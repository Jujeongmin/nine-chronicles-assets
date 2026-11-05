# 게임 연동

진입: 에셋을 사용하려는 게임 프로젝트에 붙일 때. ID가 불명확하면 먼저 [에셋 찾기](find-assets.md). 다운로드 파일 구성은 [번들](bundles.md).

## 렌더러 선택

| 필요한 표현 | 선택 | 다음 읽기 |
|---|---|---|
| 캐릭터/아이콘의 정지 모습 또는 프레임 시트 | `CharacterLib` | 아래 코드 |
| effects.json의 이미지/프레임 시트 | `EffectLib` | 아래 코드 |
| 캐릭터의 골격 동작, 별도 색상 variant | Spine 런타임 | [Spine](spine.md) |
| particles.json의 이미터 시뮬레이션 | `ParticleFX` | [파티클](particles.md) |

`CharacterLib.play()`는 `spine` 메타데이터를 자동 재생하지 않는다. 같은 캐릭터에 정지 클립과 Spine이 함께 있어도 필요한 표현에 맞게 선택한다. 정지 표정 탭이 많다고 프레임 애니메이션이 있는 것은 아니다.

## 스프라이트 API

소비 프로젝트에서 매니페스트 옆에 저장소 상대경로를 유지해 파일을 복사한다. 전체 복제가 필요하지 않다면 선택 ZIP을 쓴다. 런타임은 브라우저 전역 또는 CommonJS export를 제공하지만 이미지 로딩과 그리기는 브라우저 환경이 필요하다.

```html
<script src="assets/library/character-loader.js"></script>
<script src="assets/library/loader.js"></script>
```

```js
const chars = await CharacterLib.load('assets/library/characters.json');
// icons까지 필요할 때: load(['assets/library/characters.json', 'assets/library/icons.json'])
await chars.preload(['mage']);
const still = chars.play('mage', 'expr_attack'); // 정지 표정, Spine Attack 아님
still.update(dtMs).draw(ctx, x, y, {scale: 1, flipX: false});

const effects = await EffectLib.load('assets/library/effects.json');
await effects.preload(['fire_aura']);
const effect = effects.play('fire_aura', {loop: false, onComplete: () => {}});
effect.update(dtMs).draw(ctx, x, y, {scale: 1});
```

- `Animation.update(dtMs)`는 **밀리초**. 인자를 생략하면 내부 시계로 진행한다. `draw()`는 시간을 진행시키지 않는다.
- 그리기 좌표는 프레임 중심. 공통 옵션은 scale/rotation/alpha/blend, flipX는 CharacterLib만 제공한다.
- `play()`는 Promise가 아닌 Animation을 즉시 반환한다. 이미지 준비를 기다리려면 먼저 `preload()` 또는 Clip/Asset의 `load()`를 await한다.
- `load()`는 매니페스트를 `cache: 'no-cache'`로 가져오며, 이미지 URL은 hash가 있을 때 `?v=hash`를 붙인다.
- 여러 매니페스트를 합칠 때 기본 baseUrl은 **첫 URL의 디렉터리**다. 서로 다른 디렉터리의 매니페스트를 자동으로 각각 해석하지 않는다.
- 프레임 사각형은 `cols` 기반 행 우선 순서. 가로 한 줄이라고 가정하지 않는다. 자세한 필드는 [스키마](manifest-schema.md).

## 프레임워크 어댑터를 쓸 때만

소스 anchor: 두 로더의 `registerPhaser`, `toPixi`.

- Phaser: scene의 preload에서 `lib.registerPhaser(scene, ids)`. 로딩 complete에서 애니메이션 생성. Character 키는 `id:clipName`, Effect 키는 `id`. 어댑터가 만드는 repeat는 -1이다.
- Pixi: `lib.toPixi(PIXI, id, clipName)` (Effect에는 clipName 없음). v7 경로는 즉시 AnimatedSprite, v8 경로는 Promise를 반환한다. 반환 뒤 소비 프로젝트에서 재생 시작/루프를 설정한다.
- 위 설명은 이 저장소 어댑터의 구현 계약이다. 대상 게임의 실제 Phaser/Pixi 버전 호환성은 별도 확인한다.

이제 선택한 로더와 데이터의 해당 부분만 확인하면 된다. 뷰어 수정이 없다면 index.html 전체를 읽지 않는다.
