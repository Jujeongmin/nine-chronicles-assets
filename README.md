# 나인 크로니클 에셋

나인 크로니클 게임에서 쓰는 캐릭터·아이콘·이펙트·파티클 에셋 라이브러리.

## 보는 법

- 웹: https://jujeongmin.github.io/nine-chronicles-assets/
- 내 컴퓨터: 폴더를 받아 `열기-윈도우.bat`(윈도우) 또는 `열기-맥.command`(맥)을 더블클릭.
  `index.html` 을 바로 열면 브라우저 보안 때문에 목록이 안 뜬다.

## 구성

- `characters.json` · `icons.json` · `effects.json` · `particles.json` — 매니페스트
- `characters/` · `effects/` · `singles/` — 그림·Spine 파일
- `index.html` — 뷰어, `character-loader.js` · `loader.js` · `particles.js` — 게임에 넣는 로더

에셋을 누르면 상세 창에서 **전체 받기 (ZIP)** 으로 쓰는 데 필요한 파일을 한 번에 받을 수 있다.

## 에이전트용 프로젝트 안내

에이전트는 먼저 [프로젝트 스킬 진입점](.agents/skills/nine-chronicles-assets/SKILL.md) 하나를 읽으면 됩니다. 에셋 찾기, 게임 연동, 뷰어 수정, 데이터 갱신·검증 중 필요한 경로를 선택하고, Spine·파티클·ZIP·스키마의 세부 문서는 해당 작업에 필요할 때만 따라 읽도록 구성했습니다.

예: “`.agents/skills/nine-chronicles-assets/SKILL.md`를 읽고 발키리의 검은색 Spine 파일과 동작을 찾아줘.” 큰 매니페스트 전체를 대화에 넣지 않고 필요한 항목만 조회하는 예제도 포함합니다. Claude용 `.claude/skills/nine-chronicles-assets`는 같은 문서를 가리킵니다.
