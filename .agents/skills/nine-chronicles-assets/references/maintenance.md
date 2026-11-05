# Running, Updating, and Investigating Problems

Use this guide to run locally, change files/manifests, or investigate broken assets. Read [Schema](manifest-schema.md) for fields and [Validation](validation.md) for check commands.

## Run locally

From the root, run `python3 -m http.server 8765 --bind 127.0.0.1` and open `http://localhost:8765/`. Choose another port if it is occupied. Opening file:// directly restricts fetch/WebGL. No separate npm install/build is required.

- Mac `열기-맥.command`: requires Python 3, uses lsof to find a free port starting at 8765, opens the browser, and starts the server. The baseline commit lacks the executable bit, so double-clicking may fail. Check with `git ls-files -s '열기-맥.command'` when investigating. `sh 열기-맥.command` can also run it temporarily.
- Windows `열기-윈도우.bat` → `tools/serve.ps1`: built-in PowerShell HttpListener on localhost ports 8765–8785. No extra Python installation is required. .gitattributes specifies CRLF for `.bat` and LF for `.command`.
- Even locally, Spine (unpkg), JSZip (cdnjs), and fonts (Google) use the network. A page opening successfully does not imply full offline functionality.
- The Pages address in README points to the deployed viewer. This repository has no deployment workflow, so code alone cannot confirm actual Pages settings or successful deployment.

## Add or replace assets

1. Use [Find assets](find-assets.md) to check existing IDs and similar entries. Confirm the user's requested scope and Git state; preserve others' changes.
2. Put files in the appropriate directory and register them in the correct manifest. See [Schema](manifest-schema.md) for flat and animations formats. Adding an image file alone does not make it appear in the list.
3. Match file/frame count/grid/fps/defaultAnimation to actual data. New IDs must be unique, including across particle IDs.
4. Add new category/game labels to the display-name maps. To place a new category in a specific UI group, also inspect `GROUPS` in index.html.
5. Existing image hashes match the first 10 characters of SHA-1. Recompute them from bytes when replacing files. The repository does not contain the Spine hash generation algorithm; do not assert one.
6. For Spine, handle the base, variants, and all atlas image pages together. skeleton/atlas hashes do not invalidate page-image caches. If needed, change directory paths and update all references together. See [Spine](spine.md).
7. Run [Validation](validation.md), then check the changed assets, motions, and downloads in a browser. For UI changes, check desktop and mobile too.

The repository contains no source Unity project, extractor, or manifest regeneration pipeline. Do not invent an undocumented regeneration command. If automatic extraction is requested, establish the source location and tools separately.

## Route symptoms to the next location

| Symptom | First check | Next document |
|---|---|---|
| Entire list fails to load | HTTP access and response/parsing of all four JSON files | Initial loading in [Viewer](viewer.md) |
| One image is invisible | Manifest file, hash URL, and frame grid | [Validation](validation.md) |
| Only a still image appears | Difference between clip.frames and spine | [Integration](integration.md) |
| Only Spine is invisible | CDN, skeleton type, and every atlas page | [Spine](spine.md) |
| Some particles are invisible | Texture normalization and resolver results | [Particles](particles.md) |
| ZIP has missing files or fails | Atlas expansion after bundleOf, and CDN | [Bundles](bundles.md) |

Existing code refers to a missing `CHARACTERS.md`. The actual schema is documented in this skill's [Schema](manifest-schema.md). The repository has no explicit licensing/usage-permission document, so this guide does not establish those permissions.
