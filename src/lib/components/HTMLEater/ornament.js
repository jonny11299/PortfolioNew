// Gilt rococo ornaments for Frame and Plaque, built from a few path generators: spirals and
// C-scrolls, acanthus leaves, and scalloped shells. Each ornament is a set of layers for
// Ornament.svelte: `half` is drawn as is and again through the `mirror` transform, `center` once.
//
// Units are SVG user units in each ornament's viewBox, all on one scale (100 units = the frame's
// --frame-size), so stroke widths match wherever the pieces meet.

const round = (n) => Math.round(n * 100) / 100;
const pt = (x, y) => `${round(x)} ${round(y)}`;
const rad = (degrees) => (degrees * Math.PI) / 180;

// Points winding inward from radius r at `start` degrees; clockwise on screen when cw
function spiralPoints(cx, cy, r, start, turns, cw) {
	const steps = Math.ceil(turns * 32);
	return Array.from({ length: steps + 1 }, (_, i) => {
		const t = i / steps;
		const angle = rad(start + (cw ? 1 : -1) * t * turns * 360);
		const radius = r * (1 - 0.8 * t);
		return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
	});
}

export function spiral(cx, cy, r, start, turns, cw = true) {
	return spiralPoints(cx, cy, r, start, turns, cw)
		.map(([x, y], i) => `${i ? 'L' : 'M'} ${pt(x, y)}`)
		.join(' ');
}

/** A C-scroll: a cubic from `from` that winds into a spiral given as [cx, cy, r, start, turns, cw]. */
export function scroll(from, c1, c2, [cx, cy, r, start, turns, cw = true]) {
	const [first, ...rest] = spiralPoints(cx, cy, r, start, turns, cw);
	const tail = rest.map(([x, y]) => `L ${pt(x, y)}`).join(' ');
	return `M ${pt(...from)} C ${pt(...c1)} ${pt(...c2)} ${pt(...first)} ${tail}`;
}

/**
 * An acanthus leaf from its base at (x, y), pointing at `angle` degrees. The lobed edge is on the
 * left of the direction of travel; a negative width puts it on the right.
 */
export function leaf(x, y, angle, length, width) {
	const cos = Math.cos(rad(angle));
	const sin = Math.sin(rad(angle));
	// u runs along the leaf, v across it
	const at = (u, v) => pt(x + u * cos - v * sin, y + u * sin + v * cos);
	const [L, W] = [length, width];
	return {
		outline:
			`M ${at(0, 0)} Q ${at(L * 0.12, -W * 1.1)} ${at(L * 0.32, -W * 0.6)} ` +
			`Q ${at(L * 0.48, -W * 1.15)} ${at(L * 0.64, -W * 0.45)} ` +
			`Q ${at(L * 0.84, -W * 0.8)} ${at(L, 0)} ` +
			`C ${at(L * 0.7, W * 0.55)} ${at(L * 0.3, W * 0.75)} ${at(0, 0)} Z`,
		rib: `M ${at(L * 0.04, 0)} Q ${at(L * 0.5, -W * 0.2)} ${at(L * 0.92, -W * 0.02)}`
	};
}

/** A scalloped shell fanning out from (cx, cy) between two angles, clockwise. */
export function shell(cx, cy, r, from, to, ribCount) {
	const at = (radius, degrees) =>
		pt(cx + radius * Math.cos(rad(degrees)), cy + radius * Math.sin(rad(degrees)));
	const step = (to - from) / ribCount;

	let body = `M ${pt(cx, cy)} L ${at(r, from)}`;
	let ribs = '';
	for (let i = 0; i < ribCount; i++) {
		const angle = from + i * step;
		body += ` Q ${at(r * 1.14, angle + step / 2)} ${at(r, angle + step)}`;
		if (i) ribs += `M ${at(r * 0.24, angle)} L ${at(r * 0.94, angle)} `;
	}
	const lip = r * 0.3;
	const arc = `M ${at(lip, from)} A ${round(lip)} ${round(lip)} 0 0 1 ${at(lip, to)}`;
	return { body: `${body} Z`, ribs: ribs.trim(), arc };
}

