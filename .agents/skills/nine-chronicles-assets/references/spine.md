# Spine: 동작·스킨·별도 variant

진입: 항목에 spine이 있고 골격 애니메이션이 필요할 때, 또는 Spine 미리보기 수정. 일반 정지/프레임 클립은 [게임 연동](integration.md).

## 정확한 데이터 선택

1. [에셋 찾기](find-assets.md)의 단일 항목 질의로 spine만 확인한다.
2. 기본은 `entry.spine`, 별도 모습은 `entry.spine.variants.find(v => v.key === key)`를 선택한다.
3. 선택한 객체의 skeleton/atlas/skin/defaultAnimation/animations를 함께 사용한다. 기본 동작 목록이 variant에도 같다고 가정하지 않는다.

`skin`은 같은 skeleton 내부의 스킨명이다. `variants`는 key/label과 **자체 skeleton/atlas**를 가진다. flat 클립의 `black` 이름과 Spine variant의 `black`은 별개 표현이다.

## 파일을 찾는 순서

skeleton, atlas 두 경로 → **atlas 내용에 적힌 모든 이미지 페이지**. 페이지 경로는 atlas 디렉터리 기준이다. `atlas.webp` 한 장이라고 추측하지 않는다. 아래는 이 저장소 atlas 형식에서 페이지를 작게 추출하는 예다.

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

## 런타임 연결과 보존할 동작

현재 뷰어는 `@esotericsoftware/spine-webgl@4.1.24`를 CDN에서 로드한다. 스켈레톤 확장자가 `.json`이면 `loadJson`/`SkeletonJson`, 그 밖의 `.skel.bytes` 등은 `loadBinary`/`SkeletonBinary` 경로다. JSON 파일 내부를 대량 출력하지 말고 필요하면 `skeleton.spine`, `animations` 키, `skins` 이름만 파싱한다.

`index.html`의 `registerSpine`가 구현 기준이다:

1. AssetManager에 atlas와 skeleton을 로딩하고 완료를 기다린다.
2. AtlasAttachmentLoader → SkeletonJson 또는 SkeletonBinary → SkeletonData → Skeleton을 생성한다.
3. skin이 있으면 존재하는 `default`와 지정 skin을 새 Skin에 `addSkin`으로 합친다. `setSlotsToSetupPose()`를 호출한다.
4. AnimationState를 만들고 정확한 이름으로 `setAnimation(0, name, loop)`한다. 이후 동작 변경에는 state를 재사용한다.
5. 매 프레임 `animationState.update(dtSeconds)`, `apply`, `skeleton.updateWorldTransform()` 후 그린다. **초 단위**다.

뷰어 변경일 때만 함께 볼 함수: `ensureThumbSpineCanvas`, `visibleBounds`, `createSpineThumb`, `renderDetail`.

- 미리보기와 상세가 한 offscreen 512×512 WebGL 캔버스를 공유하고, 각 2D 캔버스로 결과를 복사한다. DOM에서 분리하면 clientWidth/Height가 0이 될 수 있어 화면 밖에 붙여 둔다.
- bounds는 투명 attachment를 제외하여 계산하고 종횡비를 유지한다.
- grid를 다시 만들 때 registry에서 `detail`만 남기고, 상세 닫을 때 detail 등록을 제거한다.
- 일반 카드의 IntersectionObserver와 달리 Spine은 grid 생성 시 등록된다. 모든 Spine이 지연 로딩된다고 설명하지 않는다.
- SkeletonData 캐시는 skeleton URL 기준이다. atlas 조합을 바꾸는 수정이면 캐시 키의 적합성을 함께 확인한다.

hash는 skeleton/atlas URL에 붙지만 atlas 내부 이미지 페이지에는 자동으로 붙지 않는다. 이미지 갱신 캐시 문제는 [유지보수](maintenance.md). ZIP의 variant 전체 포함 규칙은 [번들](bundles.md).
