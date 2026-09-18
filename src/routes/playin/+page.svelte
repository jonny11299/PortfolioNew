<script>
	import HTMLEater from '$lib/components/HTMLEater/HTMLEater.svelte';
	import Stem from '$lib/components/Stem.svelte';
</script>

<div class="container">
	<!-- <HTMLEater /> -->
	<Stem />
</div>

<style>
	.container {
		border: none; /* 3px dotted var(--text); */
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
</style>
