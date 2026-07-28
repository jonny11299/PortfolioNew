<script>
	import color_lab_preview from '$lib/imgs/color_lab_preview.jpg';
	import fw_api_preview from '$lib/imgs/fw_api_preview.jpg';
	import album_board from '$lib/imgs/faunixband_albums.jpg';
	import bcd from '$lib/imgs/BelovedCommunityDoula.jpg';
	import fishmap from '$lib/imgs/fishmap.jpg';
	import soundlens from '$lib/imgs/SoundLens.jpg';
	/*
	CPU Dashboard
	Beloved Community Doula
	Spotify --> Tidal Playlist Migrator
	in-progress:
	Watersheds
	*/
	let shipped = [
		{
			name: 'Color Lab',
			subtitle: 'Design website colorschemes by snapping a picture! 📸',
			image: color_lab_preview,
			href: 'link_on_click',
			completed: 'Jul 6 2026'
		},
		{
			name: 'FreeWheel Creative Approvals',
			subtitle:
				'Navigate FreeWheel Adserver in a custom interface, enhanced for your workflow. Built in 5 days using the FreeWheel API.',
			subtitleLink: {
				text: 'FreeWheel API',
				href: 'https://api-docs.freewheel.tv/publisher/reference/programmatic-client-creative-api-v4'
			},
			image: fw_api_preview,
			href: 'link_on_click',
			completed: 'Jul 14 2026'
		},
		{
			name: 'Album Concept Board',
			subtitle:
				'Upload music and listen to custom playlists, built in vanilla HTML and JS, using an AWS Bucket for storage, and Google Sheets for a database!',
			image: album_board,
			href: 'link_on_click',
			completed: 'Jan 27 2026'
		},
		{
			name: 'Beloved Community Doula',
			subtitle: "A website for my girlfriend's Doula practice, built in vanilla HTML.",
			image: bcd,
			href: 'link_on_click',
			completed: 'Sep 26 2026'
		},
		{
			name: 'SoundLens',
			subtitle: 'A fun audiovisual sketch that animates music in the shape of a symmetric flower.',
			image: soundlens,
			href: 'link_on_click',
			completed: 'Nov 21 2018'
		}
	];
	let inProgress = [
		{
			name: 'Fish Map',
			subtitle:
				'A map showing the waterbodies, rivers, and watersheds of a particular quadrant in Western Washington. Built using Python with GeoPandas, from public WSDOT geodata packages, as part of an ongoing effort to protect Coho Salmon from toxic runoff chemicals.',
			image: fishmap,
			href: 'link_on_click',
			last_updated: 'Aug 8 2025'
		}
	];
	let conceptualized = [];
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
				<p class="dateUpdated">
					{#if item.completed}
						launched {item.completed}
					{/if}
					{#if item.last_updated}
						last updated {item.last_updated}
					{/if}
				</p>
			</div>
		{/each}
	</div>
{/snippet}
<h1>Projects</h1>
<h3>Shipped</h3>
{@render previewRow(shipped)}
<h3>In-Progress</h3>
{@render previewRow(inProgress)}

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
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
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
	}
</style>
