# 매니페스트 스키마

진입: 필드 해석 또는 항목 추가/교체. 단순 검색이면 [에셋 찾기](find-assets.md)로 돌아간다. 아래는 런타임이 읽는 계약이며 전체 JSON Schema가 아니다.

## 스프라이트 세 파일

characters.json / icons.json / effects.json의 루트는 `{version, defaultFps, categories, games, assets}`. categories/games는 키→표시명 사전, assets는 배열이다. 현재 game은 `nc`지만 코드가 새 게임을 받을 수 있다.

| 위치 | 필드 | 의미 |
|---|---|---|
| 항목 | id, name?, category, game | ID와 분류. 합친 전체 목록에서 ID가 겹치면 조회/선택 상태가 충돌한다 |
| 항목 | animations?, defaultAnimation? | 이름→클립 사전. 없으면 항목 자체가 `default` 클립 |
| 클립 | file | 매니페스트 baseUrl 기준 상대경로. 현재는 저장소 루트 기준 |
| 클립 | width, height | 이미지 전체 크기 |
| 클립 | frameWidth, frameHeight, frames, cols, rows | 프레임 크기, 유효 프레임 수, 격자 |
| 클립 | fps?, hash? | fps 기본값은 재생 코드에서 12, hash는 이미지 URL 캐시 구분 |
| 항목 | spine? | 별도 skeleton/atlas 재생 정보. [Spine](spine.md) |
| 항목 | pixelArt?, layout? | 픽셀 보간 힌트, 타일 배치표 파일. 현재 데이터에는 없지만 코드 지원 |
| 항목 | source?, note?, clipNotes? | 설명 메타데이터. Character는 clipNotes를 런타임 객체로 복사하지 않음 |

`defaultFps` 루트 필드가 있다고 개별 재생 fps를 덮어쓰는 것은 아니다. 두 로더의 Animation은 `options.fps || clip.fps || 12`(Effect는 asset.fps)를 사용한다.

프레임 i는 `x = (i % cols) * frameWidth`, `y = floor(i / cols) * frameHeight`다. `frames <= cols * rows`이고 모든 사용 프레임이 이미지 안에 있어야 한다. 마지막 행은 덜 찰 수 있다. 현재 다중 행 시트가 실제 존재한다.

characters의 flat와 animations 형식이 섞여 있고, icons는 현재 animations 형식, effects는 flat 형식이다. `opaque`, `reference` 같은 effects 메타데이터로 렌더러 종류를 결정하지 않는다.

## Spine와 파티클은 서로 다른 계약

Spine의 `animations`는 **문자열 배열**, 일반 항목의 `animations`는 **클립 사전**이다. Spine variants는 별도 파일 세트이며 자세한 필드는 [Spine](spine.md).

particles.json 루트는 `{version, game, effects: {ID: {emitters: [...], variants?: [...]}}}`다. assets 배열이 아니다. 일부 효과의 `variants: [{id, tint}]`는 원본 메타데이터로 보존되어 있지만 현재 런타임과 뷰어는 사용하지 않는다. 최상위 effects 키에 없는 variant ID를 spawn하면 실패한다. 부모를 찾는 단서로만 사용하고, 부모와 variant의 시각적 동일성을 보장하지 않는다. 저장소 원본에는 `textures` 매핑이 없고 ZIP 생성 시 필요한 매핑을 만든다. 이미터와 경로 연결은 [파티클](particles.md).

## 변경 후

추가/교체 절차는 [유지보수](maintenance.md), 참조 파일·격자·중복 ID 검사는 [검증](validation.md). 원본 이미지나 skeleton의 모든 내부 키를 스킬에 복제하지 않는다.
