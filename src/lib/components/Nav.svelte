<script>
	import { themeStore } from '$lib/stores/theme.svelte.js';
	import resume from '$lib/imgs/resume.pdf';

	let { aspect } = $props();

	const themes = ['notebook', 'frutiger', 'grid', 'blue-glass', 'light', 'dark'];
	let theme = $derived(themeStore.theme);
</script>

<nav class:applySticky={aspect !== 'phone'}>
	<h1>Jonathan Bischoff</h1>
	<p class="role">frontend engineer</p>

	<div class="links">
		<a href="/">Home</a>
		<div class="sections">
			<a class="bulletted" href="/#projects">Projects</a>
			<a class="bulletted" href="/#ethos">Ethos</a>
			<a class="bulletted" href="/#tools">Tools</a>
		</div>
		<a href={resume} target="_blank">Resume</a>
		<a href="/#contact">Contact</a>
	</div>

	<p class="label">theme</p>
	<div class="themes">
		{#each themes as t}
			<button
				class:phoneWidth={aspect === 'phone'}
				class:desktopWidth={aspect !== 'phone'}
				onclick={() => themeStore.setTheme(t)}
				aria-current={theme === t ? 'true' : undefined}
			>
				{t}
			</button>
		{/each}
	</div>
</nav>

<style>
	nav {
		z-index: 100;
		max-width: var(--sticky-max-width);
		padding: var(--padding);

		background: var(--surface);
		border: var(--border-width) solid var(--border);
		border-radius: var(--border-radius);
		color: var(--text);

		:global([data-theme='light']) & {
			box-shadow: 2px 3px;
		}

		:global([data-theme='frutiger']) & {
			background-image: linear-gradient(
				to bottom,
				rgba(255, 255, 255, 0.32) 0%,
				rgba(255, 255, 255, 0.18) 25%,
				rgba(255, 255, 255, 0.04) 70%,
				rgba(255, 255, 255, 0.14) 100%
			);
			box-shadow:
				inset 0 1px 0 rgba(255, 255, 255, 0.7),
				0 2px 8px rgba(0, 40, 70, 0.35);
			backdrop-filter: blur(10px) saturate(1.4);
		}
	}

	.applySticky {
		position: sticky;
		top: 1rem;
	}

	/* --- identity --- */
	h1 {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 600;
		line-height: 1.15;
		letter-spacing: -0.01em;
	}

	.role {
		margin: 0.35rem 0 0;
		font-size: 0.8rem;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	/* --- links --- */
	.links {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;

		margin-top: 1.1rem;
		padding-top: 1.1rem;
		border-top: 1px solid var(--divider);
	}

	.links a {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--secondary);
		text-decoration: none;
		width: fit-content;
		transition: color var(--transition-time) ease;
	}

	.links a:hover,
	.links a:focus-visible {
		color: var(--primary-hover);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.sections {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-left: 0.4rem;
	}
	.bulletted::before {
		content: '• ';
	}

	/* --- theme switcher --- */
	.label {
		margin: 1.1rem 0 0.6rem;
		padding-top: 1.1rem;
		border-top: 1px solid var(--divider);

		font-family: var(--font-mono);
		font-size: calc(0.7rem * var(--font-scale));
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.themes {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.themes button {
		margin: 0;
		padding: 0.15rem 0.55rem;

		border: 1px solid var(--divider);
		border-radius: var(--border-radius);
		background: transparent;

		font-family: var(--font-mono);
		font-size: 0.72rem;
		line-height: 1.6;
		color: var(--text-muted);
		cursor: pointer;
		transition:
			color var(--transition-time) ease,
			border-color var(--transition-time) ease,
			background-color var(--transition-time) ease;
	}

	.phoneWidth {
		width: 100%;
	}
	.desktopWidth {
		width: 61%;
	}

	.themes button:hover {
		color: var(--text);
		border-color: var(--text-muted);
		background: color-mix(in srgb, var(--text) 6%, transparent);
	}

	.themes button[aria-current='true'] {
		color: var(--secondary);
		border-color: var(--secondary);
		background: color-mix(in srgb, var(--secondary) 15%, transparent);
	}
</style>
