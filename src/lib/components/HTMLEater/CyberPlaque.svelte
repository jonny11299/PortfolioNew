<script>
	// The lowkey sibling of Plaque, for CyberFrame: a plate with two chamfered corners, a fine inner
	// ring, and short callout lines off each end. Sized by --plaque-height.
	let { children } = $props();
</script>

<div class="plaque">
	<span class="callout" aria-hidden="true"></span>
	<div class="plate">{@render children()}</div>
	<span class="callout end" aria-hidden="true"></span>
</div>

<style>
	.plaque {
		--height: var(--plaque-height, 2.75rem);
		--c: calc(var(--height) * 0.3); /* corner cut */
		/* same gilt as CyberFrame */
		--backdrop: var(--frame-backdrop, var(--bg));
		--gilt: color-mix(in srgb, var(--primary-hover) 20%, var(--backdrop));
		--gilt-fine: color-mix(in srgb, var(--primary-hover) 90%, var(--backdrop));

		display: inline-flex;
		align-items: center;
		max-width: 100%;
		height: var(--height);
		/* on the wrapper, since the plate's clip-path would clip its own glow */
		filter: drop-shadow(0 0 0.3rem color-mix(in srgb, var(--primary-hover) 45%, transparent));
	}

	/* a thin line with a square node at its outer end */
	.callout {
		position: relative;
		flex: none;
		width: calc(var(--height) * 0.5);
		height: 1px;
		background: var(--gilt-fine);
	}
	.callout::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		width: 5px;
		height: 5px;
		background: var(--gilt-fine);
		translate: 0 -50%;
	}
	.callout.end::before {
		left: auto;
		right: 0;
	}

	/* chamfered at the top left and bottom right */
	.plate {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		height: 100%;
		padding-inline: calc(var(--height) * 0.5);
		isolation: isolate; /* so the wash blends with the plate, not the page behind it */
		/* --surface, not --gilt, so the plate reads as the same material as the synth's chrome; the
		   gilt stays on the ring, the callouts and the glow */
		background: var(--surface);
		/* mixed toward the text color so it reads on light and dark themes alike */
		color: color-mix(in srgb, var(--primary-hover) 90%, var(--text));
		text-shadow: 0 0 0.35em color-mix(in srgb, var(--primary-hover) 50%, transparent);
		clip-path: polygon(
			var(--c) 0,
			100% 0,
			100% calc(100% - var(--c)),
			calc(100% - var(--c)) 100%,
			0 100%,
			0 var(--c)
		);
	}
	/* The same wash the synth's container carries, so the plaques sit in the same light. z-index: -1
	   keeps it above the plate's gilt but under the ring and the lettering, and the plate's clip-path
	   takes the chamfered corners off it too. */
	.plate::after {
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

	/* keeps the content above the ring, which is positioned */
	.plate > :global(*) {
		position: relative;
	}

	/* A 1px ring following the plate's outline: outer path, then the inner one back to the start,
	   filled evenodd. The inner cut moves in 0.586px (2 − √2) to keep the diagonal 1px thick. */
	.plate::before {
		--t: 1px;
		--ci: calc(var(--c) - var(--t) * 0.586);
		content: '';
		position: absolute;
		inset: 0;
		background: var(--gilt-fine);
		pointer-events: none;
		clip-path: polygon(
			evenodd,
			var(--c) 0,
			100% 0,
			100% calc(100% - var(--c)),
			calc(100% - var(--c)) 100%,
			0 100%,
			0 var(--c),
			var(--c) 0,
			calc(var(--t) + var(--ci)) var(--t),
			var(--t) calc(var(--t) + var(--ci)),
			var(--t) calc(100% - var(--t)),
			calc(100% - var(--t) - var(--ci)) calc(100% - var(--t)),
			calc(100% - var(--t)) calc(100% - var(--t) - var(--ci)),
			calc(100% - var(--t)) var(--t),
			calc(var(--t) + var(--ci)) var(--t)
		);
	}
</style>
