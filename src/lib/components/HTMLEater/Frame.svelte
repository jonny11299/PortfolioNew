<script>
	import Ornament from './Ornament.svelte';
	import { corner, crest, side } from './ornament.js';

	// A gilt rococo mirror frame around its children. It reserves its own space with padding, so the
	// ornaments stick out past the content without spilling onto the page. `shimmer` sends a glint
	// around the ornaments.
	let { shimmer = false, children } = $props();
</script>

<div class="frame" class:shimmer>
	<div class="glass">{@render children()}</div>

	<div class="band" aria-hidden="true"></div>
	<div class="beads" aria-hidden="true"></div>
	<!-- leaves run toward the middle of each edge from both ends -->
	<div class="garland top start" aria-hidden="true"></div>
	<div class="garland top end" aria-hidden="true"></div>
	<div class="garland bottom start" aria-hidden="true"></div>
	<div class="garland bottom end" aria-hidden="true"></div>
	<div class="garland left start" aria-hidden="true"></div>
	<div class="garland left end" aria-hidden="true"></div>
	<div class="garland right start" aria-hidden="true"></div>
	<div class="garland right end" aria-hidden="true"></div>

	<!-- --order sets when each piece catches the glint, clockwise from the top left -->
	<div class="ornament corner tl" style:--order="0">
		<Ornament art={corner} viewBox="0 0 100 100" />
	</div>
	<div class="ornament crest top" style:--order="1">
		<Ornament art={crest} viewBox="0 0 200 70" />
	</div>
	<div class="ornament corner tr" style:--order="2">
		<Ornament art={corner} viewBox="0 0 100 100" />
	</div>
	<div class="ornament side right" style:--order="3">
		<Ornament art={side} viewBox="0 0 40 120" />
	</div>
	<div class="ornament corner br" style:--order="4">
		<Ornament art={corner} viewBox="0 0 100 100" />
	</div>
	<div class="ornament crest bottom" style:--order="5">
		<Ornament art={crest} viewBox="0 0 200 70" />
	</div>
	<div class="ornament corner bl" style:--order="6">
		<Ornament art={corner} viewBox="0 0 100 100" />
	</div>
	<div class="ornament side left" style:--order="7">
		<Ornament art={side} viewBox="0 0 40 120" />
	</div>
</div>

