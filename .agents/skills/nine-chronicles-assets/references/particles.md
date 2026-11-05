# 파티클: 레시피와 텍스처

진입: particles.json 에셋 재생, 텍스처 누락, 시뮬레이션 수정. 스프라이트 이펙트면 [게임 연동](integration.md)으로 돌아간다.

## 데이터와 경로

효과의 선택적 `variants: [{id, tint}]`는 **런타임 미사용 메타데이터**다. `ParticleFX.ids/get/spawn`과 뷰어는 최상위 effects 키만 다룬다. variant 이름을 받으면 [에셋 찾기](find-assets.md)의 검색으로 부모 키를 찾고 부모 레시피를 조사한다. 이름을 별칭으로 자동 등록하거나 tint를 적용하는 기능은 없다. 해당 ID가 독립 최상위 키에도 있는지는 별도로 확인한다.

`particles.json.effects[id].emitters`가 레시피다. 각 emitter는 name/duration/looping/maxParticles, lifetime/speed/size/rotation/gravity/color, rate/bursts/shape, 선택적 velocity/sizeOverLife/colorOverLife, texture/tint/blend/render를 가진다.

수치 curve는 `{v}`, `{min,max}`, `{keys:[[t,value],...]}` 중 하나. 색은 `{color:[r,g,b,a]}` 또는 `{stops,alpha}`. `particles.js`의 `sample`, `sampleGradient`, `Emitter.emit/update/draw`가 지원 범위의 기준이다. Unity 3D의 완전 재현이 아닌 2D 해석이며 render 필드를 비롯한 원본 정보가 모두 구현된 것은 아니다.

텍스처 이름 → `String(name).toLowerCase().replace(/[^a-z0-9]+/g, '_')` → effects.json의 ID → file. 접두사 `single_`를 추가하지 않는다. 경로 예: NY_glow_01 → ny_glow_01 → singles/ny_glow_01.webp.

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

이미터 수, 고유 텍스처 이름 수, 중복 제거한 파일 수는 다르다. 파일 개수는 위처럼 집합으로 계산하고 행을 눈으로 세지 않는다.

원본 particles.json에 textures 사전은 없다. `index.html`의 `pfxTextures`가 ZIP에만 이름→파일 매핑을 만든다. [번들](bundles.md).

## 런타임 사용

```js
// images에는 원본 texture 이름을 키로, 로딩 완료된 HTMLImageElement를 넣는다.
const fx = await ParticleFX.load('assets/library/particles.json', {
  resolveTexture: name => images[name],
  unitScale: 100
});
const inst = fx.spawn(id, {x: 200, y: 300});
inst.update(dtSeconds); // 초. CharacterLib/EffectLib의 밀리초와 다름
inst.draw(ctx);
// inst.alive()로 종료 확인. 반복 emitter가 있으면 계속 살아 있음.
```

텍스처가 없거나 아직 준비되지 않았으면 `Emitter.image()`가 이후 draw에서 다시 resolver를 호출한다. **Emitter.draw는 이미지가 없으면 즉시 return**한다. index.html의 “기본 원으로 그린다” 주석은 현재 코드와 다르다. 누락된 텍스처를 자동 생성/대체하지 않는다.

이미지를 찾으면 **시트 전체**를 사용한다. 텍스처가 프레임 시트라도 이 런타임은 프레임을 잘라 진행시키지 않는다. 의도와 다르면 텍스처 해석/렌더링 변경 과제로 별도 판단한다.

이 문서와 필요한 함수 확인만으로 누락 텍스처 조사와 재생 API 확인을 마칠 수 있다. ZIP 파일 집합이 필요할 때만 번들 문서를 추가로 읽는다. 스프라이트 로더도 함께 사용할 때만 [게임 연동](integration.md)을 읽는다.

## ParticleFX 공용 렌더링

`isAdditive`: blend가 alpha면 source-over, additive면 lighter, 그 외 dstBlend가 10일 때만 alpha. tinted는 색상별 캔버스를 캐시한다. 원본과 다른 표현을 조사할 때 이 함수들과 curve/shape 지원부터 확인한다. 이 함수들은 `particles.js`에 있으며 소비 게임에도 적용된다.

## 뷰어에서만 적용되는 처리

`resolveTexture`가 합친 CharacterLib에서 ID를 찾고 clip.load로 이미지를 받는다. `pfxMeasure`/`pfxUnitScale`은 레시피의 크기와 이동을 추정해 카드에 맞춘다. `spawnPfx`, `primeIfPaused`, `drawPfxCard`, `renderDetail`이 재생/정지와 단발 효과 재생성을 담당한다. 이 자동 맞춤은 ParticleFX 자체 API의 기본 동작이 아니다.


기준 시점 미연결 7종: NY_buff_plus_dispel, NY_buff_hp, NY_boss, NY_smoke_01, NY_feather_02.png, NY_glow_wind, NY_UI_icon_02. 12개 효과에 걸쳐 있으나 현재 상태는 [검증](validation.md)으로 다시 계산한다. 이름이나 확장자만 보고 대체 텍스처를 확정하지 않는다.
