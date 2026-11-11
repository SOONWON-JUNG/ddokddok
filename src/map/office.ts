import type { Interactable, MapData } from './types';

/**
 * 702호 전경란 교수님 연구실 (Scene 05~06). 2006년.
 * 윗벽: 출구 문 · 시간표 · 책장(교수님 책) · 결혼식 사진 · 창문. 가운데: 책상(과제 더미, 빨간 펜).
 */
export const OFFICE_W = 22;
export const OFFICE_H = 14;
const WALL_ROWS = 4;

export function buildOffice(): MapData {
  const ground: number[][] = Array.from({ length: OFFICE_H }, () => Array(OFFICE_W).fill(0));
  const solid: boolean[][] = Array.from({ length: OFFICE_H }, () => Array(OFFICE_W).fill(false));
  for (let y = 0; y < OFFICE_H; y++) {
    for (let x = 0; x < OFFICE_W; x++) {
      if (y < WALL_ROWS || y === OFFICE_H - 1 || x === 0 || x === OFFICE_W - 1) {
        ground[y][x] = 1;
        solid[y][x] = true;
      }
    }
  }

  const interactables: Interactable[] = [
    {
      id: 'office_exit',
      kind: 'door',
      tx: 2,
      ty: 3,
      w: 2,
      h: 2,
      texture: 'door_inner',
      action: { type: 'door', toMap: 'hall', toSpawn: 'from_office' },
    },
    {
      id: 'calendar',
      kind: 'object',
      tx: 6,
      ty: 3,
      w: 2,
      h: 2,
      texture: 'calendar',
      dy: -12,
      action: { type: 'calendar' },
    },
    {
      id: 'shelf',
      kind: 'object',
      tx: 9,
      ty: 3,
      w: 2,
      h: 2,
      texture: 'bookshelf',
      action: { type: 'shelf' },
    },
    {
      id: 'wedding',
      kind: 'object',
      tx: 13,
      ty: 3,
      w: 1,
      h: 2,
      texture: 'wedding_frame',
      dy: -12,
      action: { type: 'card', card: 'wedding' },
    },
    // 책상 위: 과제 더미와 빨간 펜 (책상 그림 위에 겹쳐 그린다)
    {
      id: 'papers',
      kind: 'object',
      tx: 8,
      ty: 6,
      w: 2,
      h: 1,
      texture: 'papers',
      dy: -4,
      z: 20,
      approach: { tx: 9, ty: 8 },
      action: { type: 'paper', readSet: { papers_read: true, hint_found: true, garden_open: true }, after: 'papers_done' },
    },
    {
      id: 'red_pen',
      kind: 'object',
      tx: 10,
      ty: 6,
      w: 1,
      h: 1,
      texture: 'red_pen',
      dy: -6,
      z: 20,
      approach: { tx: 10, ty: 8 },
      action: { type: 'dialogue', script: 'red_pen' },
    },
    // 과제를 끝까지 읽으면 책상 위에 편지 한 통이 나타난다 (제자의 마음)
    {
      id: 'letter',
      kind: 'object',
      tx: 9,
      ty: 7,
      w: 1,
      h: 1,
      texture: 'letter_envelope',
      dy: -8,
      z: 20,
      float: true,
      beacon: true,
      showIf: 'papers_read',
      approach: { tx: 9, ty: 8 },
      action: { type: 'card', card: 'letter_hyeonseo', set: { letter_read: true } },
    },
  ];

  // 책상(8~10칸, 6~7줄)과 의자(9,5)는 통과할 수 없다
  const props: MapData['props'] = [
    { tx: 9, ty: 7, kind: 'desk' },
    { tx: 9, ty: 5, kind: 'chair' },
    { tx: 2, ty: 11, kind: 'plant' },
    { tx: 19, ty: 11, kind: 'plant' },
  ];
  for (let y = 6; y <= 7; y++) for (let x = 8; x <= 10; x++) solid[y][x] = true;
  solid[5][9] = true;
  solid[11][2] = true;
  solid[11][19] = true;

  return {
    id: 'office',
    theme: 'indoor',
    style: 'wood',
    music: 'office',
    w: OFFICE_W,
    h: OFFICE_H,
    ground,
    solid,
    buildings: [],
    trees: [],
    props,
    interactables,
    zones: [
      // 처음 들어서면 연구실 소개 연출
      { id: 'office_enter', tx: 1, ty: 4, w: 20, h: 9, set: { office_entered: true }, cutscene: 'office_intro' },
    ],
    decor: [
      { tx: 17, ty: 2, texture: 'office_window' },
      { tx: 19, ty: 3, texture: 'bookshelf' },
      { tx: 7, ty: 10, texture: 'rug', depth: 1 },
    ],
    timeline: { kind: 'fixed', year: 2006 },
    links: { hall: { tx: 2, ty: 3 }, outdoor: { tx: 2, ty: 3 }, garden: { tx: 2, ty: 3 }, room701: { tx: 2, ty: 3 }, room703: { tx: 2, ty: 3 } },
    spawns: {
      from_hall: { tx: 3, ty: 5, facing: 'down' },
    },
  };
}
