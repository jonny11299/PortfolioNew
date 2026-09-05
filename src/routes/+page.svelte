<script>
	import { sizeStore } from '$lib/stores/size.svelte';

	import ImageGallery from '$lib/components/ImageGallery.svelte';
	import ProjectsTurnstyle from '$lib/components/ProjectsTurnstyle.svelte';
	import ToolsTurnstyle from '$lib/components/ToolsTurnstyle.svelte';
	import Contact from '$lib/components/Contact.svelte';

	import me_piano from '$lib/imgs/IMG_9853.jpg';
	import color_lab_preview from '$lib/imgs/color_lab_preview.jpg';
	import ableton_live_preview from '$lib/imgs/ableton_live_preview.jpg';
	import fw_api_deal from '$lib/imgs/fw_api_deal.jpg';
	import fw_api_videos from '$lib/imgs/fw_api_deal_2.jpg';

	// const COLOR_LAB_LINK = 'example.com';

	let aspect = $derived(sizeStore.aspect);
</script>

<div class="container" class:clampWidthForPhone={aspect === 'phone'}>
	<section id="top" class="passageFullWidth">
		<div
			class:previewLeftContainer={aspect !== 'phone'}
			class:previewTopContainer={aspect === 'phone'}
		>
			<div class:previewLeftImage={aspect !== 'phone'} class:previewTopImage={aspect === 'phone'}>
				<a href="/resume.pdf" target="_blank">
					<img
						class:imageSmall={aspect !== 'phone'}
						class:imageBigger={aspect === 'phone'}
						src={me_piano}
						alt="me_piano"
					/>
				</a>
			</div>
			<div class="previewLeftText">
				<p>
					I'm <a href="/resume.pdf" target="_blank">Jonathan Bischoff</a>, a Front-End Engineer.
				</p>
			</div>
		</div>
	</section>

	<section id="projects" class="passageFullWidth">
		<ProjectsTurnstyle {aspect} />
	</section>

	<section id="tools" class="passageFullWidth">
		<ToolsTurnstyle {aspect} />
	</section>

	<section id="ethos" class="passage">
		<h1>Ethos</h1>
		<p class="headerDivider">
			<span class="keyText">Pacing</span>
		</p>
		<p>
			I like building workflows that <span class="keyText">quiet the mind</span> and open up
			<span class="keyText">creative possibilities</span>.
		</p>
		<p>The screen should never feel overwhelming.</p>
		<p>
			New features should become available to the user <span class="keyText"
				>as they venture deeper</span
			> into a specific component.
		</p>
		<p style="margin-top: 3rem;">
			This allows the user to take in information at their own pace, solidifying learning.
		</p>
		<p class="headerDivider"><span class="keyText">Modularity</span></p>
		<p>Each component should function along the <span class="keyText">same design logic</span>.</p>
		<p>
			Learning <span class="keyText">one component</span> in-depth should inform the user how they
			can expect <span class="keyText">future components</span> to work.
		</p>
		<p>
			This requires a standardizing of <span class="keyText">visual language</span>,
			<span class="keyText">workflows</span>, <span class="keyText">and keywords</span>.
		</p>

		<p style="margin-top: 3rem;">
			The result is an application that <span class="keyText">feels good to use</span>, like MacOS,
			Ableton Live, and Google Workspace.
		</p>

		<p class="headerDivider"><span class="keyText">Use</span></p>
		<p>
			The application should put the user in the <span class="keyText">driver's seat</span>.
		</p>
		<p>
			Internal state should be remembered and manipulated by the <span class="keyText"
				>application</span
			>
			in order to free up the user's <span class="keyText">mental load</span>.
		</p>
		<p>
			Friction should be <span class="keyText">minimal</span> where possible, except for operations
			with <span class="keyText">big consequences</span> like deleting a database or deploying
			information to the public. Here, friction is introduced to remind the user of the
			<span class="keyText"> gravity</span> of their actions.
		</p>
		<p style="margin-top: 3rem;">
			The result is an application that allows the user to enter a <span class="keyText"
				>flow state</span
			>
			so they can focus on what
			<span class="keyText">actually matters</span>.
		</p>
	</section>

	<section id="contact" class="passageFullWidth" style="margin-bottom: 1rem;">
		<Contact />
	</section>

	<!-- end useful part so far -->

	<!--
	<div class="passage">
		<div class="previewVerticalContainer">
			<img
				class="imageFill clickable"
				src={color_lab_preview}
				alt="color_lab_preview.jpg"
				on:click={() => window.open(COLOR_LAB_LINK, '_blank', 'noopener,noreferrer')}
			/>
			<div>
				<p>
					<a href={COLOR_LAB_LINK} target="_blank">Color Lab</a> is a browser application that lets you
					design your website's color scheme and format.
				</p>
				<p>
					It displays contrast ratios between colors so you can design readable, accessible
					applications.
				</p>
				<p>
					You can select an image to extract its colorscheme for your website, or use a picker to
					dial with more precision.
				</p>
				<p>It exports raw .css, so you can copy definitions directly into your code.</p>
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
		<div class="previewVerticalContainer">
			<img class="imageFill" src={ableton_live_preview} alt="ableton_live_preview.jpg" />

			<p>
				My favorite software to use is <span class="keyText">Ableton Live</span>.
				<span class="moreDetails">why?</span>
			</p>
		</div>
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
		<p>I'm also familiar with the following tools:</p>
		<ul>
			<li>Python</li>
			<li>C++</li>
			<li>SQL (with Supabase)</li>
		</ul>
	</div>

	<div class="passage">
		<h2>Learning Journey</h2>
		<p>
			In the past year, I learned to build websites using raw HTML and JavaScript before scaling
			into JS frameworks like Svelte and React.
		</p>
		<p>
			I built an entire music player and file-sharing app in raw HTML using a Google Sheets database
			as the backend. It works.
		</p>
	</div>

	<div class="passage">
		Todo:
		<p>Wire up all links (no dead links)</p>
		<p>allow test driving all apps</p>
		<p>write "learning journey" page and "disclaimer"</p>
		<p>write generic site-monitoring statistics, like, your javascript watcher</p>
	</div>
	 -->
