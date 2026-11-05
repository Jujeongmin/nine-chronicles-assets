# ZIP·파일 복사·생성 사용법

진입: 소비 프로젝트에 필요한 파일 집합, 다운로드 오류, ZIP 내용 변경. 구현 anchor는 index.html의 `clipInfo`, `pfxTextures`, `bundleOf`, `saveZip`, `downloadZip`, `downloadPicked`, `usage`, `setupPrompt`.

## 구성 규칙

| 대상 | bundleOf가 모으는 것 |
|---|---|
| 일반 캐릭터/아이콘 | character-loader.js, 모든 클립 file, layout이 있으면 그 JSON |
| Spine 포함 캐릭터 | 위 파일 + 기본 및 **모든 variants**의 skeleton/atlas |
| 스프라이트 이펙트 | loader.js, 기본 clip.file, flat 단일 항목 manifest |
| 파티클 | particles.js, 해당 레시피, 이름→file textures 맵, 해결된 텍스처 파일 |

`saveZip`은 atlas 텍스트에서 페이지 이미지 경로를 찾아 추가하고 파일 경로를 중복 제거한다. 따라서 bundleOf 결과만으로 최종 Spine 파일 집합을 계산하면 이미지가 빠진다. [Spine](spine.md)의 페이지 질의를 사용한다.

CDN JSZip 3.10.1을 첫 다운로드에 로드한다. 파일을 fetch해 메모리에서 ZIP을 만들고 Blob URL로 받는다. 다운로드 실패는 JSZip 로드, atlas 해석, 실제 파일 HTTP 상태를 순서대로 구분한다. 많은 에셋 선택은 파일별 병렬 fetch와 메모리 사용이 커진다.

## 단일 ZIP과 선택 ZIP의 경로 차이

- 단일: `<id>.json`과 `사용법.txt`. 안내대로 게임의 `assets/<id>/`에 풀고 기존 상대경로를 유지한다.
- 선택: `characters.json`(아이콘도 여기에 합침), `effects.json`, `particles.json` 중 필요한 것과 로더/파일을 넣는다. 게임의 `assets/library/`에 풀도록 안내한다.
- ZIP 내부에 `assets/library/` 접두사를 다시 넣는 것이 아니다. 추출 위치가 그 디렉터리다.
- 현재 선택된 Spine variant만이 아니라 모든 variants를 포함한다. 단일 사용법은 기본 c.spine을 사용한다.

manifest의 클립 출력은 CLIP_KEYS(file, width, height, frameWidth, frameHeight, frames, cols, rows, fps)만 복사한다. 일반 clip hash는 제외되지만 spine 객체는 그대로 포함된다. categories/games는 선택 항목에 맞춰 만든다.

파티클 원본에는 textures가 없고 ZIP manifest에만 추가된다. 해결하지 못한 텍스처는 조용히 제외된다. 실제 렌더러는 해당 emitter를 그리지 않는다. 누락과 이름 정규화는 [파티클](particles.md).

## 화면의 경로 복사와 AI 안내

일반 항목의 “이 그림만”, “경로 복사”, “직링크 복사”는 현재 flat clip 파일을 가리킨다. 파티클에는 “이 그림만” 버튼이 없고 경로/직링크 복사는 particles.json을 가리킨다. Spine 전체 묶음 링크가 아니다.

`usage`는 상세 코드와 단일 ZIP 설명을 만들고 `downloadPicked`는 선택 ZIP 설명을 따로 만든다. `setupPrompt`는 AI 연결용 긴 안내다. API/경로를 바꿀 때 이 세 출력을 함께 확인한다. 기존 안내의 모든 시트가 가로 한 줄이라는 설명과 로컬 전용 주소라는 설명은 각각 다중 행 데이터와 Pages 사용에는 맞지 않는다.

로컬 서버 주소를 다른 게임이 항상 접근할 수 있다고 가정하지 않는다. 필요한 파일을 소비 프로젝트에 복사하고 그 프로젝트의 HTTP 서버에서 확인한다. 원격 자료를 전달해야 한다면 실제 PR/서비스 URL을 제공한다.
