<script>
	import { SITE_URL, SITE_NAME, OG_IMAGE, OG_IMAGE_ALT, DEFAULT_DESCRIPTION } from '$lib/seo.js';

	let {
		title,
		description = DEFAULT_DESCRIPTION,
		path = '/',
		type = 'website',
		image = OG_IMAGE,
		imageAlt = OG_IMAGE_ALT
	} = $props();

	// The home page title stands alone; inner pages get the site name appended.
	let fullTitle = $derived(path === '/' ? title : `${title} · ${SITE_NAME}`);
	let url = $derived(`${SITE_URL}${path}`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta name="author" content={SITE_NAME} />
	<link rel="canonical" href={url} />

	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={imageAlt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
	<meta name="twitter:image:alt" content={imageAlt} />
</svelte:head>
