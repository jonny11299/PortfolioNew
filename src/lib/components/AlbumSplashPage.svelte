<script>
	import ImageGallery from '$lib/components/ImageGallery.svelte';

	import addNotes from '$lib/imgs/album/add notes.png';
	import order from '$lib/imgs/album/album order.png';
	import homepage from '$lib/imgs/album/homepage.png';
	import listen from '$lib/imgs/album/listen.png';
	import upload from '$lib/imgs/album/upload song.png';
</script>

<article class="card flow">
	<h2>Album Concept Board</h2>
	<div class="galleryBlock">
		<ImageGallery
			images={[homepage, listen, addNotes, upload, order]}
			onclick={() => console.log("display side text about why I can't show this demo")}
		/>
	</div>
	<h3>Demo Version: (in-progress)</h3>
	<p>
		This website allows my bandmates and I to upload song files as we're working on them, to build
		playlists out of these song files, and to listen to these playlists anywhere. It keeps track
		of song versions so we can see how our music is developing over time.
	</p>
	<p>
		This website was built in vanilla HTML, JS, and CSS, largely coded by-hand, and does not make
		use of any JS Frameworks such as React, Svelte, or JSX.
	</p>
	<p>
		It contains various security vulnerabilities. Until I refactor it completely, I cannot host a
		demo version. It is tightly coupled to its specific use-case and hidden online for a select
		group of people to access.
	</p>
	<h3>Context:</h3>
	<p>
		This application was built in December and January 2025-2026 in order to facilitate project
		management for my band Faunix's album. It was built in a sprint because we were actively
		mixing our album and therefore submitting various file versions from different computers. We
		wanted to track the project's history as soon as possible.
	</p>
	<p>
		It is built with HTML, CSS, and JavaScript. It does not use any JS frameworks. This was done
		intentionally to get a feel for web development in the early 2000s, and to solidify knowledge
		of the technologies underpinning modern web deveopment. Shortly after completing this project,
		I ventured more deeply into learning component-driven web architecture.
	</p>
	<p>
		For file hosting, the site uses an AWS Bucket. For organizing and sharing information across
		devices, it uses a Google Sheets blob database, where POST and GET requesets are routed
		through AppsScript.
	</p>
	<h3>Zero-Latency Technology</h3>
	<p>
		The application utilizes the browser's "localStorage" as a buffer between the Google Sheets
		database and the user's site. When the user makes changes to data, it stores these changes
		locally. This allows the user to experience zero latency. Every 5 minutes, the website checks
		for differences ("deltas") between the Google Sheets database and the user's localStorage JSON
		objects, and performs a non-destructive, two-way integration. IDs are managed to ensure that
		no duplicates are made of existing information.
	</p>
	<p>
		Using localStorage as a buffer between server data and client data allows an application to
		"get the best of both worlds." The user experiences no latency, while the information stored
		in the server remains current.
	</p>
	<h3>Does it work?</h3>
	<p>
		Yes, this website actually works as intended, and my band has been using it since January. We
		generate playlists of our own songs and stream them from anywhere, on mobile and on desktop.
	</p>
	<h3>Future goals:</h3>
	<p>
		Although it is currently hosted online, I cannot disclose its location because it contains
		various security vulnerabilities. I will someday refactor this website. In the next version, I
		intend to de-couple it from the context of my specific band's album, and generalize it to a
		site where various musicians can share their works-in-progress with their friends.
	</p>
	<p>
		I will use SupaBase to scale up the user capacity, SvelteKit to organize routing, and AWS
		Console to estimate per-user costs and set pricing accordingly.
	</p>
</article>

<style>
	.galleryBlock {
		--flow-space: var(--space-l);
		margin-block-end: var(--space-l);
	}

	h3 {
		--flow-space: var(--space-xl);
		padding-bottom: var(--space-2xs);
		border-bottom: 1px solid var(--divider);
	}
</style>
