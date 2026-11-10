# 소스 구조 안내

## 한눈에 보기

```
index.html                 화면 뼈대 + 대화창·타이틀·과제지·카드·크레딧의 스타일(CSS)
public/                    그대로 배포되는 파일 (사진, 음원, 아이콘, 오프라인용 파일)
  images/                    book.jpg / wedding.jpg / sports.jpg / gift.png (실제 사진)
  audio/                     bgm_outdoor / hall / office / paper / garden .m4a (장면별 클래식, 출처는 README.txt)
src/
  main.ts                  시작 순서: 타이틀 → (이어하기) → 게임
  config.ts                화면 크기, 이동 속도, 연도 표시(2026→2006)와 색
  data/                    ★ 이야기 내용: 여기를 주로 고칩니다
    dialogues.ts             모든 대사
    cutscenes.ts             연출(학생 등장, 문 두드리기, 보물상자 …)
    papers.ts                702호 과제 더미(빨간 펜 첨삭) 내용
    cards.ts                 책·결혼식 사진·선물 카드 문구와 사진 경로
  state/
    quest.ts                 진행 순서와 "다음 목표" 문구, 화살표 위치
    gameState.ts             진행 플래그(예: pizza_done)
  map/                     장소 데이터
    outdoor.ts               야외(본관, 비탈길, 산학협력관, 수덕전, 정원 대문)
    hall.ts                  산학협력관 복도(게시판, 701·702·703호)
    office.ts                702호 연구실
    room701.ts               701호 댄스 동아리 UCDC 연습실 (춤추는 병아리 태진)
    room703.ts               703호 체육대회 닭싸움 결승전 (병아리 현서 vs 황소 선배)
    garden.ts                비밀 정원(보물상자)
    types.ts                 장소 데이터의 형식 설명
  scenes/
    WorldScene.ts            게임의 중심: 걷기, 대화, 문, 컷신, 저장
    BootScene.ts             캐릭터·나무·소품 도트 그림 만들기 (교수님, 배달부, 학생)
    storyTextures.ts         복도·연구실·정원의 도트 그림 만들기
  render/mapRenderer.ts    땅·건물·나무·소품을 화면에 그림
  entities/puppy.ts        따라다니는 강아지(그림, 따라가기, 앉아 기다리기)
  effects/                 연출 효과
    particles.ts             색종이·꽃폭죽·흙 튀기기
    seasonEffects.ts         비탈길 계절 파티클 (끄기: seasonConfig.ts 의 enabled)
  ui/                      대화창(dialogue), 오버레이(overlays), 얼굴 아이콘(portraits), 상단 문구(hint)
  audio/audio.ts           BGM·효과음 (코드로 만든 소리, 파일 음원이 있으면 파일 우선)
  save/save.ts             진행 저장("이어하기")
  systems/pathfinding.ts   탭한 곳까지 길찾기
docs/                      안내 문서 (PLAN.md: 처음 세운 개발 계획)
.github/workflows/deploy.yml  main 에 푸시하면 GitHub Pages 자동 배포
scripts/single-file.mjs    백업용 단일 HTML 만들기
```

## 어디를 고치면 되나요?

| 바꾸고 싶은 것 | 파일 | 방법 |
|---|---|---|
| 대사, 안내 문구 | `src/data/dialogues.ts` | 따옴표 안의 `text` 를 바꿉니다. `\n` 은 줄바꿈입니다. |
| 말하는 사람 이름, 얼굴 아이콘 | `src/data/dialogues.ts` | `speaker`, `portrait` (아이콘 종류는 `src/ui/portraits.ts`) |
| 화면 위 "다음 목표" 문구, 이야기 순서 | `src/state/quest.ts` | 단계의 `text` 를 바꾸거나 단계를 추가/삭제합니다. |
| 연출 순서(학생 등장 등) | `src/data/cutscenes.ts` | 줄 단위로 `wait`, `say`, `emote`, `confetti` … 를 나열합니다. |
| 702호 과제 첨삭 내용, 보물 힌트 | `src/data/papers.ts` | `{틀린말>고친말}` 로 빨간 펜 교정, `((말))` 로 동그라미 |
| 책·사진·선물 사진 | `public/images/` | `book.jpg`, `wedding.jpg`, `gift.png` 로 저장하면 자동 반영 (없으면 그림으로 대체) |
| 결혼식 사진의 편지 문구, 선물 설명 | `src/data/cards.ts` | `text` |
| BGM | `public/audio/` | `bgm_outdoor.mp3`, `bgm_indoor.mp3`, `bgm_garden.mp3`, `bgm_ending.mp3` 로 저장 (없으면 코드로 만든 곡) |
| 엔딩 크레딧 문구 | `src/ui/overlays.ts` | `CREDIT_BLOCKS` |
| 연도(2026 → 2006)와 글자 색 | `src/config.ts` | `YEAR_NOW`, `YEAR_PAST`, `YEAR_COLOR_*` |
| 걷는 속도 | `src/config.ts` | `PLAYER_SPEED` |
| 아이템·건물·물건 위치 | `src/map/*.ts` | `tx`, `ty` 는 칸 좌표(왼쪽 위가 0,0) |
| 건물 이름, 현수막 | `src/map/outdoor.ts` | `buildings` 의 `label`, `banner` |
| 제자들(병아리/사람) 머리색·옷색 | `src/scenes/BootScene.ts` | `CHICKS`(병아리), `KIDS`(사람) |

## 이야기가 진행되는 방식

- 게임은 **플래그**(켜짐/꺼짐 표시)로 진행됩니다. 예: 피자 이벤트가 끝나면 `pizza_done` 이 켜집니다.
- `src/state/quest.ts` 의 각 단계는 `done` 플래그가 켜지면 끝나고, 다음 단계로 넘어갑니다.
- 플래그는 대사(`set`), 문/컷신(`flag`), 구역(`zones`)에서 켭니다.
- 잠긴 문은 `requires` + `lockedText` 로 만듭니다. (비밀 정원 대문: `garden_open`)

## 코드를 건드리지 않고 확인하는 방법

- 개발 서버(`npm run dev`)를 켜 두고 문구를 고치면, 브라우저가 자동으로 새로고침됩니다.
- 개발 중에는 주소 끝에 `?skiptitle` 를 붙이면 타이틀을 건너뜁니다.
- 브라우저 콘솔(F12)에서 `__ddok.state()` 로 현재 위치와 진행 플래그를 볼 수 있고, `__ddok.tp(칸x, 칸y)` 로 그 칸으로 이동합니다. (개발 모드에서만 동작하며 배포본에는 없습니다.)
