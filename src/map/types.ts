import type { Flags } from '../state/gameState';
import type { BgmName } from '../audio/audio';
import type { Dir } from '../scenes/BootScene';

export interface Building {
  tx: number;
  ty: number;
  tw: number;
  th: number;
  /** 시각 테마 (이름과 무관) */
  theme: 'red' | 'gray' | 'pink';
  label: string;
  /** 건물 외벽에 걸리는 현수막 문구 (줄마다 한 항목) */
  banner?: string[];
  /** 외벽에 그려 넣는 가게 그림 (예: 파르페 메뉴판) */
  emblem?: 'parfait';
}

export type TreeKind = 'oak' | 'pine';
export type PropKind = 'bush' | 'lamp' | 'bench' | 'flowerbed' | 'plant' | 'desk' | 'chair';

export type InteractAction =
  | {
      type: 'dialogue';
      script: string;
      set?: Flags;
      /** 대화가 끝나면 이어서 실행할 컷신 id (data/cutscenes.ts). altScript 의 플래그가 이미 켜져 있으면 실행하지 않는다 */
      cutscene?: string;
      /** 플래그가 켜진 뒤에는 script 대신 이 대사를 쓴다 (예: 이벤트가 끝난 NPC의 인사) */
      altScript?: { flag: string; script: string };
    }
  | { type: 'door'; toMap: string; toSpawn: string; set?: Flags }
  /** 책·사진 같은 이미지 카드를 띄운다 (data/cards.ts) */
  | { type: 'card'; card: string; set?: Flags }
  /** 702호 책장: 선택 메뉴(저서 발견 / 체육대회의 추억 / 닫기). 메인 퀘스트와 무관, 여러 번 열어 볼 수 있음 */
  | { type: 'shelf' }
  /** 이상한 달력: 2006 → 2014 → 2026 → 쓰이지 않은 페이지 (선택형 이스터에그) */
  | { type: 'calendar' }
  /** 과제지를 펼쳐 넘겨 본다 (data/papers.ts). 끝까지 읽으면 readSet 플래그가 켜지고 after 대사가 나온다 */
  | { type: 'paper'; readSet?: Flags; after?: string };

/** 탭/키로 상호작용할 수 있는 NPC·오브젝트·문 */
export interface Interactable {
  id: string;
  kind: 'npc' | 'object' | 'door';
  /** 기준 칸. 탭 인식 영역은 (tx, ty)를 맨 아래 왼쪽으로 하는 w×h 칸 */
  tx: number;
  ty: number;
  w?: number;
  h?: number;
  /** 그려질 스프라이트 (없으면 보이지 않는 영역, 예: 건물 문) */
  texture?: string;
  /** true 면 제자리에서 쉬지 않고 브레이크 댄스를 춘다 (701호 태진). 말을 걸면 잠시 멈춘다 */
  dance?: boolean;
  /** true 면 가까이 가지 않아도 머리 위에 느낌표가 계속 떠 있다 (이상한 소리가 나는 수풀 등) */
  beacon?: boolean;
  /** true 면 말을 걸어도 NPC가 플레이어를 돌아보지 않는다 (둘이 대화 중인 NPC를 엿보는 연출) */
  noTurn?: boolean;
  /** NPC가 바라보는 방향 */
  facing?: Dir;
  /** 다가갈 때 서는 칸 (없으면 주변에서 가장 가까운 빈 칸) */
  approach?: { tx: number; ty: number };
  /** 이 플래그가 켜지면 사라진다(습득한 아이템 등) */
  hideIf?: string;
  /** 이 플래그가 켜져야 나타난다 */
  showIf?: string;
  /** 스프라이트를 칸 기준 위치에서 옮기는 값(px). 벽에 걸린 물건, 책상 위 물건에 사용 */
  dx?: number;
  dy?: number;
  /** 그리는 순서 보정(앞뒤 가림). 책상 위 물건처럼 같은 줄의 다른 물건보다 위에 그려야 할 때 */
  z?: number;
  /** 플래그가 켜지면 스프라이트를 이 텍스처로 바꾼다 (열린 문, 열린 상자) */
  altTexture?: { flag: string; texture: string };
  /** 위아래로 둥실 떠 있는 연출 (아이템용) */
  float?: boolean;
  /** 이 플래그가 켜져야 사용 가능 */
  requires?: string;
  lockedText?: string;
  action: InteractAction;
}

/** 플레이어가 들어서면 플래그를 켜는 보이지 않는 영역 (칸 단위) */
export interface Zone {
  id: string;
  tx: number;
  ty: number;
  w: number;
  h: number;
  set: Flags;
  /** 이 플래그가 켜져 있어야 작동한다 */
  requires?: string;
  /** 처음 들어설 때(set 플래그가 아직 안 켜져 있을 때) 실행할 컷신 */
  cutscene?: string;
}

/** 상호작용은 없고 그림만 있는 장식 (벽 포스터, 창문, 바닥 깔개). 칸 왼쪽 아래를 기준으로 놓는다 */
export interface Decor {
  tx: number;
  ty: number;
  texture: string;
  /** 그리는 순서. 바닥 깔개는 1, 벽 장식은 기본값(칸 아래쪽 y) */
  depth?: number;
}

export interface Spawn {
  tx: number;
  ty: number;
  facing: Dir;
}

/**
 * 연도 표시 규칙.
 * - 'path': 길(line)을 따라 from(길의 끝점 line[last]) → to(길의 시작점 line[0]) 로 연도가 변한다.
 *   내려가면 과거, 올라가면 다시 현재.
 * - 'fixed': 맵 전체가 같은 연도
 */
export type Timeline =
  | { kind: 'path'; line: [number, number][]; from: number; to: number }
  | { kind: 'fixed'; year: number };

export interface MapData {
  id: string;
  theme: 'outdoor' | 'indoor';
  w: number;
  h: number;
  /** outdoor: 0 잔디 / 1 길 / 2 계단 / 3 옹벽(통과 불가) · indoor: 0 바닥 / 1 벽 */
  ground: number[][];
  solid: boolean[][];
  buildings: Building[];
  trees: { tx: number; ty: number; kind: TreeKind }[];
  props: { tx: number; ty: number; kind: PropKind }[];
  interactables: Interactable[];
  zones: Zone[];
  decor?: Decor[];
  /** 이 맵에서 흐르는 BGM */
  music: BgmName;
  /** 실내 바닥/벽 스타일: wood(연구실), hall(복도) */
  style?: 'wood' | 'hall' | 'dance';
  /** 꽃 장식 개수 (야외). 기본 260 */
  flowerCount?: number;
  /** 다른 맵에 있는 목표를 향할 때 이 맵에서 가야 할 문 위치 (화살표 안내용) */
  links?: Record<string, { tx: number; ty: number }>;
  /** 없으면 연도를 표시하지 않는다 */
  timeline?: Timeline;
  spawns: Record<string, Spawn>;
}
