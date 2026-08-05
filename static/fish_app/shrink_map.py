#!/usr/bin/env python3
"""
Shrink an ipywidgets/ipyleaflet HTML export.

Does three things, in order of how much they usually save:
  1. Prunes widget models that nothing actually renders (orphaned maps/layers).
  2. Runs mapshaper over each embedded GeoJSON FeatureCollection.
  3. Re-serializes the widget state JSON minified instead of pretty-printed.

Usage:
    python shrink_map.py fish_map.html
    python shrink_map.py fish_map.html --simplify 15% --precision 0.0001
    python shrink_map.py fish_map.html --no-prune      # skip step 1
    python shrink_map.py fish_map.html --dry-run       # report sizes, write nothing

Requires mapshaper on PATH:  npm install -g mapshaper
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

STATE_RE = re.compile(
    r'(<script[^>]*type="application/vnd\.jupyter\.widget-state\+json"[^>]*>)(.*?)(</script>)',
    re.DOTALL,
)
VIEW_RE = re.compile(
    r'<script[^>]*type="application/vnd\.jupyter\.widget-view\+json"[^>]*>(.*?)</script>',
    re.DOTALL,
)
MODEL_REF_RE = re.compile(r"IPY_MODEL_([0-9a-fA-F]+)")


def human(n):
    for unit in ("B", "KB", "MB", "GB"):
        if abs(n) < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def find_roots(html, state):
    """Model IDs that are actually rendered on the page."""
    roots = []
    for block in VIEW_RE.findall(html):
        try:
            view = json.loads(block)
        except json.JSONDecodeError:
            continue
        mid = view.get("model_id")
        if mid:
            roots.append(mid)
    return [r for r in roots if r in state]


def reachable_from(state, roots):
    """Walk IPY_MODEL_ references outward from the rendered roots."""
    seen, stack = set(), list(roots)
    while stack:
        mid = stack.pop()
        if mid in seen or mid not in state:
            continue
        seen.add(mid)
        blob = json.dumps(state[mid])
        for ref in MODEL_REF_RE.findall(blob):
            if ref not in seen:
                stack.append(ref)
    return seen


def geojson_models(state):
    for mid, model in state.items():
        if model.get("model_name") != "LeafletGeoJSONModel":
            continue
        data = model.get("state", {}).get("data")
        if isinstance(data, dict) and data.get("features"):
            yield mid, model, data


def run_mapshaper(mapshaper, data, simplify, precision, workdir, tag):
    src = os.path.join(workdir, f"{tag}.geojson")
    dst = os.path.join(workdir, f"{tag}.out.geojson")
    with open(src, "w") as fh:
        json.dump(data, fh)

    cmd = [mapshaper, src]
    if simplify:
        cmd += ["-simplify", simplify, "keep-shapes"]
    cmd += ["-o", f"precision={precision}", dst]

    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0 or not os.path.exists(dst):
        sys.stderr.write(f"  ! mapshaper failed, leaving this layer alone\n")
        sys.stderr.write("    " + (proc.stderr.strip() or "no stderr") + "\n")
        return None

    with open(dst) as fh:
        return json.load(fh)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--simplify", default="15%",
                    help="vertex retention, e.g. 15%% (empty string to skip)")
    ap.add_argument("--precision", default="0.0001",
                    help="coordinate precision; 0.0001 is roughly 11m")
    ap.add_argument("--no-prune", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("-o", "--output", default=None)
    args = ap.parse_args()

    mapshaper = shutil.which("mapshaper") or shutil.which("mapshaper.cmd")
    if args.simplify and not mapshaper and not args.dry_run:
        sys.exit("mapshaper not on PATH. Run: npm install -g mapshaper")

    with open(args.html, encoding="utf-8") as fh:
        html = fh.read()
    before = len(html.encode("utf-8"))
    print(f"input: {human(before)}")

    match = STATE_RE.search(html)
    if not match:
        sys.exit("No widget-state JSON block found. Is this an ipywidgets export?")

    open_tag, payload, close_tag = match.groups()
    doc = json.loads(payload)
    state = doc["state"]
    print(f"widget models: {len(state)}")

    # --- 1. prune -----------------------------------------------------------
    if not args.no_prune:
        roots = find_roots(html, state)
        if not roots:
            print("prune: no widget-view tag found, skipping (use --no-prune "
                  "to silence)")
        else:
            keep = reachable_from(state, roots)
            dropped = len(state) - len(keep)
            if dropped:
                print(f"prune: dropping {dropped} unreferenced models "
                      f"(keeping {len(keep)} reachable from {len(roots)} view root(s))")
                state = {k: v for k, v in state.items() if k in keep}
                doc["state"] = state
            else:
                print("prune: nothing orphaned")

    # --- 2. simplify --------------------------------------------------------
    layers = list(geojson_models(state))
    print(f"geojson layers with features: {len(layers)}")

    if layers and args.simplify and not args.dry_run:
        with tempfile.TemporaryDirectory() as workdir:
            for mid, model, data in layers:
                name = model["state"].get("name", mid[:8])
                was = len(json.dumps(data))
                simplified = run_mapshaper(
                    mapshaper, data, args.simplify, args.precision, workdir, mid
                )
                if simplified is None:
                    continue
                now = len(json.dumps(simplified))
                model["state"]["data"] = simplified
                pct = 100 * (1 - now / was) if was else 0
                print(f"  {name}: {human(was)} -> {human(now)}  ({pct:.0f}% off)")

    # --- 3. minify and write ------------------------------------------------
    minified = json.dumps(doc, separators=(",", ":"))
    out_html = html[:match.start()] + open_tag + minified + close_tag + html[match.end():]
    after = len(out_html.encode("utf-8"))
    print(f"result: {human(before)} -> {human(after)}  "
          f"({100 * (1 - after / before):.0f}% off)")

    if args.dry_run:
        print("(dry run, nothing written)")
        return

    dest = args.output or args.html.replace(".html", ".min.html")
    if dest == args.html:
        sys.exit("Refusing to overwrite the input in place. Pass -o.")
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write(out_html)
    print(f"wrote {dest}")


if __name__ == "__main__":
    main()
