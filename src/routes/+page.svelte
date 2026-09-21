<script>
	import Seo from '$lib/components/Seo.svelte';
	import JsonLd from '$lib/components/JsonLd.svelte';
	import { SITE_NAME, SITE_ROLE } from '$lib/seo.js';
	import ImageGallery from '$lib/components/ImageGallery.svelte';
	import ProjectsTurnstyle from '$lib/components/ProjectsTurnstyle.svelte';
	import ToolsTurnstyle from '$lib/components/ToolsTurnstyle.svelte';
	import Contact from '$lib/components/Contact.svelte';
	import SocialIcon from '$lib/components/SocialIcon.svelte';
	import HTMLEater from '$lib/components/HTMLEater/HTMLEater.svelte';
	import CyberFrame from '$lib/components/HTMLEater/CyberFrame.svelte';

	import me_piano from '$lib/imgs/IMG_9853.jpg';
	import color_lab_preview from '$lib/imgs/color_lab_preview.jpg';
	import ableton_live_preview from '$lib/imgs/ableton_live_preview.jpg';
	import fw_api_deal from '$lib/imgs/fw_api_deal.jpg';
	import fw_api_videos from '$lib/imgs/fw_api_deal_2.jpg';

	// const COLOR_LAB_LINK = 'example.com';
</script>

<Seo title={`${SITE_NAME} — ${SITE_ROLE}`} path="/" />
<JsonLd />

<div class="container">
	<section id="top" class="card intro">
		<a class="introImage" href="/resume.pdf" target="_blank" rel="noopener">
			<img src={me_piano} alt="Jonathan Bischoff at a piano" />
		</a>
		<div class="introText">
			<p>
				I'm <a href="/resume.pdf" target="_blank" rel="noopener">Jonathan Bischoff</a>, a Full Stack
				Engineer.
			</p>
			<br />
			<p>I work in the world of digital advertising, and I love music.</p>
		</div>
	</section>

	<HTMLEater />

	<section id="projects" class="card">
		<ProjectsTurnstyle />
	</section>

	<section id="tools">
		<!-- the synth's frame, blinking on its own since there's no playback to follow -->
		<CyberFrame shimmer>
			<div class="framed">
				<ToolsTurnstyle />
			</div>
		</CyberFrame>
	</section>

	<section id="ethos" class="card flow">
		<h2>Ethos</h2>

		<p class="subhead">Pacing</p>
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
		<p class="conclusion">
			This allows the user to take in information at their own pace, solidifying learning.
		</p>

		<p class="subhead">Modularity</p>
		<p>
			Each component should function along the <span class="keyText">same design logic</span>.
		</p>
		<p>
			Learning <span class="keyText">one component</span> in-depth should inform the user how they
			can expect <span class="keyText">future components</span> to work.
		</p>
		<p>
			This requires a standardizing of <span class="keyText">visual language</span>,
			<span class="keyText">workflows</span>, <span class="keyText">and keywords</span>.
		</p>
		<p class="conclusion">
			The result is an application that <span class="keyText">feels good to use</span>, like MacOS,
			Ableton Live, and Google Workspace.
		</p>

		<p class="subhead">Use</p>
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
		<p class="conclusion">
			The result is an application that allows the user to enter a <span class="keyText"
				>flow state</span
			>
			so they can <span class="keyText">move data</span> at the
			<span class="keyText">pace of their mind</span>.
		</p>
	</section>

	<section id="contact">
		<!-- the synth's frame, blinking on its own since there's no playback to follow -->
		<CyberFrame shimmer>
			<div class="framed">
				<Contact />
			</div>
		</CyberFrame>
	</section>

	<div class="finalIcons">
		<SocialIcon platform="linkedin" />
		<SocialIcon platform="github" />
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		color: var(--text);
	}

	/*
		Section rhythm lives in one place now, instead of a margin-bottom: 10vh
		on every card.
	*/
	.container > section + section {
		margin-block-start: var(--space-xl);
	}

	/* --- intro --- */
	/*
		Wraps on its own when the text can no longer hold its min-width, so it
		needs no breakpoint and no JS measurement.
	*/
	/* nowrap: the sentence always sits beside the thumbnail, never under it */
	.intro {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		gap: var(--space-s-m);
	}

	.introImage {
		flex: 0 0 auto;
	}

	.introImage img {
		display: block;
		width: clamp(5.5rem, 16vw, 12rem);
		height: auto;
		border-radius: calc(var(--border-radius) / 2);
	}

	.introText {
		flex: 1 1 0;
		min-width: 0;
	}

	.introText p {
		margin: 0;
		font-size: var(--step-1);
	}

	/* --- ethos --- */
	.subhead {
		font-family: var(--font-mono);
		font-size: var(--step-0);
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);

		padding-bottom: var(--space-2xs);
		border-bottom: 1px solid var(--divider);

		--flow-space: var(--space-xl);
	}

	.conclusion {
		--flow-space: var(--space-m);
	}

	.finalIcons {
		display: flex;
		flex-direction: row-reverse;
		width: 100%;
		align-items: center;
		margin-top: var(--space-m);
		gap: var(--space-xs);
	}

	/* --- framed sections --- */
	/*
		CyberFrame replaces the card on these, so the body carries the padding the
		card used to: the glass is clipped at the corners and content would run
		into the cut.
	*/
	.framed {
		padding: var(--space-xs) var(--space-s);
	}

	/* --- shared bits --- */
	.keyText {
		color: var(--primary);
		font-weight: bold;
		transition:
			color var(--transition-time) ease,
			border-color var(--transition-time) ease,
			background-color var(--transition-time) ease;
	}
</style>
