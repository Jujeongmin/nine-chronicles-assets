# Find Assets

Use this guide to find names, IDs, categories, motions, or required files. For actual game integration, continue to [Integration](integration.md); for field meanings only, see [Schema](manifest-schema.md).

## 1. Print only candidates

Search manifest ID/name/category fields and clip/Spine motion names before searching filenames. Replace `q` below and limit output to 20 results. For effects without Korean names, search a category or part of an ID, such as `aura` or `lightning`. Look up Korean category labels in each manifest's `categories` map.

```bash
python3 - <<'PY'
import json
q = 'valkyrie'.lower()
hits = []
for filename in ('characters.json', 'icons.json', 'effects.json'):
    data = json.load(open(filename, encoding='utf-8'))
    for a in data['assets']:
        words = [str(a.get(k, '')) for k in ('id','name','category')]
        words.extend(a.get('animations', {}))
        spine = a.get('spine', {})
        for spec in [spine] + spine.get('variants', []):
            words.extend(spec.get('animations', []))
        if q in ' '.join(words).lower():
            hits.append((filename, a['id'], a.get('name'), a['category'], bool(a.get('spine'))))
p = json.load(open('particles.json', encoding='utf-8'))
for parent, spec in p['effects'].items():
    if q in parent.lower(): hits.append(('particles.json', parent, '', 'pfx', False))
    for v in spec.get('variants', []):
        if q in v['id'].lower():
            hits.append(('particles.json', parent, 'metadata variant: ' + v['id'], 'pfx', False))
print('matches:', len(hits))
for hit in hits[:20]: print(hit)
PY
```

## 2. Read exactly one entry

Use the filename/id from the candidate result unchanged. For a `metadata variant` result, the id column contains the **parent effect key**. Do not spawn a variant ID absent from the top-level effects keys. If a top-level key with that name exists, play that key. Preserve ID case, especially for particle keys containing Korean characters and uppercase letters.

```bash
python3 - <<'PY'
import json
filename, asset_id = 'characters.json', 'valkyrie'
d = json.load(open(filename, encoding='utf-8'))
a = d['effects'][asset_id] if filename == 'particles.json' else next(a for a in d['assets'] if a['id'] == asset_id)
# For large particles, print emitter names/textures first; read the full recipe only to edit its fields.
if filename == 'particles.json':
    print([(e['name'], e.get('texture'), e.get('looping')) for e in a['emitters']])
else:
    print(json.dumps(a, ensure_ascii=False, indent=2))
PY
```

- `default`, `black`, and `expr_attack` under `animations` are clip names. A clip with `frames: 1` is a still image.
- Find skeletal motion names in `spine.animations`. Do not change `Attack` to `attack`.
- A `key` in `spine.variants` identifies a separate skeleton/atlas set. Read [Spine](spine.md) and select the relevant variant.
- Resolve particle textures with [Particles](particles.md).
- To copy files or inspect ZIP contents, continue to [Bundles](bundles.md).

## 3. Stop when the evidence is sufficient

Report the manifest name, exact ID, selected appearance/motion, and actual file paths. Check file existence with `test -f 'path'`. Finding one entry does not require reading an entire skeleton JSON file or the full 3 MB particles.json.

Baseline counts: characters 204 / icons 388 / effects 201 / particles 209. Do not turn these counts into fixed code or test requirements.
