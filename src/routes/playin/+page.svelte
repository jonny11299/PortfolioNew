<script>
	import HTMLEater from '$lib/components/HTMLEater/HTMLEater.svelte';
</script>

<div class="container">
	<h3>Hello</h3>
	<p>pip</p>
	<HTMLEater />
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
