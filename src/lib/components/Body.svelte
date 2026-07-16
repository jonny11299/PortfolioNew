<script>
	import ImageGallery from './ImageGallery.svelte';

	import me_piano from '$lib/imgs/IMG_9853.jpg';
	import color_lab_preview from '$lib/imgs/color_lab_preview.jpg';
	import ableton_live_preview from '$lib/imgs/ableton_live_preview.jpg';
	import fw_api_deal from '$lib/imgs/fw_api_deal.jpg';
	import fw_api_videos from '$lib/imgs/fw_api_videos.jpg';
</script>

<div class="container">
	<div class="passage">
		<div class="previewLeftContainer">
			<div class="previewLeftImage">
				<img class="imageSmall" src={me_piano} alt="me_piano" />
			</div>
			<div class="previewLeftText">
				<p>
					I'm <span class="keyText">Jonathan Bischoff</span>, a frontend engineer from Vanderbilt
					University.
				</p>
			</div>
		</div>
	</div>

	<div class="passage">
		<p>
			I like building workflows that <span class="keyText">quiet the mind</span> and open up
			<span class="keyText">creative possibilities.</span>
		</p>
	</div>

	<div class="passage">
		<p>
			You can ask this bot anything you want to know about me, or continue scrolling to find out.
		</p>
	</div>

	<div class="passage">
		<div class="previewVerticalContainer">
			<img class="imageFill" src={color_lab_preview} alt="color_lab_preview.jpg" />
			<div>
				<p>
					<a>Color Lab</a> is a browser application that lets you design your website's color scheme and
					format.
				</p>
				<p>
					You can select an image to extract its colors, and use a picker to dial with more
					precision.
				</p>
				<p>It exports raw .css, so you can copy definitions directly into your code.</p>
				<p>
					It also displays contrast ratios between colors so you can design readable, accessible
					applications.
				</p>
			</div>
		</div>
	</div>

	<div class="passage">
		<div class="previewVerticalContainer">
			<ImageGallery
				images={[fw_api_deal, fw_api_videos]}
				onclick={() => console.log("display side text about why I can't show this demo")}
			/>
		</div>
		<div>
			<p>
				I also built an "Advertisement Video Review" engine for my <span class="keyText"
					>current job</span
				>
				in only 5 days using the
				<a
					href="https://api-docs.freewheel.tv/publisher/reference/programmatic-client-creative-api-v4"
					target="_blank">FreeWheel Client API.</a
				>
			</p>
			<p>
				(why?) Advertisers frequently upload an enormous amount of duplicate or near-duplicate
				videos, which can only be reviewed one-by-one due to limitations in their website. This can
				lead to 30-minute sessions watching the same video file on repeat.
			</p>
			<p>
				My application allows us to watch up to 50 videos in-parallel to verify they pass our
				specifications. (It uses GET requests to streamline the creative review workflow)
			</p>
		</div>
	</div>

	<div class="passage">
		<div class="previewVerticalContainer"></div>
		<div>
			<p>
				I can program in Python, too. Here's a map I rendered that shows which Washington State
				waterbodies are connected to which segments of road.
			</p>
			<p>
				This map was made as part of an ongoing effort to track and prioritize pollution cleanup for
				6PPD Quinone, a chemical used to lengthen the lifespan of car tires that is toxic to salmon,
				and <a>has been linked to extremely high morbididy rates for Coho Salmon.</a>
			</p>
		</div>
	</div>

	<div class="passage">
		<p>
			My favorite software to use is <span class="keyText">Ableton Live</span>.
			<span class="moreDetails">why?</span>
			<!-- opens up './expand/AbletonLive.svelte' -->
		</p>
	</div>

	<div class="passage">
		<h3>Disclaimer:</h3>
		<p>
			My website is anonymously observing your usage habits. <span class="moreDetails">why?</span>
		</p>
	</div>

	<div class="passage">
		<p>My <span class="keyText">design tools</span> consist largely of:</p>
		<ul>
			<li>
				Zed <span class="moreDetails">why?</span>
			</li>
			<li>
				Svelte 5 <span class="moreDetails">why?</span>
			</li>
			<li>
				Claude <span class="moreDetails">how?</span>
			</li>
			<li>Figma</li>
			<li>
				Firefox <span class="moreDetails">why?</span>
			</li>
		</ul>
	</div>

	<div class="passage">
		<p>I am also competent with the following tools:</p>
		<ul>
			<li>Python</li>
			<li>C++</li>
			<li>SQL (with Supabase)</li>
		</ul>
	</div>
</div>

<style>
	.container {
		max-width: 50vw;
		margin-inline: auto;
		height: 100%;
		padding: 1rem;
		background: var(--bg);
		color: var(--text);
		border: none /* 2px solid black; */
		border-radius: 0;
		overflow: hidden;

		display: flex;
		flex-direction: column;

		justify-content: center;
		align-items: center;
	}

	h3 {
		text-align: center;
	}

	.passage {
		background-color: var(--surface);
		margin-top: 3rem;
		margin-bottom: 2rem;
		padding: 1.5rem;
		border: 2px solid var(--border);
		border-radius: var(--border-radius);
	}

	.keyText {
		color: var(--primary-hover);
		font-weight: bold;
	}
	.moreDetails {
		color: var(--secondary);
		font-weight: bold;
	}

	.previewLeftContainer {
		display: flex;
		flex-direction: row;
		overflow: auto;
	}
	.previewLeftImage {
		margin-right: 1rem;
		padding-right: 1rem;
		border-right: 2px solid var(--border);
	}
	.previewLeftText {
		align-content: center;
	}

	.imageSmall {
		max-width: 10rem;
	}
	.imageFill {
		width: auto;
		max-width: 80%;
		margin: 4rem;
		border: 2px solid var(--border);
		border-radius: var(--border-radius);
		overflow: hidden;
	}

	.previewVerticalContainer {
		display: flex;
		flex-direction: column;
		overflow: display;

		align-items: center;
		justify-content: center;
	}
</style>
