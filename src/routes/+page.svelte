<script>
	import '../app.css';
	import Body from '$lib/components/Body.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import Bot from '$lib/components/Bot.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		console.log('Welcome to my console logs.');
	});
</script>

<Nav />
<!--
<Bot />
 -->

<Body />

<style>
</style>
