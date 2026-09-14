// Picks an oscillator for each character from where it sits in the HTML source:
// inside quotes → triangle, inside <…> → sawtooth, anywhere else → sine.
// Quotes win over tags, so attribute values are triangle. The < > and quote marks themselves
// belong to the region they open or close.
//
// One pass with a little state is enough for this; a full HTML parser isn't needed.

const QUOTES = `'"\``;

/** @returns {Array<'sine' | 'triangle' | 'sawtooth'>} the wave for each character of `text` */
export function classifyWaves(text) {
	const waves = new Array(text.length);
	let inTag = false;
	let quote = null; // the mark that opened the current quote

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		if (quote) {
			waves[i] = 'triangle';
			// an unclosed quote ends at the newline, so a stray mark can't swallow the document
			if (char === quote || char === '\n') quote = null;
			continue;
		}

		// a quote mark right after a letter or digit is an apostrophe (Isn't, I'm), not a quote
		if (QUOTES.includes(char) && !/[\p{L}\p{N}]/u.test(text[i - 1] ?? '')) {
			quote = char;
			waves[i] = 'triangle';
			continue;
		}

		// like the HTML tokenizer, < only opens a tag before a letter, / ! or ? — not in `a < b`
		if (char === '<' && /[a-zA-Z/!?]/.test(text[i + 1] ?? '')) inTag = true;
		waves[i] = inTag ? 'sawtooth' : 'sine';
		if (char === '>') inTag = false;
	}

	return waves;
}
