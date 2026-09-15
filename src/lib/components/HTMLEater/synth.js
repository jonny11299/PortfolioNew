// Plays one note per character, timed on the audio clock.
//
// Tone's Transport schedules each step slightly ahead of time (the context's lookahead) with an
// exact audio timestamp, so notes land evenly regardless of main-thread load. Visual updates are
// queued with Tone.Draw for the same timestamp and fire on the nearest animation frame — they can
// be a frame late, but never pull the audio off.
//
// Tone is imported lazily: pages are prerendered, and there's no AudioContext on the server.

import { drums, charToDrum } from './drums.js';

const NOTE_OFFSETS = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const MAX_MIDI = 127;
const A_CODE = 'a'.charCodeAt(0);

/** The twelve pitch classes, sharps only, in the order a root select shows them. */
export const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Named scales, as semitones above the root. `scaleMapFor` turns one into the 12-note map the
 * synth actually quantizes with; 'chromatic' maps every note to itself, so it's the off switch.
 */
export const scales = {
	major: { label: 'Major', steps: [0, 2, 4, 5, 7, 9, 11] },
	minor: { label: 'Minor', steps: [0, 2, 3, 5, 7, 8, 10] },
	harmonicMinor: { label: 'Harmonic minor', steps: [0, 2, 3, 5, 7, 8, 11] },
	chromatic: { label: 'Chromatic (off)', steps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }
};

const MIN_STEP_MS = 5; // an interval of 0 would make the loop spin forever
const MIN_TIME_MS = 1; // envelope stages can't be zero-length

// Times in ms, sustain 0–1, volume 0–100, filter frequency in Hz, filter gain in dB
export const defaults = {
	stepInterval: 40,
	tonalCenter: 'A3', // the note 'a' plays; every character is counted from it
	scaleRoot: 'A', // root of the quantizing scale, independent of the tonal center
	scale: 'major', // a key of `scales`; 'chromatic' leaves every note where it landed
	volume: 100,
	drumVolume: 0.35, // gain on all drums, relative to the waves
	voice: { attack: 5, decay: 100, sustain: 0.1, release: 50 },
	sawFilter: { frequency: 800, gain: -12 }
};

const settings = {
	...structuredClone(defaults),
	// output pitch class for each of the twelve input pitch classes, C first. The UI's 12x12 grid
	// edits this directly, so a named scale is only ever a starting point.
	scaleMap: scaleMapFor(defaults.scaleRoot, defaults.scale)
};
let tonalCenterMidi = noteToMidi(settings.tonalCenter);

let Tone;
// One PolySynth per wave type: all voices in a PolySynth share the same oscillator type
let synths;
let sawFilter;
// One NoiseSynth per drum: noise can't go in a PolySynth, and separate instruments don't cut each
// other off (a repeated drum does, like a real hihat)
let noises;
let drumBus;
let loop;
let loading;

// Invalid input (e.g. an empty number field) keeps the previous value
const clamp = (value, previous, min, max = Infinity) =>
	Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : previous;

