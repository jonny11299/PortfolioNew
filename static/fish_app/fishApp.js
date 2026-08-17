let sketchContainer;

let emptyMapIframe;
let filledMapIframe;
let loadingEmptyMap = true;
let loadingFilledMap = true;

let filled_src = '/fish_app/fish_map.min.html';

let momentLoaded = Date.now();

// how long (ms) the "Loaded map details!" message takes to fade out,
// measured from the moment the fade actually starts (see FADE_DELAY below)
const FADE_DELAY = 2000;
const FADE_DURATION = 7650; // ~ matches the feel of the old (255 - elapsed/30) canvas fade

// Everything (canvas + both iframes) lives inside #sketch-container now,
// so it's sized/positioned relative to that box instead of the whole page.
function containerSize() {
	if (!sketchContainer) return { w: windowWidth, h: windowHeight };
	return {
		w: sketchContainer.clientWidth || windowWidth,
		h: sketchContainer.clientHeight || windowHeight
	};
}

function preload() {
	sketchContainer = document.getElementById('sketch-container');

	// Create iframe element
	emptyMapIframe = createElement('iframe', '');
	emptyMapIframe.attribute('src', '/fish_app/empty_map.html');
	emptyMapIframe.parent(sketchContainer);

	// Position and style it
	const { w: cw0, h: ch0 } = containerSize();
	emptyMapIframe.position(0, 0);
	emptyMapIframe.size(cw0, ch0);
	emptyMapIframe.style('border', '0px solid #ccc');
	emptyMapIframe.style('border-radius', '8px');
	emptyMapIframe.style('z-index', '10');
	emptyMapIframe.style('overflow', 'hidden');
	emptyMapIframe.style('overflow-y', 'hidden');

	// Create iframe element
	filledMapIframe = createElement('iframe', '');
	filledMapIframe.attribute('src', filled_src);
	filledMapIframe.parent(sketchContainer);

	// Position and style it
	filledMapIframe.position(0, 0);
	filledMapIframe.size(cw0, ch0);
	filledMapIframe.style('border', '0px solid #ccc');
	filledMapIframe.style('border-radius', '8px');
	filledMapIframe.style('z-index', '10');
	filledMapIframe.style('overflow', 'hidden');
	filledMapIframe.style('overflow-y', 'hidden');
}

function emptyMapSuccess() {
	loadingEmptyMap = false;
	console.log('Empty map loaded!');
	resizeMaps();
}

function filledMapSuccess() {
	loadingFilledMap = false;
	console.log('Filled map loaded!');
	resizeMaps();

	momentLoaded = Date.now();
}

function setup() {
	const { w: cw, h: ch } = containerSize();

	// Sized off the container's actual box, not the window, so the canvas
	// fills #sketch-container exactly instead of overflowing past it.
	let canvas = createCanvas(cw, ch, WEBGL);
	canvas.parent(sketchContainer);

	// Add load event listener
	emptyMapIframe.elt.addEventListener('load', emptyMapSuccess);
	filledMapIframe.elt.addEventListener('load', filledMapSuccess);

	resizeMaps();
}

function draw() {
	// canvas is now just a dark backdrop behind the iframes; all text lives in HTML (see index.html)
	background(30, 30, 60);

	updateLoadingText();

	// rect(50, 50, 50, 50);
}

function updateLoadingText() {
	const loadingEl = document.getElementById('loading-text');
	if (!loadingEl) return;

	let dots = '.'.repeat(Math.floor(frameCount / 20) % 4);

	if (loadingEmptyMap) {
		loadingEl.textContent = `Loading map${dots}`;
		loadingEl.style.opacity = 1;
	} else if (loadingFilledMap) {
		loadingEl.textContent = `Loading map details${dots}\nfeel free to scroll this empty map, or`;
		loadingEl.style.opacity = 1;
	} else {
		let elapsedSinceFadeStart = Date.now() - (momentLoaded + FADE_DELAY);
		let alpha =
			elapsedSinceFadeStart > 0 ? Math.max(0, 1 - elapsedSinceFadeStart / FADE_DURATION) : 1;
		loadingEl.textContent = 'Loaded map details!';
		loadingEl.style.opacity = alpha;
	}
}

function windowResized() {
	const { w: cw, h: ch } = containerSize();
	resizeCanvas(cw, ch);
	resizeMaps();
}

async function downloadMap() {
	try {
		const response = await fetch('/embed/fish_map.html');
		const blob = await response.blob();

		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'fish_map.html';
		link.click();

		// Clean up
		window.URL.revokeObjectURL(url);
	} catch (error) {
		console.error('Download failed:', error);
	}
}

function resizeMaps() {
	// Get the iframe's actual dimensions
	// Set max dimensions and let it scale naturally

	let iframeWidth = emptyMapIframe.elt.offsetWidth || 800; // fallback to 800 if not loaded yet
	let iframeHeight = emptyMapIframe.elt.offsetHeight || 600; // fallback to 600
	console.log(`w, h: ${iframeWidth}, ${iframeHeight}`);

	let w = iframeWidth;
	let h = iframeHeight;

	w = width;
	h = height;

	// fills #sketch-container edge-to-edge, relative to it now that it's
	// the iframe's positioned ancestor...

	emptyMapIframe.position(0, 0);
	emptyMapIframe.size(w, h);

	emptyMapIframe.style('border', '0px solid #ccc');
	emptyMapIframe.style('border-radius', '8px');
	emptyMapIframe.style('z-index', '10');
	emptyMapIframe.style('overflow', 'hidden');
	filledMapIframe.style('overflow-y', 'hidden');

	if (!loadingFilledMap) {
		// Get the iframe's actual dimensions
		emptyMapIframe.hide();
		let filledWidth = filledMapIframe.elt.offsetWidth || 800; // fallback to 800 if not loaded yet
		let filledHeight = filledMapIframe.elt.offsetHeight || 600; // fallback to 600
		console.log(`w, h: ${iframeWidth}, ${iframeHeight}`);

		let wf = filledWidth;
		let hf = filledHeight;

		wf = width;
		hf = height;

		// fills #sketch-container edge-to-edge...

		filledMapIframe.position(0, 0);
		filledMapIframe.size(wf, hf);

		filledMapIframe.style('border', '0px solid #ccc');
		filledMapIframe.style('border-radius', '8px');
		filledMapIframe.style('z-index', '10');
		filledMapIframe.style('overflow', 'hidden');
		filledMapIframe.style('overflow-y', 'hidden');
	}
}

function keyReleased() {
	if (key === 'l') {
		console.log('windowWidth, windowHeight: ' + windowWidth + ', ' + windowHeight);
		console.log('p width and height: ' + width + ', ' + height);
	}
	if (key === 'm') {
		if (emptyMapIframe.style('display') === 'none') {
			emptyMapIframe.style('display', 'block');
		} else {
			emptyMapIframe.style('display', 'none');
		}
	}
}
