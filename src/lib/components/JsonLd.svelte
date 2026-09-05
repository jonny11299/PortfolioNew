<script>
	/*
		schema.org structured data, emitted as a single @graph so the Person,
		WebSite and project nodes can reference each other by @id.

		The tool and project lists are imported from the same modules the
		visible HTML renders from — the structured data cannot drift from what
		a reader actually sees.
	*/
	import { SITE_URL, SITE_NAME, SITE_ROLE, OG_IMAGE, DEFAULT_DESCRIPTION, PROFILES } from '$lib/seo.js';
	import { allTools } from '$lib/data/tools.js';
	import { shipped, inProgress } from '$lib/data/projects.js';
	import { iso } from '$lib/date.js';

	const PERSON_ID = `${SITE_URL}/#person`;

	// Relative hrefs (/album, /color_lab/index.html) must be absolute in JSON-LD.
	const absolute = (href) => (href.startsWith('http') ? href : `${SITE_URL}${href}`);

	const project = (item) => {
		const node = {
			'@type': 'CreativeWork',
			name: item.name,
			description: item.subtitle,
			url: absolute(item.href),
			creator: { '@id': PERSON_ID }
		};
		const created = iso(item.completed);
		const modified = iso(item.last_updated);
		if (created) node.dateCreated = created;
		if (modified) node.dateModified = modified;
		return node;
	};

	const graph = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Person',
				'@id': PERSON_ID,
				name: SITE_NAME,
				jobTitle: SITE_ROLE,
				description: DEFAULT_DESCRIPTION,
				url: SITE_URL,
				image: OG_IMAGE,
				sameAs: [PROFILES.github, PROFILES.linkedin],
				knowsAbout: allTools.map((t) => t.name)
			},
			{
				'@type': 'WebSite',
				'@id': `${SITE_URL}/#website`,
				url: SITE_URL,
				name: `${SITE_NAME} — ${SITE_ROLE}`,
				description: DEFAULT_DESCRIPTION,
				inLanguage: 'en',
				publisher: { '@id': PERSON_ID }
			},
			...[...shipped, ...inProgress].map(project)
		]
	};

	// Escape '<' so a closing script tag inside any string cannot end this block.
	const json = JSON.stringify(graph).replace(/</g, '\u003c');
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${json}</script>`}
</svelte:head>