/** MIDI number for a note name like 'C2', 'F#3' or 'Bb1' (C4 = 60), or null if it isn't one. */
export function noteToMidi(name) {
	const match = /^\s*([a-g])([#b]?)(-?\d)\s*$/i.exec(name ?? '');
	if (!match) return null;

	const [, letter, accidental, octave] = match;
	const shift = { '#': 1, b: -1, B: -1 }[accidental] ?? 0;
	const midi = (Number(octave) + 1) * 12 + NOTE_OFFSETS[letter.toLowerCase()] + shift;
	return midi >= 0 && midi <= MAX_MIDI ? midi : null;
}

/** Note name for a MIDI number, like 57 → 'A3' (C4 = 60), in sharps so noteToMidi reads it back. */
export function midiToNote(midi) {
	return `${noteNames[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

/**
 * The 12-note map for a named scale: each input pitch class paired with the next pitch class at or
 * above it that the scale allows. An unknown root or scale gives the identity map (no quantizing).
 */
export function scaleMapFor(rootName, scaleName) {
	const root = noteNames.indexOf(
		String(rootName ?? '')
			.trim()
			.toUpperCase()
	);
	const scale = scales[scaleName];
	if (root === -1 || !scale) return noteNames.map((_, pitch) => pitch);

	return noteNames.map((_, pitch) => {
		const degree = (((pitch - root) % 12) + 12) % 12;
		for (let lift = 0; lift < 12; lift++) {
			if (scale.steps.includes((degree + lift) % 12)) return (pitch + lift) % 12;
		}
		return pitch;
	});
}

/**
 * Sends a note to the pitch class the map assigns it, raising it by up to 11 semitones. A note
 * mapped to itself doesn't move. Only ever raises, so the caller's lower bound still holds.
 */
export function quantize(midi) {
	const target = settings.scaleMap[((midi % 12) + 12) % 12];
	return midi + ((((target - midi) % 12) + 12) % 12);
}

/** MIDI note for a character, or null for whitespace (a silent step). */
export function charToMidi(char) {
	if (/\s/.test(char)) return null;

	// 'a' is the tonal center, one semitone per character code away from 'a'
	let midi = tonalCenterMidi + char.charCodeAt(0) - A_CODE;

	// Characters below the center move up by whole octaves, keeping their pitch class
	if (midi < tonalCenterMidi) midi += 12 * Math.ceil((tonalCenterMidi - midi) / 12);

	// Quantizing last, so a note pushed up by the scale still lands in range
	midi = quantize(midi);
	if (midi > MAX_MIDI) midi -= 12 * Math.ceil((midi - MAX_MIDI) / 12);
	return midi;
}

/** Loads Tone and builds the synth. Safe to call repeatedly; call early so play() starts instantly. */
export function load() {
	loading ??= init();
	return loading;
}

async function init() {
	Tone = await import('tone');

	// sawtooth is bright, so it runs through a high shelf to tame the highs
	sawFilter = new Tone.Filter({ type: 'highshelf' }).toDestination();

	synths = {};
	// sawtooth8 is built from only the first 8 harmonics, so it's softer than a full sawtooth
	const oscillators = { sine: 'sine', triangle: 'triangle', sawtooth: 'sawtooth8' };
	for (const [wave, type] of Object.entries(oscillators)) {
		synths[wave] = new Tone.PolySynth(Tone.Synth, { oscillator: { type } });
		synths[wave].volume.value = -12; // short steps stack several voices at once
		synths[wave].connect(wave === 'sawtooth' ? sawFilter : Tone.getDestination());
	}

	// every drum feeds one gain, so drum volume scales them together against the waves
	drumBus = new Tone.Gain().toDestination();
	noises = {};
	for (const [name, { filter, envelope, level }] of Object.entries(drums)) {
		const output = new Tone.Filter(filter).connect(drumBus);
		noises[name] = new Tone.NoiseSynth({
			noise: { type: 'white' },
			// sustain 0: the noise stops on its own once attack and decay finish
			envelope: { sustain: 0, release: 0.005, ...envelope },
			volume: level
		}).connect(output);
	}

	applyVoice();
	applyFilter();
	applyDrumVolume();
	applyVolume();
}

function applyVoice() {
	if (!synths) return;
	const { attack, decay, sustain, release } = settings.voice;
	const envelope = { attack: attack / 1000, decay: decay / 1000, sustain, release: release / 1000 };
	for (const synth of Object.values(synths)) synth.set({ envelope });
}

function applyFilter() {
	if (!sawFilter) return;
	// ramp rather than jump, so edits while playing don't click
	sawFilter.frequency.rampTo(settings.sawFilter.frequency, 0.05);
	sawFilter.gain.rampTo(settings.sawFilter.gain, 0.05);
}

function applyDrumVolume() {
	if (!drumBus) return;
	drumBus.gain.rampTo(settings.drumVolume, 0.05);
}

function applyVolume() {
	if (!synths) return;
	// squared so the control sounds even to the ear; 100 is unity gain, 0 mutes
	Tone.getDestination().volume.value = Tone.gainToDb((settings.volume / 100) ** 2);
}

/** Time between steps in ms. Applies immediately, including mid-playback. */
export function setStepInterval(ms) {
	settings.stepInterval = clamp(ms, settings.stepInterval, MIN_STEP_MS);
	if (loop) loop.interval = settings.stepInterval / 1000;
}

/** Drum level relative to the waves, 0–1. 0.5 is half the amplitude (-6 dB). */
export function setDrumVolume(level) {
	settings.drumVolume = clamp(level, settings.drumVolume, 0, 1);
	applyDrumVolume();
}

/** The note 'a' plays, and the floor lower characters fold up to. Invalid names are ignored. */
export function setTonalCenter(name) {
	const midi = noteToMidi(name);
	if (midi === null) return;
	settings.tonalCenter = name.trim();
	tonalCenterMidi = midi;
}

/**
 * The whole scale, as twelve output pitch classes indexed by input pitch class (C first). Anything
 * that isn't twelve numbers in 0-11 is ignored, so a half-built map can't silence the synth.
 */
export function setScaleMap(map) {
	if (!Array.isArray(map) || map.length !== 12) return;
	if (!map.every((pitch) => Number.isInteger(pitch) && pitch >= 0 && pitch < 12)) return;
	settings.scaleMap = [...map];
}

/** Master volume, 0–100. */
export function setVolume(level) {
	settings.volume = clamp(level, settings.volume, 0, 100);
	applyVolume();
}

/** Envelope times in ms, sustain 0–1. Applies to notes scheduled from now on. */
export function setVoice({ attack, decay, sustain, release }) {
	const voice = settings.voice;
	settings.voice = {
		attack: clamp(attack, voice.attack, MIN_TIME_MS),
		decay: clamp(decay, voice.decay, MIN_TIME_MS),
		sustain: clamp(sustain, voice.sustain, 0, 1),
		release: clamp(release, voice.release, MIN_TIME_MS)
	};
	applyVoice();
}

/**
 * The voice envelope as [ms, level] points for drawing, following Tone's default curves: a
 * linear attack, then exponential decay and release. Notes release as soon as decay ends, but
 * the sustain level gets a plateau a quarter as long as the other stages so it stays visible.
 */
export function envelopePoints({ attack, decay, sustain, release }) {
	const fallback = defaults.voice;
	const a = clamp(attack, fallback.attack, MIN_TIME_MS);
	const d = clamp(decay, fallback.decay, MIN_TIME_MS);
	const s = clamp(sustain, fallback.sustain, 0, 1);
	const r = clamp(release, fallback.release, MIN_TIME_MS);
	const plateau = (a + d + r) / 4;
	const releaseStart = a + d + plateau;

	return {
		points: [
			[0, 0],
			[a, 1],
			...approach(1, s, a, d),
			[releaseStart, s],
			...approach(s, 0, releaseStart, r)
		],
		duration: releaseStart + r
	};
}

// Samples Tone's exponentialApproachValueAtTime: a setTargetAtTime curve for 90% of the ramp,
// then a linear ramp the rest of the way. Tone works in seconds, these points in ms.
function approach(from, to, start, duration, samples = 24) {
	const timeConstant = (Math.log(duration / 1000 + 1) / Math.log(200)) * 1000;
	const points = [];
	for (let i = 1; i <= samples; i++) {
		const t = (0.9 * duration * i) / samples;
		points.push([start + t, to + (from - to) * Math.exp(-t / timeConstant)]);
	}
	points.push([start + duration, to]);
	return points;
}

/** High shelf on the sawtooth wave: frequency in Hz, gain in dB (negative cuts). Applies immediately. */
export function setSawFilter({ frequency, gain }) {
	const filter = settings.sawFilter;
	settings.sawFilter = {
		frequency: clamp(frequency, filter.frequency, 20, 20000),
		gain: clamp(gain, filter.gain, -40, 12)
	};
	applyFilter();
}

/**
 * Starts stepping through characters. Must be called from a user gesture (e.g. a click handler).
 *
 * @param {object} options
 * @param {() => {char: string, wave: 'sine' | 'triangle' | 'sawtooth'} | null} options.next
 *   returns the next step, or null when out of text. Called ahead of time, when the note is
 *   scheduled — not when it's heard.
 * @param {(step: {char: string}) => void} options.onStep called on the animation frame nearest
 *   the moment the step is heard
 * @param {() => void} options.onEnd called when the last step has been heard
 */
export async function start({ next, onStep, onEnd }) {
	await load();
	await Tone.start();

	loop?.dispose();
	loop = new Tone.Loop((time) => {
		const step = next();
		if (step === null) {
			loop.stop(time);
			Tone.getDraw().schedule(onEnd, time);
			return;
		}

		const drum = charToDrum(step.char);
		const midi = charToMidi(step.char);
		if (drum) {
			noises[drum].triggerAttack(time);
		} else if (midi !== null) {
			// release once attack and decay have played out and the note has held at sustain
			const { attack, decay } = settings.voice;
			const noteLength = (attack + decay) / 1000;
			const frequency = Tone.Frequency(midi, 'midi').toFrequency();
			synths[step.wave].triggerAttackRelease(frequency, noteLength, time);
		}
		Tone.getDraw().schedule(() => onStep(step), time);
	}, settings.stepInterval / 1000).start(0);

	Tone.getTransport().start();
}

/**
 * Stops scheduling new steps. Steps already scheduled (up to one lookahead window) still play and
 * still reach onStep, so a caller's position stays in sync.
 * Pass { immediate: true } to also silence the synth and drop pending onStep/onEnd calls.
 */
export function stop({ immediate = false } = {}) {
	if (!Tone) return;

	loop?.dispose();
	loop = null;
	Tone.getTransport().stop();

	if (immediate) {
		Tone.getDraw().cancel(0);
		for (const synth of Object.values(synths)) synth.releaseAll();
		for (const noise of Object.values(noises)) noise.triggerRelease();
	}
}
