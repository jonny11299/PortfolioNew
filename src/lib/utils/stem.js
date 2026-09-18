/*
	Geometry for the fiddlehead stem in Stem.svelte.

	Grown from a Processing sketch: a bezier trunk flows into a sine "helix"
	strand, a stem forks off near every crest and curls into a spiral at its
	tip, and the strand's own top end curls the same way — the growing tip of
	the frond. Every curl is an anchor point, and the component hangs one
	screenshot just above each of them.

	Everything is in abstract user units. The caller renders it through an SVG
	viewBox, so the composition holds its proportions at any width, and the
	cards can be positioned as percentages of the same box.

	Pure JS with no Svelte imports on purpose, so the layout can be rendered
	and eyeballed from node without a browser.
*/

/** Tuned by rendering; see the comments on the shape-critical ones. */
export const DEFAULTS = {
	/* --- strand --- */
	amp: 250, // horizontal swing of the strand
	spacing: 300, // vertical distance between crests; also sets the wave frequency
	trunkLen: 320, // bare bezier trunk below the first crest
	trunkPull: 0.6, // 0..1, how long the trunk keeps going straight up
	side: 1, // 1 = first bend swings right, -1 = left
	strandBaseW: 26, // stroke weight at the root
	strandTipW: 7, // stroke weight where the crown curl ends
	strandTaperPow: 1.6, // >1 keeps the trunk heavy and thins late, like a real stem
	steps: 60, // polyline resolution per crest-to-crest span

	/* --- stems --- */
	/*
		Negative offset is the whole trick. The sketch branched just *past*
		each crest, so the stem left heading back toward the middle and
		curled in against the strand, with no room above it for anything.
		Branching just *before* the crest sends it up and outward instead,
		and the curl lands clear of the strand with open space above it.
	*/
	stemOffset: -0.2, // where the stem branches, in radians of the wave
	stemLen: 500, // length of each stem, measured along its own arc
	stemRelax: 0.002, // gentle curvature the stem relaxes into after branching
	stemRelaxAt: 0.12, // fraction of the stem spent switching from the strand's bend to its own
	stemCurl: 0.055, // how tightly the tip curls
	stemCurlPow: 5, // higher = curl stays gentle longer, then tightens at the tip
	stemBaseW: 15, // stroke weight where the stem leaves the strand
	stemTipW: 3.5, // stroke weight at the tip
	stemSteps: 200, // resolution of each stem

	/* --- cards --- */
	/*
		The screenshots arrive at wildly different pixel sizes, so they are
		not sized by their own dimensions at all. Every card is drawn to the
		same *area* and only its proportions vary — a panorama comes out wide
		and short, a portrait narrow and tall, and both carry the same visual
		weight on the page. Aspect is clamped so one freak image cannot
		stretch the whole composition.
	*/
	cardArea: 355 * 240,
	cardAspectMin: 0.8,
	cardAspectMax: 1.9,
	cardGap: 55, // vertical clearance between a curl and the card above it
	cardNudge: 0.22, // card centre pushed outward by this fraction of its width
	cardAnchor: 'tip', // 'tip' = beside the vine, 'center' = stacked over it
	captionSpace: 0, // extra headroom reserved above the top card for a caption
	margin: 24 // blank space outside the widest card
};

/*
	Narrow containers get the same plant on a different footing. Sitting the
	cards *beside* the vine costs roughly twice a card's width, which a phone
	does not have, so here the vine is pulled in thin and the cards stack
	down the middle over it, with each curl poking out past the card edge on
	its own side. The stems shorten to match and their curvatures rise by the
	same factor, which keeps the curl the same shape rather than a squashed
	version of it.
*/
export const COMPACT = {
	amp: 145,
	spacing: 300,
	trunkLen: 240,
	strandBaseW: 15,
	strandTipW: 4.5,
	stemLen: 220,
	stemRelax: 0.0045,
	stemCurl: 0.125,
	stemBaseW: 8,
	stemTipW: 2.2,
	cardGap: 50,
	cardAnchor: 'center',
	margin: 14
};

const smoothstep = (t) => t * t * (3 - 2 * t);
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const f = (v) => Math.round(v * 100) / 100;

/** Card size for one aspect ratio, under the equal-area rule above. */
export function cardSize(aspect, o = DEFAULTS) {
	const ar = clamp(aspect || 1.5, o.cardAspectMin, o.cardAspectMax);
	return { w: Math.sqrt(o.cardArea * ar), h: Math.sqrt(o.cardArea / ar) };
}

/**
 * Build the whole composition for `count` screenshots.
 *
 * The canvas is sized around the geometry rather than the other way round:
 * the stems are traced first, then the box is widened to hold the widest
 * card an aspect ratio is allowed to produce. That keeps the viewBox fixed
 * no matter what the images turn out to be, so nothing reflows when they
 * finish loading.
 */
