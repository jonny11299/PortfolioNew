<script>
	let {
		value = $bindable(),
		min = 0,
		max = 1,
		step = 0.01,
		log = false, // exponential response for ranges spanning orders of magnitude; min must be > 0
		reverse = false, // clockwise lowers the value, e.g. a shorter step for more speed
		label = '',
		unit = '',
		format = undefined, // value => readout text, in place of the number and unit
		reset = undefined // double-click returns here
	} = $props();

	const START = 135; // SVG angles run clockwise from 3 o'clock, so this is 7:30
	const SWEEP = 270; // degrees of travel, ending at 4:30
	const DRAG_RANGE = 150; // px of vertical drag for the full range; shift makes it 4× finer

	let decimals = $derived((String(step).split('.')[1] ?? '').length);
	let norm = $derived(toNorm(value));
	let angle = $derived(START + SWEEP * norm);
	let readout = $derived(
		value == null
			? '–'
			: format
				? format(value)
				: `${value.toFixed(decimals)}${unit ? ` ${unit}` : ''}`
	);
	// { y, norm } while a pointer is held on the dial. Raw state: only whether it's set is shown,
	// so moving it doesn't need to trigger anything.
	let drag = $state.raw(null);

	function clamp(n, lo, hi) {
		return Math.min(hi, Math.max(lo, n));
	}

	// value to 0–1 knob position
	function toNorm(v) {
		const n = log ? Math.log(v / min) / Math.log(max / min) : (v - min) / (max - min);
		const clamped = clamp(n || 0, 0, 1); // null gives NaN or -Infinity
		return reverse ? 1 - clamped : clamped;
	}

	// snaps to step and range, dropping float noise like 0.30000000000000004
	function snap(v) {
		return clamp(Number((Math.round(v / step) * step).toFixed(decimals)), min, max);
	}

	function fromNorm(n) {
		n = clamp(n, 0, 1);
		if (reverse) n = 1 - n;
		return snap(log ? min * (max / min) ** n : min + (max - min) * n);
	}

	function onpointerdown(event) {
		event.currentTarget.setPointerCapture(event.pointerId);
		drag = { y: event.clientY, norm };
	}

	function onpointermove(event) {
		if (!drag) return;
		const range = event.shiftKey ? DRAG_RANGE * 4 : DRAG_RANGE;
		// accumulate from the last event so toggling shift mid-drag doesn't jump
		drag.norm = clamp(drag.norm + (drag.y - event.clientY) / range, 0, 1);
		drag.y = event.clientY;
		value = fromNorm(drag.norm);
	}

	function endDrag() {
		drag = null;
	}

	function onkeydown(event) {
		const direction = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[event.key];
		// Home and End are the ends of the dial, which are swapped when reversed
		if (event.key === 'Home') value = fromNorm(0);
		else if (event.key === 'End') value = fromNorm(1);
		else if (direction) {
			const next = fromNorm(norm + direction * (event.shiftKey ? 0.1 : 0.01));
			// low on a log range a small move can round back to the same value
			value = next === value ? snap(value + direction * (reverse ? -step : step)) : next;
		} else return;
		event.preventDefault();
	}

	function point(degrees, radius) {
		const radians = (degrees * Math.PI) / 180;
		return [50 + radius * Math.cos(radians), 50 + radius * Math.sin(radians)];
	}

	function arc(from, to) {
		const largeArc = to - from > 180 ? 1 : 0;
		return `M ${point(from, 40)} A 40 40 0 ${largeArc} 1 ${point(to, 40)}`;
	}
</script>

<div class="knob">
	<svg
		class="dial"
		class:dragging={drag !== null}
		viewBox="0 0 100 100"
		role="slider"
		tabindex="0"
		aria-label={label}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={value}
		aria-valuetext={readout}
		{onpointerdown}
		{onpointermove}
		onpointerup={endDrag}
		onlostpointercapture={endDrag}
		{onkeydown}
		ondblclick={() => reset !== undefined && (value = reset)}
	>
		<path class="track" d={arc(START, START + SWEEP)} />
		{#if norm > 0}
			<path class="fill" d={arc(START, angle)} />
		{/if}
		<line class="pointer" x1="50" y1="50" x2={point(angle, 26)[0]} y2={point(angle, 26)[1]} />
	</svg>
	<span class="label">{label}</span>
	<span class="readout">{readout}</span>
</div>

<style>
	.knob {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3xs);
		min-width: 0;
	}

	.dial {
		width: var(--knob-size, 3rem);
		height: var(--knob-size, 3rem);
		overflow: visible;
		cursor: ns-resize;
		touch-action: none; /* a drag turns the knob instead of scrolling the page */
	}
	.dial:focus-visible {
		outline: 2px solid var(--secondary);
		outline-offset: 2px;
		border-radius: 50%;
	}

	.track,
	.fill {
		fill: none;
		stroke-width: 10;
		stroke-linecap: round;
	}
	.track {
		stroke: var(--text-muted);
		opacity: 0.4;
	}
	.fill {
		stroke: var(--accent);
		transition: stroke 120ms;
	}
	/* dragging too, since the pointer can leave the dial mid-drag */
	.dial:hover .fill,
	.dial.dragging .fill {
		stroke: var(--primary-hover);
	}
	.pointer {
		stroke: var(--text);
		stroke-width: 8;
		stroke-linecap: round;
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
</style>
