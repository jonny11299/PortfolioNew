<script>
	import resume from '$lib/imgs/resume.pdf';
</script>

<div>
	<h1>Resume</h1>
	<iframe class="frame" src={resume} title="Resume"></iframe>
</div>

<style>
	.container {
		max-width: 50vw;
		margin-inline: auto;
		height: 100%;
		padding: var(--padding);
		background: transparent;
		color: var(--text);
		border: none; /* 2px solid black; */
		border-radius: 0;
		overflow: hidden;

		display: flex;
		flex-direction: column;

		justify-content: center;
		align-items: center;
	}

	.passage {
		background-color: var(--surface);
		margin-top: 3rem;
		margin-bottom: 60vh;
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
		margin-top: 3rem;
		margin-bottom: 2vh;
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

	.frame {
		width: 100%;
		height: 100%;
		min-height: 90vh;
		max-height: 95vh;
	}

	.submitButton {
		font-size: 2em;
		border-width: 2 * var(--border-width);
	}
</style>
