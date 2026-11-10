import type { Interactable, MapData } from './types';

/**
 * 산학협력관 복도 (Scene 04). 2006년.
 * 윗벽에 왼쪽부터: 출입구 → 디지털콘텐츠학과 게시판(DICON) → 701호 → 702호 → 703호.
 */
export const HALL_W = 29;
export const HALL_H = 12;
const WALL_ROWS = 4;

export function buildHall(): MapData {
  const ground: number[][] = Array.from({ length: HALL_H }, () => Array(HALL_W).fill(0));
  const solid: boolean[][] = Array.from({ length: HALL_H }, () => Array(HALL_W).fill(false));
  for (let y = 0; y < HALL_H; y++) {
    for (let x = 0; x < HALL_W; x++) {
      if (y < WALL_ROWS || y === HALL_H - 1 || x === 0 || x === HALL_W - 1) {
        ground[y][x] = 1;
        solid[y][x] = true;
      }
    }
  }

  const interactables: Interactable[] = [
    {
      id: 'hall_exit',
      kind: 'door',
      tx: 2,
      ty: 3,
      w: 2,
      h: 2,
      texture: 'door_glass',
      action: { type: 'door', toMap: 'outdoor', toSpawn: 'from_hall' },
    },
    {
      id: 'board',
      kind: 'object',
      tx: 6,
      ty: 3,
      w: 7,
      h: 2,
      texture: 'dicon_board',
      dy: -6,
      action: { type: 'dialogue', script: 'board', cutscene: 'board_note' },
    },
    {
      id: 'door_701',
      kind: 'door',
      tx: 17,
      ty: 3,
      w: 2,
      h: 2,
      texture: 'door_701',
      // 701호: 댄스 동아리 UCDC 연습실로 들어간다
      action: { type: 'door', toMap: 'room701', toSpawn: 'from_hall' },
    },
    // 박성대 교수님과 (병아리가 된) 창현: 서로 마주 보고 이야기 중
    {
      id: 'npc_park',
      kind: 'npc',
      tx: 8,
      ty: 7,
      texture: 'prof_ps',
      facing: 'right',
      noTurn: true,
      action: { type: 'dialogue', script: 'hall_chick', cutscene: 'ch_event', altScript: { flag: 'ch_event_done', script: 'hall_chick_after' } },
    },
    {
      id: 'npc_chick_ch',
      kind: 'npc',
      tx: 11,
      ty: 7,
      texture: 'chick_ch',
      facing: 'left',
      noTurn: true,
      // 소동이 끝나면 바닥까지 닿는 수염으로 남는다
      altTexture: { flag: 'ch_event_done', texture: 'chick_ch_beard3' },
      action: { type: 'dialogue', script: 'hall_chick', cutscene: 'ch_event', altScript: { flag: 'ch_event_done', script: 'hall_chick_after' } },
    },
    // 702호: 처음에는 닫힌 문. 두드리면(knocked) 열린 문으로 바뀌고, 그 뒤로는 바로 들어갈 수 있다
    {
      id: 'door_702',
      kind: 'door',
      tx: 21,
      ty: 3,
      w: 2,
      h: 2,
      texture: 'door_702',
      hideIf: 'knocked',
      // 복도의 창현 병아리, 701호 태진, 703호 현서를 모두 만나고 나서 두드린다
      requires: ['ch_talked', 'taejin_talked', 'hs_talked'],
      lockedText: '702호 문 앞에 섰다. …두드리기 전에, 오랜만에 온 복도부터 한 바퀴 둘러볼까?',
      lockedHints: {
        ch_talked: '· 복도 한쪽에서 박성대 교수님이 누군가와 이야기하고 있다.',
        taejin_talked: '· 701호에서 쿵짝쿵짝 음악 소리가 새어 나온다.',
        hs_talked: '· 703호 쪽에서 "청군 이겨라!" 함성이 들린다.',
      },
      action: { type: 'dialogue', script: 'door_702', cutscene: 'knock_702' },
    },
    {
      id: 'door_702_enter',
      kind: 'door',
      tx: 21,
      ty: 3,
      w: 2,
      h: 2,
      texture: 'door_702_open',
      showIf: 'knocked',
      action: { type: 'door', toMap: 'office', toSpawn: 'from_hall' },
    },
    {
      id: 'door_703',
      kind: 'door',
      tx: 26,
      ty: 3,
      w: 2,
      h: 2,
      texture: 'door_703',
      // 703호: 체육대회 닭싸움 결승전이 열리는 방
      action: { type: 'door', toMap: 'room703', toSpawn: 'from_hall' },
    },
    // 벽 포스터 3장: 누르면 크게 보인다
    ...(
      [
        [14, 'poster_dicon', 'poster_dicon'],
        [15, 'poster_3d', 'poster_3d'],
        [24, 'poster_motion', 'poster_motion'],
      ] as const
    ).map(
      ([tx, texture, card]): Interactable => ({
        id: card,
        kind: 'object',
        tx,
        ty: 2,
        w: 1,
        h: 1,
        texture,
        dx: -1,
        approach: { tx, ty: 4 },
        action: { type: 'card', card },
      }),
    ),
  ];

  // NPC는 통과할 수 없다
  for (const it of interactables) if (it.kind === 'npc') solid[it.ty][it.tx] = true;

  const props: MapData['props'] = [];
  for (const [tx, ty, kind] of [
    [1, 5, 'plant'],
    [27, 5, 'plant'],
    [14, 6, 'bench'],
    [18, 7, 'bench'],
    [1, 10, 'plant'],
    [27, 10, 'plant'],
  ] as const) {
    solid[ty][tx] = true;
    props.push({ tx, ty, kind });
  }

  return {
    id: 'hall',
    theme: 'indoor',
    style: 'hall',
    music: 'hall',
    w: HALL_W,
    h: HALL_H,
    ground,
    solid,
    buildings: [],
    trees: [],
    props,
    interactables,
    zones: [],
    decor: [],
    // 산학협력관 안: 2006년
    timeline: { kind: 'fixed', year: 2006 },
    links: { outdoor: { tx: 2, ty: 3 }, office: { tx: 21, ty: 3 }, garden: { tx: 2, ty: 3 }, room701: { tx: 17, ty: 3 }, room703: { tx: 26, ty: 3 } },
    spawns: {
      from_outdoor: { tx: 3, ty: 5, facing: 'down' },
      from_office: { tx: 21, ty: 5, facing: 'down' },
      from_701: { tx: 17, ty: 5, facing: 'down' },
      from_703: { tx: 26, ty: 5, facing: 'down' },
    },
  };
}
