# IntelliJ에서 소스 코드 확인하기

배포 전에 소스를 직접 읽어 보고 싶을 때 보는 안내입니다. 코딩 경험이 적어도 "문구/사진/소리를 어디서 바꾸는지"는 쉽게 찾을 수 있게 정리했어요.

## 1. 한 번만 준비

1. **Node.js 설치** (LTS 버전): https://nodejs.org 에서 받아 설치합니다. 터미널에서 `node -v` 가 나오면 성공입니다.
2. **IntelliJ에서 폴더 열기**: `File → Open…` 에서 이 프로젝트 폴더(`ddokddok`)를 선택합니다. 폴더 안의 `package.json` 이 있는 위치가 맞는지 확인하세요.
3. **패키지 설치**: IntelliJ 아래쪽 `Terminal` 탭을 열고 한 번만 실행합니다.
   ```bash
   npm install
   ```
   (`node_modules` 폴더가 생깁니다. 용량이 크지만 정상이며, 직접 열어 볼 필요는 없어요.)

### IntelliJ 버전 안내
- **IntelliJ IDEA Ultimate**: TypeScript(`.ts`) 자동완성·오류 표시·실행 버튼이 모두 됩니다. (권장)
- **IntelliJ IDEA Community**: 이 프로젝트의 TypeScript/JavaScript 기능이 제한됩니다. 파일을 열어 읽고 글자를 고치는 것은 되지만, 색상 표시와 자동완성이 약하고 실행 버튼은 없습니다. 이 경우 터미널에서 `npm run dev` 로 실행하세요.
- 가볍게 보기만 한다면 무료인 VS Code 도 괜찮습니다.

## 2. 실행하기

- IntelliJ 오른쪽 위 실행 목록에 **"개발 서버 (npm run dev)"** 가 보입니다(Ultimate). ▶ 를 누르세요.
- 또는 터미널에서:
  ```bash
  npm run dev
  ```
- 주소 `http://localhost:5173` 을 브라우저로 열면 게임이 나옵니다. 코드를 저장하면 화면이 자동으로 바뀝니다.
- 같은 와이파이의 아이패드에서 확인하려면, 터미널에 나오는 `Network:` 주소(예: `http://192.168.0.x:5173`)를 아이패드 Safari 에 입력합니다.
- 개발 중에 타이틀 화면을 건너뛰려면 주소 끝에 `?skiptitle` 를 붙이세요. (`http://localhost:5173/?skiptitle`)

## 3. 실행 목록(IntelliJ)

| 이름 | 하는 일 |
|---|---|
| 개발 서버 | 코드를 고치면서 바로 확인 (`npm run dev`) |
| 배포용 빌드 | 오류 검사 후 배포할 파일을 `dist/` 에 만듦 (`npm run build`) |
| 백업 파일 1개로 빌드 | 인터넷/서버 없이 더블클릭으로 열리는 `dist-single/ddokddok.html` 생성 (`npm run build:single`) |

## 4. 소스를 읽는 순서 (추천)

처음부터 전부 읽을 필요는 없습니다. 아래 순서로 필요한 곳만 보세요. 자세한 설명은 `docs/SOURCE_GUIDE.md` 에 있습니다.

1. `README.md` — 전체 소개와 조작법
2. `docs/CONTENT_TODO.md` — **바꿔야 할 임시 문구/사진 목록** (스토리 수정은 여기서 시작)
3. `src/data/dialogues.ts` — 모든 대사
4. `src/state/quest.ts` — 이야기 진행 순서와 화면 위 "다음 목표" 문구
5. `src/data/cutscenes.ts` — 학생들이 나오는 장면, 문 두드리기, 보물상자 같은 연출 순서
6. `src/map/*.ts` — 각 장소(야외, 복도, 702호, 정원)의 배치

## 5. 자주 쓰는 IntelliJ 기능

- **파일 이름으로 찾기**: `Shift` 두 번 → 파일 이름 입력 (예: `dialogues`)
- **글자로 전체 검색**: `Cmd + Shift + F` (Windows: `Ctrl + Shift + F`) → 바꾸고 싶은 문구를 입력하면 그 문구가 있는 파일이 나옵니다.
- **정의로 이동**: 함수/변수 이름에서 `Cmd + 클릭`
- **오류 확인**: 터미널에서 `npm run typecheck` (오류가 없으면 아무것도 출력되지 않음)
