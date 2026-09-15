<script>
	// Draws one ornament from ornament.js, scaled to fill its parent. `art.half` is drawn as is and
	// again through `art.mirror`, then `art.center` once on top. Colors come from --gilt (bodies)
	// and --gilt-fine (details), set by an ancestor.
	let { art, viewBox } = $props();
</script>

<svg {viewBox} aria-hidden="true">
	<!-- declared inside <svg> so the shapes are created in the SVG namespace -->
	{#snippet layer(shapes)}
		{#each shapes.strokes ?? [] as d, i (i)}<path class="stroke" {d} />{/each}
		{#each shapes.fills ?? [] as d, i (i)}<path class="fill" {d} />{/each}
		{#each shapes.lines ?? [] as d, i (i)}<path class="line" {d} />{/each}
		{#each shapes.dots ?? [] as [cx, cy, r], i (i)}<circle class="dot" {cx} {cy} {r} />{/each}
	{/snippet}

	{#if art.half}
		{@render layer(art.half)}
		<g transform={art.mirror}>{@render layer(art.half)}</g>
	{/if}
	{#if art.center}
		{@render layer(art.center)}
	{/if}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	/* the thick gilt body under a scroll, with its carved line drawn on top as .line */
	.stroke {
		fill: none;
		stroke: var(--gilt);
		stroke-width: 5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.fill {
		fill: var(--gilt);
		stroke: var(--gilt-fine);
		stroke-width: 0.9;
		stroke-linejoin: round;
	}
	.line {
		fill: none;
		stroke: var(--gilt-fine);
		stroke-width: 1.3;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.dot {
		fill: var(--gilt-fine);
	}
</style>
