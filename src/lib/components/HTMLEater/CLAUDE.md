# HTMLEater

A synth that "eats" HTML source, playing one sound per character while the UI follows along. Used on `/playin`.

## Files

- `HTMLEater.svelte`: UI, text source, settings panel, reader/queue/rest display
- `synth.js`: Tone.js engine, pitch mapping, instruments, scheduling, setters, `defaults`
- `waves.js`: `classifyWaves(text)` picks an oscillator per character
- `drums.js`: `drums` table and `charToDrum(char)` for punctuation noise
- `data.text`: sample HTML, imported with `?raw` (it isn't in `static/`, so `fetch` 404s)
- `HTMLEater-old.svelte`: original SVG layout mockup, reference only

## Architecture

- **Audio owns timing.** Steps run on a `Tone.Loop` with exact audio timestamps, scheduled one lookahead (~100ms) early. Never drive playback with `setTimeout`; it jitters audibly.
- **Visuals follow audio.** Each step queues `onStep` via `Tone.Draw` at its timestamp. Visuals may lag a frame; audio must not. Never update the display from `next()`, which runs early.
- **Two cursors.** `scheduledPosition` (non-reactive) tracks what `next()` handed out; `position` (`$state`, set only in `onStep`) tracks what's audible. `view` is `$derived` from `position` via `splitView`.
- **Settings flow one way.** Component `$state`, then one `$effect` per setting, then `synth.set*()`. Setters clamp, ignore invalid input (empty number fields give `null`), and apply to Tone once loaded. Defaults live only in `synth.defaults`.
- **Lazy Tone import.** The site prerenders, so `tone` is imported dynamically in `init()`. `load()` memoizes its promise so concurrent calls can't build two audio graphs. `start()` must run from a user gesture.

## Sound

Each step is a rest (whitespace), a drum (punctuation or symbol, `[\p{P}\p{S}]`), or a pitched note.

- **Pitch.** 'a' plays the tonal center (a note name like `C2`), plus one semitone per char code away from 'a'. Notes below the center fold up by octaves; above MIDI 127, down. `charCodeAt` splits emoji into surrogate halves.
- **Waves.** Triangle inside quotes, sawtooth inside `<…>`, sine elsewhere. Quotes win inside tags, so attribute values are triangle. Markers belong to the region they open or close. A quote mark after a letter or digit is an apostrophe. Unclosed quotes end at the newline. `<` only opens a tag before a letter, `/`, `!` or `?`.
- **Pitched instruments.** One `PolySynth` per wave, because a PolySynth's voices share one oscillator type and switching it would change ringing notes. Sawtooth is `sawtooth8` through a high shelf. Note length is attack + decay + hold, then release.
- **Drums.** `<` bursts out and `>` swells back in, `'` is a hihat, `"` a sharper hihat, `/` a snare, and anything else a quiet tick. One `NoiseSynth` per drum, each through its own `Tone.Filter`, all into a shared drum `Gain`. A repeated drum chokes itself. Drum values stay hardcoded in `drums.js` for now, on purpose.
- **Mix.** Master volume (0 to 100) is squared into gain on the destination. Drum volume (0 to 1) is linear gain on the drum bus.

## Tone.js and Web Audio gotchas

- Envelope `attackCurve: 'exponential'` rises fast then levels off. A reverse swell needs a number array (`REVERSE_CURVE`).
- `NoiseSynth` can't go in a `PolySynth`. With `sustain: 0` it stops itself after attack + decay, so `triggerAttack(time)` is enough.
- Filter `Q` is in dB for lowpass and highpass, a ratio for bandpass, and unused for shelves.
- `stop()` lets scheduled steps finish so the cursors stay in sync. `stop({ immediate: true })` also drops pending Draw callbacks and releases voices.

## UI notes

- `per_char` shows fixed 50-character chunks; `to_newline` shows the rest of the line, capped at 200.
- `.oneline::before` adds a zero-width space so reader and queue tabs keep their height when empty.
- An invalid tonal center gets `aria-invalid` and a red outline; the last valid one keeps playing.

## Known limitations

- `a<b` without spaces in inline JS opens a tag, and comments and `<script>` get no special handling. A parser with source locations (such as parse5) would fix this.
- An immediate stop can't cancel notes a PolySynth already queued for the next ~100ms.

## Checking changes

Run `npm run build` (it prerenders, so it catches server-side Tone imports) and `npx prettier --check src/lib/components/HTMLEater/`. `charToMidi`, `noteToMidi`, `classifyWaves` and `charToDrum` don't touch Tone, so plain `node` can import and check them. Audio can't be verified headlessly, so listen at `/playin` with `npm run dev`.
