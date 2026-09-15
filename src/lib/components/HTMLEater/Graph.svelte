<script>
	// A line through `points`, [x, y] pairs in data units, with x running 0–xMax and y 0–yMax.
	// The data stretches to fill the plot, so its size comes only from CSS. Optional extras, drawn in
	// CSS so they stay crisp: `grid` vertical gridline divisions, `ticks` ruler marks under the axis,
	// a glowing `marker` at one [x, y], and `axis` labels for the start and end.
	let {
		points = [],
		xMax = 1,
		yMax = 1,
		label = '',
		grid = 0,
		ticks = 0,
		marker = null,
		axis = null
	} = $props();

	let polyline = $derived(points.map(([x, y]) => `${x},${yMax - y}`).join(' '));
</script>

<div class="graph">
	<div class="plot" style:--grid={grid || null}>
		<svg viewBox="0 0 {xMax} {yMax}" preserveAspectRatio="none" role="img" aria-label={label}>
			<!-- non-scaling-stroke keeps the stroke 3px however the viewBox is stretched -->
			<polyline points={polyline} vector-effect="non-scaling-stroke" />
		</svg>
		{#if marker}
			<span
				class="marker"
				style:left="{(marker[0] / xMax) * 100}%"
				style:bottom="calc(2px + (100% - 4px) * {marker[1] / yMax})"
			></span>
		{/if}
	</div>
	{#if ticks}
		<div class="ruler" style:--ticks={ticks} aria-hidden="true"></div>
	{/if}
	{#if axis}
		<div class="axis" aria-hidden="true"><span>{axis[0]}</span><span>{axis[1]}</span></div>
	{/if}
</div>

<style>
	.graph {
		--faint: color-mix(in srgb, var(--text-muted) 25%, transparent);
		width: var(--graph-width, 12rem);
		max-width: 100%; /* squeezes rather than clipping in a narrow panel */
	}

	.plot {
		position: relative;
		height: var(--graph-height, 6rem);
		border-bottom: 2px solid var(--text-muted);
		/* with --grid unset this declaration is invalid, so no gridlines are drawn */
		background: repeating-linear-gradient(
			to right,
			var(--faint) 0 1px,
			transparent 1px calc(100% / var(--grid))
		);
	}

	svg {
		position: absolute;
		inset: 2px 0; /* room for the stroke at the top and bottom of the range */
		display: block;
		width: 100%;
		height: calc(100% - 4px);
		overflow: visible;
	}
	polyline {
		fill: none;
		stroke: var(--accent);
		stroke-width: 3;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	/* a glowing dot, drawn in HTML so the stretched viewBox can't squash it */
	.marker {
		position: absolute;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--accent);
		box-shadow:
			0 0 0 0.2rem color-mix(in srgb, var(--accent) 30%, transparent),
			0 0 0.6rem var(--accent);
		transform: translate(-50%, 50%);
		pointer-events: none;
	}

	.ruler {
		height: 0.3rem;
		background: repeating-linear-gradient(
			to right,
			var(--faint) 0 1px,
			transparent 1px calc(100% / var(--ticks))
		);
	}

	.axis {
		display: flex;
		justify-content: space-between;
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: calc(var(--step--1) * 0.8);
		text-transform: uppercase;
	}
</style>
