---
name: nine-chronicles-assets
description: Find Nine Chronicles images, Spine assets, particles, and ZIP contents; integrate them into a game or maintain the viewer and manifests. Navigate progressively to the relevant data and implementation.
---

# Nine Chronicles Asset Guide

This repository is a **static asset library**, not the game itself. `index.html` provides search, previews, and ZIP downloads; JSON manifests connect images, Spine assets, and particles. There is no npm build, backend, or database.

**Animate gameplay characters and monsters by default when Spine is available.** A request to build even a simple game includes using their provided animations; do not wait for a separate animation request or stop at displaying a still image. Inspect the selected asset's `spine` data and follow [Spine](references/spine.md) to connect available motions to the implemented game states. Still images are appropriate for intentionally static uses such as portraits/icons, or when the user explicitly requests them.

## Reading order

The documentation directory is `.agents/skills/nine-chronicles-assets/` at the repository root.
For example, read the viewer guide with `cat .agents/skills/nine-chronicles-assets/references/viewer.md`.
Running `cat references/viewer.md` from the repository root uses the wrong path. If the skill was supplied elsewhere, prefix document paths with **the parent directory of the supplied SKILL.md**.

1. Open **one** document below that matches the request. Read its deeper references only when their stated conditions apply.
2. Use its queries to narrow the candidates, then inspect one relevant ID or function section. Do not dump large JSON files or all references at once.
3. Stop when the required ID, files, API, and owning functions are clear. Follow another branch only when the request includes another task.

| Request | Next document | What it provides |
|---|---|---|
| Find an asset by name, ID, type, or motion | [Find assets](references/find-assets.md) | Small search results → one entry → files |
| Use assets in a game | [Integration](references/integration.md) | Spine-first gameplay actors, renderer selection, and project integration |
| Find or use sound effects and music | [Sounds](references/sounds.md) | Search, playback API, and manifest fields |
| Modify search, categories, previews, or download UI | [Viewer](references/viewer.md) | Functions, state, and rendering ownership by feature |
| Fix startup, add/replace assets, or check consistency | [Maintenance](references/maintenance.md) | Running locally → schema, validation, and update procedures |

If the ID and type are already known, skip the intermediate guide:
- Spine motions, variants, or required files → [Spine](references/spine.md).
- Particle textures, playback, or missing images → [Particles](references/particles.md).
- ZIP contents or copying files → [Bundles](references/bundles.md).
- Manifest fields → [Schema](references/manifest-schema.md); consistency checks only → [Validation](references/validation.md).

## Minimal project map

- `characters.json`: characters, monsters, and items. `icons.json`: equipment, weapon, and skill icons.
- `effects.json`: image/sprite effects. `particles.json`: particle recipes in the `effects` object. `sounds.json`: sound effects and music.
- `characters/`, `effects/`, `singles/`: actual files. Do not infer IDs or filenames from directory names alone.
- `character-loader.js` → `CharacterLib`, `loader.js` → `EffectLib`, `particles.js` → `ParticleFX`, `sound-loader.js` → `SoundLib`.
- `characters/index.html` redirects the old URL to the root viewer.

## Usage rules

**Download assets before using them in a game.** Do not use the current hosted URLs, including GitHub Pages (`github.io`), as runtime asset URLs. Copy the required assets, manifests, and loaders into the game project, preserve relative paths, and serve them from the game's own origin. Direct cross-origin loading can fail because of CORS during fetching or canvas/WebGL rendering.

Run commands **from the repository root**. Documentation links are relative to the current document; source paths are relative to the repository root. `.claude/skills/nine-chronicles-assets` is an alias for this skill. If a Windows checkout does not support symlinks, read `.agents/skills/nine-chronicles-assets/SKILL.md` directly. Example heredocs require a POSIX shell; on Windows, use WSL/Git Bash or execute the Python body separately.

Manifests and executable code are the source of truth. Counts and observations in these documents refer to baseline commit `db5359e`; verify them against current data. Prefer executable branches over stale comments, such as circle fallbacks for missing textures or assumptions that every sheet has one horizontal row. This guide does not itself authorize code changes, deployment, or external publication.
