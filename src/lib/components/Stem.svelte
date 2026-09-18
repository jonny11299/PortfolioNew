<script>
	/*
		A fiddlehead vine that carries screenshots.

		The geometry lives in $lib/utils/stem.js — a bezier trunk flowing into
		a sine strand, a stem forking off near every crest and curling at its
		tip, and a crown curl where the strand runs out. This file turns that
		into an SVG plus one HTML card hung just above each curl.

		Two things make a pile of mismatched screenshots sit on it gracefully:

		1. Cards are sized by equal *area*, not by their pixels. A 994x667 and
		   a 226x162 come out the same visual weight, each keeping its own
		   proportions. Aspect is clamped, so nothing can stretch the layout.
		2. The viewBox is computed from the widest card the clamp allows, not
		   from the images. It is therefore known before a single byte loads,
		   so the composition never reflows — only the card boxes settle, and
		   they stay hidden until they have.
	*/
	import { buildStemLayout, cardRect, COMPACT } from '$lib/utils/stem.js';

	/* Every screenshot in the folder, in filename order, as the default set. */
	const found = import.meta.glob('../imgs/screenshots/*.{png,jpg,jpeg,webp,avif}', {
		eager: true,
		query: '?url',
		import: 'default'
	});
	const fallback = Object.keys(found)
		.sort()
		.map((k) => ({ src: found[k] }));

	let {
		/*
			Accepts bare URLs or { src, alt, href, caption }. Captions and alt
			text are worth passing in — the filenames these screenshots carry
			make hopeless alternative text.
		*/
		items = fallback,
		/* Container width below which the cards stack over the vine instead of beside it. */
		compactAt = 700,
		options = {}
	} = $props();

	const normalised = $derived(
		items.map((it, i) => {
			const o = typeof it === 'string' ? { src: it } : it;
			return { alt: `Screenshot ${i + 1}`, ...o };
		})
	);

	let containerWidth = $state(0);
	let mounted = $state(false);

	/*
		`compact` is a boolean, so the layout is rebuilt when the breakpoint is
		crossed rather than on every pixel of a resize.
	*/
	const compact = $derived(containerWidth > 0 && containerWidth < compactAt);
	const hasCaptions = $derived(normalised.some((it) => it.caption));

	const layout = $derived(
		buildStemLayout(normalised.length, {
			...(compact ? COMPACT : {}),
			...(hasCaptions ? { captionSpace: 70 } : {}),
			...options
		})
	);

	/*
		Real aspect ratios arrive with the images. Until one does, its card is
		laid out at a neutral 3:2 and kept hidden, so the settle is never seen.
	*/
	let ratios = $state([]);
	let shown = $state([]);
	let near = $state([]);

	const cards = $derived(
		layout.stems.map((stem, i) => {
			const aspect = ratios[i] ?? 1.5;
			const r = cardRect(stem, aspect, layout);
			const o = layout.options;
			return {
				left: (r.x / layout.width) * 100,
				top: (r.y / layout.height) * 100,
				width: (r.w / layout.width) * 100,
				ratio: `${r.w} / ${r.h}`,
				/*
					Inside the clamp the card already matches the image, so cover
					is a no-op. Outside it — a panorama, a tall phone capture —
					the card cannot match, and letterboxing beats lopping the
					ends off someone's screenshot.
				*/
				fit: aspect < o.cardAspectMin || aspect > o.cardAspectMax ? 'contain' : 'cover',
				dir: stem.dir
			};
		})
	);

	function measure(event, i) {
		const img = event.currentTarget;
		if (img.naturalWidth && img.naturalHeight) {
			ratios[i] = img.naturalWidth / img.naturalHeight;
		}
		shown[i] = true;
	}

	/*
		Reveal each card as its curl scrolls into view, so the vine reads as
		growing up the page rather than arriving all at once. Cards are plain
		visible until this runs, which keeps the no-JS and pre-hydration
		render correct.
	*/
	let root;
	$effect(() => {
		const count = normalised.length;
		mounted = true;
		if (!root || typeof IntersectionObserver === 'undefined') {
			// no observer to lean on — show everything rather than nothing
			near = Array.from({ length: count }, () => true);
			return;
		}

		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					near[Number(entry.target.dataset.index)] = true;
					io.unobserve(entry.target);
				}
			},
			{ rootMargin: '0px 0px -12% 0px' }
		);
		for (const el of root.querySelectorAll('.card')) io.observe(el);
		return () => io.disconnect();
	});
</script>

<div
	class="stem"
	class:reveal={mounted}
	bind:this={root}
	bind:clientWidth={containerWidth}
	style:--ratio="{layout.width} / {layout.height}"
