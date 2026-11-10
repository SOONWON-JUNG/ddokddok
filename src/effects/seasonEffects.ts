import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import type { MapData } from '../map/types';
import { SEASON_CONFIG, type Season } from './seasonConfig';

/**
 * 계절 파티클(낙엽·눈·벚꽃잎) 연출. 화면 좌표에 그려지는 작은 도트 입자들이며,
 * 플레이어가 비탈길(timeline.line) 위 어디쯤 있는지에 따라 계절이 부드럽게 섞인다.
 * 월드 로직과는 독립: WorldScene 이 create/update/destroy 만 호출한다.
 */

const SEASONS: Season[] = ['autumn', 'winter', 'spring'];

const LEAF_COLORS = ['#f2c230', '#e0832a', '#c9692a', '#a35a2a'];
const PETAL_COLORS = ['#ffd6e4', '#ffc2d6', '#ffe4ee'];

function ensureTextures(scene: Phaser.Scene) {
  const make = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
    if (scene.textures.exists(key)) return;
    const t = scene.textures.createCanvas(key, w, h)!;
    draw(t.context);
    t.refresh();
  };
  LEAF_COLORS.forEach((c, i) =>
    make(`season_leaf${i}`, 4, 3, (g) => {
      g.fillStyle = c;
      g.fillRect(1, 0, 2, 3);
      g.fillRect(0, 1, 4, 1);
    }),
  );
  // 밝은 땅 위에서도 보이도록 눈송이 아래에 옅은 푸른 그림자를 한 겹 깐다
  make('season_snow', 4, 4, (g) => {
    g.fillStyle = '#a9c4de';
    g.fillRect(2, 1, 1, 3);
    g.fillRect(1, 2, 3, 1);
    g.fillStyle = '#ffffff';
    g.fillRect(1, 0, 1, 3);
    g.fillRect(0, 1, 3, 1);
  });
  make('season_snow_s', 3, 3, (g) => {
    g.fillStyle = '#a9c4de';
    g.fillRect(1, 1, 2, 2);
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, 2, 2);
  });
  PETAL_COLORS.forEach((c, i) =>
    make(`season_petal${i}`, 4, 3, (g) => {
      g.fillStyle = c;
      g.fillRect(0, 1, 3, 2);
      g.fillRect(1, 0, 3, 2);
    }),
  );
}

interface Particle {
  img: Phaser.GameObjects.Image;
  season: Season;
  /** 같은 계절 안에서의 번호. 계절 밀도(0~1)에 따라 번호가 큰 것부터 사라진다 */
  index: number;
  vx: number;
  vy: number;
  phase: number;
  sway: number;
  swayFreq: number;
  spin: number;
  on: boolean;
}

export class SeasonEffects {
  private particles: Particle[] = [];
  private weight: Record<Season, number> = { autumn: 0, winter: 0, spring: 0 };
  private perfScale = 1;
  private slowTime = 0;
  private time = 0;
  private line: [number, number][];

  constructor(
    private scene: Phaser.Scene,
    map: MapData,
  ) {
    const tl = map.timeline;
    this.line = tl && tl.kind === 'path' ? tl.line : [];
    if (this.line.length < 2) return;
    ensureTextures(scene);
    for (const s of SEASONS) {
      for (let i = 0; i < SEASON_CONFIG.maxParticles[s]; i++) this.particles.push(this.make(s, i));
    }
  }

  static enabled(): boolean {
    if (!SEASON_CONFIG.enabled) return false;
    if (import.meta.env.DEV && new URLSearchParams(location.search).get('season') === 'off') return false;
    return true;
  }

  private make(season: Season, index: number): Particle {
    const key =
      season === 'autumn'
        ? `season_leaf${index % LEAF_COLORS.length}`
        : season === 'spring'
          ? `season_petal${index % PETAL_COLORS.length}`
          : index % 3 === 0
            ? 'season_snow'
            : 'season_snow_s';
    const img = this.scene.add.image(0, 0, key).setScrollFactor(0).setDepth(9000).setAlpha(0).setVisible(false);
    const p: Particle = { img, season, index, vx: 0, vy: 0, phase: 0, sway: 0, swayFreq: 0, spin: 0, on: false };
    this.respawn(p, true);
    return p;
  }

