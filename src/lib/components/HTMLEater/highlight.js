// Syntax highlighting for the source view. Prism tokenizes the whole source once, so a slice that
// starts mid-tag still gets the colors it has in context. Its default build covers HTML plus the
// CSS and JavaScript inside <style> and <script>.
import Prism from 'prismjs';

/**
 * Flattens Prism's nested tokens into runs covering all of `text`. `classes` lists every token
 * type and alias from the outside in (like `tag attr-value punctuation`), and neighbouring runs
 * with the same classes are merged.
 * @returns {Array<{ start: number, end: number, classes: string }>}
 */
export function tokenize(text) {
	const runs = [];
	let offset = 0;

	function push(length, classes) {
		if (!length) return;
		const last = runs.at(-1);
		if (last?.classes === classes) last.end += length;
		else runs.push({ start: offset, end: offset + length, classes });
		offset += length;
	}

	function walk(tokens, path) {
		for (const token of tokens) {
			if (typeof token === 'string') {
				push(token.length, path.join(' '));
				continue;
			}
			const inner = [...path, token.type, ...[token.alias ?? []].flat()];
			if (typeof token.content === 'string') push(token.content.length, inner.join(' '));
			else walk([token.content].flat(), inner);
		}
	}

	walk(Prism.tokenize(text, Prism.languages.markup), []);
	return runs;
}

/**
 * The runs between `from` and `to`, with the end runs cut to fit. `key` is the run's original
 * start, so it stays stable as `from` moves through it.
 */
export function sliceRuns(runs, text, from, to = text.length) {
	if (from >= to) return [];

	// binary search for the first run ending after `from`
	let lo = 0;
	let hi = runs.length;
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (runs[mid].end <= from) lo = mid + 1;
		else hi = mid;
	}

	const sliced = [];
	for (let i = lo; i < runs.length && runs[i].start < to; i++) {
		const run = runs[i];
		sliced.push({
			key: run.start,
			text: text.slice(Math.max(run.start, from), Math.min(run.end, to)),
			classes: run.classes
		});
	}
	return sliced;
}
