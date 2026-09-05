<script>
	import { languages, frameworks, platforms, workspace } from '$lib/data/tools.js';
</script>

{#snippet previewRow(items)}
	<ul class="previewContainer">
		{#each items as item (item.name)}
			<li class="preview">
				<div class="clickable">
					<div class="thumb">
						<img src={item.image} alt="" loading="lazy" />
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
				<p class="purpose">
					{#if item.purpose}
						{item.purpose}
					{/if}
				</p>
			</li>
		{/each}
	</ul>
{/snippet}
<h2>Tools</h2>
<h3>Languages</h3>
{@render previewRow(languages)}
<h3>Frameworks &amp; Libraries</h3>
{@render previewRow(frameworks)}
<h3>Platforms</h3>
{@render previewRow(platforms)}
<h3>Workspace</h3>
{@render previewRow(workspace)}

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
		margin: var(--space-l) 0 var(--space-xs);
		font-family: var(--font-mono);
		font-size: var(--step-1);
		font-weight: 500;
		letter-spacing: 0.1em;
		color: var(--text-muted);
		padding-bottom: var(--space-2xs);
		border-bottom: 1px solid var(--divider);
		overflow-wrap: anywhere;
	}
	/* --- row --- */
	.previewContainer {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		width: 100%;
		/*
			auto-fill, not auto-fit: these cards are capped at 150px, so
			collapsing empty tracks would strand a short row's cards far apart
			instead of keeping them on the same pitch as every other row.
		*/
		grid-template-columns: repeat(auto-fill, minmax(min(150px, 45%), 1fr));
		gap: var(--space-m);
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
			/*
				No backdrop-filter here on purpose. This sits inside an already
				frosted .card and is then covered by an opaque image, so the blur
				was invisible — but with a fixed background it still recomputed on
				every scroll frame, 26 times over. The gloss above is what reads.
			*/
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
