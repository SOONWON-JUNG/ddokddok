import type { Interactable, MapData } from './types';

/**
 * 703호: 문을 열면 학교 잔디 운동장! 영상정보대학 체육대회 닭싸움 결승전이 열린다. 2006년.
 * 처음 들어서면 병아리 현서와 황소 선배의 닭싸움 연출(chicken_fight)이 나오고,
 * 그 뒤로는 멀리 날아가 대자로 뻗은 현서와 의기양양한 선배가 남아 있다.
 */
export const ROOM703_W = 20;
export const ROOM703_H = 13;
const WALL_ROWS = 4;

/** 닭싸움 뒤 자리 (컷신 착지 위치와 같아야 자연스럽다) */
export const HS_FALLEN = { tx: 3, ty: 10 };
export const SENIOR_SPOT = { tx: 11, ty: 8 };

export function buildRoom703(): MapData {
  const ground: number[][] = Array.from({ length: ROOM703_H }, () => Array(ROOM703_W).fill(0));
  const solid: boolean[][] = Array.from({ length: ROOM703_H }, () => Array(ROOM703_W).fill(false));
  for (let y = 0; y < ROOM703_H; y++) {
    for (let x = 0; x < ROOM703_W; x++) {
      if (y < WALL_ROWS || y === ROOM703_H - 1 || x === 0 || x === ROOM703_W - 1) {
        ground[y][x] = 1;
        solid[y][x] = true;
      }
    }
  }

  const interactables: Interactable[] = [
    {
      id: 'room703_exit',
      kind: 'door',
      tx: 2,
      ty: 3,
      w: 2,
      h: 2,
      texture: 'door_inner',
      action: { type: 'door', toMap: 'hall', toSpawn: 'from_703' },
    },
    {
      id: 'bracket',
      kind: 'object',
      tx: 4,
      ty: 2,
      w: 1,
      h: 1,
      texture: 'bracket',
      approach: { tx: 4, ty: 4 },
      action: { type: 'card', card: 'bracket_703' },
    },
    // 닭싸움에서 멀리 날아가 대자로 뻗은 병아리 현서
    {
      id: 'npc_hs_fallen',
      kind: 'npc',
      tx: HS_FALLEN.tx,
      ty: HS_FALLEN.ty,
      texture: 'chick_hs',
      facing: 'down',
      angle: -90,
      noTurn: true,
      showIf: 'fight_done',
      action: { type: 'dialogue', script: 'hs_fallen' },
    },
    // 이긴 황소 선배 (크게 그린다)
    {
      id: 'npc_senior',
      kind: 'npc',
      tx: SENIOR_SPOT.tx,
      ty: SENIOR_SPOT.ty,
      texture: 'bull_senior',
      facing: 'left',
      scale: 1.3,
      showIf: 'fight_done',
      action: { type: 'dialogue', script: 'senior_703' },
    },
  ];
  solid[HS_FALLEN.ty][HS_FALLEN.tx] = true;
  solid[SENIOR_SPOT.ty][SENIOR_SPOT.tx] = true;

  const cones: [number, number][] = [
    [6, 6],
    [13, 6],
    [6, 11],
    [14, 11],
  ];
  for (const [x, y] of cones) solid[y][x] = true;
  // 천막(15~18칸, 6줄), 깃대, 풍선은 지나갈 수 없다
  for (let x = 15; x <= 18; x++) solid[6][x] = true;
  for (const [x, y] of [
    [1, 7],
    [18, 9],
    [18, 11],
    [10, 11],
  ] as const)
    solid[y][x] = true;

  return {
    id: 'room703',
    theme: 'indoor',
    style: 'field',
    music: 'festival',
    w: ROOM703_W,
    h: ROOM703_H,
    ground,
    solid,
    buildings: [],
    trees: [],
    props: [],
    interactables,
    zones: [
      // 처음 들어서면 닭싸움 결승전 연출
      { id: 'room703_enter', tx: 1, ty: 4, w: 18, h: 8, set: { fight_seen: true }, cutscene: 'chicken_fight' },
    ],
    decor: [
      { tx: 7, ty: 9, texture: 'arena_circle', depth: 1 },
      // 하늘의 만국기 (두 줄), 울타리에 건 현수막과 점수판
      { tx: 1, ty: 0, texture: 'bunting' },
      { tx: 5, ty: 0, texture: 'bunting' },
      { tx: 9, ty: 0, texture: 'bunting' },
      { tx: 13, ty: 0, texture: 'bunting' },
      { tx: 1, ty: 1, texture: 'bunting' },
      { tx: 15, ty: 1, texture: 'bunting' },
      { tx: 5, ty: 2, texture: 'sports_banner' },
      { tx: 16, ty: 3, texture: 'scoreboard' },
      // 운동장 위: 천막, 깃대, 풍선, 고깔
      { tx: 15, ty: 6, texture: 'tent', depth: 7 * 16 },
      { tx: 1, ty: 7, texture: 'flagpole_red', depth: 8 * 16 },
      { tx: 18, ty: 9, texture: 'flagpole_blue', depth: 10 * 16 },
      { tx: 18, ty: 11, texture: 'balloons', depth: 12 * 16 },
      { tx: 10, ty: 11, texture: 'balloons', depth: 12 * 16 },
      ...cones.map(([tx, ty]) => ({ tx, ty, texture: 'cone', depth: (ty + 1) * 16 })),
    ],
    timeline: { kind: 'fixed', year: 2006 },
    links: { hall: { tx: 2, ty: 3 }, outdoor: { tx: 2, ty: 3 }, office: { tx: 2, ty: 3 }, garden: { tx: 2, ty: 3 }, room701: { tx: 2, ty: 3 }, room703: { tx: 2, ty: 3 } },
    spawns: {
      from_hall: { tx: 3, ty: 5, facing: 'down' },
    },
  };
}
