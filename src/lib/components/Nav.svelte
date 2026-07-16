<script>
	import { themeStore } from '$lib/stores/theme.svelte.js';

	let open = $state(false);
</script>

<nav>
	<button onclick={() => (open = !open)}>{open ? 'close' : 'open'}</button>
	<h1>Jonathan Bischoff</h1>
	<p>frontend engineer</p>
	<p>more details here</p>
</nav>

<style>
	nav {
		border: 2px solid black;
		border-radius: var(--border-radius);
		background: var(--surface);
		position: fixed;
		top: 1rem;
		left: var(--sticky-left-margin);
		overflow: hidden;
		padding: 0.75rem;

		max-width: var(--sticky-max-width);
		z-index: 100;
	}
</style>
