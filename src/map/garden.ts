import type { Interactable, MapData, TreeKind } from './types';

/**
 * 비밀 정원 (Scene 07). 현재(2026년). 과제 힌트를 읽어야 열리는 대문 뒤에 있고,
 * 안쪽 큰 나무 아래에 보물상자가 있다.
 */
export const GARDEN_W = 26;
export const GARDEN_H = 20;

export function buildGarden(): MapData {
  const ground: number[][] = Array.from({ length: GARDEN_H }, () => Array(GARDEN_W).fill(0));
  const solid: boolean[][] = Array.from({ length: GARDEN_H }, () => Array(GARDEN_W).fill(false));

  // 정원 길: 대문(아래)에서 보물상자(위)까지, 위쪽은 넓은 광장
  for (let y = 7; y < GARDEN_H; y++) for (let x = 12; x <= 14; x++) ground[y][x] = 1;
  for (let y = 5; y <= 8; y++) for (let x = 10; x <= 16; x++) ground[y][x] = 1;

  // 가장자리 숲
  const trees: MapData['trees'] = [];
  const kind = (x: number, y: number): TreeKind => ((x * 7 + y * 3) % 5 < 2 ? 'pine' : 'oak');
  for (let x = 0; x < GARDEN_W; x++) {
    for (const y of [0, GARDEN_H - 1]) {
      solid[y][x] = true;
      trees.push({ tx: x, ty: y, kind: kind(x, y) });
    }
  }
  for (let y = 1; y < GARDEN_H - 1; y++) {
    for (const x of [0, GARDEN_W - 1]) {
      solid[y][x] = true;
      trees.push({ tx: x, ty: y, kind: kind(x, y) });
    }
  }
  // 큰 나무(상자 뒤쪽)와 정원 곳곳의 나무
  for (const [tx, ty] of [
    [8, 3], [10, 2], [13, 2], [16, 2], [18, 3],
    [4, 8], [21, 9], [5, 14], [20, 14], [3, 5], [22, 5],
  ] as const) {
    if (!solid[ty][tx]) {
      solid[ty][tx] = true;
      trees.push({ tx, ty, kind: kind(tx, ty) });
    }
  }

  const props: MapData['props'] = [];
  const addProp = (tx: number, ty: number, k: MapData['props'][number]['kind']) => {
    if (solid[ty][tx] || ground[ty][tx] !== 0) return;
    solid[ty][tx] = true;
    props.push({ tx, ty, kind: k });
  };
  for (const [tx, ty] of [[11, 11], [15, 11], [11, 14], [15, 14]] as const) addProp(tx, ty, 'flowerbed');
  for (const [tx, ty] of [[11, 9], [15, 9]] as const) addProp(tx, ty, 'lamp');
  for (const [tx, ty] of [[8, 12], [18, 12]] as const) addProp(tx, ty, 'bench');
  for (const [tx, ty] of [[6, 10], [20, 11], [8, 16], [18, 16], [7, 6], [19, 6]] as const) addProp(tx, ty, 'bush');

  const interactables: Interactable[] = [
    {
      id: 'chest',
      kind: 'object',
      tx: 13,
      ty: 6,
      texture: 'chest',
      altTexture: { flag: 'chest_opened', texture: 'chest_open' },
      action: { type: 'dialogue', script: 'chest_start', cutscene: 'chest_event', altScript: { flag: 'chest_opened', script: 'chest_after' } },
    },
    // 아래쪽 대문: 나가는 길 (대문 그림은 길 끝에 겹쳐 그린다)
    {
      id: 'garden_exit',
      kind: 'door',
      tx: 12,
      ty: 19,
      w: 3,
      h: 1,
      texture: 'garden_gate_open',
      z: -40,
      approach: { tx: 13, ty: 18 },
      action: { type: 'door', toMap: 'outdoor', toSpawn: 'from_garden' },
    },
  ];
  solid[6][13] = true;

  return {
    id: 'garden',
    theme: 'outdoor',
    music: 'garden',
    flowerCount: 520,
    w: GARDEN_W,
    h: GARDEN_H,
    ground,
    solid,
    buildings: [],
    trees,
    props,
    interactables,
    zones: [{ id: 'garden_enter', tx: 1, ty: 1, w: GARDEN_W - 2, h: GARDEN_H - 2, set: { garden_entered: true } }],
    // 정원은 현재(2026년)
    timeline: { kind: 'fixed', year: 2026 },
    links: { outdoor: { tx: 13, ty: 19 }, hall: { tx: 13, ty: 19 }, office: { tx: 13, ty: 19 }, room701: { tx: 13, ty: 19 }, room703: { tx: 13, ty: 19 } },
    spawns: {
      from_outdoor: { tx: 13, ty: 16, facing: 'up' },
    },
  };
}
