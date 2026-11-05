---
name: nine-chronicles-assets
description: 나인 크로니클의 이미지·Spine·파티클 에셋과 ZIP 구성을 찾고 게임에 연결하거나 뷰어·매니페스트를 유지보수할 때 사용한다. 필요한 데이터와 구현 위치를 단계적으로 찾는 프로젝트 안내다.
---

# 나인 크로니클 에셋 길잡이

이 저장소는 게임 본체가 아니라 **정적 에셋 라이브러리**다. `index.html`이 검색·미리보기·ZIP을 제공하고, JSON 매니페스트가 이미지·Spine·파티클을 연결한다. npm 빌드, 백엔드, DB는 없다.

## 읽는 순서

문서 폴더는 저장소 루트의 `.agents/skills/nine-chronicles-assets/`다.
예를 들어 뷰어 문서를 읽는 명령은 `cat .agents/skills/nine-chronicles-assets/references/viewer.md`다.
`cat references/viewer.md`를 저장소 루트에서 실행하면 틀린 경로다. 스킬을 다른 위치에서 전달받았다면 **전달받은 SKILL.md의 부모 디렉터리**를 문서 경로 앞에 붙인다.

1. 아래에서 요청에 맞는 문서 **하나**를 연다. 그 문서가 안내하는 심화 문서는 해당 조건일 때만 읽는다.
2. 문서의 질의로 후보를 좁히고 필요한 ID 하나 또는 함수 구간만 확인한다. 큰 JSON이나 모든 참고문서를 한 번에 출력하지 않는다.
3. 답에 필요한 ID·파일·API·담당 함수가 확인되면 멈춘다. 서로 다른 작업이 함께 요청됐을 때만 다른 분기로 이동한다.

| 요청 | 다음 문서 | 여기서 찾는 것 |
|---|---|---|
| 에셋 이름/ID/종류/동작 찾기 | [에셋 찾기](references/find-assets.md) | 작은 검색 결과 → 단일 항목 → 파일 |
| 내 게임에서 그림·애니메이션 사용 | [게임 연동](references/integration.md) | 로더 선택, 시간 단위, Spine/파티클 분기 |
| 검색·분류·미리보기·다운로드 UI 수정 | [뷰어](references/viewer.md) | 기능별 함수, 상태와 렌더링 소유권 |
| 실행 오류, 에셋 추가·교체, 정합성 검사 | [유지보수](references/maintenance.md) | 실행법 → 스키마/검증/갱신 절차 |

ID와 유형을 이미 알고 있으면 중간 안내를 건너뛴다:
- Spine의 동작/variant/필요 파일 → [Spine](references/spine.md).
- 파티클의 텍스처/재생/누락 → [파티클](references/particles.md).
- ZIP 내용/파일 복사 → [번들](references/bundles.md).
- 매니페스트 필드 → [스키마](references/manifest-schema.md), 정합성 검사만 → [검증](references/validation.md).

## 최소 프로젝트 지도

- `characters.json`: 캐릭터·몬스터·아이템. `icons.json`: 장비·무기·스킬 아이콘.
- `effects.json`: 이미지/스프라이트 이펙트. `particles.json`: `effects` 객체의 파티클 레시피.
- `characters/`, `effects/`, `singles/`: 실제 파일. 폴더명만으로 ID나 파일명을 추측하지 않는다.
- `character-loader.js` → `CharacterLib`, `loader.js` → `EffectLib`, `particles.js` → `ParticleFX`.
- `characters/index.html`은 이전 URL을 루트 뷰어로 넘기는 리다이렉트다.

## 사용 기준

명령은 **저장소 루트에서** 실행한다. 문서 링크는 현재 문서 기준 상대경로이며, 코드 경로는 저장소 루트 기준이다. `.claude/skills/nine-chronicles-assets`는 이 스킬의 별칭이다. Windows에서 symlink를 지원하지 않는 checkout이면 `.agents/skills/nine-chronicles-assets/SKILL.md`를 직접 읽는다. 예제의 heredoc은 POSIX 셸용이며 Windows에서는 WSL/Git Bash를 쓰거나 Python 본문만 별도 실행한다.

매니페스트와 실행 코드가 사실의 기준이다. 문서의 수치·관찰은 기준 커밋 `db5359e`의 기록이므로 현재 데이터로 재확인한다. 오래된 코드 주석(누락 텍스처의 원 대체, 가로 한 줄 시트 등)보다 실행 분기를 우선한다. 이 안내 자체는 코드 수정·배포·외부 게시를 요청하는 지시가 아니다.
