<script>
	import Ornament from './Ornament.svelte';
	import { miniCrest } from './ornament.js';

	// The lowkey sibling of Frame: a chamfered gilt band and a neon rail, HUD brackets at the corners,
	// one small shell on top, and optional `tags` ({ tl, tr, bl, br }) as corner readouts. Reserves
	// its own space like Frame. `shimmer` sweeps light along the rail and glints the corner pieces.
	let { shimmer = false, tags = {}, children } = $props();
</script>

<div class="frame" class:shimmer>
	<div class="glass">
		{@render children()}
		<div class="scanlines" aria-hidden="true"></div>
	</div>

	<div class="band ring" aria-hidden="true"></div>
	<!-- one wrapper glows everything inside, since a filter on a clipped element gets clipped too -->
	<div class="neon" aria-hidden="true">
		<div class="rail ring"></div>
		<!-- --order sets when each piece catches the glint, clockwise from the top left -->
		<div class="bracket tl glints" style:--order="0"></div>
		<div class="bracket tr glints" style:--order="2"></div>
		<div class="bracket br glints" style:--order="3"></div>
		<div class="bracket bl glints" style:--order="4"></div>
		<div class="ticks"></div>
	</div>

	<div class="crest glints" style:--order="1">
		<Ornament art={miniCrest} viewBox="0 0 100 50" />
	</div>

	{#if tags.tl}<span class="tag tl" aria-hidden="true">{tags.tl}</span>{/if}
	{#if tags.tr}<span class="tag tr" aria-hidden="true">{tags.tr}</span>{/if}
	{#if tags.bl}<span class="tag bl" aria-hidden="true">{tags.bl}</span>{/if}
	{#if tags.br}<span class="tag br" aria-hidden="true">{tags.br}</span>{/if}
</div>

<style>
	.frame {
		/* One size drives everything; ornament.js draws the crest at 100 units = --frame-size */
		--frame-size: var(--frame-ornament-size, clamp(3rem, 7vw, 5rem));
		--pad: calc(var(--frame-size) * 0.45);
		--pad-block: calc(var(--frame-size) * 0.7); /* taller, for the crest and readouts */
		--gap: calc(var(--frame-size) * 0.1); /* glass to rail */
		--band: calc(var(--frame-size) * 0.1);
		--chamfer: calc(var(--frame-size) * 0.35);
		--band-x: calc(var(--pad) - var(--gap) * 1.6 - var(--band));
		--band-y: calc(var(--pad-block) - var(--gap) * 1.6 - var(--band));
		--radius: var(--border-radius, 0px);

		/* Same gilt as Frame, mixed into the page background rather than made transparent */
		--backdrop: var(--frame-backdrop, var(--bg));
		--gilt: color-mix(in srgb, var(--primary-hover) 20%, var(--backdrop));
		--gilt-fine: color-mix(in srgb, var(--primary-hover) 90%, var(--backdrop));
		--glow: color-mix(in srgb, var(--primary-hover) 70%, transparent);

		position: relative;
		box-sizing: border-box;
		width: 100%;
		padding: var(--pad-block) var(--pad);
	}

	/* --- The glass: Frame's grain, vignette and sheen, plus scanlines and a faint neon edge --- */
	.glass {
		/* cut to match the rail, which sits --gap outside it; square corners would poke past the
		   rail's diagonals */
		--c: calc(var(--chamfer) - (var(--band) + var(--gap) * 1.6) * 0.586);
		position: relative;
		clip-path: polygon(
			var(--c) 0,
			calc(100% - var(--c)) 0,
			100% var(--c),
			100% calc(100% - var(--c)),
			calc(100% - var(--c)) 100%,
			var(--c) 100%,
			0 calc(100% - var(--c)),
			0 var(--c)
		);
	}
	.glass::before,
	.glass::after,
	.scanlines {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--radius);
		pointer-events: none;
	}
	.glass::before {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		opacity: 0.06;
		mix-blend-mode: overlay;
	}
	.glass::after {
		box-shadow:
			inset 0 0 0 1px color-mix(in srgb, var(--primary-hover) 35%, transparent),
			inset 0 0 calc(var(--frame-size) * 0.4)
				color-mix(in srgb, var(--primary-hover) 14%, transparent),
			inset 0 0 calc(var(--frame-size) * 0.3) color-mix(in srgb, #000 28%, transparent);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, #fff 12%, transparent),
			transparent 30% 70%,
			color-mix(in srgb, #fff 6%, transparent)
		);
	}
	.scanlines {
		background: repeating-linear-gradient(
			to bottom,
			color-mix(in srgb, var(--text) 6%, transparent) 0 1px,
			transparent 1px 3px
		);
	}

	.band,
	.neon,
	.rail,
	.bracket,
	.ticks,
	.crest,
	.tag {
		position: absolute;
		pointer-events: none;
	}

	/* A chamfered ring of thickness --t with corner cuts of --c: the outer outline, then the inner one
	   back to the start, filled evenodd so the middle is a hole. Moving the inner corner cut in by
	   0.586 × --t (2 − √2) keeps the diagonals as thick as the straight edges. */
	.ring {
		--ci: calc(var(--c) - var(--t) * 0.586);
		clip-path: polygon(
			evenodd,
			var(--c) 0,
			calc(100% - var(--c)) 0,
			100% var(--c),
			100% calc(100% - var(--c)),
			calc(100% - var(--c)) 100%,
			var(--c) 100%,
			0 calc(100% - var(--c)),
			0 var(--c),
			var(--c) 0,
			calc(var(--t) + var(--ci)) var(--t),
			var(--t) calc(var(--t) + var(--ci)),
			var(--t) calc(100% - var(--t) - var(--ci)),
			calc(var(--t) + var(--ci)) calc(100% - var(--t)),
			calc(100% - var(--t) - var(--ci)) calc(100% - var(--t)),
			calc(100% - var(--t)) calc(100% - var(--t) - var(--ci)),
			calc(100% - var(--t)) calc(var(--t) + var(--ci)),
			calc(100% - var(--t) - var(--ci)) var(--t),
			calc(var(--t) + var(--ci)) var(--t)
		);
	}
	.band {
		--t: var(--band);
		--c: var(--chamfer);
		inset: var(--band-y) var(--band-x);
		background: var(--gilt);
	}

	.neon {
		inset: 0;
		filter: drop-shadow(0 0 calc(var(--frame-size) * 0.06) var(--glow));
	}
	.rail {
		--t: 1.5px;
		/* inset from the band, so its corner cut shrinks to stay parallel */
		--c: calc(var(--chamfer) - (var(--band) + var(--gap) * 0.6) * 0.586);
		inset: calc(var(--pad-block) - var(--gap)) calc(var(--pad) - var(--gap));
		background: var(--gilt-fine);
	}

	/* square HUD brackets standing off the chamfered corners */
	.bracket {
		--off: calc(var(--frame-size) * 0.07);
		width: calc(var(--frame-size) * 0.3);
		height: calc(var(--frame-size) * 0.3);
		border: 0 solid var(--gilt-fine);
	}
	.bracket.tl,
	.bracket.tr {
		top: calc(var(--band-y) - var(--off));
		border-top-width: 2px;
	}
	.bracket.bl,
	.bracket.br {
		bottom: calc(var(--band-y) - var(--off));
		border-bottom-width: 2px;
	}
	.bracket.tl,
	.bracket.bl {
		left: calc(var(--band-x) - var(--off));
		border-left-width: 2px;
	}
	.bracket.tr,
	.bracket.br {
		right: calc(var(--band-x) - var(--off));
		border-right-width: 2px;
	}

	/* a segmented strip under the bottom edge, fading out at both ends */
	.ticks {
		left: 50%;
		bottom: calc(var(--band-y) - var(--frame-size) * 0.2);
		width: calc(var(--frame-size) * 2.4);
		height: calc(var(--frame-size) * 0.1);
		transform: translateX(-50%);
		background: repeating-linear-gradient(to right, var(--gilt-fine) 0 2px, transparent 2px 6px);
		-webkit-mask: linear-gradient(to right, transparent, #000 25% 75%, transparent);
		mask: linear-gradient(to right, transparent, #000 25% 75%, transparent);
	}

	/* the shell's base sits in the band */
	.crest {
		left: 50%;
		top: calc(var(--band-y) + var(--band) - var(--frame-size) * 0.5);
		width: var(--frame-size);
		height: calc(var(--frame-size) * 0.5);
		transform: translateX(-50%);
	}

	/* corner readouts just outside the band, clear of the crest and ticks */
	.tag {
		--lift: calc(100% - var(--band-y) + var(--frame-size) * 0.05);
		max-width: calc(50% - var(--band-x) - var(--chamfer) - var(--frame-size) * 1.3);
		overflow: hidden;
		color: var(--gilt-fine);
		font: 600 max(0.6rem, calc(var(--frame-size) * 0.14)) / 1 var(--font-mono);
		letter-spacing: 0.08em;
		text-overflow: ellipsis;
		text-shadow: 0 0 0.4em var(--glow);
		text-transform: uppercase;
		white-space: nowrap;
	}
	.tag.tl,
	.tag.tr {
		bottom: var(--lift);
	}
	.tag.bl,
	.tag.br {
		top: var(--lift);
	}
	.tag.tl,
	.tag.bl {
		left: calc(var(--band-x) + var(--chamfer));
	}
	.tag.tr,
	.tag.br {
		right: calc(var(--band-x) + var(--chamfer));
	}

	/* --- Shimmer: Frame's glint travels around the brackets and crest, and light sweeps along the
	   rail. No neon flicker: dipping the whole .neon layer's opacity read as the frame blinking
	   out, not as a glow. --- */
	.shimmer .glints {
		animation: glint 3s ease-in-out infinite;
		animation-delay: calc(var(--order) * 0.6s);
	}
	@keyframes glint {
		0%,
		30%,
		100% {
			filter: brightness(1) drop-shadow(0 0 0 transparent);
		}
		15% {
			filter: brightness(1.4) drop-shadow(0 0 0.35rem var(--primary-hover));
		}
	}
	.shimmer .rail {
		background: linear-gradient(
				90deg,
				var(--gilt-fine) 40%,
				color-mix(in srgb, var(--primary-hover) 40%, #fff) 50%,
				var(--gilt-fine) 60%
			)
			0 0 / 300% 100%;
		animation: sweep 2.4s linear infinite;
	}
	@keyframes sweep {
		from {
			background-position: 100% 0;
		}
		to {
			background-position: 0% 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.shimmer .glints,
		.shimmer .rail {
			animation: none;
		}
	}
</style>
