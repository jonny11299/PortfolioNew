<script>
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	let { images } = $props();
	let size = $derived(images.length ?? 0);
	let i = $state(0);
	let direction = $state(1); // 1 = advancing right, -1 = advancing left
	function left() {
		direction = -1;
		i = (i - 1 + size) % size;
	}
	function right() {
		direction = 1;
		i = (i + 1) % size;
	}
</script>

<div class="gallery" role="group" aria-label="Image gallery">
	<div class="container">
		<button class="arrow" onclick={left} aria-label="Previous image" disabled={size === 0}>
			<svg
				viewBox="0 0 24 24"
				width="20"
				height="20"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="15 18 9 12 15 6" />
			</svg>
		</button>
		<div class="stage" aria-live="polite" aria-atomic="true">
			{#if size > 0}
				{#key i}
					<div
						class="slide"
						in:fly={{ x: direction * 60, duration: 280, easing: cubicOut }}
						out:fly={{ x: direction * -60, duration: 280, easing: cubicOut }}
					>
						<img src={images[i]} alt={`Gallery item ${i + 1} of ${size}`} class="imageFill" />
					</div>
				{/key}
			{:else}
				<p class="empty">Empty gallery.</p>
			{/if}
		</div>
		<button class="arrow" onclick={right} aria-label="Next image" disabled={size === 0}>
			<svg
				viewBox="0 0 24 24"
				width="20"
				height="20"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="9 18 15 12 9 6" />
			</svg>
		</button>
	</div>
	{#if size > 0}
		<div class="dots">
			{#each images as _, idx}
				<button
					class="dot"
					class:active={idx === i}
					onclick={() => {
						direction = idx > i ? 1 : -1;
						i = idx;
					}}
					aria-label={`Go to image ${idx + 1}`}
				></button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.gallery {
		/*
			Fluid instead of a fixed 24rem, and a query container so the narrow
			layout below keys off the gallery's own width rather than the
			viewport's — it renders inside cards of varying width.
		*/
		--gallery-height: clamp(12rem, 34vw, 24rem);
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-s);
		width: 100%;
		box-sizing: border-box;
	}
	.container {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 1.5rem;
		width: 100%;
		max-width: 900px;
		height: var(--gallery-height);
		overflow: hidden;
	}
	.arrow {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		border: var(--border-width) solid var(--border);
		background: var(--surface);
		color: var(--text);
		cursor: pointer;
		flex-shrink: 0;
		transition:
			transform var(--transition-time) ease,
			background var(--transition-time) ease,
			color var(--transition-time) ease;
	}
	.arrow:hover:not(:disabled) {
		background: var(--primary-hover);
		color: var(--surface);
		transform: scale(1.08);
	}
	.arrow:active:not(:disabled) {
		transform: scale(0.95);
	}
	.arrow:disabled {
		opacity: 0.4;
		cursor: default;
	}
	.stage {
		position: relative;
		height: var(--gallery-height);
		min-width: 0;
		min-height: 0;
		overflow: hidden;
	}
	.slide {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.imageFill {
		display: block;
		height: var(--gallery-height);
		width: auto;
		max-width: 100%;
		object-fit: contain;
		border: var(--border-width) solid var(--border);
		border-radius: var(--border-radius);
		box-sizing: border-box;
	}
	.empty {
		width: 100%;
		height: var(--gallery-height);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px dashed var(--divider);
		border-radius: var(--border-radius);
		color: var(--text-muted);
		font-family: var(--font-sans);
		box-sizing: border-box;
	}
	.dots {
		display: flex;
		gap: 0.5rem;
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		border: none;
		background: var(--divider);
		cursor: pointer;
		padding: 0;
		transition:
			background var(--transition-time) ease,
			transform var(--transition-time) ease;
	}
	.dot.active {
		background: var(--primary);
		transform: scale(1.3);
	}

	/* --- Narrow mode --- */
	/* Fits comfortably in a 320px container: the image takes the full width on
	   its own row, prev/next move to a single row underneath (kept at a 44px
	   touch target), and dots get a bigger tap area without growing visually. */
	@container (max-width: 30rem) {
		.container {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			align-items: center;
			gap: var(--space-xs);
			max-width: 100%;
			height: auto;
		}
		.stage {
			order: 1;
			flex: 1 1 100%;
			width: 100%;
		}
		.arrow {
			order: 2;
		}
		.arrow:last-of-type {
			order: 3;
		}
		.dots {
			flex-wrap: wrap;
			justify-content: center;
			max-width: 100%;
		}
		.dot {
			padding: 10px; /* expands the tap target without enlarging the visible dot */
			background-clip: content-box;
		}
	}

</style>
