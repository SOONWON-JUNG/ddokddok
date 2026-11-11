import type { Building, Interactable, MapData, PropKind, TreeKind, Zone } from './types';

/**
 * 캠퍼스 야외 맵 (S3).
 * - 본관: 북동쪽(위), 산학협력관: 남서쪽(아래). 두 건물 모두 정면이 아래(남쪽)를 향함
 * - 이야기 시작: 본관 앞(현수막) → 계단과 돌담으로 층이 나뉜 비탈길 → 산학협력관 앞
 * - 비탈길 곳곳에 추억 클릭 포인트와 딸기파르페 아이템이 있다
 */
export const MAP_W = 60;
export const MAP_H = 45;

// 결정적(같은 결과) 난수: 새로고침해도 맵이 바뀌지 않도록
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** 길의 중심선(타일 좌표) */
const PATH: [number, number][] = [
  [7, 37],
  [14, 36],
  [21, 32],
  [28, 27],
  [36, 22],
  [44, 16],
  [50, 13],
];
const PATH_RADIUS = 1.7;

function distToPath(x: number, y: number) {
  let best = Infinity;
  for (let i = 0; i < PATH.length - 1; i++) {
    const [ax, ay] = PATH[i];
    const [bx, by] = PATH[i + 1];
    const vx = bx - ax;
    const vy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)));
    best = Math.min(best, Math.hypot(x - (ax + vx * t), y - (ay + vy * t)));
  }
  return best;
}

