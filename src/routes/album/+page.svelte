<script>
	import '../../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import Contact from '$lib/components/Contact.svelte';
	import AlbumSplashPage from '$lib/components/AlbumSplashPage.svelte';

	import { onMount } from 'svelte';

	const aspects = ['desktop', 'square', 'phone'];
	let aspect = $state('desktop');

	onMount(() => {
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
	<AlbumSplashPage {aspect} />
</div>

<style>
	.wrapper {
		box-sizing: border-box;
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