>
	<!-- Decorative: every card below carries the real content. -->
	<svg
		class="vine"
		viewBox="0 0 {layout.width} {layout.height}"
		preserveAspectRatio="xMidYMid meet"
		aria-hidden="true"
		focusable="false"
	>
		<!--
			Outline pass first, then the fill on top — the same two-layer trick
			the original sketch used. Drawing every shape's outline before any
			fill is what stops the seams showing where a stem forks off.
		-->
		<g class="edge">
			<path d={layout.strand} />
			{#each layout.stems as stem, i (i)}
				<path d={stem.d} />
			{/each}
		</g>
		<g class="ink">
			<path d={layout.strand} />
			{#each layout.stems as stem, i (i)}
				<path d={stem.d} />
			{/each}
		</g>
	</svg>

	{#each normalised as item, i (item.src)}
		{@const c = cards[i]}
		{#if c}
			<figure
				class="card"
				class:loaded={shown[i]}
				class:near={near[i]}
				class:left={c.dir < 0}
				data-index={i}
				style:left="{c.left}%"
				style:top="{c.top}%"
				style:width="{c.width}%"
				style:--card-ratio={c.ratio}
				style:--fit={c.fit}
				style:--delay="{(i % 3) * 70}ms"
			>
				{#if item.caption}
					<figcaption>{item.caption}</figcaption>
				{/if}
				<svelte:element
					this={item.href ? 'a' : 'div'}
					class="frame"
					href={item.href}
					target={item.href ? '_blank' : undefined}
					rel={item.href ? 'noopener' : undefined}
				>
					<img
						src={item.src}
						alt={item.alt}
						loading="lazy"
						decoding="async"
						onload={(e) => measure(e, i)}
						onerror={(e) => measure(e, i)}
					/>
				</svelte:element>
			</figure>
		{/if}
	{/each}
</div>

<style>
	.stem {
		/*
			Overridable so the vine can be tinted per theme without touching
			the geometry.
		*/
		--stem-ink: var(--text);
		--stem-edge: color-mix(in srgb, var(--secondary) 60%, var(--bg));

		position: relative;
		/*
			A declared ratio gives the box a definite height before the SVG has
			laid out, which is what lets the cards position themselves in plain
			percentages of the same coordinate space.
		*/
		aspect-ratio: var(--ratio);
		width: 100%;
		margin-inline: auto;
		/* card radius and caption size key off the composition, not the viewport */
		container-type: inline-size;
	}

	.vine {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		overflow: visible;
	}
	.edge {
		fill: var(--stem-edge);
		stroke: var(--stem-edge);
		stroke-width: 7;
		stroke-linejoin: round;
	}
	.ink {
		fill: var(--stem-ink);
	}

	/* --- cards --- */
	.card {
		position: absolute;
		margin: 0;
	}

	.frame {
		/*
			The ratio sits here rather than on the figure so a caption can hang
			above the card without shifting the image off its curl.
		*/
		display: block;
		width: 100%;
		aspect-ratio: var(--card-ratio);
		overflow: hidden;
		border: var(--border-width) solid var(--border);
		border-radius: clamp(0.35rem, 1.4cqw, 1rem);
		background: var(--surface);
		box-shadow: 0 0.6cqw 2cqw rgba(0, 0, 0, 0.18);
		transition:
			transform var(--transition-time) ease,
			box-shadow var(--transition-time) ease;
	}
	.frame img {
		display: block;
		width: 100%;
		height: 100%;
		/* cover inside the aspect clamp, contain outside it — see `fit` above */
		object-fit: var(--fit, cover);
	}

	/* Lift away from the vine on hover; outward, so the curl stays visible. */
	a.frame:hover,
	a.frame:focus-visible {
		transform: translate(0.6cqw, -0.6cqw) scale(1.025);
		box-shadow: 0 1.2cqw 3cqw rgba(0, 0, 0, 0.26);
	}
	.card.left a.frame:hover,
	.card.left a.frame:focus-visible {
		transform: translate(-0.6cqw, -0.6cqw) scale(1.025);
	}

	figcaption {
		position: absolute;
		bottom: 100%;
		left: 0;
		right: 0;
		margin: 0 0 0.6cqw;
		font-family: var(--font-mono);
		font-size: clamp(0.62rem, 1.5cqw, 0.85rem);
		line-height: 1.25;
		color: var(--text-muted);
		text-align: center;
		overflow-wrap: anywhere;
	}

	/*
		`.reveal` is added on mount, so the server-rendered and no-JS versions
		show every card outright and only the hydrated one animates.
	*/
	.reveal .card {
		opacity: 0;
		transform: translateY(1.5cqw) scale(0.97);
		transition:
			opacity 0.5s ease var(--delay),
			transform 0.5s cubic-bezier(0.2, 0.8, 0.25, 1) var(--delay);
	}
	.reveal .card.loaded.near {
		opacity: 1;
		transform: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal .card {
			transform: none;
			transition: opacity 0.2s ease;
		}
		.frame,
		a.frame:hover,
		a.frame:focus-visible {
			transform: none;
			transition: none;
		}
	}
</style>
