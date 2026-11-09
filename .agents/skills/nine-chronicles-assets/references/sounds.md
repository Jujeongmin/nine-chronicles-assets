# Sounds: Effects and Music

Use this guide to find sounds, use them in a game, or add sound entries. The manifest is `sounds.json`, the files live in `sounds/sfx/` and `sounds/music/`, and the runtime is `sound-loader.js` (`SoundLib`).

## Find a sound

Search `sounds.json` by `id`, `name`, or `category`. Do not dump the whole file.

```bash
python3 - <<'PY'
import json
q = 'boss'
for a in json.load(open('sounds.json', encoding='utf-8'))['assets']:
    if q in (a['id'] + a['name'] + a['category']).lower():
        print(a['id'], '|', a['name'], '|', a['category'], '|', a['type'], '|', a['duration'], 's |', a['file'])
PY
```

Some effects share identical audio under different IDs, such as the five `sfx_casting_*` files. Check `hash` when that matters.

## Use in a game

Copy the selected `file`, `sounds.json`, and `sound-loader.js` into the game project with paths preserved. Keep the bytes unchanged.

```html
<script src="assets/library/sound-loader.js"></script>
```

```js
const sounds = await SoundLib.load('assets/library/sounds.json');

// Browsers block audio until the first input. List music that later starts without a gesture.
addEventListener('pointerdown', () => sounds.unlock(['bgm_boss1']), { once: true });

await sounds.preload(['sfx_click', 'sfx_critical01']);
sounds.play('sfx_click', { volume: 0.8 });
sounds.play('bgm_boss1', { volume: 0.5, fade: 0.5 });
sounds.stopMusic({ fade: 0.5 });
```

- `play` chooses effect or music playback from the entry's `type`.
- Effects (`type: sfx`) are decoded into AudioBuffers. Call `release(ids)` when a scene no longer needs them.
- Music (`type: music`) streams through one reused `<audio>` element per track. Do not call `decodeAudioData` on music: a four-minute stereo track stays in memory as about 100MB of PCM.
- Connect implemented game events to sounds. Loading a sound without playing it is not a complete integration.
- `loop` is a usage hint from the track's purpose. Loop points were not checked.
- Check playback on mobile. Older iOS Safari versions may not play `.ogg` files.

## Manifest fields

The root is `{version, categories, games, assets}`.

| Field | Meaning |
|---|---|
| id, name, category, game | ID and classification. IDs must stay unique across every manifest |
| type | `sfx` or `music` |
| file | Path relative to the manifest |
| format, duration, channels, sampleRate, bytes | Properties read from the file |
| loop | Whether the sound normally repeats |
| hash | First 10 characters of the file's SHA-1, added to the URL for caching |

## Add sounds

Put the file in the matching folder, add an entry with values read from the file, and keep `category` to a key listed in `categories`. New categories must also be added to `GROUPS` in `index.html` to get their own chip. Check playback in the viewer.
