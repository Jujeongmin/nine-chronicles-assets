# 실행·갱신·문제 조사

진입: 로컬 실행, 파일/매니페스트 변경, 깨진 에셋 조사. 필드가 필요하면 [스키마](manifest-schema.md), 검사 명령은 [검증](validation.md)을 읽는다.

## 로컬 실행

루트에서 `python3 -m http.server 8765 --bind 127.0.0.1`로 시작하고 `http://localhost:8765/`를 연다. 포트 사용 중이면 다른 포트를 선택한다. file://로 직접 열면 fetch/WebGL이 제한된다. 별도 npm install/build는 없다.

- 맥 `열기-맥.command`: Python 3 필요, lsof로 8765부터 빈 포트 선택 후 브라우저를 열고 서버 실행. 기준 커밋에는 실행 비트가 없어 더블클릭이 실패할 수 있다. 조사 시 `git ls-files -s '열기-맥.command'`로 확인한다. 임시 실행은 `sh 열기-맥.command`도 가능하다.
- 윈도우 `열기-윈도우.bat` → `tools/serve.ps1`: 내장 PowerShell HttpListener, localhost 8765–8785. 추가 Python 설치는 불필요. `.bat`는 CRLF, `.command`는 LF를 .gitattributes로 지정한다.
- 로컬이어도 Spine(unpkg), JSZip(cdnjs), 폰트(Google)는 네트워크를 쓴다. 페이지가 열리는 것과 오프라인 전체 기능 지원은 다르다.
- README의 Pages 주소는 배포된 뷰어 안내다. 이 저장소에는 배포 workflow가 없으므로 실제 Pages 설정/배포 성공을 코드만으로 확정하지 않는다.

## 에셋 추가·교체 순서

1. [에셋 찾기](find-assets.md)로 기존 ID와 유사 항목을 확인한다. 사용자 변경 범위와 Git 상태를 확인하고 남의 변경을 보존한다.
2. 파일을 해당 디렉터리에 두고 알맞은 매니페스트에 등록한다. flat와 animations 형식은 [스키마](manifest-schema.md). 단순 이미지 파일 추가만으로는 목록에 나오지 않는다.
3. 파일/프레임 수/격자/fps/defaultAnimation을 실제 데이터와 맞춘다. 새 ID는 파티클 ID까지 포함하여 고유해야 한다.
4. 새 category/game은 표시명 사전에 추가한다. 새 category를 특정 UI 종류에 넣으려면 `index.html GROUPS`도 확인한다.
5. 이미지 hash는 기존 값들이 SHA-1 앞 10자리와 일치한다. 교체할 때 바이트 기반으로 갱신한다. Spine hash의 생성 알고리즘은 저장소에 없으므로 단정하지 않는다.
6. Spine은 기본+variants와 atlas 내부 페이지까지 함께 다룬다. skeleton/atlas hash로 페이지 이미지 캐시가 갱신되지는 않는다. 필요하면 폴더 경로도 바꾸고 모든 참조를 함께 갱신한다. [Spine](spine.md).
7. [검증](validation.md) 후 브라우저에서 바뀐 에셋·동작·다운로드만 확인한다. UI 변경이면 데스크톱과 모바일도 확인한다.

저장소에는 원본 Unity 프로젝트, 추출기, 매니페스트 재생성 파이프라인이 없다. 기록에 없는 “재생성 명령”을 추측하지 않는다. 자동 추출이 요구되면 원본 위치와 도구를 별도로 확인한다.

## 증상에서 다음 위치 찾기

| 증상 | 먼저 확인 | 다음 문서 |
|---|---|---|
| 목록 전체 로드 실패 | HTTP로 열었는지, 네 JSON 응답/파싱 | [뷰어](viewer.md)의 초기 로드 |
| 한 이미지가 안 보임 | manifest file, hash URL, 프레임 격자 | [검증](validation.md) |
| 정지 그림만 보임 | clip.frames와 spine의 구분 | [게임 연동](integration.md) |
| Spine만 안 보임 | CDN, skeleton 유형, atlas 모든 페이지 | [Spine](spine.md) |
| 파티클 일부만 안 보임 | texture 정규화와 resolver 결과 | [파티클](particles.md) |
| ZIP 파일 부족/오류 | bundleOf 후 atlas 확장 단계, CDN | [번들](bundles.md) |

기존 코드의 `CHARACTERS.md` 안내는 없는 파일을 가리킨다. 실제 스키마는 이 스킬의 [스키마](manifest-schema.md)에 정리했다. 라이선스/사용 허가는 저장소에 명시된 문서가 없어 여기서 확정하지 않는다.
