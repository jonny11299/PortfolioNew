<!-- Check out history at https://app.web3forms.com/dashboard -->

<script>
	import { PUBLIC_FORM_ACCESS_KEY as FORM_KEY } from '$env/static/public';
	import { PROFILES } from '$lib/seo.js';

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

<h2>Contact Me</h2>

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

<!--
	rel="me" marks these as the same person publishing this page. It only
	counts as verification when the profile links back here too, so both
	profiles should carry this site's URL.
-->
<p class="elsewhere">
	Also find me on
	<a href={PROFILES.github} target="_blank" rel="me noopener">GitHub</a>
	and
	<a href={PROFILES.linkedin} target="_blank" rel="me noopener">LinkedIn</a>.
</p>

<style>
	h2 {
		margin: 0 0 var(--space-l);
		font-weight: 600;
	}

	form {
		display: flex;
		flex-direction: column;
	}

	.formLabel {
		margin: var(--space-l) 0 var(--space-xs);
		font-family: var(--font-mono);
		font-size: var(--step-0);
		font-weight: 500;
		letter-spacing: 0.1em;
		color: var(--text-muted);
		padding-bottom: var(--space-2xs);
		border-bottom: 1px solid var(--divider);
	}

	.elsewhere {
		margin: var(--space-l) 0 0;
		padding-top: var(--space-s);
		border-top: 1px solid var(--divider);
		font-size: var(--step-0);
		color: var(--text-muted);
	}

	.submitButton {
		margin-top: var(--space-l);
		font-size: var(--step-2);
		font-family: var(--font-sans);
	}
</style>
