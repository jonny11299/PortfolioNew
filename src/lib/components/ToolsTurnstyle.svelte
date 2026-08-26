<script>
	import zed from '$lib/imgs/skill-previews/zed.png';
	import svelte from '$lib/imgs/skill-previews/svelte.png';
	import aws from '$lib/imgs/skill-previews/aws.png';
	import claude from '$lib/imgs/skill-previews/claude.png';
	import figma from '$lib/imgs/skill-previews/figma.jpg';
	import firefox from '$lib/imgs/skill-previews/firefox.jpg';
	import chrome from '$lib/imgs/skill-previews/chrome.jpg';
	import node from '$lib/imgs/skill-previews/node.svg';
	import python from '$lib/imgs/skill-previews/python.jpg';
	import geopandas from '$lib/imgs/skill-previews/geopandas.jpg';
	import supabase from '$lib/imgs/skill-previews/supabase.jpg';
	import react from '$lib/imgs/skill-previews/react.png';
	import sql from '$lib/imgs/skill-previews/sql.jpg';
	import cplusplus from '$lib/imgs/skill-previews/cplusplus.jpg';
	import ts from '$lib/imgs/Typescript.svg';
	import js from '$lib/imgs/javascript.png';
	import html from '$lib/imgs/HTML5.svg';
	import nextjs from '$lib/imgs/skill-previews/nextjs.jpg';

	let { aspect } = $props();

	let preferred = [
		{
			name: 'Zed',
			subtitle: 'Code Editor',
			purpose: 'Works quickly',
			image: zed,
			href: 'https://zed.dev'
		},
		{
			name: 'Svelte 5',
			subtitle: 'Component Framework',
			purpose: 'Compiles to vanilla JS and uses clean syntax',
			image: svelte,
			href: 'https://svelte.dev'
		},
		{
			name: 'SvelteKit',
			subtitle: 'Full-Stack Framework',
			purpose: 'Handles routing, like Next.js for Svelte',
			image: svelte,
			href: 'https://svelte.dev/docs/kit/introduction#What-is-SvelteKit'
		},
		{
			name: 'AWS',
			subtitle: 'Cloud Platform',
			purpose: 'Hosts large files and scales to more users',
			image: aws,
			href: 'https://aws.amazon.com'
		},
		{
			name: 'Claude',
			subtitle: 'AI Assistant',
			purpose: 'Cuts through monotonous tasks',
			image: claude,
			href: 'https://www.anthropic.com/'
		},
		{
			name: 'Figma',
			subtitle: 'Design Tool',
			purpose: 'Creates mockups visually before writing code',
			image: figma,
			href: 'https://www.figma.com'
		},
		{
			name: 'JavaScript',
			subtitle: 'Language',
			purpose: 'Powers the web',
			image: js,
			href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
		},
		{
			name: 'TypeScript',
			subtitle: 'Language',
			purpose: 'Moves JS runtime errors to compile-time errors',
			image: ts,
			href: 'https://www.typescriptlang.org/'
		},
		{
			name: 'HTML',
			subtitle: 'Markup Language',
			purpose: 'Scaffolds the web',
			image: html,
			href: 'https://info.cern.ch/hypertext/WWW/TheProject.html'
		},
		{
			name: 'Node',
			subtitle: 'Runtime',
			purpose: 'Powers local development',
			image: node,
			href: 'https://nodejs.org'
		},
		{
			name: 'Firefox',
			subtitle: 'Browser',
			purpose: 'Respects privacy and RAM',
			image: firefox,
			href: 'https://www.mozilla.org/firefox'
		},
		{
			name: 'Chrome',
			subtitle: 'Browser',
			purpose: 'Runs in-browser apps the fastest',
			image: chrome,
			href: 'https://www.google.com/chrome'
		}
	];

	let proficient = [
		{
			name: 'Python',
			subtitle: 'Language',
			purpose: 'Processes large data',
			image: python,
			href: 'https://www.python.org'
		},
		{
			name: 'GeoPandas',
			subtitle: 'Library',
			purpose: 'Maps geospacial data',
			image: geopandas,
			href: 'https://geopandas.org'
		},
		{
			name: 'Supabase',
			subtitle: 'Backend Platform',
			purpose: 'Organizes and scales data',
			image: supabase,
			href: 'https://supabase.com'
		},
		{
			name: 'SQL',
			subtitle: 'Language',
			purpose: 'Structures data',
			image: sql,
			href: 'https://www.w3schools.com/Sql/sql_quickref.asp'
		},
		{
			name: 'C++',
			subtitle: 'Language',
			purpose: 'Gets closer to the machine; we studied C++ in my undergrad (Vanderbilt 2017-2021)',
			image: cplusplus,
			href: 'https://isocpp.org'
		},
		{
			name: 'React',
			subtitle: 'Framework',
			purpose: 'Matches most team stacks',
			image: react,
			href: 'https://react.dev'
		},
		{
			name: 'NextJS',
			subtitle: 'Full-Stack Framework',
			purpose: 'Powers React apps for the modern web',
			image: nextjs,
			href: 'https://nextjs.org/'
		}
	];
