import type { Flags } from '../state/gameState';
import type { Dir } from '../scenes/BootScene';

/**
 * 진행 저장 (브라우저 localStorage). 새로고침하거나 실수로 창을 닫아도 "이어하기"로 돌아올 수 있다.
 * 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 조용히 저장을 건너뛴다.
 */
const KEY = 'ddokddok.save.v1';

export interface SaveData {
  flags: Flags;
  map: string;
  tx: number;
  ty: number;
  facing: Dir;
}

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as SaveData;
    if (!d || typeof d.map !== 'string' || typeof d.tx !== 'number' || typeof d.ty !== 'number' || typeof d.flags !== 'object') return null;
    return d;
  } catch {
    return null;
  }
}

export function writeSave(d: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* 저장소를 쓸 수 없으면 건너뜀 */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* 무시 */
  }
}
