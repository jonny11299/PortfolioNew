# Mock media (USE_MOCK mode)

When `USE_MOCK=true`, `/api/vastWalker` skips the real VAST walk and returns a
local video from this folder instead of a signed ad-server URL. Files here are
served by SvelteKit at the site root, so `static/mock-media/ad-30s-01.mp4` is
reachable at **`/mock-media/ad-30s-01.mp4`** — which is exactly the `url` the
mock hands back to the player.

## Drop your videos here

The placeholder `.mp4` files below are **empty** (0 bytes). Replace each one
with a real clip of the matching length and keep the filename identical:

| Filename          | Length |
| ----------------- | ------ |
| `ad-15s-01.mp4`   | ~15s   |
| `ad-15s-02.mp4`   | ~15s   |
| `ad-15s-03.mp4`   | ~15s   |
| `ad-30s-01.mp4`   | ~30s   |
| `ad-30s-02.mp4`   | ~30s   |
| `ad-30s-03.mp4`   | ~30s   |

The mock picks a file by the creative's duration (15s vs 30s) and a stable hash
of the creative, so a given creative always maps to the same clip.

### Want more variety?

Add more files following the same `ad-<15|30>s-NN.mp4` pattern, then bump
`FILES_PER_DURATION` in `src/lib/server/mocks/media.js` to match the new count.
