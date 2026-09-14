<script>
	import { onMount } from 'svelte';
	import * as synth from './synth.js';
	import dataText from './data.text?raw';
	import { classifyWaves } from './waves.js';

	const settings =
		'Mode: Arp / Chunk (mono / poly) (letter / word) Pitches per character Samples per word / symbol could actually form a way to generalize any sample with white noise... “sharpness” leads to shorter envelope volume on the screen leads to the filter being higher up';

	let source = $state(dataText);
	// Index of the character currently being heard. Only set from the synth's onStep, so the
	// display follows the audio clock.
	let position = $state(-1);
	// Index of the last character handed to the synth. Runs ahead of `position` by the audio
	// lookahead, so it's kept separate and non-reactive.
	let scheduledPosition = -1;

	let msPause = $state(synth.defaults.stepInterval);
	let tonalCenter = $state(synth.defaults.tonalCenter); // note name, e.g. C2
	let volume = $state(synth.defaults.volume); // 0–100
	let drumVolume = $state(synth.defaults.drumVolume); // 0–1, relative to the waves
	let voice = $state({ ...synth.defaults.voice }); // ms, sustain 0–1
	let sawFilter = $state({ ...synth.defaults.sawFilter }); // frequency Hz, gain dB
	let playing = $state(false);
	let queueLength = 50; // will load 50 chars into the top part
	let maxQueueLength = 200;
	let read_settings = ['fixed_width', 'to_newline'];
	let read_setting = $state(read_settings[1]);

	let view = $derived(splitView(source, position, read_setting));
	let waves = $derived(classifyWaves(source)); // oscillator type per character

	// Push settings to the synth whenever they change; it holds them until Tone has loaded
	$effect(() => synth.setStepInterval(msPause));
	$effect(() => synth.setTonalCenter(tonalCenter));
	$effect(() => synth.setVolume(volume));
	$effect(() => synth.setDrumVolume(drumVolume));
	$effect(() => synth.setVoice({ ...voice }));
	$effect(() => synth.setSawFilter({ ...sawFilter }));

	// Splits the text around `pos` into the reader char, the rest of its chunk, and everything after
	function splitView(text, pos, setting) {
		if (pos < 0) return { reader: '', queued: '', rest: text };

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

		return {
			reader: text[pos],
			queued: text.slice(pos + 1, chunkEnd),
			rest: text.slice(chunkEnd)
		};
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
		source = dataText;
		position = -1;
		scheduledPosition = -1;
	}

	onMount(() => {
		synth.load(); // so the first play() doesn't wait on the import
		return () => synth.stop({ immediate: true });
	});
</script>

<div class="testing">
	<button onclick={() => play()}>play</button>
	<button onclick={() => pause()}>pause</button>
	<button onclick={() => reload()}>reload</button>
</div>

<div class="container">
	<div class="columns">
		<div class="leftPanel">
			<div class="row">
				<div class="tab center">
					<h2 class="title1">HTML Eater</h2>
				</div>
				<div class="tab center fill">
					<h3 class="title2">HTML Source:</h3>
					<span> local</span>
				</div>
			</div>
			<div class="row">
				<div class="tab oneline center" style="min-width: var(--space-xl)">
					{view.reader}
				</div>
				<div class="tab oneline">{view.queued}</div>
			</div>
			<div class="rest">
				<div class="tab clipEnd">
					<pre>{view.rest}</pre>
				</div>
			</div>
		</div>
		<div class="rightPanel">
			<div class="tab clipEnd scrollY">
				<h3 class="title2">Synth Settings</h3>
				<div class="settings">
					<label>
						Read mode
						<select bind:value={read_setting}>
							{#each read_settings as setting (setting)}
								<option value={setting}>{setting}</option>
							{/each}
						</select>
					</label>
					<label>Step (ms) <input type="number" min="5" step="1" bind:value={msPause} /></label>
					<label>
						Tonal center
						<input
							type="text"
							bind:value={tonalCenter}
							aria-invalid={synth.noteToMidi(tonalCenter) === null}
						/>
					</label>
					<label>Volume <input type="number" min="0" max="100" step="1" bind:value={volume} /></label>
					<label>
						Drum volume <input type="number" min="0" max="1" step="0.05" bind:value={drumVolume} />
					</label>

					<h4>Voice</h4>
					<label
						>Attack (ms) <input type="number" min="1" step="1" bind:value={voice.attack} /></label
					>
					<label>Decay (ms) <input type="number" min="1" step="1" bind:value={voice.decay} /></label
					>
					<label>
						Sustain (0–1)
						<input type="number" min="0" max="1" step="0.05" bind:value={voice.sustain} />
					</label>
					<label>Hold (ms) <input type="number" min="0" step="1" bind:value={voice.hold} /></label>
					<label>
						Release (ms) <input type="number" min="1" step="1" bind:value={voice.release} />
					</label>

					<h4>Sawtooth filter</h4>
					<label>
						Shelf (Hz)
						<input type="number" min="20" max="20000" step="50" bind:value={sawFilter.frequency} />
					</label>
					<label>
						Gain (dB) <input type="number" min="-40" max="12" step="1" bind:value={sawFilter.gain} />
					</label>
				</div>
			</div>
		</div>
	</div>
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

	.testing {
		background-color: var(--surface);
		border: var(--border-width) solid var(--border);
		display: block;
		width: 100%;
		min-height: 2rem;
		overflow: scroll;
		margin-block: var(--space-l);
	}

	.container {
		background-color: var(--surface);
		border: var(--border-width) solid var(--border);
		display: block;
		width: 100%;
		aspect-ratio: 4 / 3;
		overflow: hidden;
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
		border: 2px solid var(--text-muted);
		border-radius: var(--border-radius);
		margin: var(--space-2xs);
		padding-inline: var(--space-2xs);
		padding-block: var(--space-2xs);

		overflow-wrap: anywhere;
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
	}
	.settings input,
	.settings select {
		width: 100%;
		min-width: 0;
	}
	.settings input[aria-invalid='true'] {
		outline: 2px solid crimson;
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
	}

	.manyline {
	}

	.nameContainer {
	}
	.title1 {
		color: var(--primary);
		margin: 0;
		padding: 0;
	}
	.title2 {
		color: var(--secondary);
		margin: 0;
		padding: 0;
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
