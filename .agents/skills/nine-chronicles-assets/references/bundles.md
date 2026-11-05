# ZIP Bundles, File Copying, and Generated Usage Guides

Use this guide for the files required by a consuming project, download failures, or ZIP changes. Implementation anchors in index.html: `clipInfo`, `pfxTextures`, `bundleOf`, `saveZip`, `downloadZip`, `downloadPicked`, `usage`, `setupPrompt`.

## Bundle rules

| Target | What bundleOf collects |
|---|---|
| Ordinary character/icon | character-loader.js, every clip file, and the layout JSON when present |
| Character with Spine | The files above plus skeleton/atlas for the base and **all variants** |
| Sprite effect | loader.js, the default clip.file, and a flat single-entry manifest |
| Particle | particles.js, the recipe, a name-to-file textures map, and resolved texture files |

`saveZip` reads atlas text to add page images, then deduplicates file paths. Calculating the final Spine file set from bundleOf alone therefore misses images. Use the page query in [Spine](spine.md).

The first download loads JSZip 3.10.1 from a CDN. Files are fetched into memory, zipped, and downloaded through a Blob URL. Distinguish failures in JSZip loading, atlas parsing, and actual file HTTP responses, in that order. Large selections increase parallel file fetches and memory use.

## Single ZIP versus selection ZIP paths

- Single: `<id>.json` and `사용법.txt` (usage instructions). Extract into the game's `assets/<id>/` as instructed, preserving relative paths.
- Selection: the required subset of `characters.json` (including icons), `effects.json`, and `particles.json`, plus loaders/files. Instructions target the game's `assets/library/` directory.
- Do not add another `assets/library/` prefix inside the ZIP. That directory is the extraction destination.
- All Spine variants are included, not just the selected one. Single-asset usage instructions use the base c.spine.

Clip output in manifests copies only CLIP_KEYS (file, width, height, frameWidth, frameHeight, frames, cols, rows, fps). Ordinary clip hashes are omitted, but the spine object is retained unchanged. categories/games are built for the selected entries.

The original particle data has no textures map; only the ZIP manifest adds it. Unresolved textures are silently omitted, and the renderer does not draw their emitters. See [Particles](particles.md) for missing textures and name normalization.

## UI path copying and AI instructions

For ordinary entries, “이 그림만” (this image only), “경로 복사” (copy path), and “직링크 복사” (copy direct link) target the current flat clip file. Particles have no “이 그림만” button; copying their path/direct link targets particles.json. These are not links to a complete Spine bundle.

`usage` generates detail code and single-ZIP instructions; `downloadPicked` separately generates selection-ZIP instructions. `setupPrompt` generates the longer AI integration guide. Check all three outputs when changing APIs or paths. Existing claims that all sheets have one horizontal row or that the address is local-only do not hold for multi-row data or Pages hosting, respectively.

**Use downloaded files in the game, not the copied hosted URLs.** Do not use GitHub Pages (`github.io`), the current viewer URL, or its direct asset links as runtime asset URLs. Download the required files or ZIP, copy them into the consuming project with relative paths intact, and serve them from that project's own origin. Cross-origin fetching and canvas/WebGL rendering can fail because of CORS. Do not assume another game can always reach a local server address either. Verify the copied files through the consuming project's HTTP server. When delivering remote references, provide an actual PR/service URL.
