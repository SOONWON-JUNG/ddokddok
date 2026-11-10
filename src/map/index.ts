import { buildGarden } from './garden';
import { buildHall } from './hall';
import { buildOffice } from './office';
import { buildOutdoor } from './outdoor';
import { buildRoom701 } from './room701';
import { buildRoom703 } from './room703';
import type { MapData } from './types';

/** 맵 레지스트리. 새 맵(연구실, 비밀 정원 등)은 여기에 추가한다. */
const BUILDERS: Record<string, () => MapData> = {
  outdoor: buildOutdoor,
  hall: buildHall,
  office: buildOffice,
  garden: buildGarden,
  room701: buildRoom701,
  room703: buildRoom703,
};

export function getMap(id: string): MapData {
  const build = BUILDERS[id];
  if (!build) throw new Error(`알 수 없는 맵: ${id}`);
  return build();
}

export const START_MAP = 'outdoor';
export const START_SPAWN = 'start';
