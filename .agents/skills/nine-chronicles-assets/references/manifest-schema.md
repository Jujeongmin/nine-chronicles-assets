# Manifest Schema

Use this guide to interpret fields or add/replace entries. For simple searches, return to [Find assets](find-assets.md). This describes the contract read by the runtime, not a complete JSON Schema.

## The three sprite manifests

The root of characters.json / icons.json / effects.json is `{version, defaultFps, categories, games, assets}`. categories/games map keys to display labels; assets is an array. The current game is `nc`, but the code can accept new games.

| Location | Fields | Meaning |
|---|---|---|
| Entry | id, name?, category, game | ID and classification. Duplicate IDs across the merged list cause lookup/selection-state collisions |
| Entry | animations?, defaultAnimation? | Name-to-clip map. If absent, the entry itself is the `default` clip |
| Clip | file | Path relative to the manifest baseUrl, currently the repository root |
| Clip | width, height | Full image dimensions |
| Clip | frameWidth, frameHeight, frames, cols, rows | Frame dimensions, valid frame count, and grid |
| Clip | fps?, hash? | Playback code defaults fps to 12; hash distinguishes cached image URLs |
| Entry | spine? | Separate skeleton/atlas playback information. See [Spine](spine.md) |
| Entry | pixelArt?, layout? | Pixel interpolation hint and tile-layout file. Supported by code but absent from current data |
| Entry | source?, note?, clipNotes? | Descriptive metadata. Character does not copy clipNotes into the runtime object |

The root `defaultFps` field does not override individual playback fps. Animation in both loaders uses `options.fps || clip.fps || 12` (asset.fps for Effect).

Frame i is at `x = (i % cols) * frameWidth`, `y = floor(i / cols) * frameHeight`. Require `frames <= cols * rows`, with every used frame inside the image. The last row may be partially filled. Multi-row sheets exist in the current data.

characters mixes flat entries and animations maps; icons currently uses animations maps, and effects uses flat entries. Do not select a renderer based on effects metadata such as `opaque` or `reference`.

## Spine and particles have different contracts

Spine's `animations` is a **string array**; an ordinary entry's `animations` is a **clip map**. Spine variants use separate file sets. See [Spine](spine.md) for details.

The particles.json root is `{version, game, effects: {ID: {emitters: [...], variants?: [...]}}}`, not an assets array. Some effects retain `variants: [{id, tint}]` as source metadata, but the current runtime and viewer do not use it. Spawning a variant ID absent from the top-level effects keys fails. Use it only as a clue to find the parent; do not promise visual equivalence between parent and variant. The repository original has no `textures` map; ZIP generation creates the required mapping. See [Particles](particles.md) for emitters and path resolution.

## After changes

See [Maintenance](maintenance.md) for adding/replacing assets and [Validation](validation.md) for referenced files, grids, and duplicate IDs. Do not duplicate every internal key of source images or skeletons in this skill.
