export type Flags = Record<string, boolean>;

/** 게임 진행 상태(플래그). 퀘스트 진행, 잠금 해제, 이벤트 완료 여부를 여기에 기록한다. */
class GameState {
  private flags: Flags = {};
  private listeners = new Set<() => void>();

  has(key: string) {
    return !!this.flags[key];
  }

  set(key: string, value = true) {
    if (this.flags[key] === value) return;
    this.flags[key] = value;
    this.emit();
  }

  setMany(flags?: Flags) {
    if (!flags) return;
    let changed = false;
    for (const [k, v] of Object.entries(flags)) {
      if (this.flags[k] !== v) {
        this.flags[k] = v;
        changed = true;
      }
    }
    if (changed) this.emit();
  }

  snapshot(): Flags {
    return { ...this.flags };
  }

  reset() {
    this.flags = {};
    this.emit();
  }

  /** 변경을 구독한다. 반환값을 호출하면 구독 해제. */
  onChange(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit() {
    for (const fn of this.listeners) fn();
  }
}

export const gameState = new GameState();