<style>
	.frame {
		/* One size drives everything; ornament.js draws on the same scale (100 units = --frame-size) */
		--frame-size: var(--frame-ornament-size, clamp(3.5rem, 9vw, 6.5rem));
		--pad: calc(var(--frame-size) * 0.4);
		--pad-block: calc(var(--frame-size) * 0.7); /* taller, for the crest and apron */
		--band: calc(var(--frame-size) * 0.16);
		--radius: var(--border-radius, 0px);

		/* Mixed into the page background rather than made transparent: it looks the same as 50% and
		   90% opacity, but overlapping pieces don't stack into brighter patches. */
		--backdrop: var(--frame-backdrop, var(--bg));
		--gilt: color-mix(in srgb, var(--primary-hover) 20%, var(--backdrop));
		--gilt-fine: color-mix(in srgb, var(--primary-hover) 90%, var(--backdrop));

		position: relative;
		box-sizing: border-box;
		width: 100%;
		padding: var(--pad-block) var(--pad);
	}

	/* --- The mirror glass: the content, with a vignette, a faint sheen and grain on top --- */
	.glass {
		position: relative;
	}
	.glass::before,
	.glass::after {
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
		box-shadow: inset 0 0 calc(var(--frame-size) * 0.3) color-mix(in srgb, #000 28%, transparent);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, #fff 12%, transparent),
			transparent 30% 70%,
			color-mix(in srgb, #fff 6%, transparent)
		);
	}

	/* --- The molding: a gilt band with fine lines at its edges and a groove near the outside --- */
	.band,
	.beads,
	.garland,
	.ornament {
		position: absolute;
		pointer-events: none;
	}
	.band {
		inset: calc(var(--pad-block) - var(--band)) calc(var(--pad) - var(--band));
		border: var(--band) solid var(--gilt);
		border-radius: calc(var(--radius) + var(--band));
		box-shadow:
			0 0 0 1px var(--gilt-fine),
			inset 0 0 0 1px var(--gilt-fine);
		outline: 1px solid var(--gilt-fine);
		outline-offset: calc(var(--band) * -0.52);
	}

	/* a row of beads along the inner edge */
	.beads {
		--at: calc(var(--band) * 0.34);
		inset: calc(var(--pad-block) - var(--at)) calc(var(--pad) - var(--at));
		border: calc(var(--band) * 0.2) dotted var(--gilt-fine);
		border-radius: calc(var(--radius) + var(--at));
	}

	/* Leaf garlands along the outer half of the band: fine-colored, cut out by a repeating leaf mask.
	   Both tiles are the same leaf, the vertical one with x and y swapped. */
	.garland {
		--leaf-h: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 12'%3E%3Cg fill='none' stroke='black' stroke-width='1.2' stroke-linecap='round'%3E%3Cpath d='M1 11C7 3 19 0 31 3C22 7 11 11 1 11Z'/%3E%3Cpath d='M3 10Q16 5 29 3.5'/%3E%3C/g%3E%3Ccircle cx='30' cy='9.5' r='1.1'/%3E%3C/svg%3E");
		--leaf-v: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 32'%3E%3Cg transform='matrix(0 1 1 0 0 0)'%3E%3Cg fill='none' stroke='black' stroke-width='1.2' stroke-linecap='round'%3E%3Cpath d='M1 11C7 3 19 0 31 3C22 7 11 11 1 11Z'/%3E%3Cpath d='M3 10Q16 5 29 3.5'/%3E%3C/g%3E%3Ccircle cx='30' cy='9.5' r='1.1'/%3E%3C/g%3E%3C/svg%3E");
		--edge: calc(var(--pad-block) - var(--pad) + var(--frame-size)); /* past the corner art */
		background: var(--gilt-fine);
	}
	.garland.top,
	.garland.bottom {
		height: calc(var(--band) * 0.5);
		-webkit-mask: var(--leaf-h) left center / auto 100% round no-repeat;
		mask: var(--leaf-h) left center / auto 100% round no-repeat;
	}
	.garland.left,
	.garland.right {
		width: calc(var(--band) * 0.5);
		-webkit-mask: var(--leaf-v) center top / 100% auto no-repeat round;
		mask: var(--leaf-v) center top / 100% auto no-repeat round;
	}
	.garland.top {
		top: calc(var(--pad-block) - var(--band));
	}
	.garland.bottom {
		bottom: calc(var(--pad-block) - var(--band));
	}
	.garland.left {
		left: calc(var(--pad) - var(--band));
	}
	.garland.right {
		right: calc(var(--pad) - var(--band));
	}
	.garland:is(.top, .bottom).start {
		left: var(--frame-size);
		right: 50%;
	}
	.garland:is(.top, .bottom).end {
		left: 50%;
		right: var(--frame-size);
	}
	.garland:is(.left, .right).start {
		top: var(--edge);
		bottom: 50%;
	}
	.garland:is(.left, .right).end {
		top: 50%;
		bottom: var(--edge);
	}
	/* flip so leaves point at the middle and their outer side faces out */
	.garland.top.end {
		transform: scaleX(-1);
	}
	.garland.left.end {
		transform: scaleY(-1);
	}
	.garland.bottom.start {
		transform: scaleY(-1);
	}
	.garland.bottom.end {
		transform: scale(-1, -1);
	}
	.garland.right.start {
		transform: scaleX(-1);
	}
	.garland.right.end {
		transform: scale(-1, -1);
	}

	/* --- Ornaments, placed so each viewBox's band lines up with .band --- */
	.corner {
		width: var(--frame-size);
		height: var(--frame-size);
	}
	.corner.tl,
	.corner.tr {
		top: calc(var(--pad-block) - var(--pad));
	}
	.corner.bl,
	.corner.br {
		bottom: calc(var(--pad-block) - var(--pad));
	}
	.corner.tl,
	.corner.bl {
		left: 0;
	}
	.corner.tr,
	.corner.br {
		right: 0;
	}
	.corner.tr {
		transform: scaleX(-1);
	}
	.corner.bl {
		transform: scaleY(-1);
	}
	.corner.br {
		transform: scale(-1, -1);
	}

	.crest {
		left: 50%;
		width: calc(var(--frame-size) * 2);
		height: var(--pad-block);
	}
	.crest.top {
		top: 0;
		transform: translateX(-50%);
	}
	.crest.bottom {
		bottom: 0;
		transform: translateX(-50%) scaleY(-1);
	}

	.side {
		top: 50%;
		width: var(--pad);
		height: calc(var(--frame-size) * 1.2);
	}
	.side.left {
		left: 0;
		transform: translateY(-50%);
	}
	.side.right {
		right: 0;
		transform: translateY(-50%) scaleX(-1);
	}

	/* --- Shimmer: a glint that travels clockwise around the ornaments --- */
	.shimmer .ornament {
		animation: glint 4.8s ease-in-out infinite;
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
	@media (prefers-reduced-motion: reduce) {
		.shimmer .ornament {
			animation: none;
		}
	}
</style>