// Collects leaves into fill outlines and rib lines
function leaves(...list) {
	const made = list.map((args) => leaf(...args));
	return { fills: made.map((l) => l.outline), lines: made.map((l) => l.rib) };
}

// Merges layers, concatenating each kind of shape
function layers(...parts) {
	const merged = { strokes: [], fills: [], lines: [], dots: [] };
	for (const part of parts) {
		for (const kind of Object.keys(merged)) merged[kind].push(...(part[kind] ?? []));
	}
	return merged;
}

// Top-left corner, viewBox 0 0 100 100. The molding band runs 24–40 on both axes and the glass
// starts at 40, so everything stays out of the x > 40, y > 40 quarter. `half` is the top edge;
// the mirror swaps x and y to draw the left edge.
const cornerShell = shell(33, 33, 25, 180, 270, 5);
const cornerScroll = scroll([30, 22], [40, 6], [62, 4], [76, 16, 7, 270, 1.3, true]);
const cornerFinial = spiral(10, 10, 6, 45, 1.4);
export const corner = {
	mirror: 'matrix(0 1 1 0 0 0)',
	half: layers(
		{ strokes: [cornerScroll], lines: [cornerScroll] },
		leaves([28, 30, -8, 36, 7], [46, 33, -3, 26, 5.5], [58, 24, -25, 16, 4]),
		{
			dots: [
				[88, 22, 2.4],
				[94, 25, 1.7],
				[98.5, 27, 1.1]
			]
		}
	),
	center: {
		strokes: [cornerFinial],
		fills: [cornerShell.body],
		lines: [cornerShell.ribs, cornerShell.arc, cornerFinial]
	}
};

// Top-center crest, viewBox 0 0 200 70. The band runs 54–70 and the glass starts below 70.
// Flipped vertically, it's also the bottom apron. `half` is the left side.
const crestShell = shell(100, 58, 42, 180, 360, 9);
const crestScroll = scroll([64, 62], [54, 46], [36, 54], [24, 44, 9, 90, 1.3, true]);
export const crest = {
	mirror: 'translate(200 0) scale(-1 1)',
	half: layers(
		{ strokes: [crestScroll], lines: [crestScroll] },
		leaves([66, 52, 200, 34, -7], [72, 64, 184, 40, -6], [50, 40, 225, 18, -4]),
		{
			dots: [
				[10, 58, 2.4],
				[5, 62, 1.6],
				[1.8, 65, 1]
			]
		}
	),
	center: {
		fills: [crestShell.body],
		lines: [crestShell.ribs, crestShell.arc],
		dots: [[100, 5, 3.2]]
	}
};

// Left-middle cartouche, viewBox 0 0 40 120. The band runs 24–40 across and the glass starts
// right of 40. `half` is the top; the mirror flips it down.
const sideShell = shell(32, 60, 20, 90, 270, 6);
const sideScroll = scroll([30, 44], [16, 38], [10, 28], [16, 16, 6, 90, 1.3, false]);
export const side = {
	mirror: 'translate(0 120) scale(1 -1)',
	half: layers(
		{ strokes: [sideScroll], lines: [sideScroll] },
		leaves([30, 40, -95, 30, 5]),
		{
			dots: [
				[7, 7, 2],
				[4, 2.5, 1.3]
			]
		}
	),
	center: { fills: [sideShell.body], lines: [sideShell.ribs, sideShell.arc] }
};

// Left end of a plaque, viewBox 0 0 30 60, meeting the plate at x = 30. `half` is the top.
const endCurl = `M 30 30 L 25 30 ${spiral(15, 30, 10, 0, 1.5, false).replace('M', 'L')}`;
export const plaqueEnd = {
	mirror: 'translate(0 60) scale(1 -1)',
	half: leaves([27, 18, 205, 22, -4.5]),
	center: { strokes: [endCurl], lines: [endCurl], dots: [[3, 30, 2]] }
};
