<script>
	import { onMount } from 'svelte';
	import * as synth from './synth.js';
	import dataText from './data.text?raw';
	import { classifyWaves } from './waves.js';
	import CyberFrame from './CyberFrame.svelte';
	import CyberPlaque from './CyberPlaque.svelte';
	import Frame from './Frame.svelte';
	import Graph from './Graph.svelte';
	import Knob from './Knob.svelte';
	import Plaque from './Plaque.svelte';
	import Slider from './Slider.svelte';
	import { tokenize, sliceRuns } from './highlight.js';

	const settings =
		'Mode: Arp / Chunk (mono / poly) (letter / word) Pitches per character Samples per word / symbol could actually form a way to generalize any sample with white noise... “sharpness” leads to shorter envelope volume on the screen leads to the filter being higher up';

	// The text reload() goes back to: the bundled sample, or the last uploaded file
	let loadedText = dataText;
	let source = $state(dataText);
	let sourceName = $state(''); // uploaded file's name, empty while on the bundled sample
	// Index of the character currently being heard. Only set from the synth's onStep, so the
	// display follows the audio clock.
	let position = $state(-1);
	// Index of the last character handed to the synth. Runs ahead of `position` by the audio
	// lookahead, so it's kept separate and non-reactive.
	let scheduledPosition = -1;

	let msPause = $state(synth.defaults.stepInterval);
	// a MIDI number for the knob; the synth gets it as a note name like A3
	let tonalCenter = $state(synth.noteToMidi(synth.defaults.tonalCenter));
	let volume = $state(synth.defaults.volume); // 0–100
	let drumVolume = $state(synth.defaults.drumVolume); // 0–1, relative to the waves
	let voice = $state({ ...synth.defaults.voice }); // ms, sustain 0–1
	let sawFilter = $state({ ...synth.defaults.sawFilter }); // frequency Hz, gain dB
	let playing = $state(false);
	let queueLength = 50; // will load 50 chars into the top part
	let maxQueueLength = 200;
	let read_settings = ['fixed_width', 'to_newline'];
	let read_setting = $state(read_settings[1]);

	// A number, not an object, so the rest view only re-slices when its start actually moves
	let restStart = $derived(findRestStart(source, position, read_setting));
	let waves = $derived(classifyWaves(source)); // oscillator type per character
	let tokens = $derived(tokenize(source)); // syntax highlighting runs over the whole source
	// the reader char, the rest of its chunk, and everything after, as highlighted runs
	let readerRuns = $derived(position < 0 ? [] : sliceRuns(tokens, source, position, position + 1));
	let queuedRuns = $derived(position < 0 ? [] : sliceRuns(tokens, source, position + 1, restStart));
	let restRuns = $derived(sliceRuns(tokens, source, restStart));
	let envelope = $derived(synth.envelopePoints(voice)); // what the voice graph draws

	// Which frame and plaques to wrap the synth in: 'cyber' (lowkey, with HUD readouts) or 'rococo'
	const look = 'cyber';
	const FrameLook = look === 'cyber' ? CyberFrame : Frame;
	const PlaqueLook = look === 'cyber' ? CyberPlaque : Plaque;
	// corner readouts for the cyber frame; the rococo one ignores them
	let hud = $derived({
		tl: `src://${sourceName || 'local'}`,
		tr: playing ? '● playing' : '○ idle',
		bl: `${String(position + 1).padStart(5, '0')} / ${source.length}`,
		br: `${msPause} ms · ${synth.midiToNote(tonalCenter)}`
	});

	// Push settings to the synth whenever they change; it holds them until Tone has loaded
	$effect(() => synth.setStepInterval(msPause));
	$effect(() => synth.setTonalCenter(synth.midiToNote(tonalCenter)));
	$effect(() => synth.setVolume(volume));
	$effect(() => synth.setDrumVolume(drumVolume));
	$effect(() => synth.setVoice({ ...voice }));
	$effect(() => synth.setSawFilter({ ...sawFilter }));

	// Where the chunk holding `pos` ends, which is where the rest view starts
	function findRestStart(text, pos, setting) {
		if (pos < 0) return 0;

		let chunkEnd;
		if (setting === 'fixed_width') {
			// fixed chunks of queueLength
			chunkEnd = (Math.floor(pos / queueLength) + 1) * queueLength;
		} else if (setting === 'to_newline') {
			// chunk runs to the end of the line, capped at maxQueueLength
			const lineStart = pos === 0 ? 0 : text.lastIndexOf('\n', pos - 1) + 1;
			const newline = text.indexOf('\n', pos);
			const lineEnd = newline === -1 ? text.length : newline + 1;
			const chunkStart =
				lineStart + Math.floor((pos - lineStart) / maxQueueLength) * maxQueueLength;
			chunkEnd = Math.min(lineEnd, chunkStart + maxQueueLength);
		}

		return chunkEnd;
	}

	async function play() {
		if (playing) return;
		playing = true;

		// start over once the text has been fully played
		if (scheduledPosition >= source.length - 1) scheduledPosition = -1;

		await synth.start({
			next: () => {
				if (scheduledPosition + 1 >= source.length) return null;
				scheduledPosition++;
				return {
					char: source[scheduledPosition],
					wave: waves[scheduledPosition],
					index: scheduledPosition
				};
			},
			onStep: (step) => (position = step.index),
			onEnd: () => pause()
		});
	}

	function pause() {
		synth.stop();
		playing = false;
	}

	function reload() {
		synth.stop({ immediate: true });
		playing = false;
		source = loadedText;
		position = -1;
		scheduledPosition = -1;
	}

	async function onPick(event) {
		const input = event.currentTarget;
		const file = input.files[0];
		input.value = ''; // so picking the same file again still fires change
		if (!file) return;
		loadedText = await file.text();
		sourceName = file.name;
		reload();
	}

	onMount(() => {
		synth.load(); // so the first play() doesn't wait on the import
		return () => synth.stop({ immediate: true });
	});
