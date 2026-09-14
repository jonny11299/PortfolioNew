// Punctuation and symbols play shaped white noise instead of a pitched note.
// Hardcoded for now. Times in seconds, level in dB.
// Web Audio filter Q is in dB for highpass, and a plain ratio for bandpass.

// Slow start, sudden finish — what noise sounds like played backwards
const REVERSE_CURVE = Array.from({ length: 64 }, (_, i) => (i / 63) ** 3);

export const drums = {
	// < bursts out and > swells back in, so an element breathes out, then in
	burst: {
		filter: { type: 'highpass', frequency: 2000 },
		envelope: { attack: 0.001, decay: 0.15 },
		level: -18
	},
	swell: {
		filter: { type: 'highpass', frequency: 2000 },
		envelope: { attack: 0.15, attackCurve: REVERSE_CURVE, decay: 0.005 },
		level: -18
	},
	hihat: {
		filter: { type: 'highpass', frequency: 7000 },
		envelope: { attack: 0.001, decay: 0.04 },
		level: -20
	},
	sharpHihat: {
		filter: { type: 'highpass', frequency: 10000, Q: 6 },
		envelope: { attack: 0.001, decay: 0.02 },
		level: -18
	},
	snare: {
		filter: { type: 'bandpass', frequency: 1800, Q: 0.8 },
		envelope: { attack: 0.001, decay: 0.15 },
		level: -14
	},
	// every other punctuation mark or symbol
	tick: {
		filter: { type: 'bandpass', frequency: 5000, Q: 2 },
		envelope: { attack: 0.001, decay: 0.008 },
		level: -14
	}
};

const drumByChar = { '<': 'burst', '>': 'swell', "'": 'hihat', '"': 'sharpHihat', '/': 'snare' };

/** Drum name for a character, or null for letters, digits and whitespace. */
export function charToDrum(char) {
	return drumByChar[char] ?? (/[\p{P}\p{S}]/u.test(char) ? 'tick' : null);
}
