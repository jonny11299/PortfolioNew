<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import { themeStore } from '$lib/stores/theme.svelte.js';
	import { sizeStore } from '$lib/stores/size.svelte.js';
	import Nav from '$lib/components/Nav.svelte';
	import { onMount } from 'svelte';

	let aspect = $derived(sizeStore.aspect);

	onMount(() => {
		themeStore.init();

		console.log(
			'%c Welcome to my console logs. You must be a curious fellow.',
			'background: #000; color: #00f000'
		);
		console.log(
			'%c This portfolio is built using Svelte 5 and hosted on Github Pages. You can view the github repo here:',
			'background: #000; color: #00f000'
		);
		console.log(
			'%c https://github.com/jonny11299/PortfolioNew/tree/main',
			'background: #000; color: #00f000'
		);
		console.log(
			`We're logging from "routes/+layout.svelte," which is the landing page for the application.`
		);
		console.log(
			`First, let's check the screen size of the user so we can deliver the proper layout dimensions.`
		);

		sizeStore.init();

		return () => sizeStore.destroy();
	});

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
	import '@fontsource/shadows-into-light'; // only weight available: 400

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- nav -->
<!-- children -->

<!-- Control the main layout -->
<div
	class="wrapper"
	class:desktop={aspect === 'desktop'}
	class:square={aspect === 'square'}
	class:phone={aspect === 'phone'}
>
	<Nav {aspect} />
	{@render children()}
</div>

<style>
	.wrapper {
		box-sizing: border-box;
		max-width: 100%;
		max-height: 100%;
		padding: 1rem;
	}

	.desktop {
		display: grid;
		grid-template-columns: 260px 1fr 260px;
		gap: 0rem;
		align-items: start;
	}

	.square {
		display: grid;
		grid-template-columns: 260px 1fr;
		gap: 0rem;
		align-items: start;
	}

	.phone {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}
</style>
