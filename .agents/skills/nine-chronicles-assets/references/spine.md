# Spine: Motions, Skins, and Separate Variants

Use this guide when an entry has spine data and skeletal animation is needed, or when modifying Spine previews. Read [Integration](integration.md) additionally only when also using ordinary still/frame clips. This document covers Spine files, motions, and time units.

## Select the exact data

1. Go to [Find assets](find-assets.md) only if the ID is unknown. Otherwise, replace the ID in the query below and extract only the relevant spine information.
2. Select `entry.spine` for the base appearance, or `entry.spine.variants.find(v => v.key === key)` for a separate appearance.
3. Use skeleton/atlas/skin/defaultAnimation/animations from the selected object together. Do not assume a variant has the same motions as the base.

`skin` names a skin within the same skeleton. Each variant has a key/label and **its own skeleton/atlas**. A flat clip named `black` and a Spine variant named `black` are separate representations.

## Resolve files in order

Start with skeleton and atlas paths, then resolve **every image page listed inside the atlas**. Page paths are relative to the atlas directory. Do not assume a single `atlas.webp`. The following query extracts a small page list for this repository's atlas format.

```bash
python3 - <<'PY'
import json, pathlib, re
c = next(a for a in json.load(open('characters.json', encoding='utf-8'))['assets'] if a['id'] == 'valkyrie')
s = next(v for v in c['spine']['variants'] if v['key'] == 'black')
atlas = pathlib.Path(s['atlas'])
print(s['skeleton']); print(atlas)
pages = {str(atlas.parent / line.strip()) for line in atlas.read_text().splitlines()
         if re.search(r'\.(png|webp|jpe?g)$', line.strip(), re.I)}
for page in sorted(pages): print(page)
print('unique pages:', len(pages))
print('motions:', s['animations'], 'skin:', s.get('skin'))
PY
```

## Runtime integration and behavior to preserve

The current viewer loads `@esotericsoftware/spine-webgl@4.1.24` from a CDN. Skeletons ending in `.json` use `loadJson`/`SkeletonJson`; other extensions, such as `.skel.bytes`, use `loadBinary`/`SkeletonBinary`. Avoid dumping skeleton JSON; parse only `skeleton.spine`, `animations` keys, and `skins` names when needed.

Use `registerSpine` in `index.html` as the implementation reference:

1. Load atlas and skeleton through AssetManager and wait for completion.
2. Create AtlasAttachmentLoader → SkeletonJson or SkeletonBinary → SkeletonData → Skeleton.
3. If skin is specified, combine the existing `default` and specified skin into a new Skin with `addSkin`. Call `setSlotsToSetupPose()`.
4. Create AnimationState and call `setAnimation(0, name, loop)` with the exact name. Reuse the state for later motion changes.
5. Each frame, call `animationState.update(dtSeconds)`, `apply`, and `skeleton.updateWorldTransform()`, then draw. Time is in **seconds**.

Additional functions to inspect only for viewer changes: `ensureThumbSpineCanvas`, `visibleBounds`, `createSpineThumb`, `renderDetail`.

- Previews and details share one offscreen 512×512 WebGL canvas, copying results into individual 2D canvases. Keep it attached outside the visible area: detaching it from the DOM can make clientWidth/Height zero.
- Bounds exclude transparent attachments and preserve aspect ratio.
- Rebuilding the grid keeps only `detail` in the registry; closing details removes that registration.
- Unlike ordinary cards using IntersectionObserver, Spine registers during grid creation. Do not describe every Spine asset as lazy-loaded.
- SkeletonData is cached by skeleton URL. When changing atlas combinations, check whether the cache key remains appropriate.

Hashes are appended to skeleton/atlas URLs but not automatically to image pages inside the atlas. See [Maintenance](maintenance.md) for image-update caching issues and [Bundles](bundles.md) for the rule that ZIPs include all variants.
