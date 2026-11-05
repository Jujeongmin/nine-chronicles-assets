# 범위에 맞는 검증

진입: 데이터/로더/뷰어를 바꾼 뒤 또는 사실 재확인. 명령은 저장소 루트에서 실행한다. 기준 상태의 문제를 새 변경의 회귀와 구분한다. 전용 테스트/빌드/CI 설정은 기준 커밋에 없다.

## 매니페스트와 파일 연결

아래는 표준 Python만 사용하며 파일을 바꾸지 않는다. 파일 경로·프레임 메타데이터·중복 ID·Spine 페이지를 검사한다. 파티클 미연결은 기존 7종도 있으므로 진단으로 출력하며 자동 실패시키지 않는다. 새 누락은 변경 전 결과와 비교한다.

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

이 검사는 이미지 바이트의 실제 크기, hash, Spine 바이너리 호환성, 실제 시각적 품질을 보장하지 않는다. 이미지 교체라면 이미지 도구로 크기를 확인한다. hash를 확인할 때만 `hashlib.sha1(path.read_bytes()).hexdigest()[:10]`를 해당 clip.hash와 비교한다. JSON skeleton 변경은 animations 키와 skins 이름만 추출해 선언과 비교하고, binary는 런타임 로딩으로 확인한다.

뷰어는 이펙트도 CharacterLib으로 읽으며 `loader.js`를 직접 로드하지 않는다. EffectLib 변경은 뷰어 확인만으로 검증되지 않으므로 소비 예제를 별도로 실행한다. `index.html`의 character-loader.js와 particles.js에는 고정 `?v=`가 있어 해당 코드 배포 시 캐시 갱신도 확인한다.

## JavaScript 변경일 때만

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

위 검사는 문법만 확인하며 브라우저 동작을 보장하지 않는다.

## 브라우저 확인 범위

실행은 [유지보수](maintenance.md). 변경에 맞춰 검색/필터, 정지 클립, 다중 행 시트, Spine 기본/variant, 파티클, 단일/선택 ZIP을 확인한다. ZIP 변경은 압축을 풀어 매니페스트 참조 파일을 확인하고 소비 프로젝트의 HTTP 서버에서 대표 에셋을 로드한다. 바꾸지 않은 전체 에셋의 육안 검사를 요구하지 않는다.

## 스킬 문서를 갱신할 때

링크, 함수/파일명, 실행 예시를 확인한다. 하위 문서를 늘리면 부모에 선택 조건을 추가한다. 모든 참고문서를 한 번에 읽도록 지시하지 않는다. 독립 에이전트에 진입점과 실제 과업만 주고 읽은 경로·출력량·결과를 기록해 막힌 곳을 개선한다.
