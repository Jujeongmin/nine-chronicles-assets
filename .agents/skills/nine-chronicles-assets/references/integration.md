# Game Integration

Use this guide to integrate assets into the consuming game project. If the ID is unclear, start with [Find assets](find-assets.md). For downloaded file sets, see [Bundles](bundles.md).

## Choose a renderer

Inspect the selected character/monster entry for `spine` before choosing a loader. **For a gameplay actor with Spine, integrate its animations by default, including in a simple game or prototype.** Do not wait for the user to ask for animation separately. Use still images only for intentionally static roles such as portraits/icons or an explicit user request. Follow [Spine](spine.md) for available motions, state transitions, and playback verification.

| Required representation | Choice | Next reading |
|---|---|---|
| Gameplay character/monster with Spine (default) | Spine runtime | [Spine](spine.md) |
| Character without Spine, or an intentionally static portrait/icon | `CharacterLib` | Code below |
| Image/frame sheet from effects.json | `EffectLib` | Code below |
| Emitter simulation from particles.json | `ParticleFX` | [Particles](particles.md) |

`CharacterLib.play()` does not automatically play `spine` metadata. A still clip is not a substitute for the available skeletal animations of a gameplay actor. Many facial-expression tabs do not imply frame animation.

## Sprite API

The still-expression example below is for static presentation, not the default implementation of a gameplay actor that has Spine.

**Download and copy the required assets, manifests, and loaders into the game project. Do not point the implementation at the library's current hosted URLs, including `github.io`.** Direct cross-origin URLs can cause CORS failures when fetching or rendering assets. Preserve repository-relative paths beside the manifests and serve the files from the game's own origin. Use a selection ZIP when a full copy is unnecessary. The runtimes expose browser globals or CommonJS exports, but image loading and drawing require a browser environment.

```html
<script src="assets/library/character-loader.js"></script>
<script src="assets/library/loader.js"></script>
```

```js
const chars = await CharacterLib.load('assets/library/characters.json');
// Load icons.json as well only when copying the original repository manifests.
// A selection ZIP includes icons in characters.json, so load only the file above.
// Example for copied original manifests: load(['assets/library/characters.json', 'assets/library/icons.json'])
await chars.preload(['mage']);
const still = chars.play('mage', 'expr_attack'); // Still expression, not the Spine Attack motion
still.update(dtMs).draw(ctx, x, y, {scale: 1, flipX: false});

const effects = await EffectLib.load('assets/library/effects.json');
await effects.preload(['fire_aura']);
const effect = effects.play('fire_aura', {loop: false, onComplete: () => {}});
effect.update(dtMs).draw(ctx, x, y, {scale: 1});
```

- `Animation.update(dtMs)` takes **milliseconds**. Without an argument, it advances using its internal clock. `draw()` does not advance time.
- Drawing coordinates specify the frame center. Shared options are scale/rotation/alpha/blend; only CharacterLib provides flipX.
- `play()` immediately returns an Animation, not a Promise. To wait for images, first await `preload()` or the Clip/Asset's `load()`.
- `load()` fetches the manifest with `cache: 'no-cache'`; image URLs receive `?v=hash` when a hash exists.
- When merging manifests, the default baseUrl is **the first URL's directory**. Manifests from different directories are not automatically resolved against their own directories.
- Frame rectangles use row-major order based on `cols`. Do not assume one horizontal row. See [Schema](manifest-schema.md) for field details.

## Only when using framework adapters

Source anchors: `registerPhaser` and `toPixi` in both loaders.

- Phaser: call `lib.registerPhaser(scene, ids)` during scene preload. Animations are created on loading complete. Character keys are `id:clipName`; Effect keys are `id`. The adapter sets repeat to -1.
- Pixi: use `lib.toPixi(PIXI, id, clipName)` (no clipName for Effect). The v7 path immediately returns an AnimatedSprite; the v8 path returns a Promise. Configure playback and looping in the consuming project after receiving it.
- These are the implementation contracts of this repository's adapters. Check compatibility with the game's actual Phaser/Pixi versions separately.

Inspect only the relevant parts of the selected loader and data from here. Do not read all of index.html unless modifying the viewer.