export function buildStemLayout(count, options = {}) {
	const o = { ...DEFAULTS, ...options };
	const n = Math.max(0, count | 0);

	const maxCardW = Math.sqrt(o.cardArea * o.cardAspectMax);
	const tallestCard = Math.sqrt(o.cardArea / o.cardAspectMin);

	/*
		Crests have to be far enough apart that the tallest card the clamp can
		produce still clears the one above it. Stacked down the middle, every
		crest carries a card, so a card needs a whole crest to itself; hung
		beside the vine they alternate, and a card's nearest same-side
		neighbour is two crests away.
	*/
	const stack = o.cardAnchor === 'center' ? 1 : 2;
	const spacing = Math.max(o.spacing, (tallestCard + o.cardGap) / stack);
	const k = Math.PI / spacing; // crests sit every PI/k = spacing apart

	/*
		Trace one stem at the origin first. Its reach decides both the canvas
		width and the headroom, and it is identical for every stem because
		they all branch at the same point in the wave.
	*/
	const probe = traceFrom(o, k, 0, 0);

	/*
		The probe is traced from the origin, so its x values are relative to
		the branch point. The branch sits `branchOut` away from the centre
		line, and the two add up to how far the stem swings in total.
	*/
	const branchOut = o.amp * Math.sin(Math.PI / 2 + o.stemOffset);
	const reach = extent(probe, branchOut);

	/*
		Half-width is whichever needs more room: the vine with a card hung out
		beside it, or — when the cards stack down the middle — the widest card
		on its own, with the curls still clearing its edge.
	*/
	const half =
		o.cardAnchor === 'center'
			? Math.max(maxCardW / 2, reach.maxOut) + o.margin
			: reach.maxOut + o.cardNudge * maxCardW + maxCardW / 2 + o.margin;
	const width = 2 * half;
	const cx = half;

	/*
		Crests 1..n carry a stem; crest n+1 carries the crown, where the
		strand itself runs out and curls. Headroom is whatever the crown and
		the topmost card need above the last crest.
	*/
	const crests = n + 1;
	const headroom = Math.max(-reach.minY, o.cardGap + tallestCard + o.captionSpace) + o.margin;
	const yJoin = headroom + crests * spacing - o.stemOffset / k;
	const height = yJoin + o.trunkLen;

	const phase = (y) => Math.PI / 2 + k * (yJoin - y);
	const helixX = (y) => cx + o.side * o.amp * Math.sin(phase(y));
	const helixDX = (y) => -o.side * o.amp * k * Math.cos(phase(y));
	const helixDDX = (y) => -o.side * o.amp * k * k * Math.sin(phase(y));

	const branchY = (i) => yJoin - i * spacing - o.stemOffset / k;

	/* --- the strand, as one continuous centreline from root to crown --- */
	const spine = [];

	// bezier trunk, sampled so it can share the taper with everything above it
	const jx = cx + o.side * o.amp;
	const b = Math.sqrt(2 / 3) / k; // curvature-matched handle: the join is invisible
	const a = o.trunkPull * (o.trunkLen - b);
	const trunkSteps = Math.round(o.steps * (o.trunkLen / spacing));
	for (let i = 0; i <= trunkSteps; i++) {
		spine.push(cubic(i / trunkSteps, cx, height, cx, height - a, jx, yJoin + b, jx, yJoin));
	}

	// the sine strand, up to the point where the crown takes over
	const yCrown = branchY(crests);
	const helixSteps = Math.round((o.steps * (yJoin - yCrown)) / spacing);
	for (let i = 1; i <= helixSteps; i++) {
		const y = yJoin - ((yJoin - yCrown) * i) / helixSteps;
		spine.push({ x: helixX(y), y });
	}

	// the crown: the strand's own growing tip, traced exactly like a stem
	const crown = traceFrom(o, k, helixX(yCrown), yCrown, helixDX(yCrown), helixDDX(yCrown));
	for (let i = 1; i < crown.length; i++) spine.push(crown[i]);

	const strand = taperedOutline(spine, o.strandBaseW, o.strandTipW, o.strandTaperPow);

	/* --- stems --- */
	const stems = [];
	for (let i = 1; i <= n; i++) {
		const yb = branchY(i);
		const pts = traceFrom(o, k, helixX(yb), yb, helixDX(yb), helixDDX(yb));
		const tip = pts[pts.length - 1];

		/*
			Crests alternate sides, so consecutive curls do too. That
			alternation is what lets the cards stack close together: same-side
			neighbours are two crests apart, never one.
		*/
		const dir = tip.x >= cx ? 1 : -1;

		stems.push({
			d: taperedOutline(pts, o.stemBaseW, o.stemTipW, 1),
			tip: { x: tip.x, y: tip.y },
			dir
		});
	}

	return { width, height, cx, strand, stems, options: o };
}

