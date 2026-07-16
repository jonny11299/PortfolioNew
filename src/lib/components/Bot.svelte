<script>
	import { themeStore } from '$lib/stores/theme.svelte.js';

	let open = $state(false);
</script>

<nav>
	<h3>Bot To Be</h3>
	<p>
		I think this section is actually going to be reserved for looking into more in-detail text from
		the left side, whereas the bot is going to sit in-line with the stuff on the left... I'm not
		sure
	</p>
</nav>

<style>
	nav {
		border: 2px solid black;
		border-radius: var(--border-radius);
		background: var(--surface);
		position: fixed;
		top: 1rem;
		right: var(--sticky-left-margin);
		overflow: hidden;
		padding: 0.75rem;

		max-width: var(--sticky-max-width);
		z-index: 100;
	}
</style>
