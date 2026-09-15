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
- `CyberFrame.svelte`, `CyberPlaque.svelte`: the lowkey look, chamfered with neon, HUD brackets, corner `tags` and one small shell (`miniCrest`)
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
- **Scale.** `settings.scaleMap` — twelve output pitch classes indexed by input pitch class, C first — is the whole scale, and the only thing `quantize` reads. `scaleMapFor(root, scale)` builds one from a named scale (`major`, `minor`, `harmonicMinor` or `chromatic` in `scales`), and `setScaleMap` takes a hand-edited one from the grid. Quantizing a note off the scale is raised to the next note on it, so a scale only brightens the line and never drops below the tonal center. Quantizing runs after the fold-up and before the fold-down, so a note the scale pushes over MIDI 127 still comes back in range on the same pitch class. `chromatic` maps every note to itself, so it's the off switch. The root is independent of the tonal center.
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
- `.scrollbars` is the thin gilt bar, shared by the settings panel and the rest view; `.scrollY` (settings, vertical) and `.scrollBoth` (rest view, both axes) only pick the direction, and both sit after `.clipEnd` so they beat its `overflow: clip`. The rest view's `pre` must not clip, or there'd be nothing to scroll sideways. They read `--gilt-fine` (thumb) and `--gilt` (track) from whichever frame is around them, through inheritance, with `--primary-hover` as the fallback. It's transparent until the panel is hovered or holds focus. Both the standard `scrollbar-color` and the `::-webkit-scrollbar` pseudo-elements are set; styling the WebKit ones is what stops the bar fading out on its own, so hover decides when it shows. Only the colors change on hover, never the width — a bar that appears and disappears would reflow the panel under the pointer.

## Look