  /** 입자를 화면 위(또는 왼쪽) 바깥에서 다시 시작시킨다. 처음엔 화면 어디에나 흩뿌린다 */
  private respawn(p: Particle, scatter: boolean) {
    const r = Math.random;
    p.phase = r() * Math.PI * 2;
    if (p.season === 'autumn') {
      p.vy = 14 + r() * 12;
      p.vx = 2 + r() * 5;
      p.sway = 6 + r() * 8;
      p.swayFreq = 0.9 + r() * 0.8;
      p.spin = (r() - 0.5) * 2.4;
    } else if (p.season === 'winter') {
      p.vy = 13 + r() * 12;
      p.vx = 0;
      p.sway = 2 + r() * 4;
      p.swayFreq = 0.6 + r() * 0.7;
      p.spin = 0;
    } else {
      // 벚꽃잎: 오른쪽 아래로 바람 타듯 대각선
      p.vy = 11 + r() * 9;
      p.vx = 20 + r() * 16;
      p.sway = 3 + r() * 4;
      p.swayFreq = 1.2 + r() * 1.0;
      p.spin = (r() - 0.5) * 3;
    }
    if (scatter) {
      p.img.x = r() * GAME_WIDTH;
      p.img.y = r() * GAME_HEIGHT;
    } else if (p.season === 'spring' && r() < 0.5) {
      p.img.x = -6;
      p.img.y = r() * GAME_HEIGHT * 0.8;
    } else {
      p.img.x = r() * (GAME_WIDTH + 30) - (p.season === 'spring' ? 30 : 0);
      p.img.y = -6;
    }
  }

  /** 비탈길 위 위치 0(본관)~1(산학협력관). 연도 표시와 같은 길을 읽기만 한다 */
  private progress(tx: number, ty: number) {
    let best = Infinity;
    let bestS = 0;
    let acc = 0;
    for (let i = 0; i < this.line.length - 1; i++) {
      const [ax, ay] = this.line[i];
      const [bx, by] = this.line[i + 1];
      const vx = bx - ax;
      const vy = by - ay;
      const len = Math.hypot(vx, vy);
      const u = Phaser.Math.Clamp(((tx - ax) * vx + (ty - ay) * vy) / (len * len), 0, 1);
      const d = Math.hypot(tx - (ax + vx * u), ty - (ay + vy * u));
      if (d < best) {
        best = d;
        bestS = acc + len * u;
      }
      acc += len;
    }
    // line 은 산학협력관(시작) → 본관(끝) 순서이므로 뒤집는다
    return acc > 0 ? 1 - bestS / acc : 0;
  }

  private activeSeason(s: number): Season {
    let cur = SEASON_CONFIG.zones[0].season;
    for (const z of SEASON_CONFIG.zones) if (s >= z.from) cur = z.season;
    return cur;
  }

  /** 매 프레임: tx, ty = 플레이어 칸 좌표(소수) */
  update(dt: number, tx: number, ty: number) {
    if (this.particles.length === 0) return;
    this.time += dt;

    // 프레임이 계속 낮으면 밀도 자동 감소
    if (dt > 1 / 38) this.slowTime += dt;
    else this.slowTime = Math.max(0, this.slowTime - dt * 2);
    this.perfScale = this.slowTime > 2 ? SEASON_CONFIG.lowPerfScale : 1;

    const active = this.activeSeason(this.progress(tx, ty));
    const step = dt / Math.max(0.2, SEASON_CONFIG.fadeSeconds);
    for (const s of SEASONS) {
      const target = s === active ? 1 : 0;
      const w = this.weight[s];
      this.weight[s] = w < target ? Math.min(target, w + step) : Math.max(target, w - step);
    }

    for (const p of this.particles) {
      const share = this.weight[p.season] * this.perfScale * SEASON_CONFIG.maxParticles[p.season];
      const wanted = p.index < share;
      // 사라질 입자는 서서히 투명해지고, 보이는 입자만 움직인다
      const targetAlpha = wanted ? 0.9 : 0;
      p.img.alpha += (targetAlpha - p.img.alpha) * Math.min(1, dt * 2.5);
      if (p.img.alpha < 0.02 && !wanted) {
        if (p.img.visible) p.img.setVisible(false);
        continue;
      }
      if (!p.img.visible) {
        this.respawn(p, false);
        p.img.setVisible(true);
      }
      const t = this.time * p.swayFreq + p.phase;
      p.img.x += (p.vx + Math.cos(t) * p.sway * p.swayFreq * 0.6) * dt;
      p.img.y += p.vy * dt;
      p.img.rotation += p.spin * dt;
      if (p.img.y > GAME_HEIGHT + 6 || p.img.x > GAME_WIDTH + 8 || p.img.x < -34) this.respawn(p, false);
    }
  }

  destroy() {
    for (const p of this.particles) p.img.destroy();
    this.particles = [];
  }
}