</script>

<!-- one line on purpose: whitespace inside <pre> is shown -->
{#snippet highlighted(runs)}{#each runs as run (run.key)}<span class={run.classes}>{run.text}</span
		>{/each}{/snippet}

<div class="htmlEater">
	<PlaqueLook --plaque-height="3.25rem">
		<h2 class="name" class:cursor={look === 'cyber'}>HTML Eater</h2>
	</PlaqueLook>

	<PlaqueLook>
		<div class="playback">
			<button class:active={playing} onclick={() => play()}>play</button>
			<span class="divider" aria-hidden="true">◆</span>
			<button onclick={() => pause()}>pause</button>
			<span class="divider" aria-hidden="true">◆</span>
			<button onclick={() => reload()}>reload</button>
		</div>
	</PlaqueLook>

	<FrameLook shimmer={playing} tags={hud}>
		<div class="container">
			<div class="columns">
				<div class="leftPanel">
					<div class="row">
						<div class="tab center fill sourceTab">
							<h3 class="title2">HTML Source:</h3>
							<label class="upload" title="Choose an .html or .txt file">
								{sourceName || 'upload'}
								<input
									class="visuallyHidden"
									type="file"
									accept=".html,.htm,.txt,.text,text/html,text/plain"
									onchange={onPick}
								/>
							</label>
						</div>
					</div>
					<div class="row">
						<div class="tab oneline center code reader" style="min-width: var(--space-xl)">
							<!-- recreated each step, which restarts its pulse -->
							{#key position}
								{#if position >= 0}<span class="glow" aria-hidden="true"></span>{/if}
							{/key}
							{@render highlighted(readerRuns)}
						</div>
						<div class="tab oneline code">{@render highlighted(queuedRuns)}</div>
					</div>
					<div class="rest">
						<div class="tab clipEnd">
							<pre class="code">{@render highlighted(restRuns)}</pre>
						</div>
					</div>
				</div>
				<div class="rightPanel">
					<div class="tab clipEnd scrollY">
						<h3 class="title2">Synth Settings</h3>
						<div class="settings">
							<!--
							<label>
								Read mode
								<select bind:value={read_setting}>
									{#each read_settings as setting (setting)}
										<option value={setting}>{setting}</option>
									{/each}
								</select>
							</label>
							 -->
							<div class="sliders">
								<Slider
									label="Volume"
									min={0}
									max={100}
									step={1}
									reset={synth.defaults.volume}
									bind:value={volume}
								/>
								<Slider
									label="Drum volume"
									min={0}
									max={1}
									step={0.01}
									reset={synth.defaults.drumVolume}
									bind:value={drumVolume}
								/>
							</div>
							<div class="knobs">
								<!-- the value is the pause between characters, so clockwise shortens it -->
								<Knob
									label="Speed"
									unit="ms"
									min={5}
									max={1000}
									step={1}
									log
									reverse
									reset={synth.defaults.stepInterval}
									bind:value={msPause}
								/>
								<Knob
									label="Tonal center"
									min={24}
									max={84}
									step={1}
									format={synth.midiToNote}
									reset={synth.noteToMidi(synth.defaults.tonalCenter)}
									bind:value={tonalCenter}
								/>
							</div>

							<h4>Voice</h4>
							<div class="voice">
								<Graph
									points={envelope.points}
									xMax={envelope.duration}
									label="Voice envelope"
									grid={4}
									ticks={20}
									marker={envelope.points[1]}
									axis={['0', `${Math.round(envelope.duration)} ms`]}
								/>
								<div class="knobs">
									<Knob
										label="Attack"
										unit="ms"
										min={1}
										max={2000}
										step={1}
										log
										reset={synth.defaults.voice.attack}
										bind:value={voice.attack}
									/>
									<Knob
										label="Decay"
										unit="ms"
										min={1}
										max={2000}
										step={1}
										log
										reset={synth.defaults.voice.decay}
										bind:value={voice.decay}
									/>
									<Knob
										label="Sustain"
										min={0}
										max={1}
										step={0.01}
										reset={synth.defaults.voice.sustain}
										bind:value={voice.sustain}
									/>
									<Knob
										label="Release"
										unit="ms"
										min={1}
										max={2000}
										step={1}
										log
										reset={synth.defaults.voice.release}
										bind:value={voice.release}
									/>
								</div>
							</div>
							<!--
							<h4>Sawtooth filter</h4>
							<label>
								Shelf (Hz)
								<input type="number" min="20" max="20000" step="50" bind:value={sawFilter.frequency} />
							</label>
							<label>
								Gain (dB) <input
									type="number"
									min="-40"
									max="12"
									step="1"
									bind:value={sawFilter.gain}
								/>
							</label>
							 -->
						</div>
					</div>
				</div>
			</div>
		</div>
	</FrameLook>
</div>

<style>
	p {
		margin: 0;
		padding: 0;
	}
	h3 {
		font-size: var(--step-1);
	}
	pre {
		overflow: clip;
		tab-size: 2;
	}

	/* Syntax colors. Classes are Prism token types, outermost first, so where rules overlap
	   (a quote is `tag attr-value punctuation`) the later rule wins. */
	.code :global(.tag) {
		color: var(--primary);
	}
	.code :global(:is(.attr-name, .selector, .property, .function, .class-name)) {
		color: var(--secondary);
	}
	.code :global(:is(.attr-value, .string, .regex, .url)) {
		color: var(--accent);
	}
	.code :global(:is(.keyword, .atrule, .important)) {
		color: var(--primary-hover);
	}
	.code :global(:is(.number, .boolean, .constant, .entity)) {
		color: var(--text-warn);
	}
	.code :global(:is(.punctuation, .operator, .comment, .prolog, .doctype, .cdata)) {
		color: var(--text-muted);
	}

	/* --- Name plaque, playback plaque, then the framed synth --- */
	.htmlEater {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2xs);
		margin-block: var(--space-l);
	}

	.name {
		margin: 0;
		font-size: var(--step-2);
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		white-space: nowrap;
	}
	/* a blinking terminal cursor, for the cyber look */
	.name.cursor::after {
		content: '_';
		animation: blink 1.1s steps(1) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.name.cursor::after {
			animation: none;
		}
	}

	.playback {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}
	.playback button {
		padding: 0.15em 0.3em;
		border: none;
		background: none;
		color: inherit;
		font: inherit;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		text-shadow: inherit;
		cursor: pointer;
	}
	.playback button:hover {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	.playback button.active {
		text-shadow:
			0 0 0.15em var(--primary-hover),
			0 0 0.6em var(--primary-hover);
	}
	.playback button:focus-visible {
		outline: 2px solid var(--secondary);
		outline-offset: 2px;
	}
	.divider {
		font-size: 0.5em;
		opacity: 0.7;
	}

	.container {
		box-sizing: border-box; /* width: 100% and aspect-ratio now include padding and border */
		background-color: var(--surface);
		border: var(--border-width) solid var(--border);
		border-radius: var(--border-radius);
		display: block;
		width: 100%;
		aspect-ratio: 4 / 3;
		overflow: hidden;

		padding: var(--space-2xs);
	}

	.columns {
		display: grid;
		grid-template-columns: 70% 30%;
		grid-template-rows: minmax(0, 1fr);
		height: 100%;
		min-height: 0;
	}

	.leftPanel {
		border: none;
		margin: 0;
		padding: 0;

		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.rightPanel {
		border: none;
		margin: 0;
		padding: 0;

		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.row {
		display: flex;
		flex-direction: row;

		margin: 0;
		padding: 0;
	}
	.rest {
		border: none;
		padding: 0;
		flex: 1 1 0; /* takes whatever the two rows leave */
		min-height: 0; /* flex items default to min-height: auto — same trap as min-width */
		display: flex; /* so the tab can fill it */
	}

	.tab {
		background-color: var(--bg);
		border: var(--border-width) solid var(--text-muted);
		border-radius: var(--border-radius);
		margin: var(--space-2xs);
		padding-inline: var(--space-2xs);
		padding-block: var(--space-2xs);

		overflow-wrap: anywhere;
	}
	[data-theme='light'] .tab {
		border: 1px solid var(--text-muted);
	}

	/* a soft accent glow behind the reader char, pulsing on each step */
	.reader {
		position: relative;
		isolation: isolate; /* keeps the glow's z-index above the tab's background */
	}
	.glow {
		position: absolute;
		inset: 0;
		z-index: -1;
		background: radial-gradient(
			circle,
			color-mix(in srgb, var(--accent) 60%, transparent),
			transparent 70%
		);
		opacity: 0.35;
		animation: pulse 400ms ease-out;
		pointer-events: none;
	}
	@keyframes pulse {
		from {
			opacity: 1;
			transform: scale(1.3);
		}
		to {
			opacity: 0.35;
			transform: scale(1);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.glow {
			animation: none;
		}
	}

	.settings {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-2xs);
		align-items: center;
		margin-block: var(--space-2xs);
	}
	.settings label {
		display: contents; /* label text and control become the two grid columns */
	}
	.settings h4 {
		grid-column: 1 / -1;
		margin: var(--space-2xs) 0 0;
		color: var(--text-muted);
		font-size: var(--step--1);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.voice {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2xs);
	}
	.sliders {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}
	.knobs {
		grid-column: 1 / -1; /* spans the settings grid when it isn't inside .voice */
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		gap: var(--space-2xs);
		width: 100%;
	}
	.settings input,
	.settings select {
		width: 100%;
		min-width: 0;
	}

	.sourceTab {
		gap: var(--space-2xs);
		min-width: 0;
	}
	/* the title keeps its one line; the file name shrinks and truncates instead */
	.sourceTab h3 {
		white-space: nowrap;
		flex-shrink: 0;
	}
	.upload {
		cursor: pointer;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		min-width: 0;
	}
	.upload:hover {
		color: var(--secondary);
		text-decoration: underline;
	}
	/* keyboard focus only, so a mouse click doesn't leave an outline behind */
	.upload:has(input:focus-visible) {
		outline: 2px solid var(--secondary);
		outline-offset: 2px;
	}
	.visuallyHidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.fill {
		flex: 1;
	}

	.oneline {
		overflow-wrap: normal;
		white-space: nowrap;
		overflow: clip;

		min-width: 0;
	}
	/* a zero-width space keeps one line of height when the text is empty or only whitespace */
	.oneline::before {
		content: '\200b';
	}

	.clipEnd {
		overflow: clip;
		min-height: 0;
		min-width: 0;
		flex: 1;
	}

	/* after .clipEnd so it wins */
	.scrollY {
		overflow-y: auto;
		/* still scrolls, just without a visible bar */
		scrollbar-width: none; /* Firefox, Chrome 121+, Safari 18.2+ */
		-ms-overflow-style: none; /* old Edge/IE */
	}
	.scrollY::-webkit-scrollbar {
		display: none; /* older Chrome and Safari */
	}

	.manyline {
	}

	.nameContainer {
	}
	/* small uppercase headings, like the labels on an instrument panel */
	.title2 {
		color: var(--secondary);
		margin: 0;
		padding: 0;
		font-size: var(--step-0);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.sourceContainer {
	}

	.readContainer {
	}

	.queuedContainer {
	}

	.contentContainer {
	}

	.synthSettingsContainer {
	}
</style>
