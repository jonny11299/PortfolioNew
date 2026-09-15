<script>
	// A line through `points`, [x, y] pairs in data units, with x running 0–xMax and y 0–yMax.
	// The data stretches to fill the box, so the box's size comes only from CSS.
	let { points = [], xMax = 1, yMax = 1, label = '' } = $props();

	let polyline = $derived(points.map(([x, y]) => `${x},${yMax - y}`).join(' '));
</script>

<svg class="graph" viewBox="0 0 {xMax} {yMax}" preserveAspectRatio="none" role="img" aria-label={label}>
	<!-- non-scaling-stroke keeps the stroke 3px however the viewBox is stretched -->
	<polyline points={polyline} vector-effect="non-scaling-stroke" />
</svg>

<style>
	.graph {
		display: block;
		box-sizing: border-box;
		width: var(--graph-width, 12rem);
		height: var(--graph-height, 6rem);
		max-width: 100%; /* squeezes rather than clipping in a narrow panel */
		padding-block: 2px; /* room for the stroke at the top and bottom of the range */
		border: none;
		border-bottom: 2px solid var(--text-muted);
		overflow: visible;
	}

	polyline {
		fill: none;
		stroke: var(--accent);
		stroke-width: 3;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
</style>
