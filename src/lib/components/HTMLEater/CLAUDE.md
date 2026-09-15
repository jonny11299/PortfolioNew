# HTMLEater

A synth that "eats" HTML source, playing one sound per character while the UI follows along. Used on `/playin`.

## Files

- `HTMLEater.svelte`: UI, text source, settings panel, reader/queue/rest display
- `synth.js`: Tone.js engine, pitch mapping, instruments, scheduling, setters, `defaults`
- `waves.js`: `classifyWaves(text)` picks an oscillator per character
- `drums.js`: `drums` table and `charToDrum(char)` for punctuation noise
- `data.text`: sample HTML, imported with `?raw` (it isn't in `static/`, so `fetch` 404s)
- `highlight.js`: `tokenize(text)` flattens Prism's HTML tokens into `{ start, end, classes }` runs; `sliceRuns` cuts them from an offset
- `Knob.svelte`: rotary control, `bind:value` with `min`/`max`/`step`, optional `log` response, `reverse` direction, `format` readout and double-click `reset`
- `Slider.svelte`: horizontal slider on a restyled native range input, same `bind:value`/`min`/`max`/`step`/`format`/`reset` props as `Knob`
- `Graph.svelte`: fixed-size line graph of `[x, y]` points, stretched to fill its box; optional `grid`, `ticks`, `marker` and `axis` labels
- `Frame.svelte`: gilt rococo mirror frame around its children, with `shimmer` for a traveling glint
- `Plaque.svelte`: engraved gilt plate with scrolled ends, sized by `--plaque-height`
- `Ornament.svelte`: draws one two-tone ornament from `ornament.js`
- `ornament.js`: path generators (`spiral`, `scroll`, `leaf`, `shell`) and the `corner`, `crest`, `side` and `plaqueEnd` ornaments
- `HTMLEater-old.svelte`: original SVG layout mockup, reference only

## Architecture

- **Audio owns timing.** Steps run on a `Tone.Loop` with exact audio timestamps, scheduled one lookahead (~100ms) early. Never drive playback with `setTimeout`; it jitters audibly.
- **Visuals follow audio.** Each step queues `onStep` via `Tone.Draw` at its timestamp. Visuals may lag a frame; audio must not. Never update the display from `next()`, which runs early.
- **Two cursors.** `scheduledPosition` (non-reactive) tracks what `next()` handed out; `position` (`$state`, set only in `onStep`) tracks what's audible. `restStart` is `$derived` from `position` via `findRestStart`; the reader is `position` and the queue runs from `position + 1` to `restStart`.
- **Settings flow one way.** Component `$state`, then one `$effect` per setting, then `synth.set*()`. Setters clamp, ignore invalid input (empty number fields give `null`), and apply to Tone once loaded. Defaults live only in `synth.defaults`.
- **Lazy Tone import.** The site prerenders, so `tone` is imported dynamically in `init()`. `load()` memoizes its promise so concurrent calls can't build two audio graphs. `start()` must run from a user gesture.

## Sound

Each step is a rest (whitespace), a drum (punctuation or symbol, `[\p{P}\p{S}]`), or a pitched note.

- **Pitch.** 'a' plays the tonal center (a note name like `C2`), plus one semitone per char code away from 'a'. Notes below the center fold up by octaves; above MIDI 127, down. `charCodeAt` splits emoji into surrogate halves.
- **Waves.** Triangle inside quotes, sawtooth inside `<…>`, sine elsewhere. Quotes win inside tags, so attribute values are triangle. Markers belong to the region they open or close. A quote mark after a letter or digit is an apostrophe. Unclosed quotes end at the newline. `<` only opens a tag before a letter, `/`, `!` or `?`.
- **Pitched instruments.** One `PolySynth` per wave, because a PolySynth's voices share one oscillator type and switching it would change ringing notes. Sawtooth is `sawtooth8` through a high shelf. Note length is attack + decay, then release (there's no hold).
- **Drums.** `<` bursts out and `>` swells back in, `'` is a hihat, `"` a sharper hihat, `/` a snare, and anything else a quiet tick. One `NoiseSynth` per drum, each through its own `Tone.Filter`, all into a shared drum `Gain`. A repeated drum chokes itself. Drum values stay hardcoded in `drums.js` for now, on purpose.
- **Mix.** Master volume (0 to 100) is squared into gain on the destination. Drum volume (0 to 1) is linear gain on the drum bus.

## Tone.js and Web Audio gotchas

