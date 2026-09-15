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
	let readout = $derived(
		value == null
			? '–'
			: format
				? format(value)
				: `${value.toFixed(decimals)}${unit ? ` ${unit}` : ''}`
	);
</script>

<div class="slider">
	<div class="top">
		<label class="label" for={id}>{label}</label>
		<span class="readout">{readout}</span>
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
</div>

<style>
	.slider {
		display: flex;
		flex-direction: column;
		gap: var(--space-3xs);
		min-width: 0;
	}

	.top {
		display: flex;
		justify-content: space-between;
		gap: var(--space-2xs);
	}
	.label {
		color: var(--text-muted);
		font-size: var(--step--1);
	}
	.readout {
		font-family: var(--font-mono);
		font-size: var(--step--1);
		white-space: nowrap;
	}

	/* A native range input with its parts restyled; the vendor pseudo-elements have to be
	   written out separately, since a browser drops a whole rule with a selector it doesn't know. */
	input {
		--color: var(--accent);
		--track: color-mix(in srgb, var(--text-muted) 40%, transparent);
		--height: var(--slider-height, 0.375rem);
		--thumb: var(--slider-thumb, 0.875rem);

		appearance: none;
		width: 100%;
		height: var(--thumb);
		margin: 0;
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
		background: linear-gradient(to right, var(--color) var(--fill), var(--track) var(--fill));
	}
	input::-moz-range-track {
		height: var(--height);
		border-radius: var(--height);
		background: linear-gradient(to right, var(--color) var(--fill), var(--track) var(--fill));
	}

	input::-webkit-slider-thumb {
		appearance: none;
		width: var(--thumb);
		height: var(--thumb);
		margin-top: calc((var(--height) - var(--thumb)) / 2); /* webkit doesn't center it */
		border: none;
		border-radius: 50%;
		background: var(--text);
	}
	input::-moz-range-thumb {
		width: var(--thumb);
		height: var(--thumb);
		border: none;
		border-radius: 50%;
		background: var(--text);
	}
</style>
