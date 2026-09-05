<script>
	import { shipped, inProgress } from '$lib/data/projects.js';
	import { iso } from '$lib/date.js';
</script>

{#snippet previewRow(items)}
	<ul class="previewContainer">
		{#each items as item (item.name)}
			<li class="preview">
				<div class="clickable">
					<div class="thumb">
						<img src={item.image} alt={item.alt ?? ''} loading="lazy" />
					</div>
					<a class="name" target="_blank" rel="noopener" href={item.href}>{item.name}</a>
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
				<p class="dateUpdated">
					{#if item.completed}
						launched <time datetime={iso(item.completed)}>{item.completed}</time>
					{/if}
					{#if item.last_updated}
						last updated <time datetime={iso(item.last_updated)}>{item.last_updated}</time>
					{/if}
				</p>
			</li>
		{/each}
	</ul>
{/snippet}
<h2>Projects</h2>
<h3>Shipped</h3>
{@render previewRow(shipped)}
<h3>In-Progress</h3>
{@render previewRow(inProgress)}

<!--
<h3>Conceptualized</h3>
{@render previewRow(conceptualized)}
 -->

<style>
	h2 {
		margin: 0 0 var(--space-l);
		font-weight: 600;
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
	/* auto-fit already collapses to a single column when it runs out of room,
	   so this needs no breakpoint. */
	.previewContainer {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		width: 100%;
		grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
		gap: var(--space-m);
		align-items: start;
	}
	/* --- card --- */
	.preview {
		display: block;
		max-width: 420px;
		color: var(--text);
		font-weight: inherit;
	}
	.clickable {
		position: relative; /* scopes the stretched-link overlay to thumb + name only */
	}
	.thumb {
		aspect-ratio: 2 / 1;
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
		overflow-wrap: anywhere;
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

	.dateUpdated {
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
