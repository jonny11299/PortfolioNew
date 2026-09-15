<script>
	import Ornament from './Ornament.svelte';
	import { plaqueEnd } from './ornament.js';

	// An engraved gilt plate with scrolled ends, sized by --plaque-height.
	let { children } = $props();
</script>

<div class="plaque">
	<div class="end"><Ornament art={plaqueEnd} viewBox="0 0 30 60" /></div>
	<div class="plate">{@render children()}</div>
	<div class="end finish"><Ornament art={plaqueEnd} viewBox="0 0 30 60" /></div>
</div>

<style>
	.plaque {
		--height: var(--plaque-height, 2.75rem);
		--notch: calc(var(--height) * 0.22);
		/* same gilt as Frame: mixed into the page background, not transparent */
		--backdrop: var(--frame-backdrop, var(--bg));
		--gilt: color-mix(in srgb, var(--primary-hover) 50%, var(--backdrop));
		--gilt-fine: color-mix(in srgb, var(--primary-hover) 90%, var(--backdrop));

		display: inline-flex;
		max-width: 100%;
		height: var(--height);
	}

	.end {
		flex: none;
		width: calc(var(--height) / 2);
		height: 100%;
	}
	.finish {
		transform: scaleX(-1);
	}

	/* A plate with concave corners cut by four radial masks, and an inner engraved rule */
	.plate {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		padding-inline: calc(var(--height) * 0.45);
		background: var(--gilt);
		box-shadow: inset 0 0 0 1px var(--gilt-fine);
		/* engraving: mixed toward the text color so it reads on light and dark themes alike */
		color: color-mix(in srgb, var(--primary-hover) 90%, var(--text));
		text-shadow: 0 1px 0 color-mix(in srgb, var(--bg) 50%, transparent);
		--corner: transparent var(--notch), #000 calc(var(--notch) + 0.5px);
		-webkit-mask:
			radial-gradient(circle at top left, var(--corner)) top left / 51% 51% no-repeat,
			radial-gradient(circle at top right, var(--corner)) top right / 51% 51% no-repeat,
			radial-gradient(circle at bottom left, var(--corner)) bottom left / 51% 51% no-repeat,
			radial-gradient(circle at bottom right, var(--corner)) bottom right / 51% 51% no-repeat;
		mask:
			radial-gradient(circle at top left, var(--corner)) top left / 51% 51% no-repeat,
			radial-gradient(circle at top right, var(--corner)) top right / 51% 51% no-repeat,
			radial-gradient(circle at bottom left, var(--corner)) bottom left / 51% 51% no-repeat,
			radial-gradient(circle at bottom right, var(--corner)) bottom right / 51% 51% no-repeat;
	}
	.plate::before {
		content: '';
		position: absolute;
		inset: calc(var(--notch) * 0.55);
		border: 1px solid var(--gilt-fine);
		pointer-events: none;
	}
</style>
