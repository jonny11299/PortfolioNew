import zed from '$lib/imgs/skill-previews/zed.png';
import svelte from '$lib/imgs/skill-previews/svelte.png';
import aws from '$lib/imgs/skill-previews/aws.png';
import claude from '$lib/imgs/skill-previews/claude.png';
import figma from '$lib/imgs/skill-previews/figma.jpg';
import firefox from '$lib/imgs/skill-previews/firefox.jpg';
import chrome from '$lib/imgs/skill-previews/chrome.jpg';
import python from '$lib/imgs/skill-previews/python.jpg';
import geopandas from '$lib/imgs/skill-previews/geopandas.jpg';
import supabase from '$lib/imgs/skill-previews/supabase.jpg';
import react from '$lib/imgs/skill-previews/react.png';
import sql from '$lib/imgs/skill-previews/sql.jpg';
import cplusplus from '$lib/imgs/skill-previews/cplusplus.jpg';
import ts from '$lib/imgs/Typescript.svg';
import js from '$lib/imgs/javascript.png';
import html from '$lib/imgs/HTML5.svg';
import nextjs from '$lib/imgs/skill-previews/nextjs.jpg';

export const languages = [
	{
		name: 'HTML',
		subtitle: 'Markup Language',
		purpose: 'Scaffolds the web',
		image: html,
		href: 'https://info.cern.ch/hypertext/WWW/TheProject.html'
	},
	{
		name: 'JavaScript',
		subtitle: 'Language',
		purpose: 'Powers the web',
		image: js,
		href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
	},
	{
		name: 'TypeScript',
		subtitle: 'Language',
		purpose: 'Moves JS runtime errors to compile-time errors',
		image: ts,
		href: 'https://www.typescriptlang.org/'
	},
	{
		name: 'Python',
		subtitle: 'Language',
		purpose: 'Fast for prototyping, good for processing large data',
		image: python,
		href: 'https://www.python.org'
	},
	{
		name: 'C++',
		subtitle: 'Language',
		purpose: 'Gets closer to the machine; we studied C++ in my undergrad (Vanderbilt 2017-2021)',
		image: cplusplus,
		href: 'https://isocpp.org'
	},
	{
		name: 'SQL',
		subtitle: 'Language',
		purpose: 'Structures data',
		image: sql,
		href: 'https://www.w3schools.com/Sql/sql_quickref.asp'
	}
];

export const frameworks = [
	{
		name: 'Svelte 5',
		subtitle: 'Component Framework',
		purpose: 'Compiles to vanilla JS and uses clean syntax',
		image: svelte,
		href: 'https://svelte.dev'
	},
	{
		name: 'SvelteKit',
		subtitle: 'Full-Stack Framework',
		purpose: 'Handles routing, like Next.js for Svelte',
		image: svelte,
		href: 'https://svelte.dev/docs/kit/introduction#What-is-SvelteKit'
	},
	{
		name: 'React',
		subtitle: 'Framework',
		purpose: 'Matches most team stacks',
		image: react,
		href: 'https://react.dev'
	},
	{
		name: 'NextJS',
		subtitle: 'Full-Stack Framework',
		purpose: 'Powers React apps',
		image: nextjs,
		href: 'https://nextjs.org/'
	},
	{
		name: 'GeoPandas',
		subtitle: 'Library',
		purpose: 'Maps geospacial data',
		image: geopandas,
		href: 'https://geopandas.org'
	}
];

export const platforms = [
	{
		name: 'AWS',
		subtitle: 'Cloud Platform',
		purpose: 'Hosts large files and scales to more users',
		image: aws,
		href: 'https://aws.amazon.com'
	},
	{
		name: 'Supabase',
		subtitle: 'Backend Platform',
		purpose: 'Organizes and scales data',
		image: supabase,
		href: 'https://supabase.com'
	}
];

export const workspace = [
	{
		name: 'Zed',
		subtitle: 'Code Editor',
		purpose: 'Works quickly',
		image: zed,
		href: 'https://zed.dev'
	},
	{
		name: 'Figma',
		subtitle: 'Design Tool',
		purpose: 'Creates mockups visually before writing code',
		image: figma,
		href: 'https://www.figma.com'
	},
	{
		name: 'Claude',
		subtitle: 'AI Assistant',
		purpose: 'Cuts through monotonous tasks',
		image: claude,
		href: 'https://www.anthropic.com/'
	},
	{
		name: 'Firefox',
		subtitle: 'Browser',
		purpose: 'Respects privacy and RAM',
		image: firefox,
		href: 'https://www.mozilla.org/firefox'
	},
	{
		name: 'Chrome',
		subtitle: 'Browser',
		purpose: 'Runs in-browser apps the fastest',
		image: chrome,
		href: 'https://www.google.com/chrome'
	}
];

/* Every tool, flattened — feeds schema.org knowsAbout. */
export const allTools = [...languages, ...frameworks, ...platforms, ...workspace];