</script>

{#snippet previewRow(items)}
	<div class:previewContainer={aspect !== 'phone'} class:previewContainerPhone={aspect === 'phone'}>
		{#each items as item (item.name)}
			<div class="preview">
				<div class="clickable">
					<div class="thumb">
						<img src={item.image} alt="" loading="lazy" />
					</div>
					<a class="name" target="_blank" href={item.href}>{item.name}</a>
				</div>
				<p class="subtitle">
					{#if item.subtitleLink}
						{@const i = item.subtitle.indexOf(item.subtitleLink.text)}
						{item.subtitle.slice(0, i)}
						<a class="subtitle-link" href={item.subtitleLink.href} target="_blank" rel="noopener"
							>{item.subtitleLink.text}</a
						>{item.subtitle.slice(i + item.subtitleLink.text.length)}
					{:else}
						{item.subtitle}
					{/if}
				</p>
				<p class="purpose">
					{#if item.purpose}
						{item.purpose}
					{/if}
				</p>
			</div>
		{/each}
	</div>
{/snippet}
<h1>Tools</h1>
<h3>Preferred</h3>
{@render previewRow(preferred)}
<h3>Proficient</h3>
{@render previewRow(proficient)}

<!--
<h3>Conceptualized</h3>
{@render previewRow(conceptualized)}
 -->

<style>
	h1 {
		margin: 0 0 2rem;
		font-size: 2.25rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		overflow-wrap: anywhere;
	}
	h3 {
		margin: 2.5rem 0 1rem;
		font-family: var(--font-mono);
		font-size: calc(1rem * var(--font-scale));
		font-weight: 500;
		letter-spacing: 0.1em;
		color: var(--text-muted);
		padding-bottom: 0.6rem;
		border-bottom: 1px solid var(--divider);
		overflow-wrap: anywhere;
	}
	/* --- row --- */
	.previewContainer {
		display: grid;
		width: 100%;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1.5rem;
		align-items: start;
	}
	.previewContainerPhone {
		display: grid;
		width: 100%;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.5rem;
		align-items: start;
	}
	/* --- card --- */
	.preview {
		display: block;
		max-width: 150px;
		color: var(--text);
		font-weight: inherit;
	}
	.clickable {
		position: relative; /* scopes the stretched-link overlay to thumb + name only */
	}
	.thumb {
		aspect-ratio: 1 / 1;
		overflow: hidden;
		background: transparent;
		border: var(--border-width) solid var(--border);
		border-radius: var(--border-radius);
		transition: border-color var(--transition-time) ease;

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
	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.name {
		display: block;
		margin: 0.75rem 0 0;
		font-size: 1.15rem;
		font-weight: 500;
		line-height: 1.3;
		color: var(--text);
		text-decoration: none;
		transition: color var(--transition-time) ease;
	}
	.name::after {
		content: '';
		position: absolute;
		inset: 0; /* stretches only over .clickable (thumb + name), not the subtitle */
	}
	.clickable:hover .thumb,
	.clickable:has(.name:focus-visible) .thumb {
		border-color: var(--primary-hover);
	}
	.clickable:hover .name,
	.name:focus-visible {
		color: var(--primary-hover);
	}
	.subtitle {
		margin: 0rem 0 0;
		font-size: 1rem;
		line-height: 1.3;
		color: var(--text-muted);
		cursor: default; /* explicitly non-interactive; not covered by the link overlay anyway */
	}
	.subtitle-link {
		position: relative; /* not strictly needed now, but harmless to keep */
		z-index: 1;
		text-decoration: underline;
		text-underline-offset: 2px;
		color: var(--secondary);
		font-weight: 800;
		cursor: pointer;
	}
	.subtitle-link:hover,
	.subtitle-link:focus-visible {
		color: var(--primary-hover);
	}

	.purpose {
		margin: 0.6rem 0 0.6rem;
		font-size: 0.8rem;
		font-weight: 100;
		line-height: 1;
		color: color-mix(in srgb, var(--text-muted) 70%, var(--surface));
		cursor: default; /* explicitly non-interactive; not covered by the link overlay anyway */
		font-family: var(--font-mono);
		font-size: calc(0.8rem * var(--font-scale));
	}
</style>
