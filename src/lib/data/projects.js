import color_lab_preview from '$lib/imgs/color_lab_preview.jpg';
import fw_api_preview from '$lib/imgs/fw_api_preview.png';
import album_board from '$lib/imgs/faunixband_albums.jpg';
import bcd from '$lib/imgs/BelovedCommunityDoula.jpg';
import fishmap from '$lib/imgs/fishmap.jpg';
import soundlens from '$lib/imgs/SoundLens.jpg';
import findReplace from '$lib/imgs/findReplace.png';
import dashboard from '$lib/imgs/dashboard.png';

export const shipped = [
	{
		name: 'Color Lab',
		alt: 'Color tool showing swatch rows sampled from a dusk photograph, contrast ratios along the top, and a live site preview beside them.',
		subtitle: 'Design website colorschemes by snapping a picture! 📸',
		image: color_lab_preview,
		href: '/color_lab/index.html',
		completed: 'Jul 6 2026'
	},
	{
		name: 'FreeWheel Creative Approvals',
		alt: 'Grid of nine ad videos playing at once, each with an ID and approve or reject controls, beside a list of deals pending approval.',
		subtitle:
			'Navigate FreeWheel Adserver in a custom interface, enhanced for your workflow. Built in 5 days using the FreeWheel API.',
		subtitleLink: {
			text: 'FreeWheel API',
			href: 'https://api-docs.freewheel.tv/publisher/reference/programmatic-client-creative-api-v4'
		},
		image: fw_api_preview,
		href: '/fw_api/index.html',
		completed: 'Jul 14 2026'
	},
	{
		name: 'CPU Dashboard',
		alt: 'Dark dashboard charting CPU, memory and temperature over 90 seconds, above a table of current, average, minimum and maximum values.',
		subtitle:
			"Monitor your computer's CPU, temperature, and RAM usage in real-time, built with Tauri, Svelte, and Rust.",
		image: dashboard,
		href: 'https://github.com/jonny11299/dashboard/tree/main',
		completed: 'Aug 26 2026'
	},
	{
		name: 'Album Concept Board',
		alt: 'Three columns on a navy background: a clickable song list, the chosen album running order, and a version dropdown for each track.',
		subtitle:
			'Upload music and listen to custom playlists, built in vanilla HTML and JS, using an AWS Bucket for storage, and Google Sheets for a database!',
		image: album_board,
		href: '/album',
		completed: 'Jan 27 2026'
	},
	{
		name: 'Beloved Community Doula',
		alt: 'Pale green homepage with a circular logo of a swaddled baby ringed by leaves, above an introduction from the doula.',
		subtitle: "A website for my girlfriend's Doula practice, built in vanilla HTML.",
		image: bcd,
		href: 'https://belovedcommunitydoula.com/',
		completed: 'Sep 26 2025'
	},
	{
		name: 'Vast Macro Replacement',
		alt: 'Digital brutalism-styled tool with a pasted excel table above a results table. The table contains placement IDs, platforms, flight dates and tag URLs.',
		subtitle:
			'Format advertising VAST links for your organization at the click of a button, using a custom ruleset',
		image: findReplace,
		href: '/find_and_replace/fr.html',
		completed: 'Apr 7 2026'
	},
	{
		name: 'SoundLens',
		alt: 'Symmetrical magenta and teal line figure resembling a flower, drawn on black, with pause and microphone controls beneath.',
		subtitle: 'A fun audiovisual sketch that animates music in the shape of a symmetric flower.',
		image: soundlens,
		href: '/sound_lens/sound_lens.html',
		completed: 'Nov 21 2018'
	}
];
export const inProgress = [
	{
		name: 'Fish Map',
		alt: 'Map of Puget Sound with red watershed outlines, blue river networks and green waterbodies, beside a panel of layer toggles.',
		subtitle:
			'A map showing the waterbodies, rivers, and watersheds of a particular quadrant in Western Washington. Built using Python with GeoPandas, from public WSDOT geodata packages, as part of an ongoing effort to protect Coho Salmon from toxic runoff chemicals.',
		image: fishmap,
		href: '/fish_app/fishApp.html',
		last_updated: 'Aug 8 2025'
	}
];