- Column order: name plaque, playback plaque (play, pause, reload), the synth inside the frame, then the `.credit` line thanking Yotam Mann for Tone.js. The credit borrows the plaques' uppercase gilt lettering but has no plate, since a plaque is a fixed `--plaque-height` and the sentence wraps.
- `look` in `HTMLEater.svelte` picks the frame and plaques: `'cyber'` (`CyberFrame`, `CyberPlaque`, a blinking cursor on the name, and `hud` readouts passed as `tags`) or `'rococo'` (`Frame`, `Plaque`).
- CyberFrame's chamfered rings are `clip-path` polygons: outer outline plus inner outline, filled `evenodd`. The inner corner cut is `--c − 0.586 × --t` so diagonals keep the edge thickness. Its glow sits on the `.neon` wrapper, because a filter on a clipped element is clipped with it. The glass is chamfered too, parallel to the rail, or its corners poke past the rail's diagonals. Every inset ring's cut is `--chamfer − (distance in from the band's outer edge) × 0.586`.
- Both frames share the glass grain, vignette and sheen, and a glint that travels clockwise while playing. CyberFrame adds scanlines and a rail light sweep. Keep these when restyling. Don't animate `.neon`'s opacity: a flicker there dips the rail, brackets and ticks together and reads as the frame blinking out.
- `.container::before` lays `screen.png` over the surface at 20%, grayscaled and `mix-blend-mode: overlay`, so only the image's light and dark carry over and the surface keeps its hue. It's `z-index: -1` inside an `isolation: isolate` container, so it sits above the container's background but under the content, and the tabs' opaque `--bg` covers it: the texture only ever shows on the chrome around the windows. The file is 1.7 MB, so it's the page's heaviest asset.
- Gilt colors are `--gilt` (`--primary-hover` at 50%) for bodies and `--gilt-fine` (90%) for fine details. They're mixed into `--bg` (override with `--frame-backdrop`) instead of made transparent, so overlapping pieces don't stack brighter.
- `Frame` reserves its space with padding. Everything scales from `--frame-size`: the band, beads and leaf garlands are CSS; the corners, crest, bottom apron and side cartouches are SVG from `ornament.js`, where 100 units equal `--frame-size`. Each viewBox's band position must line up with `.band`; the comments in `ornament.js` give the numbers.
- Ornament art must stay out of the glass (for corners, the x > 40, y > 40 quarter), since it sits on top of the content.
- Motion: `Frame`'s shimmer runs while playing, and the reader glow restarts each step through `{#key position}`. Both stop under `prefers-reduced-motion`.
- Instrument-panel texture from the reference image: knob tick rings, slider ticks and lamp thumbs, graph gridlines, ruler and peak marker, uppercase labels, and bold readouts with small units.
- `<svelte:window onkeydown>` makes space toggle play and pause, unless the focus is somewhere space already does something (an input, select, textarea, button or contenteditable). It preventDefaults, since space scrolls the page.
- `.oneline::before` adds a zero-width space so reader and queue tabs keep their height when empty.
- The source row is "HTML Source:", then a `reading` readout, then the controls. The readout is "default sample" in `--text-muted` for the bundled `data.text`, or the uploaded file's name in `--accent`, truncating with an ellipsis. The control is a `<label>` around a hidden file input (`.html`, `.htm`, `.txt`, `.text`), reading "upload .html or .txt" until a file is loaded and "change file" after; a loaded file also gets a "use default" button back to the sample. An uploaded file becomes `loadedText`, which `reload()` restores and `useDefault()` clears.
- Voice shows a `Graph` of `synth.envelopePoints(voice)` above four `Knob`s (attack, decay, sustain, release). The graph mimics Tone's curves (see `approach`) and draws a sustain plateau a quarter as long as the other stages so the level stays readable, though notes release right after decay. Size and colors come from CSS variables: `--graph-width`, `--graph-height`, `--knob-size`, `--accent`.
- Knob and slider fills are `--accent`, turning `--primary-hover` on hover and while dragging. The slider fill is a gradient stopped at `--fill`, set inline from the value; track and thumb pseudo-elements are written once per engine.
- Knobs: drag vertically (shift for fine), arrow keys (shift for ×10), Home/End, double-click to reset. Time knobs are logarithmic, 1–2000 ms.
- Synth Settings opens with volume (0–100) and drum volume (0–1) sliders, then knobs for speed and tonal center. Speed's value is the step in ms (5–1000, log) and is `reverse`d so clockwise is faster. Tonal center is a MIDI number (C1–C6) shown and sent to the synth as a note name via `midiToNote`. Section headings (`.settings h4`) take `--secondary`, matching the panel's `.title2`, with `margin-block: var(--space-s)` keeping the sections apart.
- Scale, below Voice, is two selects — root (the twelve `synth.noteNames`) and scale (the `synth.scales` labels) — over a 12x12 map after Ableton's Scale device: a column per note played, a row per note heard (highest at the top), one lit square per column. `scaleMap` is the source of truth; picking a root or scale overwrites it, and editing a square away from the named scale switches the select to a `custom` option that's only listed while it applies. Squares are `button.cell`, written that way to outrank the site's global `button` and `button:hover` rules; sharps are tinted on both axes, and the two tints stack where they cross. Only each column's lit square is tabbable, and up/down from there moves the mapping. They're plain `<label>`s, so `.scale label` has to undo `.settings label`'s `display: contents`, and `.scale select` trims the site's full-width form padding. `select:hover` borrows the global `select:focus` border and ring, which the site otherwise only shows on focus.

## Known limitations

- `a<b` without spaces in inline JS opens a tag, and comments and `<script>` get no special handling. A parser with source locations (such as parse5) would fix this.
- An immediate stop can't cancel notes a PolySynth already queued for the next ~100ms.

## Checking changes

Run `npm run build` (it prerenders, so it catches server-side Tone imports) and `npx prettier --check src/lib/components/HTMLEater/`. `charToMidi`, `noteToMidi`, `classifyWaves` and `charToDrum` don't touch Tone, so plain `node` can import and check them. Audio can't be verified headlessly, so listen at `/playin` with `npm run dev`.
