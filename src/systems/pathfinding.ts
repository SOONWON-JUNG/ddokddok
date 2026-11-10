export interface Point {
  x: number;
  y: number;
}

/** 타일 격자 위 A* 길찾기 (8방향, 대각선은 양옆이 막혀 있으면 불가). 경로는 start 다음 칸부터 goal까지. */
export function findPath(
  solid: boolean[][],
  start: Point,
  goal: Point,
): Point[] | null {
  const h = solid.length;
  const w = solid[0].length;
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  if (!inside(goal.x, goal.y) || solid[goal.y][goal.x]) return null;
  if (start.x === goal.x && start.y === goal.y) return [];

  const key = (x: number, y: number) => y * w + x;
  const open = new Map<number, { x: number; y: number; g: number; f: number }>();
  const came = new Map<number, number>();
  const gScore = new Map<number, number>();
  const closed = new Set<number>();

  const heuristic = (x: number, y: number) => {
    const dx = Math.abs(x - goal.x);
    const dy = Math.abs(y - goal.y);
    return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
  };

  gScore.set(key(start.x, start.y), 0);
  open.set(key(start.x, start.y), {
    x: start.x,
    y: start.y,
    g: 0,
    f: heuristic(start.x, start.y),
  });

  const dirs = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1],
  ];

  while (open.size > 0) {
    let current: { x: number; y: number; g: number; f: number } | undefined;
    for (const n of open.values()) if (!current || n.f < current.f) current = n;
    if (!current) break;
    const ck = key(current.x, current.y);

    if (current.x === goal.x && current.y === goal.y) {
      const path: Point[] = [];
      let k = ck;
      while (k !== key(start.x, start.y)) {
        path.push({ x: k % w, y: Math.floor(k / w) });
        k = came.get(k)!;
      }
      return path.reverse();
    }

    open.delete(ck);
    closed.add(ck);

    for (const [dx, dy] of dirs) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (!inside(nx, ny) || solid[ny][nx]) continue;
      if (dx !== 0 && dy !== 0 && (solid[current.y][nx] || solid[ny][current.x])) continue;
      const nk = key(nx, ny);
      if (closed.has(nk)) continue;
      const g = current.g + (dx !== 0 && dy !== 0 ? Math.SQRT2 : 1);
      if (g >= (gScore.get(nk) ?? Infinity)) continue;
      gScore.set(nk, g);
      came.set(nk, ck);
      open.set(nk, { x: nx, y: ny, g, f: g + heuristic(nx, ny) });
    }
  }
  return null;
}

/** 목표 칸이 막혀 있을 때 가장 가까운 이동 가능한 칸을 찾는다. */
export function nearestWalkable(
  solid: boolean[][],
  p: Point,
  maxRadius = 4,
): Point | null {
  const h = solid.length;
  const w = solid[0].length;
  if (p.x >= 0 && p.y >= 0 && p.x < w && p.y < h && !solid[p.y][p.x]) return p;
  for (let r = 1; r <= maxRadius; r++) {
    let best: Point | null = null;
    let bestD = Infinity;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = p.x + dx;
        const y = p.y + dy;
        if (x < 0 || y < 0 || x >= w || y >= h || solid[y][x]) continue;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = { x, y };
        }
      }
    }
    if (best) return best;
  }
  return null;
}
