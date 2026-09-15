<script>
	import { onMount, tick } from 'svelte';
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
	let scaleRoot = $state(synth.defaults.scaleRoot); // a note name like 'C' or 'F#'
	let scale = $state(synth.defaults.scale); // a key of synth.scales, or 'custom' once the grid is edited
	// The scale itself: an output pitch class per input pitch class, C first. The grid edits this,
	// and picking a named scale overwrites it.
	let scaleMap = $state(synth.scaleMapFor(synth.defaults.scaleRoot, synth.defaults.scale));
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
		tl: `src://${sourceName || 'default'}`,
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
	$effect(() => synth.setScaleMap(scaleMap));
	$effect(() => synth.setSawFilter({ ...sawFilter }));

	const BLACK_KEYS = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#
	const isBlack = (pitch) => BLACK_KEYS.includes(pitch);
	// grid rows, highest note at the top
	const outputs = [...synth.noteNames.keys()].reverse();
	let gridEl; // so the arrow keys look up squares in this grid, not any grid on the page

	// Picking a named scale overwrites the grid; the root only means anything while one is picked
	function pickScale(name) {
		scale = name;
		if (name !== 'custom') scaleMap = synth.scaleMapFor(scaleRoot, name);
	}
	function pickRoot(name) {
		scaleRoot = name;
		if (scale !== 'custom') scaleMap = synth.scaleMapFor(name, scale);
	}

	// One output per input, so a click replaces whatever its column already held
	function mapNote(input, output) {
		const next = [...scaleMap];
		next[input] = output;
		scaleMap = next;
		// the selects keep their name only while they still describe the grid
		const named =
			scale !== 'custom' && synth.scaleMapFor(scaleRoot, scale).every((p, i) => p === next[i]);
		if (!named) scale = 'custom';
	}

	// Only the lit square in each column is tabbable, so up and down move the mapping from there
	async function onCellKey(event, input) {
		const step = { ArrowUp: 1, ArrowDown: -1 }[event.key];
		if (!step) return;
		event.preventDefault();

		const output = (((scaleMap[input] + step) % 12) + 12) % 12;
		mapNote(input, output);
		await tick(); // the square that's now lit is the one that's now tabbable
		gridEl?.querySelector(`[data-cell="${input}-${output}"]`)?.focus();
	}

	// Space toggles playback, except where space already does something
	function onKey(event) {
		if (event.code !== 'Space' || event.metaKey || event.ctrlKey || event.altKey) return;
		if (event.target?.closest?.('input, select, textarea, button, [contenteditable]')) return;
		event.preventDefault(); // it would scroll the page otherwise
		if (playing) pause();
		else play();
	}

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

	// back to the bundled sample, dropping whatever file was uploaded
	function useDefault() {
		loadedText = dataText;
		sourceName = '';
		reload();
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

<svelte:window onkeydown={onKey} />

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
						<div class="tab fill sourceTab">
							<h3 class="title2">HTML Source:</h3>
							<span class="reading">
								<span class="sourceNow" class:custom={sourceName} title={sourceName || 'data.text'}>
									{sourceName || 'google'}
								</span>
							</span>
							<span class="sourceActions">
								<label class="upload" title="Read your own .html, .htm or .txt file">
									{sourceName ? 'change file' : 'upload .html'}
									<input
										class="visuallyHidden"
										type="file"
										accept=".html,.htm,.txt,.text,text/html,text/plain"
										onchange={onPick}
									/>
								</label>
								{#if sourceName}
									<span class="divider" aria-hidden="true">◆</span>
									<button class="linkish" onclick={() => useDefault()}>use default</button>
								{/if}
							</span>
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
						<div class="tab clipEnd scrollBoth scrollbars">
							<pre class="code">{@render highlighted(restRuns)}</pre>
						</div>
					</div>
				</div>
				<div class="rightPanel">
					<div class="tab clipEnd scrollY scrollbars">
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

							<h4 style="margin-bottom: var(--space-2xs)">Voice</h4>
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

							<h4 style="margin-bottom: var(--space-2xs)">Scale</h4>
							<div class="scale">
								<div class="scaleSelects">
									<label>
										Root
										<select
											bind:value={scaleRoot}
											onchange={(event) => pickRoot(event.currentTarget.value)}
										>
											{#each synth.noteNames as name (name)}
												<option value={name}>{name}</option>
											{/each}
										</select>
									</label>
									<label>
										Scale
										<select
											bind:value={scale}
											onchange={(event) => pickScale(event.currentTarget.value)}
										>
											{#each Object.entries(synth.scales) as [name, { label }] (name)}
												<option value={name}>{label}</option>
											{/each}
											<!-- only listed once the grid has been edited away from a named scale -->
											{#if scale === 'custom'}<option value="custom">Custom</option>{/if}
										</select>
									</label>
								</div>

								<div
									bind:this={gridEl}
									class="grid"
									role="group"
									aria-label="Scale map: each column is a note played, each row the note it lands on"
								>
									{#each outputs as output (output)}
										{#each synth.noteNames as _, input (input)}
											{@const on = scaleMap[input] === output}
											<button
												type="button"
												class="cell"
												class:on
												class:blackCol={isBlack(input)}
												class:blackRow={isBlack(output)}
												tabindex={on ? 0 : -1}
												aria-pressed={on}
												aria-label="{synth.noteNames[input]} plays {synth.noteNames[output]}"
												title="{synth.noteNames[input]} → {synth.noteNames[output]}"
												data-cell="{input}-{output}"
												onclick={() => mapNote(input, output)}
												onkeydown={(event) => onCellKey(event, input)}
											></button>
										{/each}
									{/each}
								</div>
								<p class="gridAxis"><span>note played →</span><span>↑ note heard</span></p>
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

	<p class="credit" style="margin-top: var(--space-3xl)">
		Huge thank you to Yotam Mann for creating tone.js, the open-source audio package this synth
		relies on.
	</p>
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
		/* no clipping here: the scrolling tab around it does that, and a clipped pre would have
		   nothing to scroll sideways */
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

	/* the plaques' lettering, dialed down: same uppercase gilt, no plate */
	.credit {
		max-width: 60ch;
		margin: var(--space-2xs) 0 0;
		color: color-mix(in srgb, var(--primary-hover) 45%, var(--text-muted));
		font-size: var(--step--1);
		letter-spacing: 0.1em;
		line-height: 1.7;
		text-align: center;
		text-shadow: 0 0 0.4em color-mix(in srgb, var(--primary-hover) 20%, transparent);
		text-transform: uppercase;
		text-wrap: balance;
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
		position: relative;
		isolation: isolate; /* so the texture blends with the surface, not the page behind it */
		background-color: var(--surface);
		border: var(--border-width) solid var(--border);
		border-radius: var(--border-radius);
		display: block;
		width: 100%;
		aspect-ratio: 4 / 3;
		overflow: hidden;

		padding: var(--space-2xs);
	}

	.container::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			linear-gradient(var(--primary-hover), var(--primary-hover)), linear-gradient(#fff, #fff);

		filter: contrast(2) invert(1);
		mix-blend-mode: overlay;
		opacity: 0.05;
		pointer-events: none;
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
		margin-inline: 0;
		margin-block: var(--space-s); /* the sections were running into each other */
		color: var(--secondary); /* same as the .title2 panel heading */
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

	/* the site's globals give selects a lit border on focus but nothing on hover, so the control
	   looks inert until it's clicked; this borrows the focus treatment */
	select:hover {
		cursor: pointer;
		border-color: var(--primary);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 35%, transparent);
	}

	.scale {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
		width: 100%;
	}
	/* root and scale side by side; the scale names are longer, so they get more of the row */
	.scaleSelects {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
		gap: var(--space-2xs);
	}
	/* overrides .settings label's display: contents, which is only for the two-column rows */
	.settings .scaleSelects label {
		display: flex;
		flex-direction: column;
		gap: var(--space-3xs);
		min-width: 0;
		color: var(--text-muted);
		font-size: calc(var(--step--1) * 0.85);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	/* the site's global select padding is built for full-width forms, not this panel */
	.scale select {
		margin: 0;
		padding: 0.25em 0.4em;
		color: var(--text);
		font-size: var(--step--1);
		letter-spacing: normal;
		text-transform: none;
	}

	/* The map, after Ableton's Scale device: a column per note played, a row per note heard, and
	   one lit square per column, since every note lands somewhere. */
	.grid {
		--line: color-mix(in srgb, var(--text-muted) 30%, transparent);
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		aspect-ratio: 1;
		width: 100%;
		border: var(--border-width) solid var(--border);
		border-radius: var(--border-radius);
		overflow: hidden; /* so the corner squares don't square off the rounded border */
	}
	/* written as button.cell so it outranks the site's global button and button:hover rules */
	button.cell {
		/* the key tint is a variable, not a background: .blackCol.blackRow is two classes, so as a
		   background it outranked .on and left a sharp mapped to a sharp looking switched off */
		--key-tint: transparent;
		min-width: 0;
		margin: 0;
		padding: 0;
		border: none;
		border-right: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		border-radius: 0;
		background: var(--key-tint);
		cursor: pointer;
	}
	button.cell:nth-child(12n) {
		border-right: none;
	}
	button.cell:nth-child(n + 133) {
		border-bottom: none;
	}
	/* the piano pattern on both axes, so it's clear which notes are sharps */
	button.cell.blackCol,
	button.cell.blackRow {
		--key-tint: color-mix(in srgb, var(--text) 20%, transparent);
	}
	button.cell.blackCol.blackRow {
		--key-tint: color-mix(in srgb, var(--text) 20%, transparent);
	}
	button.cell.on {
		background: var(--accent);
	}
	/* inset, so the outline isn't cropped by the neighbouring squares' borders */
	button.cell:hover {
		outline: 2px solid var(--primary);
		outline-offset: -2px;
		z-index: 1;
	}
	button.cell:focus-visible {
		outline: 2px solid var(--secondary);
		outline-offset: -2px;
		z-index: 1;
	}
	.gridAxis {
		display: flex;
		justify-content: space-between;
		gap: var(--space-2xs);
		margin: 0;
		color: var(--text-muted);
		font-size: calc(var(--step--1) * 0.8);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	/* heading, then what's being read, then the controls pushed to the far end */
	.sourceTab {
		display: flex;
		align-items: center;
		gap: var(--space-2xs);
		min-width: 0;
	}
	/* the title and the controls keep their one line; the file name truncates instead */
	.sourceTab h3 {
		white-space: nowrap;
		flex-shrink: 0;
	}
	.reading {
		display: flex;
		align-items: baseline;
		gap: var(--space-3xs);
		flex: 1;
		min-width: 0;
	}
	.readingLabel {
		flex-shrink: 0;
		color: var(--text-muted);
		font-size: calc(var(--step--1) * 0.85);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	/* the bundled sample reads as muted; an uploaded file is the accent, so it's obvious which
	   one is playing */
	.sourceNow {
		overflow: hidden;
		min-width: 0;
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: var(--step--1);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sourceNow.custom {
		color: var(--accent);
	}
	.sourceActions {
		display: flex;
		align-items: center;
		gap: var(--space-2xs);
		flex-shrink: 0;
	}
	/* both read as links; button.linkish outranks the site's global button:hover */
	.upload,
	button.linkish {
		padding: 0;
		border: none;
		background: none;
		margin: 0;
		color: var(--primary);
		font: inherit;
		font-size: var(--step--1);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
		cursor: pointer;
	}
	.upload:hover,
	button.linkish:hover {
		background: none;
		color: var(--primary-hover);
		text-decoration: underline;
	}
	/* keyboard focus only, so a mouse click doesn't leave an outline behind */
	.upload:has(input:focus-visible),
	button.linkish:focus-visible {
		outline: 2px solid var(--primary);
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

	/* Both after .clipEnd, so they win over its overflow: clip */
	.scrollY {
		overflow-y: auto;
	}
	.scrollBoth {
		overflow: auto;
	}

	/* Gilt, so the bars read as part of the instrument: both looks set --gilt and --gilt-fine on
	   their root and custom properties inherit down to here. Shared by the settings panel and the
	   rest view. The bar keeps its size at all times and only its colors come and go, so content
	   doesn't reflow when the pointer enters. */
	.scrollbars {
		scrollbar-width: thin; /* Firefox, Chrome 121+, Safari 18.2+ */
		scrollbar-color: transparent transparent;
		transition: scrollbar-color var(--transition-time) ease;
	}
	/* focus-within too, so it's still there for anyone tabbing through the controls */
	.scrollbars:hover,
	.scrollbars:focus-within {
		scrollbar-color: var(--gilt-fine, var(--primary-hover)) var(--gilt, transparent);
	}
	/* WebKit needs its own set. Styling them also opts out of the overlay bar that only appears
	   while scrolling, which is what lets hover decide when it shows. */
	.scrollbars::-webkit-scrollbar {
		width: 0.4rem;
		height: 0.4rem; /* the horizontal bar, for the rest view */
	}
	.scrollbars::-webkit-scrollbar-track,
	.scrollbars::-webkit-scrollbar-thumb,
	.scrollbars::-webkit-scrollbar-corner {
		background: transparent;
		border-radius: 0.2rem;
		transition: background var(--transition-time) ease;
	}
	.scrollbars:hover::-webkit-scrollbar-track,
	.scrollbars:focus-within::-webkit-scrollbar-track {
		background: var(--gilt, transparent);
	}
	.scrollbars:hover::-webkit-scrollbar-thumb,
	.scrollbars:focus-within::-webkit-scrollbar-thumb {
		background: var(--gilt-fine, var(--primary-hover));
	}
	.scrollbars::-webkit-scrollbar-thumb:hover {
		background: var(--primary-hover);
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