</div>

<style>
	.container {
		max-width: 980px;
		margin-inline: auto;
		height: 100%;
		padding-block: 0;
		padding-inline: var(--padding);
		background: transparent;
		color: var(--text);
		border: none;
		border-radius: 0;
		overflow: hidden;

		display: flex;
		flex-direction: column;

		justify-content: flex-start;
		align-items: center;
	}
	.clampWidthForPhone {
		max-width: 28rem;
		padding-inline: 0.5rem;
	}

	h3,
	h2 {
		text-align: center;
	}

	.headerDivider {
		margin-top: 3rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--divider);
	}

	.passage {
		background-color: var(--surface);
		margin-top: 0;
		margin-bottom: 10vh;
		padding: 1.5rem;
		border: var(--border-width) solid var(--border);
		border-radius: var(--border-radius);

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
	.passageFullWidth {
		background-color: var(--surface);
		margin-top: 0;
		margin-bottom: 10vh;
		padding: 1.5rem;
		border: var(--border-width) solid var(--border);
		border-radius: var(--border-radius);
		align-self: stretch;

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

	.subdivider {
		margin: 2.5rem 0 1rem;
		font-family: var(--font-mono);
		font-size: calc(1rem * var(--font-scale));
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
		padding-bottom: 0.6rem;
		border-bottom: 1px solid var(--divider);
	}

	.glide {
		animation: glide-fade linear both;
		animation-timeline: view();
		animation-range: cover 0% cover 100%;
	}

	@keyframes glide-fade {
		0% {
			opacity: 0;
		} /* bottom edge of viewport */
		10% {
			opacity: 1;
		} /* 10% into view */
		90% {
			opacity: 1;
		} /* start of top 10% */
		100% {
			opacity: 0;
		} /* top edge of viewport */
	}

	.keyText {
		color: var(--primary);
		font-weight: bold;
		transition:
			color var(--transition-time) ease,
			border-color var(--transition-time) ease,
			background-color var(--transition-time) ease;
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
		text-align: center;
		width: 100%;
	}

	.previewTopContainer {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
	.previewTopImage {
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--border);

		align-self: auto;
		margin-inline: auto;
	}

	.clickable {
		cursor: pointer;
	}

	.imageSmall {
		max-width: 10rem;
		width: 100%;
	}
	.imageBigger {
		max-width: 18rem;
		width: 100%;
	}

	.imageFill {
		width: auto;
		max-width: 80%;
		margin: 4rem;
		border: var(--border-width) solid var(--border);
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

	.todo {
		font-weight: 400;
	}
</style>
