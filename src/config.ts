// 논리 해상도: 320x240 (4:3, 아이패드 비율). 화면에는 정수배에 가깝게 확대되어 픽셀이 선명하게 보인다.
export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 240;

// 한 타일 = 16px (무료 CC0 에셋 대부분이 16x16)
export const TILE = 16;

// 플레이어 이동 속도 (논리 픽셀/초)
export const PLAYER_SPEED = 76;

// 발 위치 충돌 박스 (스프라이트 하단 중앙 기준)
export const FOOT_W = 10;
export const FOOT_H = 6;

// 연도 표시 색: 현재(2026)는 흰색, 과거(2006)로 갈수록 따뜻한 세피아색
export const YEAR_NOW = 2026;
export const YEAR_PAST = 2006;
export const YEAR_COLOR_NOW: [number, number, number] = [255, 246, 216];
export const YEAR_COLOR_PAST: [number, number, number] = [224, 160, 92];
