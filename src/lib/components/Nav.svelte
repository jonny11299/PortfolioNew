<script>
	import { themeStore } from '$lib/stores/theme.svelte.js';

	const themes = ['grid', 'notebook', 'frutiger', 'blue-glass', 'light', 'dark'];
	let theme = $derived(themeStore.theme);
</script>

<nav class="card">
	<div class="links">
		<a href="/">Home</a>
		<a href="/#projects">Projects</a>
		<a href="/#tools">Tools</a>
		<a href="/#ethos">Ethos</a>
		<a href="/resume.pdf" target="_blank" rel="noopener">Resume</a>
		<a href="/#contact">Contact</a>
	</div>

	<p class="label">theme</p>
	<div class="themes">
		{#each themes as t}
			<button
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
		padding: var(--space-s-m);
	}

	/*
		Sticky only once the sidebar actually sits beside the content. Stacked
		above that width it would pin over the page as you scroll.
	*/
	@media (min-width: 60rem) {
		nav {
			position: sticky;
			top: var(--space-s);
		}
	}

	/* --- links --- */
	.links {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.links a {
		font-size: var(--step-0);
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
		gap: var(--space-2xs);
		margin-left: var(--space-2xs);
	}

	.bulletted::before {
		content: '• ';
	}

	/* --- theme switcher --- */
	.label {
		margin: var(--space-s) 0 var(--space-2xs);
		padding-top: var(--space-s);
		border-top: 1px solid var(--divider);

		font-family: var(--font-mono);
		font-size: var(--step--1);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/*
		One button per row at full width, so switching themes cannot reflow the
		buttons out from under the cursor.
	*/
	.themes {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-3xs);
	}

	.themes button {
		width: 100%;
		margin: 0;
		padding: 0.15rem var(--space-2xs);

		border: 1px solid var(--divider);
		border-radius: var(--border-radius);
		background: transparent;

		font-family: var(--font-mono);
		font-size: var(--step--1);
		line-height: 1.6;
		color: var(--text-muted);
		cursor: pointer;
		transition:
			color var(--transition-time) ease,
			border-color var(--transition-time) ease,
			background-color var(--transition-time) ease;
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
	/*
		Below 60rem the nav is a full-width bar rather than a sidebar, so links
		and theme buttons run horizontally instead of stacking.
	*/
	@media (max-width: 59.999rem) {
		.links {
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
			column-gap: var(--space-s);
		}

		.sections {
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
			column-gap: var(--space-s);
			margin-left: 0;
		}

		.themes {
			display: flex;
			flex-wrap: wrap;
		}

		.themes button {
			flex: 1 1 auto;
			width: auto;
		}
	}
</style>
