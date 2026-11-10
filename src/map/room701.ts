import type { Interactable, MapData } from './types';

/**
 * 701호: 댄스 동아리 UCDC 연습실. 2006년.
 * 윗벽: 출구 문 · UCDC 공연 포스터 · 전신 거울 · UCDC 현수막 · 미러볼.
 * 가운데: 골판지 위에서 브레이크 댄스를 추는 병아리 태진. 양옆에 큰 스피커, 구석에 붐박스.
 */
export const ROOM701_W = 20;
export const ROOM701_H = 13;
const WALL_ROWS = 4;

export function buildRoom701(): MapData {
  const ground: number[][] = Array.from({ length: ROOM701_H }, () => Array(ROOM701_W).fill(0));
  const solid: boolean[][] = Array.from({ length: ROOM701_H }, () => Array(ROOM701_W).fill(false));
  for (let y = 0; y < ROOM701_H; y++) {
    for (let x = 0; x < ROOM701_W; x++) {
      if (y < WALL_ROWS || y === ROOM701_H - 1 || x === 0 || x === ROOM701_W - 1) {
        ground[y][x] = 1;
        solid[y][x] = true;
      }
    }
  }

  const interactables: Interactable[] = [
    {
      id: 'room701_exit',
      kind: 'door',
      tx: 2,
      ty: 3,
      w: 2,
      h: 2,
      texture: 'door_inner',
      action: { type: 'door', toMap: 'hall', toSpawn: 'from_701' },
    },
    {
      id: 'poster_ucdc',
      kind: 'object',
      tx: 5,
      ty: 2,
      w: 1,
      h: 1,
      texture: 'poster_ucdc',
      dx: -1,
      approach: { tx: 5, ty: 4 },
      action: { type: 'card', card: 'poster_ucdc' },
    },
    // 방 한가운데에서 쉬지 않고 브레이크 댄스를 추는 병아리 태진
    {
      id: 'npc_taejin_dance',
      kind: 'npc',
      tx: 10,
      ty: 8,
      texture: 'chick_ty',
      facing: 'down',
      dance: true,
      action: { type: 'dialogue', script: 'taejin_dance' },
    },
  ];
  solid[8][10] = true;

  // 큰 스피커(양옆), 붐박스: 지나갈 수 없다
  for (const [x, y] of [
    [3, 6],
    [16, 6],
    [17, 10],
  ] as const)
    solid[y][x] = true;

  return {
    id: 'room701',
    theme: 'indoor',
    style: 'dance',
    music: 'dance',
    w: ROOM701_W,
    h: ROOM701_H,
    ground,
    solid,
    buildings: [],
    trees: [],
    props: [],
    interactables,
    zones: [],
    decor: [
      // 바닥 조명과 골판지 (바닥에 깔리므로 가장 아래에 그린다)
      { tx: 4, ty: 9, texture: 'spot_pink', depth: 1 },
      { tx: 12, ty: 7, texture: 'spot_cyan', depth: 1 },
      { tx: 9, ty: 8, texture: 'cardboard', depth: 2 },
      // 윗벽: 현수막, 전신 거울, 미러볼
      { tx: 7, ty: 1, texture: 'ucdc_banner' },
      { tx: 7, ty: 3, texture: 'mirror_wall' },
      { tx: 9, ty: 3, texture: 'mirror_wall' },
      { tx: 11, ty: 3, texture: 'mirror_wall' },
      { tx: 13, ty: 3, texture: 'mirror_wall' },
      { tx: 17, ty: 2, texture: 'disco_ball' },
      // 바닥 위 물건 (앞뒤 가림은 아래쪽 줄 기준)
      { tx: 3, ty: 6, texture: 'speaker', depth: 7 * 16 },
      { tx: 16, ty: 6, texture: 'speaker', depth: 7 * 16 },
      { tx: 17, ty: 10, texture: 'boombox', depth: 11 * 16 },
    ],
    timeline: { kind: 'fixed', year: 2006 },
    links: { hall: { tx: 2, ty: 3 }, outdoor: { tx: 2, ty: 3 }, office: { tx: 2, ty: 3 }, garden: { tx: 2, ty: 3 }, room701: { tx: 2, ty: 3 }, room703: { tx: 2, ty: 3 } },
    spawns: {
      from_hall: { tx: 3, ty: 5, facing: 'down' },
    },
  };
}
