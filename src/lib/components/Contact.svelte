<script>
</script>

<h1>Contact Me</h1>

<h3>Name:</h3>
<input id="Name" type="text" />

<h3>Email:</h3>
<input id="Email" type="text" />

<h3>Organization:</h3>
<input id="Org" type="text" />

<h3>Message:</h3>
<textarea id="Message" type="text" />

<button class="submitButton">Submit</button>

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

	.passageFullWidth {
		background-color: var(--surface);
		margin-top: 3rem;
		margin-bottom: 60vh;
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

	.frame {
		width: 100%;
		height: 100%;
		min-height: 90vh;
		max-height: 95vh;
	}

	.submitButton {
		margin-top: 3rem;
		font-size: 2em;
		border-width: 2 * var(--border-width);
	}
</style>
