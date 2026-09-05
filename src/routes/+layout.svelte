<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import { themeStore } from '$lib/stores/theme.svelte.js';
	import Nav from '$lib/components/Nav.svelte';
	import { onMount } from 'svelte';
	import { logVisit } from '$lib/utils/engagement';

	onMount(() => {
		themeStore.init();
		logVisit();

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

<header class="siteHeader">
	<div class="wrapper headerInner">
		<div class="identity">
			<h1 class="name"><a href="/">Jonathan Bischoff</a></h1>
			<p class="role">Front-End Engineer</p>
		</div>
	</div>
</header>

<div class="wrapper layout">
	<Nav />
	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	.siteHeader {
		border-bottom: 1px solid var(--divider);
		margin-bottom: var(--space-l);
	}

	.headerInner {
		padding-block: var(--space-s);
	}

	.identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-3xs);
		width: fit-content;
	}

	/* The page's only h1: the subject of the document is the person. */
	.name {
		margin: 0;
		font-size: var(--step-2);
		font-weight: 600;
		line-height: 1.1;
		letter-spacing: -0.015em;
	}

	.name a {
		color: inherit;
		text-decoration: none;
	}

	.name a:hover,
	.name a:focus-visible {
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}

	.role {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--step--1);
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.layout {
		display: grid;
		gap: var(--space-l);
		align-items: start;
		padding-bottom: var(--space-2xl);
	}

	/*
		Single breakpoint: below this the sidebar cannot sit beside the content
		without squeezing the measure, so it stacks. Everything else is fluid.
	*/
	@media (min-width: 60rem) {
		.layout {
			grid-template-columns: var(--sidebar) minmax(0, 1fr);
			gap: var(--space-xl);
		}
	}

	.content {
		min-width: 0;
	}
</style>
