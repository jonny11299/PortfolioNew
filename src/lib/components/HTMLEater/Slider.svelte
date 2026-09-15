<script>
	let {
		value = $bindable(),
		min = 0,
		max = 1,
		step = 0.01,
		label = '',
		unit = '',
		format = undefined, // value => readout text, in place of the number and unit
		reset = undefined // double-click returns here
	} = $props();

	const id = $props.id();

	let decimals = $derived((String(step).split('.')[1] ?? '').length);
	// how much of the track to fill, for the gradient in CSS
	let percent = $derived(
		value == null ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
	);
	// shown as a bold number and a smaller unit; `format` replaces both
	let number = $derived(value == null ? '–' : format ? format(value) : value.toFixed(decimals));
	let shownUnit = $derived(value == null || format ? '' : unit);
	let readout = $derived(shownUnit ? `${number} ${shownUnit}` : number);
</script>

<div class="slider">
	<div class="top">
		<label class="label" for={id}>{label}</label>
		<span class="readout">
			<span class="number">{number}</span>{#if shownUnit}<span class="unit">{shownUnit}</span>{/if}
		</span>
	</div>
	<input
		{id}
		type="range"
		{min}
		{max}
		{step}
		bind:value
		style:--fill="{percent}%"
		aria-valuetext={readout}
		ondblclick={() => reset !== undefined && (value = reset)}
	/>
	<div class="ticks" aria-hidden="true"></div>
</div>

<style>
	.slider {
		--thumb: var(--slider-thumb, 0.875rem);
		--height: var(--slider-height, 0.375rem);
		--muted: color-mix(in srgb, var(--text-muted) 40%, transparent);

		display: flex;
		flex-direction: column;
		gap: var(--space-3xs);
		min-width: 0;
	}

	.top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2xs);
	}
	.label {
		color: var(--text-muted);
		font-size: calc(var(--step--1) * 0.85);
		letter-spacing: 0.08em;
		overflow-wrap: normal; /* wrap between words, not mid-word like the tabs allow */
		text-transform: uppercase;
	}
	.readout {
		font-family: var(--font-mono);
		white-space: nowrap;
	}
	.number {
		font-size: var(--step-0);
		font-weight: 700;
	}
	.unit {
		margin-left: 0.2em;
		color: var(--text-muted);
		font-size: calc(var(--step--1) * 0.8);
		text-transform: uppercase;
	}

	/* A native range input with its parts restyled; the vendor pseudo-elements have to be
	   written out separately, since a browser drops a whole rule with a selector it doesn't know. */
	input {
		--color: var(--accent);

		appearance: none;
		box-sizing: border-box;
		width: 100%;
		height: var(--thumb);
		margin: 0;
		padding: 0;
		border: none; /* the site's global input styles would draw a box */
		box-shadow: none;
		background: none;
		cursor: pointer;
	}
	input:hover,
	input:active {
		--color: var(--primary-hover);
	}
	input:focus-visible {
		outline: 2px solid var(--secondary);
		outline-offset: 2px;
		border-radius: var(--thumb);
	}

	input::-webkit-slider-runnable-track {
		height: var(--height);
		border-radius: var(--height);
		background: linear-gradient(to right, var(--color) var(--fill), var(--muted) var(--fill));
	}
	input::-moz-range-track {
		height: var(--height);
		border-radius: var(--height);
		background: linear-gradient(to right, var(--color) var(--fill), var(--muted) var(--fill));
	}

	/* a lit lamp: filled with the track color, ringed in the surface color, with a glow */
	input::-webkit-slider-thumb {
		appearance: none;
		box-sizing: border-box;
		width: var(--thumb);
		height: var(--thumb);
		margin-top: calc((var(--height) - var(--thumb)) / 2); /* webkit doesn't center it */
		border: 2px solid var(--surface);
		border-radius: 50%;
		background: var(--color);
		box-shadow:
			0 0 0 1px var(--color),
			0 0 0.6rem var(--color);
	}
	input::-moz-range-thumb {
		box-sizing: border-box;
		width: var(--thumb);
		height: var(--thumb);
		border: 2px solid var(--surface);
		border-radius: 50%;
		background: var(--color);
		box-shadow:
			0 0 0 1px var(--color),
			0 0 0.6rem var(--color);
	}

	/* eleven marks, inset half a thumb so they line up with where the thumb's center can go */
	.ticks {
		height: 0.3rem;
		margin-inline: calc(var(--thumb) / 2);
		background:
			repeating-linear-gradient(to right, var(--muted) 0 1px, transparent 1px 10%),
			linear-gradient(to left, var(--muted) 0 1px, transparent 1px);
	}
</style>
