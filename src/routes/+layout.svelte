<script>
	// import fonts:
	// Quicksand — default weight 400
	import '@fontsource/quicksand';
	import '@fontsource/quicksand/500.css';
	import '@fontsource/quicksand/700.css';

	// SN Pro
	import '@fontsource/sn-pro';
	import '@fontsource/sn-pro/600.css';

	// Fira Sans
	import '@fontsource/fira-sans';
	import '@fontsource/fira-sans/600.css';

	// Roboto
	import '@fontsource/roboto';
	import '@fontsource/roboto/500.css';

	// Indie Flower — only ships weight 400
	import '@fontsource/indie-flower';

	// IBM Plex Mono
	import '@fontsource/ibm-plex-mono';
	import '@fontsource/ibm-plex-mono/500.css';

	// Lilex — variable font, imports the whole weight axis at once
	import '@fontsource-variable/lilex';
	// Play
	import '@fontsource/play'; // 400
	import '@fontsource/play/700.css'; // 700

	// Electrolize — single weight, 400 only
	import '@fontsource/electrolize';

	// Caudex
	import '@fontsource/caudex';
	import '@fontsource/spectral';

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