/**
 * Where one card sits, given its stem and aspect ratio. Returned in user
 * units; the component turns these into percentages of the viewBox.
 */
export function cardRect(stem, aspect, layout) {
	const o = layout.options;
	const { w, h } = cardSize(aspect, o);
	const wanted =
		o.cardAnchor === 'center' ? layout.cx : stem.tip.x + stem.dir * o.cardNudge * w;
	const cardX = clamp(wanted, w / 2 + o.margin, layout.width - w / 2 - o.margin);
	return { x: cardX - w / 2, y: stem.tip.y - o.cardGap - h, w, h, cx: cardX };
}

/* ---------------------------------------------------------------- tracing */

/*
	A stem is traced by steering: at each small step it turns by the current
	curvature. It starts with exactly the strand's direction and curvature so
	it forks off seamlessly, quickly swings to bend the opposite way, sweeps
	up off the crest, then tightens into a spiral curl.

	Called with no derivatives it traces the canonical stem at the origin,
	which is what sizes the canvas.
*/
function traceFrom(o, k, x0, y0, d1, dd1) {
	if (d1 === undefined) {
		// the branch point's own place in the wave, independent of position:
		// phase(branchY(i)) works out to PI/2 + i*PI + stemOffset, so i = 0
		// is the canonical stem every other one mirrors or repeats
		const ph = Math.PI / 2 + o.stemOffset;
		d1 = -o.side * o.amp * k * Math.cos(ph);
		dd1 = -o.side * o.amp * k * k * Math.sin(ph);
	}

	const pts = new Array(o.stemSteps + 1);
	let x = x0;
	let y = y0;

	let heading = Math.atan2(-1, -d1); // travelling upward along the strand
	const kb = dd1 / Math.pow(1 + d1 * d1, 1.5); // signed curvature at the branch point
	const dir = kb < 0 ? -1 : 1;
	const kStart = Math.abs(kb);

	const ds = o.stemLen / o.stemSteps;
	pts[0] = { x, y };

	for (let i = 0; i < o.stemSteps; i++) {
		const t = i / o.stemSteps;
		const relax = smoothstep(Math.min(t / o.stemRelaxAt, 1));
		const curvature =
			kStart * (1 - relax) - (o.stemRelax * relax + o.stemCurl * Math.pow(t, o.stemCurlPow));

		heading += dir * curvature * ds;
		x += Math.cos(heading) * ds;
		y += Math.sin(heading) * ds;
		pts[i + 1] = { x, y };
	}
	return pts;
}

function extent(pts, offset) {
	let maxOut = 0;
	let minY = 0;
	for (const p of pts) {
		maxOut = Math.max(maxOut, Math.abs(offset + p.x));
		minY = Math.min(minY, p.y);
	}
	return { maxOut, minY };
}

function cubic(t, x0, y0, x1, y1, x2, y2, x3, y3) {
	const u = 1 - t;
	const A = u * u * u;
	const B = 3 * u * u * t;
	const C = 3 * u * t * t;
	const D = t * t * t;
	return { x: A * x0 + B * x1 + C * x2 + D * x3, y: A * y0 + B * y1 + C * y2 + D * y3 };
}

/*
	SVG strokes have one width for the whole path, so the taper is drawn as a
	closed shape instead: walk the centreline offsetting by half the local
	width on one side, then walk back down the other. `pow` > 1 holds the
	thickness near the base and sheds it late, which is what makes a stem
	look grown rather than drawn with a calligraphy nib.
*/
function taperedOutline(pts, baseW, tipW, pow) {
	const last = pts.length - 1;
	const left = [];
	const right = [];

	for (let i = 0; i <= last; i++) {
		const t = i / last;
		const w = (tipW + (baseW - tipW) * Math.pow(1 - t, pow)) / 2;

		// tangent from the neighbours, so the offset follows the local direction
		const p0 = pts[Math.max(0, i - 1)];
		const p1 = pts[Math.min(last, i + 1)];
		const tx = p1.x - p0.x;
		const ty = p1.y - p0.y;
		const len = Math.hypot(tx, ty) || 1;
		const nx = -ty / len;
		const ny = tx / len;

		left.push({ x: pts[i].x + nx * w, y: pts[i].y + ny * w });
		right.push({ x: pts[i].x - nx * w, y: pts[i].y - ny * w });
	}

	let d = `M ${f(left[0].x)} ${f(left[0].y)}`;
	for (let i = 1; i <= last; i++) d += ` L ${f(left[i].x)} ${f(left[i].y)}`;
	for (let i = last; i >= 0; i--) d += ` L ${f(right[i].x)} ${f(right[i].y)}`;
	return d + ' Z';
}