export function buildOutdoor(): MapData {
  const ground: number[][] = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(0));
  const solid: boolean[][] = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(false));

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (distToPath(x + 0.5, y + 0.5) < PATH_RADIUS) ground[y][x] = 1;
    }
  }

  // 오르막 계단: 길 위 두 지점에 가로 계단 2줄
  for (const [cx, cy] of [
    [27, 28],
    [39, 20],
  ]) {
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (ground[cy + dy]?.[cx + dx] === 1) ground[cy + dy][cx + dx] = 2;
      }
    }
  }

  const buildings: Building[] = [
    { tx: 2, ty: 29, tw: 10, th: 6, theme: 'red', label: '산학협력관' },
    // 수덕전(파르페 가게): 비탈길 중앙에서 길의 반대편(위쪽 왼쪽)에 있다
    { tx: 23, ty: 18, tw: 7, th: 5, theme: 'pink', label: '수덕전', emblem: 'parfait' },
    {
      tx: 44,
      ty: 4,
      tw: 12,
      th: 8,
      theme: 'gray',
      label: '본관',
      banner: ['전경란 교수님 총장 취임을 축하드립니다', '06학번 현서 · 창현 · 태진'],
    },
  ];
  for (const b of buildings) {
    for (let y = b.ty; y < b.ty + b.th; y++) {
      for (let x = b.tx; x < b.tx + b.tw; x++) solid[y][x] = true;
    }
  }

  const insideBuilding = (tx: number, ty: number, margin = 0) =>
    buildings.some(
      (b) => tx >= b.tx - margin && tx < b.tx + b.tw + margin && ty >= b.ty - margin && ty < b.ty + b.th + margin,
    );

  // 옹벽(돌담): 계단 양옆에 둘러 비탈길이 "층"으로 나뉘어 보이게 한다. 계단으로만 오르내릴 수 있다.
  for (let y = 0; y < MAP_H; y++) {
    const xs: number[] = [];
    for (let x = 0; x < MAP_W; x++) if (ground[y][x] === 2) xs.push(x);
    if (!xs.length) continue;
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    for (let k = 1; k <= 5; k++) {
      for (const x of [minX - k, maxX + k]) {
        if (x > 0 && x < MAP_W - 1 && ground[y][x] === 0 && !insideBuilding(x, y, 1)) {
          ground[y][x] = 3;
          solid[y][x] = true;
        }
      }
    }
  }

  // 연못과 정자: 수덕전 위쪽 빈터. 물(4)은 통과할 수 없고, 남쪽 기슭에서 정자까지 나무다리(5)가 놓여 있다.
  const POND = { cx: 20, cy: 10, rx: 8.5, ry: 5.5 };
  const OX = -21; // 정자·다리 위치 보정 (처음 설계 기준 칸에서 옮긴 만큼)
  const OY = -26;
  const inPond = (x: number, y: number) =>
    ((x + 0.5 - POND.cx) / POND.rx) ** 2 + ((y + 0.5 - POND.cy) / POND.ry) ** 2 <= 1;
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (ground[y][x] === 0 && !solid[y][x] && inPond(x, y)) {
        ground[y][x] = 4;
        solid[y][x] = true;
      }
    }
  }
  // 정자 앞 마루(y 35)와 기슭까지 이어지는 다리(x 41~42, y 36~42)
  for (let x = 39 + OX; x <= 44 + OX; x++) {
    ground[35 + OY][x] = 5;
    solid[35 + OY][x] = false;
  }
  for (let y = 36 + OY; y <= 42 + OY; y++) {
    for (const x of [41 + OX, 42 + OX]) {
      ground[y][x] = 5;
      solid[y][x] = false;
    }
  }
  // 정자 본체(가로 4칸 × 세로 2칸)는 통과할 수 없다
  for (let y = 33 + OY; y <= 34 + OY; y++) for (let x = 40 + OX; x <= 43 + OX; x++) solid[y][x] = true;
  const nearPond = (tx: number, ty: number) => tx >= 10 && tx <= 30 && ty >= 3 && ty <= 17;

  /** 목표 칸 주변에서, 길 중심선으로부터 [minD, maxD] 떨어진 빈 잔디 칸 중 가장 가까운 곳 */
  const findSpot = (tx: number, ty: number, minD: number, maxD: number): [number, number] => {
    let best: [number, number] = [tx, ty];
    let bestScore = Infinity;
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        const x = tx + dx;
        const y = ty + dy;
        if (x < 2 || y < 2 || x >= MAP_W - 2 || y >= MAP_H - 2) continue;
        if (ground[y][x] !== 0 || solid[y][x] || insideBuilding(x, y, 2)) continue;
        const d = distToPath(x + 0.5, y + 0.5);
        if (d < minD || d > maxD) continue;
        const score = Math.hypot(dx, dy);
        if (score < bestScore) {
          bestScore = score;
          best = [x, y];
        }
      }
    }
    return best;
  };

  const [signX, signY] = findSpot(48, 18, 2.4, 3.8);
  const [vendX, vendY] = findSpot(13, 33, 2.4, 3.8);

  // 상호작용 대상
  const interactables: Interactable[] = [
    {
      id: 'banner',
      kind: 'object',
      tx: 45,
      ty: 8,
      w: 10,
      h: 2,
      approach: { tx: 50, ty: 12 },
      action: { type: 'dialogue', script: 'banner' },
    },
    {
      id: 'npc_pizza',
      kind: 'npc',
      tx: 10,
      ty: 39,
      texture: 'npc_pizza',
      facing: 'right',
      action: {
        type: 'dialogue',
        script: 'pizza',
        cutscene: 'pizza_event',
        altScript: { flag: 'pizza_done', script: 'pizza_after' },
      },
    },
    {
      id: 'door_sanhak',
      kind: 'door',
      tx: 6,
      ty: 34,
      w: 2,
      h: 1,
      approach: { tx: 7, ty: 35 },
      // 본관 앞 신입생의 강아지 이벤트와 피자 배달부 이벤트를 모두 본 뒤에 들어갈 수 있다
      requires: ['puppy_reported', 'pizza_done'],
      lockedText: '산학협력관 문은 아직 들어갈 때가 아닌 것 같다.',
      lockedHints: {
        puppy_reported: '비탈길 위, 본관 앞의 신입생이 곤란한 일이 있는 것 같았는데…\n그 학생의 이야기부터 들어 줄까?',
        pizza_done: '건물 앞에서는 피자 배달부가 두리번거리고 있다.\n무슨 일인지 먼저 물어볼까?',
      },
      action: { type: 'door', toMap: 'hall', toSpawn: 'from_outdoor', set: { entered_building: true } },
    },
    {
      id: 'door_main',
      kind: 'door',
      tx: 49,
      ty: 11,
      w: 2,
      h: 1,
      approach: { tx: 50, ty: 12 },
      action: { type: 'dialogue', script: 'main_door' },
    },
    // 이상한 소리 퀘스트: 겁먹은 신입생(진행에 따라 대사가 바뀌는 같은 자리의 NPC 4개) + 본관 왼쪽 수풀
    { id: 'npc_scared', kind: 'npc', tx: 42, ty: 18, texture: 'npc_student', facing: 'down', hideIf: 'met_scared', action: { type: 'dialogue', script: 'scared_intro', set: { met_scared: true } } },
    { id: 'npc_scared_wait', kind: 'npc', tx: 42, ty: 18, texture: 'npc_student', facing: 'down', showIf: 'met_scared', hideIf: 'puppy_found', action: { type: 'dialogue', script: 'scared_wait' } },
    { id: 'npc_scared_react', kind: 'npc', tx: 42, ty: 18, texture: 'npc_student', facing: 'down', showIf: 'puppy_found', hideIf: 'puppy_reported', action: { type: 'dialogue', script: 'scared_react_a', cutscene: 'npc_puppy_react' } },
    { id: 'npc_scared_after', kind: 'npc', tx: 42, ty: 18, texture: 'npc_student', facing: 'down', showIf: 'puppy_reported', action: { type: 'dialogue', script: 'scared_after' } },
    {
      id: 'bush_sound',
      kind: 'object',
      tx: 39,
      ty: 9,
      approach: { tx: 39, ty: 10 },
      showIf: 'met_scared',
      hideIf: 'puppy_found',
      beacon: true,
      action: { type: 'dialogue', script: 'bush_sound', cutscene: 'puppy_reveal' },
    },
    // 연못 위 정자: 다리 끝 마루에서 말을 건다
    {
      id: 'jeongja',
      kind: 'object',
      tx: 40 + OX,
      ty: 34 + OY,
      w: 4,
      h: 3,
      texture: 'jeongja',
      approach: { tx: 41 + OX, ty: 35 + OY },
      action: { type: 'dialogue', script: 'jeongja' },
    },
    // 연꽃이 떠 있는 물가 (눈에 보이지 않는 영역)
    {
      id: 'lotus_pond',
      kind: 'object',
      tx: 34 + OX,
      ty: 38 + OY,
      w: 4,
      h: 3,
      approach: { tx: 41 + OX, ty: 38 + OY },
      action: { type: 'dialogue', script: 'lotus_pond' },
    },
    // 추억 클릭 포인트 (문구는 임시. dialogues.ts 에서 수정)
    { id: 'mem_sign', kind: 'object', tx: signX, ty: signY, texture: 'sign', action: { type: 'dialogue', script: 'mem_sign' } },
    { id: 'mem_vending', kind: 'object', tx: vendX, ty: vendY, texture: 'vending', action: { type: 'dialogue', script: 'mem_vending' } },
    { id: 'mem_bench', kind: 'object', tx: 3, ty: 37, action: { type: 'dialogue', script: 'mem_bench' } },
    // 비밀 정원 대문: 과제 힌트를 읽기 전에는 잠겨 있다 (garden_open 플래그)
    {
      id: 'garden_gate',
      kind: 'door',
      tx: 54,
      ty: 28,
      w: 2,
      h: 2,
      // 처음에는 땅에 묻혀 윗부분만 빼꼼 보인다. 강아지가 파 주면(garden_dug) 모습을 드러낸다
      texture: 'garden_gate_peek',
      altTexture: { flag: 'garden_dug', texture: 'garden_gate_open' },
      approach: { tx: 55, ty: 29 },
      requires: 'garden_dug',
      lockedText: '덩굴 사이로 대문 꼭대기만 빼꼼 보인다.\n나머지는 땅에 묻혀 있는 것 같다…',
      action: { type: 'door', toMap: 'garden', toSpawn: 'from_outdoor' },
    },
    // 수덕전(파르페 가게): 문 + 앞의 파르페 표지판 + 그 옆의 파르페 아이템
    {
      id: 'door_shop',
      kind: 'door',
      tx: 26,
      ty: 22,
      w: 2,
      h: 1,
      approach: { tx: 27, ty: 23 },
      action: { type: 'dialogue', script: 'shop_door' },
    },
    {
      id: 'parfait_sign',
      kind: 'object',
      tx: 28,
      ty: 23,
      texture: 'parfait_sign',
      action: { type: 'dialogue', script: 'parfait_sign' },
    },
    {
      id: 'item_parfait',
      kind: 'object',
      tx: 29,
      ty: 23,
      texture: 'parfait',
      float: true,
      hideIf: 'got_parfait',
      action: { type: 'dialogue', script: 'parfait' },
    },
  ];
  for (const it of interactables) {
    // NPC·안내판·자판기·파르페 표지판은 통과할 수 없다 (파르페 아이템과 벤치는 소품 칸 그대로)
    if (it.kind === 'npc' || it.texture === 'sign' || it.texture === 'vending' || it.texture === 'parfait_sign') {
      solid[it.ty][it.tx] = true;
    }
    if (it.texture === 'garden_gate') {
      solid[it.ty][it.tx] = true;
      solid[it.ty][it.tx + 1] = true;
    }
  }

  // 구역: 산학협력관 앞에 도착하면 진행 플래그를 켠다
  const zones: Zone[] = [
    { id: 'sanhak_front', tx: 5, ty: 35, w: 5, h: 3, set: { arrived_sanhak: true } },
    // 비밀 정원 대문 앞: 단서를 찾은 뒤 가까이 가면 강아지가 땅을 파 준다
    { id: 'gate_front', tx: 51, ty: 28, w: 7, h: 4, set: { garden_dig_seen: true }, requires: 'garden_open', cutscene: 'garden_dig' },
  ];

  // 상호작용 대상 주변(3x3)은 나무가 가리지 않도록 비워 둔다
  const reserved = new Set<string>();
  for (const it of interactables) {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) reserved.add(`${it.tx + dx},${it.ty + dy}`);
  }

  const rand = rng(1234);

  // 외곽 숲: 가장자리 칸마다 나무를 겹쳐 심어 빽빽하게
  const trees: MapData['trees'] = [];
  const kindAt = (): TreeKind => (rand() < 0.35 ? 'pine' : 'oak');
  for (let x = 0; x < MAP_W; x++) {
    for (const y of [0, MAP_H - 1]) {
      solid[y][x] = true;
      trees.push({ tx: x, ty: y, kind: kindAt() });
    }
  }
  for (let y = 1; y < MAP_H - 1; y++) {
    for (const x of [0, MAP_W - 1]) {
      solid[y][x] = true;
      trees.push({ tx: x, ty: y, kind: kindAt() });
    }
  }

  const nearBuilding = (tx: number, ty: number, margin = 1) =>
    buildings.some(
      (b) => tx >= b.tx - margin && tx < b.tx + b.tw + margin && ty >= b.ty - margin && ty < b.ty + b.th + margin + 1,
    );

  // 흩어진 나무 (길·건물에서 떨어진 곳에만)
  let placed = 0;
  let guard = 0;
  while (placed < 70 && guard++ < 4000) {
    const tx = 2 + Math.floor(rand() * (MAP_W - 4));
    const ty = 2 + Math.floor(rand() * (MAP_H - 4));
    if (solid[ty][tx] || nearPond(tx, ty) || reserved.has(`${tx},${ty}`) || distToPath(tx + 0.5, ty + 0.5) < PATH_RADIUS + 1.8 || nearBuilding(tx, ty, 2)) continue;
    solid[ty][tx] = true;
    trees.push({ tx, ty, kind: kindAt() });
    placed++;
  }

  // 비밀 정원 대문 앞은 나무가 강아지 이벤트를 가리지 않도록 비워 둔다 (다른 나무 위치는 그대로)
  for (let i = trees.length - 1; i >= 0; i--) {
    const t = trees[i];
    if (t.tx >= 50 && t.tx <= 58 && t.ty >= 25 && t.ty <= 33 && t.tx < MAP_W - 1 && t.ty < MAP_H - 1) {
      solid[t.ty][t.tx] = false;
      trees.splice(i, 1);
    }
  }

  // 소품
  const props: MapData['props'] = [];
  const addProp = (tx: number, ty: number, kind: PropKind) => {
    if (solid[ty]?.[tx] || ground[ty]?.[tx] !== 0) return;
    solid[ty][tx] = true;
    props.push({ tx, ty, kind });
  };
  // 출입구 양옆 화단, 산학협력관 앞 벤치
  addProp(4, 35, 'flowerbed');
  addProp(10, 35, 'flowerbed');
  addProp(46, 12, 'flowerbed');
  addProp(53, 12, 'flowerbed');
  addProp(3, 37, 'bench');
  addProp(12, 35, 'bush');
  addProp(1, 35, 'bush');
  addProp(57, 12, 'bush');
  addProp(39, 9, 'bush'); // 이상한 소리가 나는 수풀
  addProp(42, 12, 'bush');
  // 길을 따라 가로등: 각 지점 근처에서 길 바로 옆 풀밭 칸을 찾아 배치
  for (const [lx, ly] of [
    [15, 33],
    [23, 29],
    [31, 24],
    [39, 18],
    [46, 14],
  ]) {
    let best: [number, number] | null = null;
    let bestScore = Infinity;
    for (let dy = -4; dy <= 1; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const tx = lx + dx;
        const ty = ly + dy;
        if (ground[ty]?.[tx] !== 0 || solid[ty]?.[tx]) continue;
        const d = distToPath(tx + 0.5, ty + 0.5);
        if (d < PATH_RADIUS + 0.4 || d > PATH_RADIUS + 1.6) continue;
        const score = Math.abs(d - (PATH_RADIUS + 0.8)) + (ty > ly ? 2 : 0) + Math.abs(dx) * 0.05;
        if (score < bestScore) {
          bestScore = score;
          best = [tx, ty];
        }
      }
    }
    if (best) addProp(best[0], best[1], 'lamp');
  }

  // 연못 위에 떠 있는 연꽃과 연잎 (정자·다리·기슭에서 떨어진 물 칸에만)
  const decor: NonNullable<MapData['decor']> = [];
  const lotusKinds = ['lotus_leaf', 'lotus_pink', 'lotus_leaf', 'lotus_white', 'lotus_bud', 'lotus_pink'];
  const lotusRand = rng(777);
  const isWater = (x: number, y: number) => ground[y]?.[x] === 4;
  for (let y = 31 + OY; y <= 42 + OY; y++) {
    for (let x = 32 + OX; x <= 50 + OX; x++) {
      if (!isWater(x, y) || ![-1, 0, 1].every((d) => isWater(x + d, y)) || !isWater(x, y - 1) || !isWater(x, y + 1)) continue;
      if (x >= 39 + OX && x <= 44 + OX && y >= 32 + OY && y <= 36 + OY) continue; // 정자 주변
      if (lotusRand() < 0.3) decor.push({ tx: x, ty: y, texture: lotusKinds[Math.floor(lotusRand() * lotusKinds.length)], depth: 2 });
    }
  }

  return {
    id: 'outdoor',
    theme: 'outdoor',
    music: 'outdoor',
    w: MAP_W,
    h: MAP_H,
    ground,
    solid,
    buildings,
    trees,
    props,
    interactables,
    zones,
    decor,
    // 본관 앞 2026년(현재) → 비탈길을 내려가며 과거로 → 산학협력관 앞 2006년. 올라가면 다시 현재로.
    timeline: { kind: 'path', line: PATH, from: 2026, to: 2006 },
    links: { hall: { tx: 7, ty: 34 }, office: { tx: 7, ty: 34 }, room701: { tx: 7, ty: 34 }, room703: { tx: 7, ty: 34 }, garden: { tx: 54, ty: 28 } },
    spawns: {
      start: { tx: 50, ty: 13, facing: 'down' }, // 본관 앞 (이야기 시작)
      from_hall: { tx: 7, ty: 35, facing: 'down' }, // 산학협력관 문 앞
      from_garden: { tx: 55, ty: 30, facing: 'down' }, // 비밀 정원 대문 앞
    },
  };
}
