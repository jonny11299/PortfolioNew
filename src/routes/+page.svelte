<script>
	import '../app.css';
	import Body from '$lib/components/Body.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import Bot from '$lib/components/Bot.svelte';
	import { onMount } from 'svelte';

	const aspects = ['desktop', 'square', 'phone'];
	let aspect = $state('desktop');

	onMount(() => {
		console.log('Welcome to my console logs. You must be a curious fellow.');
		console.log(
			`We're logging from "routes/+page.svelte," which is the landing page for the application.`
		);

		console.log(
			`First, let's check the screen size of the user so we can deliver the proper layout dimensions.`
		);

		const checkSize = () => {
			const desktopMin = 1.33; // above = 'desktop', below = 'square'
			const squareMin = 1; // above = 'square', below = 'phone'
			// else 'phone'

			const r = window?.innerWidth / window?.innerHeight;
			if (r) {
				if (r > desktopMin) {
					aspect = 'desktop';
				} else if (r > squareMin) {
					aspect = 'square';
				} else {
					aspect = 'phone';
				}
			} else {
				aspect = 'desktop';
			}

			console.log(
				`Screen is ${window?.innerWidth} x ${window?.innerHeight} (r = ${r.toFixed(2)}), so let's serve the ${aspect} layout.`
			);
		};

		checkSize();

		window.addEventListener('resize', checkSize);

		return () => window.removeEventListener('resize', checkSize);
	});
</script>

<!-- Control the main layout -->
<div
	class="wrapper"
	class:desktop={aspect === 'desktop'}
	class:square={aspect === 'square'}
	class:phone={aspect === 'phone'}
>
	<Nav {aspect} />
	<Body {aspect} />
</div>

<style>
	.wrapper {
		max-width: 100%;
		max-height: 100%;
		padding: 1rem;
	}

	.desktop {
		display: grid;
		grid-template-columns: 260px 1fr 260px;
		gap: 0rem;
		align-items: start;
	}

	.square {
		display: grid;
		grid-template-columns: 260px 1fr;
		gap: 0rem;
		align-items: start;
	}

	.phone {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}
</style>
