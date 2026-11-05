# 에셋 찾기

진입: 이름·ID·카테고리·동작 또는 필요한 파일을 찾을 때. 실제 게임 연동은 [게임 연동](integration.md), 필드 의미만 모르면 [스키마](manifest-schema.md)로 간다.

## 1. 후보만 출력

파일명 검색보다 매니페스트의 ID/name/category와 클립·Spine 동작명을 우선한다. 아래 `q`를 바꾸고 결과는 20개로 제한한다. 한글 이름이 없는 이펙트는 `aura`, `lightning` 같은 category나 ID 일부로 찾는다. 카테고리 한글 표시는 각 매니페스트 `categories`에서 조회한다.

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

## 2. 정확히 한 항목 읽기

후보 결과의 filename/id를 그대로 사용한다. `metadata variant` 결과의 id 열은 **부모 효과 키**다. 최상위 effects 키에 없는 variant ID는 spawn하지 않는다. 같은 이름의 최상위 키가 있으면 그 키로 재생한다. ID는 대소문자를 보존한다. 특히 파티클 키는 한글·대문자가 섞여 있다.

```bash
python3 - <<'PY'
import json
filename, asset_id = 'characters.json', 'valkyrie'
d = json.load(open(filename, encoding='utf-8'))
a = d['effects'][asset_id] if filename == 'particles.json' else next(a for a in d['assets'] if a['id'] == asset_id)
# 큰 파티클은 먼저 이미지터별 이름/텍스처만 출력. 전체 레시피는 해당 필드 수정 때만.
if filename == 'particles.json':
    print([(e['name'], e.get('texture'), e.get('looping')) for e in a['emitters']])
else:
    print(json.dumps(a, ensure_ascii=False, indent=2))
PY
```

- `animations`의 `default`, `black`, `expr_attack` 등은 클립 이름이다. `frames: 1`이면 정지 모습이다.
- 실제 골격 동작은 `spine.animations`에서 찾는다. `Attack`을 `attack`으로 바꾸지 않는다.
- `spine.variants`의 `key`는 다른 skeleton/atlas 세트다. [Spine](spine.md)을 읽고 해당 variant만 선택한다.
- 파티클 텍스처 연결은 [파티클](particles.md)에서 확인한다.
- 파일을 복사하거나 ZIP 구성 확인이 목적이면 [번들](bundles.md)로 간다.

## 3. 근거를 확보하면 종료

최종 답에 매니페스트명, 정확한 ID, 선택한 모습/동작, 실제 파일 경로를 남긴다. 파일이 존재하는지는 `test -f '경로'`로 확인한다. 한 항목을 찾는 데 전체 skeleton JSON이나 3MB짜리 particles.json 원문을 읽을 필요는 없다.

기준 데이터 규모: characters 204 / icons 388 / effects 201 / particles 209. 이 숫자를 코드나 테스트의 고정 요구조건으로 쓰지 않는다.
