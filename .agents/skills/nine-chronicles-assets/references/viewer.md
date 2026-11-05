# Viewer Implementation Map

Use this guide to modify search, categories, previews, details, copy actions, or downloads. The inline IIFE in `index.html` owns state, DOM, and rendering. There is no separate application framework.

## Locate functions and read only the relevant sections

```bash
rg -n 'function (filtered|buildChips|renderGrid|renderDetail|saveZip)' index.html
# Read only the relevant function range from the results: sed -n 'START,ENDp' index.html
```

| User action or symptom | First anchors to inspect | Next document |
|---|---|---|
| Initial page fails to load | `Promise.all`, `CharacterLib.load`, `ParticleFX.load` | [Maintenance](maintenance.md) |
| Search, game, group, or category | `GROUPS`, `state`, `passes`, `filtered`, `buildChips` | Filter contract below |
| Card display, playback, or lazy loading | `renderGrid`, `tick`, `seen`, `drawCardFrame` | Rendering contract below |
| Blank Spine preview, sizing, or variants | `registerSpine`, `visibleBounds`, `renderDetail` | [Spine](spine.md) |
| Particle size or invisibility | `resolveTexture`, `pfxUnitScale`, `drawPfxCard` | [Particles](particles.md) |
| Open/close details or switch tabs | `selectCharacter`, `closeDetail`, `renderDetail` | Spine/Particles when needed |
| Selection ZIP, single ZIP, or copied code | `state.picked`, `bundleOf`, `downloadPicked`, `usage` | [Bundles](bundles.md) |
| Connect to AI | `setupPrompt`, `SITE_BASE`, `setupBtn` | [Bundles](bundles.md) |
| Mobile layout or top bar | CSS `@media (max-width:980px)`, `syncBarHeight` | Layout below |

## Filter contract

Initial loading merges the three sprite manifests through CharacterLib and adds particles as placeholder objects with `pfx:true`. Particles have no getClip/animationNames.

The hierarchy is game → group → category. Categories absent from `GROUPS` fall under etc. Changing game resets group/cat to all; changing group resets cat to all. `buildChips` resets URL filters with no matching entries to all.

The URL records only game/group/cat. The old `?filter=animated` is also accepted. Search text, picked IDs, and the detail entry are not currently persisted in the URL. `filtered` performs case-insensitive substring matching on ID/name/category label/game label. Its search scope differs from the loader's search.

## Rendering contract

Ordinary cards and particles track visibility with IntersectionObserver (rootMargin 200px). Ordinary images load when first visible. `renderGrid` creates DOM for every filtered result; this is not list virtualization. Spine uses a separate shared WebGL loop.

`tick` receives milliseconds, clamped to 60 ms. It converts to seconds before particle calls. OS reduced-motion starts playback paused; users can still play. Details have three branches—ordinary clips, Spine, and particles—with separate update state.

Desktop uses a 400px detail panel; at 980px or below it becomes a bottom panel with a scrim. After structural changes, use a real browser to check desktop/mobile layouts, selection persistence after filtering, pause/play, and closing details.

The existing comment that adding entries requires no page changes generally holds for existing categories. To place a new category in a particular group, update GROUPS too. Identify the owning functions and state boundaries before splitting up the entire page.
