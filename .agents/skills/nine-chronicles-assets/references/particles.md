# Particles: Recipes and Textures

Use this guide to play particles.json assets, investigate missing textures, or modify simulation. For sprite effects, return to [Integration](integration.md).

## Data and paths

An effect's optional `variants: [{id, tint}]` is **metadata unused by the runtime**. `ParticleFX.ids/get/spawn` and the viewer operate only on top-level effects keys. Given a variant name, use the search in [Find assets](find-assets.md) to locate its parent key and inspect that recipe. There is no automatic alias registration or tint application. Check separately whether the ID also exists as an independent top-level key.

The recipe is `particles.json.effects[id].emitters`. Each emitter has name/duration/looping/maxParticles, lifetime/speed/size/rotation/gravity/color, rate/bursts/shape, optional velocity/sizeOverLife/colorOverLife, and texture/tint/blend/render.

Numeric curves use `{v}`, `{min,max}`, or `{keys:[[t,value],...]}`. Colors use `{color:[r,g,b,a]}` or `{stops,alpha}`. The supported behavior is defined by `sample`, `sampleGradient`, and `Emitter.emit/update/draw` in `particles.js`. This is a 2D interpretation, not a complete reproduction of Unity 3D; not all source information, including render fields, is implemented.

Texture name → `String(name).toLowerCase().replace(/[^a-z0-9]+/g, '_')` → effects.json ID → file. Do not add a `single_` prefix. Example: NY_glow_01 → ny_glow_01 → singles/ny_glow_01.webp.

```bash
python3 - <<'PY'
import json, re
fx = json.load(open('particles.json', encoding='utf-8'))['effects']
assets = {a['id']: a for a in json.load(open('effects.json', encoding='utf-8'))['assets']}
asset_id = 'contents_unlock_01'
resolved, missing = {}, set()
for e in fx[asset_id]['emitters']:
    name = e.get('texture')
    key = re.sub('[^a-z0-9]+', '_', name.lower()) if name else None
    file = assets.get(key, {}).get('file')
    print(e['name'], name, key, file or 'MISSING')
    if file: resolved[name] = file
    elif name: missing.add(name)
print('emitters:', len(fx[asset_id]['emitters']))
print('resolved names:', len(resolved), 'unique files:', len(set(resolved.values())))
print('files:', sorted(set(resolved.values())), 'missing:', sorted(missing))
PY
```

Emitter count, unique texture-name count, and deduplicated file count differ. Calculate file counts using a set as above, rather than counting rows by eye.

The original particles.json has no textures dictionary. `pfxTextures` in `index.html` creates the name-to-file map only for ZIPs. See [Bundles](bundles.md).

## Runtime usage

```js
// Map original texture names to fully loaded HTMLImageElement instances in images.
const fx = await ParticleFX.load('assets/library/particles.json', {
  resolveTexture: name => images[name],
  unitScale: 100
});
const inst = fx.spawn(id, {x: 200, y: 300});
inst.update(dtSeconds); // Seconds, unlike CharacterLib/EffectLib milliseconds
inst.draw(ctx);
// Check completion with inst.alive(); looping emitters keep the instance alive.
```

If a texture is missing or not ready, `Emitter.image()` calls the resolver again on a later draw. **Emitter.draw returns immediately when there is no image**. The index.html comment claiming a default circle fallback does not match the current code. Missing textures are not automatically generated or replaced.

When an image is found, the runtime uses the **entire sheet**. Even when the texture is a frame sheet, this runtime does not crop and advance individual frames. If that differs from the intended result, treat it as a separate texture interpretation/rendering change.

This document and the relevant functions are enough to investigate missing textures and confirm the playback API. Read Bundles additionally only when a ZIP file set is required. Read [Integration](integration.md) only when also using a sprite loader.

## Shared ParticleFX rendering

`isAdditive`: alpha blend uses source-over; additive uses lighter; otherwise, only dstBlend 10 selects alpha. tinted caches canvases by color. When investigating differences from the source appearance, start with these functions and curve/shape support. They live in `particles.js` and also apply in consuming games.

## Viewer-only behavior

`resolveTexture` looks up an ID in the merged CharacterLib and obtains the image through clip.load. `pfxMeasure`/`pfxUnitScale` estimate recipe size and movement to fit the card. `spawnPfx`, `primeIfPaused`, `drawPfxCard`, and `renderDetail` manage playback/pause and recreate one-shot effects. This automatic fitting is not default behavior of the ParticleFX API.


Seven unresolved texture names at baseline: NY_buff_plus_dispel, NY_buff_hp, NY_boss, NY_smoke_01, NY_feather_02.png, NY_glow_wind, NY_UI_icon_02. They affect 12 effects; recalculate current results with [Validation](validation.md). Do not choose replacement textures based only on names or extensions.
