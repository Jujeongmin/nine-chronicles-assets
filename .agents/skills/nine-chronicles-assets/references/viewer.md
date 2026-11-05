# 뷰어 수정 위치

진입: 검색·분류·미리보기·상세·복사·다운로드 화면 수정. `index.html`의 inline IIFE가 상태/DOM/렌더링을 관리한다. 별도 앱 프레임워크는 없다.

## 함수 위치를 찾고 해당 구간만 읽기

```bash
rg -n 'function (filtered|buildChips|renderGrid|renderDetail|saveZip)' index.html
# 결과에서 필요한 함수 주변만: sed -n '시작,끝p' index.html
```

| 사용자 동작/증상 | 먼저 확인할 anchor | 다음 문서 |
|---|---|---|
| 첫 화면 로드 실패 | `Promise.all`, `CharacterLib.load`, `ParticleFX.load` | [유지보수](maintenance.md) |
| 검색·게임·종류·세부분류 | `GROUPS`, `state`, `passes`, `filtered`, `buildChips` | 아래 필터 계약 |
| 카드 표시/재생/지연 로딩 | `renderGrid`, `tick`, `seen`, `drawCardFrame` | 아래 렌더링 계약 |
| Spine 빈 화면/크기/variant | `registerSpine`, `visibleBounds`, `renderDetail` | [Spine](spine.md) |
| 파티클 크기/안 보임 | `resolveTexture`, `pfxUnitScale`, `drawPfxCard` | [파티클](particles.md) |
| 상세 열기/닫기/탭 | `selectCharacter`, `closeDetail`, `renderDetail` | 필요 시 Spine/파티클 |
| 선택 ZIP/단일 ZIP/복사 코드 | `state.picked`, `bundleOf`, `downloadPicked`, `usage` | [번들](bundles.md) |
| AI에 연결하기 | `setupPrompt`, `SITE_BASE`, `setupBtn` | [번들](bundles.md) |
| 모바일/상단 바 | CSS `@media (max-width:980px)`, `syncBarHeight` | 아래 레이아웃 |

## 필터 계약

초기 로드는 세 스프라이트 매니페스트를 CharacterLib로 합치고 파티클을 `pfx:true`인 자리표 객체로 더한다. 파티클에는 getClip/animationNames가 없다.

계층은 game → group → category. `GROUPS`에 없는 category는 etc. game을 바꾸면 group/cat를 all로, group을 바꾸면 cat을 all로 초기화한다. `buildChips`는 비어 있는 URL 필터를 all로 돌린다.

URL에는 game/group/cat만 기록한다. 이전 `?filter=animated`도 읽는다. 검색어·선택 ID·상세 항목을 URL에 저장하는 기능은 현재 없다. `filtered`는 ID/이름/카테고리 표시명/게임 표시명의 대소문자 무시 부분일치다. 로더의 search와 검색 범위가 다르다.

## 렌더링 계약

일반 카드와 파티클은 IntersectionObserver(rootMargin 200px)로 가시성을 추적한다. 일반 이미지는 처음 보일 때 로드한다. `renderGrid`는 필터 결과의 DOM을 모두 만들므로 목록 가상화는 아니다. Spine은 별도 공유 WebGL 루프다.

`tick`의 dt는 밀리초, 최대 60ms로 제한한다. 파티클 호출 전에 초로 바꾼다. OS reduced-motion이면 정지 시작, 사용자가 재생 가능. 상세는 일반 클립/Spine/파티클의 세 갈래이며 업데이트 상태를 따로 관리한다.

데스크톱은 400px 상세 패널, 980px 이하에서는 하단 패널+scrim으로 전환한다. 구조 변경 후 데스크톱/모바일, 필터 후 선택 유지, 정지/재생, 상세 닫기를 실제 브라우저로 확인한다.

기존 주석의 “항목을 추가하면 페이지 수정 불필요”는 기존 category일 때 대체로 맞는다. 새로운 분류를 특정 group으로 넣으려면 GROUPS도 변경한다. 전체 페이지를 분해하기 전에 수정할 함수와 상태 경계만 먼저 확정한다.