- Envelope `attackCurve: 'exponential'` rises fast then levels off. A reverse swell needs a number array (`REVERSE_CURVE`).
- `NoiseSynth` can't go in a `PolySynth`. With `sustain: 0` it stops itself after attack + decay, so `triggerAttack(time)` is enough.
- Filter `Q` is in dB for lowpass and highpass, a ratio for bandpass, and unused for shelves.
- `stop()` lets scheduled steps finish so the cursors stay in sync. `stop({ immediate: true })` also drops pending Draw callbacks and releases voices.

## UI notes

- `per_char` shows fixed 50-character chunks; `to_newline` shows the rest of the line, capped at 200.
- Reader, queue and rest are syntax highlighted (`prismjs`). The whole source is tokenized once, then `sliceRuns` cuts each view, so text starting mid-tag keeps its colors. All three render through the `highlighted` snippet, with spans keyed by run start so advancing only drops spans from the front. Keep the snippet's markup free of stray whitespace; it renders inside `<pre>`.
- `restStart` is a number on purpose: a `$derived` object would be new every step and re-slice the whole rest view every 40ms.
- Syntax colors use `:global` token classes under `.code`, all from theme variables (`--primary`, `--primary-hover`, `--secondary`, `--accent`, `--text-warn`, `--text-muted`). Rule order matters where token classes nest. `--text-key` is unused on purpose; keep it as a last resort.
- The settings panel's `.scrollY` hides its scrollbar but still scrolls.

## Look

- Column order: name plaque, playback plaque (play, pause, reload), then the synth inside `Frame`.
- Gilt colors are `--gilt` (`--primary-hover` at 50%) for bodies and `--gilt-fine` (90%) for fine details. They're mixed into `--bg` (override with `--frame-backdrop`) instead of made transparent, so overlapping pieces don't stack brighter.
- `Frame` reserves its space with padding. Everything scales from `--frame-size`: the band, beads and leaf garlands are CSS; the corners, crest, bottom apron and side cartouches are SVG from `ornament.js`, where 100 units equal `--frame-size`. Each viewBox's band position must line up with `.band`; the comments in `ornament.js` give the numbers.
- Ornament art must stay out of the glass (for corners, the x > 40, y > 40 quarter), since it sits on top of the content.
- Motion: `Frame`'s shimmer runs while playing, and the reader glow restarts each step through `{#key position}`. Both stop under `prefers-reduced-motion`.
- Instrument-panel texture from the reference image: knob tick rings, slider ticks and lamp thumbs, graph gridlines, ruler and peak marker, uppercase labels, and bold readouts with small units.
- `.oneline::before` adds a zero-width space so reader and queue tabs keep their height when empty.
- After "HTML Source:" is a `<label>` around a hidden file input. It says "upload" until a file is loaded, then shows the file name, and clicking either opens the picker (`.html`, `.htm`, `.txt`, `.text`). A loaded file becomes `loadedText`, which `reload()` restores.
- Voice shows a `Graph` of `synth.envelopePoints(voice)` above four `Knob`s (attack, decay, sustain, release). The graph mimics Tone's curves (see `approach`) and draws a sustain plateau a quarter as long as the other stages so the level stays readable, though notes release right after decay. Size and colors come from CSS variables: `--graph-width`, `--graph-height`, `--knob-size`, `--accent`.
- Knob and slider fills are `--accent`, turning `--primary-hover` on hover and while dragging. The slider fill is a gradient stopped at `--fill`, set inline from the value; track and thumb pseudo-elements are written once per engine.
- Knobs: drag vertically (shift for fine), arrow keys (shift for ×10), Home/End, double-click to reset. Time knobs are logarithmic, 1–2000 ms.
- Synth Settings opens with volume (0–100) and drum volume (0–1) sliders, then knobs for speed and tonal center. Speed's value is the step in ms (5–1000, log) and is `reverse`d so clockwise is faster. Tonal center is a MIDI number (C1–C6) shown and sent to the synth as a note name via `midiToNote`.

## Known limitations

- `a<b` without spaces in inline JS opens a tag, and comments and `<script>` get no special handling. A parser with source locations (such as parse5) would fix this.
- An immediate stop can't cancel notes a PolySynth already queued for the next ~100ms.

## Checking changes

Run `npm run build` (it prerenders, so it catches server-side Tone imports) and `npx prettier --check src/lib/components/HTMLEater/`. `charToMidi`, `noteToMidi`, `classifyWaves` and `charToDrum` don't touch Tone, so plain `node` can import and check them. Audio can't be verified headlessly, so listen at `/playin` with `npm run dev`.
