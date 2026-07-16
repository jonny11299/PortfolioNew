<script>
	import { themeStore } from '$lib/stores/theme.svelte.js';
	import favicon from '$lib/assets/favicon.png';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		themeStore.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
