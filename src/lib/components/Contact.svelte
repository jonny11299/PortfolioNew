<!-- Check out history at https://app.web3forms.com/dashboard -->

<script>
	import { PUBLIC_FORM_ACCESS_KEY as FORM_KEY } from '$env/static/public';

	let name = $state('');
	let email = $state('');
	let org = $state('');
	let message = $state('');
	let botcheck = $state(false);

	let status = $state('idle');

	async function submit(e) {
		e.preventDefault();

		status = 'sending';
		const d = new Date();
		const date = d.toLocaleDateString();

		try {
			const res = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({
					access_key: FORM_KEY,
					name,
					email,
					org,
					message,
					botcheck,
					subject: `Portfolio contact from ${name} (${org}) on ${date}`
				})
			});
			status = res.ok ? 'sent' : 'not-okay';
		} catch (err) {
			status = 'error';
			console.error('Error submitting form', err);
		}

		if (status === 'not-okay') {
			console.error("Silent error submitting form. status === 'not-okay'");
		}
	}
</script>

<h1>Contact Me</h1>

<form onsubmit={submit}>
	<label class="formLabel" for="name">Name:</label>
	<input id="name" name="name" type="text" bind:value={name} autocomplete="name" required />

	<label class="formLabel" for="email">Email:</label>
	<input id="email" name="email" type="email" bind:value={email} autocomplete="email" required />

	<label class="formLabel" for="org">Organization:</label>
	<input id="org" name="org" type="text" bind:value={org} autocomplete="organization" required />

	<label class="formLabel" for="message">Message:</label>
	<textarea id="message" name="message" rows="6" bind:value={message} required></textarea>

	<input
		type="checkbox"
		name="botcheck"
		bind:checked={botcheck}
		style="display: none;"
		tabindex="-1"
		aria-hidden="true"
	/>

	<button type="submit" class="submitButton" disabled={status === 'sending'}>
		{status === 'sending' ? 'Sending...' : 'Submit'}
	</button>

	<p aria-live="polite">
		{#if status === 'sent'}
			Thanks for submitting. I'll get back to you soon.
		{:else if status === 'error'}
			Something went wrong. Please email me directly at <a
				href="mailto:jonathan.bischoff.12@gmail.com">jonathan.bischoff.12@gmail.com</a
			>.
		{/if}
	</p>
</form>

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
		font-size: calc(1rem * var(--font-scale));
		font-weight: 500;
		letter-spacing: 0.1em;
		color: var(--text-muted);
		padding-bottom: 0.6rem;
		border-bottom: 1px solid var(--divider);
	}

	form {
		display: flex;
		flex-direction: column;
	}

	.formLabel {
		margin: 2.5rem 0 1rem;
		font-family: var(--font-mono);
		font-size: calc(1rem * var(--font-scale));
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
		font-family: var(--font-sans);
	}
</style>
