const LS_KEY = 'portfolio_username_poasindfpoasjdfp';
const PAGE_LOAD_TIME = Date.now();

const words1 = [
	'desktop',
	'ctv',
	'ott',
	'site',
	'video',
	'para',
	'plus',
	'magnite',
	'springserve',
	'disney',
	'unilever',
	'client',
	'omnicom',
	'internal',
	'adaptive',
	'competitive',
	'guaranteed'
];
const words2 = [
	'banana',
	'apple',
	'cheese',
	'dance',
	'tiktok',
	'peanut',
	'cereal',
	'sandwich',
	'donut',
	'plant',
	'tree',
	'raisin',
	'crow',
	'finch',
	'pinecone',
	'bear',
	'fox',
	'dog',
	'cat',
	'wolf'
];

function newUid() {
	const f = words1[Math.floor(Math.random() * words1.length)];
	const s = words2[Math.floor(Math.random() * words2.length)];
	return `${f}_${s}_${Date.now()}`;
}

export async function logVisit() {
	/*
	const res = await fetch('/api/engagement');
  const { accessToken } = await res.json();
   */

	let firstTime = false;

	let me = localStorage.getItem(LS_KEY);
	if (!me) {
		me = newUid();
		localStorage.setItem(LS_KEY, me);
		firstTime = true;
	}

	let botResult = guessBot();
	let deviceType = guessDeviceType(botResult);

	let content = {
		action: 'entered',
		user: me,
		timeZone: `${getSyncLocationGuess().timezone}`,
		time: PAGE_LOAD_TIME,
		bot: `bot: ${JSON.stringify(botResult)}`,
		device: `device: ${deviceType}`,
		firstTime: `first time: ${firstTime}`
	};

	try {
		const response = await fetch('/api/engagement', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content })
		});

		if (!response.ok) throw new Error(`Error: server responded ${response.status} for ${content}`);

		console.log(`%c Success on post.`, 'color: green');
	} catch (err) {
		console.log(`%c Failure on post.`, 'color: red');
	}
}

function guessBot() {
	const ua = navigator.userAgent || '';
	const signals = {
		// Classic UA sniff
		uaMatch:
			/bot|crawler|spider|crawling|headless|phantomjs|puppeteer|playwright|slurp|bingpreview|lighthouse/i.test(
				ua
			),

		// Automation flag — set true by Selenium/Puppeteer/Playwright unless patched
		webdriver: navigator.webdriver === true,

		// Real browsers always report at least one language
		noLanguages: !navigator.languages || navigator.languages.length === 0,

		// Headless Chrome historically reports 0 plugins on desktop
		noPlugins: !navigator.plugins || navigator.plugins.length === 0,

		// Screen of 0 (or absurdly small) usually means no real display
		zeroScreen: !window.screen || window.screen.width === 0 || window.screen.height === 0,

		// Missing/odd hardware reporting
		noHardware: navigator.hardwareConcurrency === undefined || navigator.hardwareConcurrency === 0
	};

	// uaMatch or webdriver alone is enough. Otherwise require 2+ soft signals.
	const softCount = [
		signals.noLanguages,
		signals.noPlugins,
		signals.zeroScreen,
		signals.noHardware
	].filter(Boolean).length;

	const isBot = signals.uaMatch || signals.webdriver || softCount >= 2;

	return { isBot, signals, softCount };
}

function guessDeviceType(botResult) {
	let prestring = '';
	if (botResult.isBot) prestring = 'bot_or_';
	const ua = navigator.userAgent || '';
	if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return prestring + 'tablet';
	if (/Mobi|Android|iPhone|iPod|IEMobile|Opera Mini/i.test(ua)) return prestring + 'mobile';
	return prestring + 'desktop';
}

function getSyncLocationGuess() {
	const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || null; // "America/Los_Angeles"
	const lang = navigator.language || null; // "en-US"
	const tzParts = tz ? tz.split('/') : [];

	return {
		timezone: tz,
		timezoneArea: tzParts[0] || null, // "America"
		timezoneCity: tzParts[tzParts.length - 1] || null, // "Los_Angeles"
		utcOffsetMinutes: -new Date().getTimezoneOffset(), // 480 = UTC+8, -480 = UTC-8
		language: lang,
		countryGuess: lang && lang.includes('-') ? lang.split('-').pop().toUpperCase() : null
	};
}
