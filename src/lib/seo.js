/*
	Single source of truth for site-level metadata.

	SITE_URL must be absolute and must match static/CNAME — Open Graph
	consumers (LinkedIn, Slack, iMessage) fetch og:image and canonical from
	outside the site, so relative paths are useless to them.
*/
export const SITE_URL = 'https://bischoffportfolio.com';
export const SITE_NAME = 'Jonathan Bischoff';
export const SITE_ROLE = 'Front-End Engineer';

/*
	Lives in static/, not $lib/imgs: Vite content-hashes lib assets on every
	build, and a social card needs a stable URL that scrapers can cache.
	1200x630 is the size LinkedIn, Slack, X and iMessage all crop from.
*/
export const OG_IMAGE = `${SITE_URL}/og-image.png`;
export const OG_IMAGE_ALT = `${SITE_NAME} — ${SITE_ROLE}`;

export const DEFAULT_DESCRIPTION =
	'The portfolio of Jonathan Bischoff, Software Engineer and Front-End Specialist who writes in HTML, JavaScript, Python, and more.';

/*
	Profile URLs. Used two ways:
	  - JSON-LD "sameAs" (Tier 3), which needs no visible link
	  - rel="me" on any visible <a> pointing at them
	Absolute and canonical — both consumers resolve these from outside the site.
*/
export const PROFILES = {
	github: 'https://github.com/jonny11299',
	linkedin: 'https://www.linkedin.com/in/jonathan-bischoff12/'
};
