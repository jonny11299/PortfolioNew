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

	let preferred = [
		{
			name: 'Zed',
			subtitle: 'Code Editor',
			purpose: 'Works quickly',
			image: zed,
			href: 'link_on_click'
		},
		{
			name: 'Svelte 5',
			subtitle: 'Framework',
			purpose: 'Compiles to vanilla JS with clean syntax',
			image: svelte,
			href: 'link_on_click'
		},
		{
			name: 'AWS',
			subtitle: 'Cloud Platform',
			purpose: 'Hosts and scales',
			image: aws,
			href: 'link_on_click'
		},
		{
			name: 'Claude',
			subtitle: 'AI Assistant',
			purpose: 'Cuts through monotonous tasks',
			image: claude,
			href: 'link_on_click'
		},
		{
			name: 'Figma',
			subtitle: 'Design Tool',
			purpose: 'Creates mockups before code',
			image: figma,
			href: 'link_on_click'
		},
		{
			name: 'Firefox',
			subtitle: 'Browser',
			purpose: 'Respects privacy and RAM',
			image: firefox,
			href: 'link_on_click'
		},
		{
			name: 'Chrome',
			subtitle: 'Browser',
			purpose: 'Runs the fastest',
			image: chrome,
			href: 'link_on_click'
		},
		{
			name: 'Node',
			subtitle: 'Runtime',
			purpose: 'Powers local development',
			image: node,
			href: 'link_on_click'
		}
	];

	let situational = [
		{
			name: 'Python',
			subtitle: 'Language',
			purpose: 'Processes large data',
			image: python,
			href: 'link_on_click'
		},
		{
			name: 'GeoPandas',
			subtitle: 'Library',
			purpose: 'Maps geospacial data',
			image: geopandas,
			href: 'link_on_click'
		},
		{
			name: 'Supabase',
			subtitle: 'Backend Platform',
			purpose: 'Scales data',
			image: supabase,
			href: 'link_on_click'
		},
		{
			name: 'SQL',
			subtitle: 'Language',
			purpose: 'Structures data',
			image: sql,
			href: 'link_on_click'
		},
		{
			name: 'C++',
			subtitle: 'Language',
			purpose: 'Gets closer to the machine',
			image: cplusplus,
			href: 'link_on_click'
		},
		{
			name: 'React',
			subtitle: 'Framework',
			purpose: 'Matches most team stacks',
			image: react,
			href: 'link_on_click'
		}
	];
</script>

{#snippet previewRow(items)}
	<div class="previewContainer">
		{#each items as item (item.name)}
			<div class="preview">
				<div class="clickable">
					<div class="thumb">
						<img src={item.image} alt="" loading="lazy" />
					</div>
					<a class="name" href={item.href}>{item.name}</a>
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
<h3>Situational</h3>
{@render previewRow(situational)}

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
	}
	h3 {
		margin: 2.5rem 0 1rem;
		font-family: var(--font-mono);
		font-size: 1rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		color: var(--text-muted);
		padding-bottom: 0.6rem;
		border-bottom: 1px solid var(--divider);
	}
	/* --- row --- */
	.previewContainer {
		display: grid;
		width: 100%;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
	}
</style>
