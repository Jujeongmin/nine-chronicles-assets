# Validation Appropriate to the Change

Use this guide after data/loader/viewer changes or to verify facts. Run commands from the repository root. Distinguish baseline issues from regressions introduced by the change. The baseline commit has no dedicated test/build/CI configuration.

## Manifests and referenced files

The following uses only standard Python and does not modify files. It checks paths, frame metadata, duplicate IDs, and Spine pages. Unresolved particle textures are reported diagnostically rather than failing automatically because seven names are already unresolved at baseline. Compare with pre-change output to identify new omissions.

```bash
python3 - <<'PY'
import collections, json, pathlib, re
root = pathlib.Path('.')
ids, errors = [], []
entries = []
def exists(path):
    if not (root / path).is_file(): errors.append(('missing', path))
for filename in ('characters.json', 'icons.json', 'effects.json'):
    data = json.load(open(filename, encoding='utf-8'))
    entries.extend(data['assets'])
    for a in data['assets']:
        ids.append(a['id'])
        clips = a.get('animations', {'default': a})
        if a.get('defaultAnimation') and a['defaultAnimation'] not in clips:
            errors.append(('default clip', a['id']))
        for c in clips.values():
            exists(c['file'])
            if not (0 < c['frames'] <= c['cols'] * c['rows']
                    and c['frameWidth'] > 0 and c['frameHeight'] > 0
                    and c['cols'] > 0 and c['rows'] > 0
                    and c['cols'] * c['frameWidth'] <= c['width']
                    and c['rows'] * c['frameHeight'] <= c['height']):
                errors.append(('grid', a['id'], c['file']))
        if a.get('layout'): exists(a['layout'])
        if a.get('spine'):
            for s in [a['spine']] + a['spine'].get('variants', []):
                exists(s['skeleton']); exists(s['atlas'])
                atlas = root / s['atlas']
                if atlas.is_file():
                    for line in atlas.read_text().splitlines():
                        page = line.strip()
                        if re.search(r'\.(png|webp|jpe?g)$', page, re.I):
                            exists(str(atlas.parent / page))
p = json.load(open('particles.json', encoding='utf-8'))['effects']
ids.extend(p)
errors += [('duplicate id', k) for k, n in collections.Counter(ids).items() if n > 1]
by_id = {a['id']: a for a in entries}
missing = collections.defaultdict(set)
for key, spec in p.items():
    for e in spec['emitters']:
        t = e.get('texture')
        if t and re.sub('[^a-z0-9]+', '_', t.lower()) not in by_id:
            missing[t].add(key)
print('assets:', len(ids), 'errors:', len(errors))
for error in errors[:20]: print(error)
print('unresolved textures:', {k: len(v) for k, v in sorted(missing.items())})
print('affected effects:', len(set().union(*missing.values())) if missing else 0)
raise SystemExit(bool(errors))
PY
```

This does not verify actual image dimensions, hashes, Spine binary compatibility, or visual quality. For image replacement, check dimensions with an image tool. When checking hashes, compare `hashlib.sha1(path.read_bytes()).hexdigest()[:10]` with the corresponding clip.hash. For JSON skeleton changes, extract animations keys and skins names and compare them with declarations; verify binary skeletons through runtime loading.

The viewer reads effects through CharacterLib and does not load `loader.js` directly. Viewer checks alone therefore do not validate EffectLib changes; run a consuming example separately. character-loader.js and particles.js have fixed `?v=` values in index.html, so check cache invalidation when deploying changes to those files.

## Only for JavaScript changes

```bash
node --check loader.js
node --check character-loader.js
node --check particles.js
node <<'JS'
const fs = require('fs'), vm = require('vm');
for (const file of ['index.html', 'characters/index.html']) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(m[1]);
}
console.log('inline syntax OK');
JS
```

These checks verify syntax only, not browser behavior.

## Browser check scope

See [Maintenance](maintenance.md) for startup. Match checks to the change: search/filters, still clips, multi-row sheets, base/variant Spine, particles, and single/selection ZIPs. For ZIP changes, extract the archive, verify manifest-referenced files, and load representative assets through the consuming project's HTTP server. Do not require visual inspection of every unchanged asset.

## When updating skill documents

Check links, function/filenames, and runnable examples. When adding a child document, add its selection criteria to the parent. Do not instruct agents to read all references at once. Give an independent agent only the entrypoint and a realistic task, record its reading path, output volume, and results, and improve places where it gets stuck.
