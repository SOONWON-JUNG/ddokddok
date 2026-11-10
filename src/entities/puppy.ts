import Phaser from 'phaser';
import { PLAYER_SPEED } from '../config';
import type { Dir } from '../scenes/BootScene';

/**
 * 교수님을 졸졸 따라다니는 강아지.
 * - 그림은 코드로 그린다 (frames: `${dir}_0`, `${dir}_1`, 걷기 애니메이션: `puppy_walk_${dir}`)
 * - 플레이어가 지나온 길(trail)을 따라 걷기 때문에 모퉁이를 가로지르지 않는다
 * - 건물 안(실내 맵)에는 들어가지 않는다: WorldScene 이 실내 맵에서는 만들지 않는다
 */
export const PUPPY_KEY = 'puppy';
const FW = 20;
const FH = 18;
const DIRS: Dir[] = ['down', 'up', 'left', 'right'];

const C = {
  body: '#e8b66a',
  bodyHi: '#f6d9a0',
  ear: '#b0713a',
  nose: '#3a2a28',
  eye: '#2a2024',
  tongue: '#ef7a8a',
};

export function ensurePuppyAssets(scene: Phaser.Scene) {
  if (!scene.textures.exists(PUPPY_KEY)) {
    const tex = scene.textures.createCanvas(PUPPY_KEY, FW * 2, FH * 5)!;
    const ctx = tex.context;
    ctx.imageSmoothingEnabled = false;
    ([...DIRS, 'sit'] as const).forEach((dir, row) => {
      for (let f = 0; f < 2; f++) {
        const ox = f * FW;
        const oy = row * FH;
        const px = (x: number, y: number, w: number, h: number, c: string, mirror = false) => {
          ctx.fillStyle = c;
          ctx.fillRect(ox + (mirror ? FW - x - w : x), oy + y, w, h);
        };
        // 그림자
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(ox + FW / 2, oy + FH - 2, 7, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        if (dir === 'left' || dir === 'right') drawSide(px, f, dir === 'left');
        else if (dir === 'sit') drawSit(px, f);
        else if (dir === 'down') drawFront(px, f);
        else drawBack(px, f);
        tex.add(`${dir}_${f}`, 0, ox, oy, FW, FH);
      }
    });
    outline(ctx, FW * 2, FH * 5);
    tex.refresh();
  }
  if (!scene.anims.exists('puppy_sit')) {
    scene.anims.create({
      key: 'puppy_sit',
      frames: [
        { key: PUPPY_KEY, frame: 'sit_0' },
        { key: PUPPY_KEY, frame: 'sit_1' },
      ],
      frameRate: 3,
      repeat: -1,
    });
  }
  for (const dir of DIRS) {
    const key = `puppy_walk_${dir}`;
    if (scene.anims.exists(key)) continue;
    scene.anims.create({
      key,
      frames: [
        { key: PUPPY_KEY, frame: `${dir}_0` },
        { key: PUPPY_KEY, frame: `${dir}_1` },
      ],
      frameRate: 8,
      repeat: -1,
    });
  }
}

type Px = (x: number, y: number, w: number, h: number, c: string, mirror?: boolean) => void;

function drawSide(px: Px, f: number, m: boolean) {
  px(2, 5 + f, 3, 2, C.body, m); // 꼬리
  px(4, 7, 11, 6, C.body, m); // 몸
  px(5, 11, 8, 2, C.bodyHi, m); // 배
  px(12, 4, 6, 6, C.body, m); // 머리
  px(16, 7, 3, 3, C.bodyHi, m); // 주둥이
  px(18, 7, 1, 1, C.nose, m);
  px(15, 6, 1, 1, C.eye, m);
  px(12, 4, 2, 5, C.ear, m); // 귀
  // 다리
  px(5 + f, 13, 2, 3, C.body, m);
  px(12 - f, 13, 2, 3, C.body, m);
}

function drawFront(px: Px, f: number) {
  px(5, 10, 10, 6, C.body);
  px(8, 12, 4, 4, C.bodyHi);
  px(4, 3, 12, 8, C.body); // 머리
  px(2, 3, 3, 7, C.ear); // 늘어진 귀
  px(15, 3, 3, 7, C.ear);
  px(8, 7, 4, 3, C.bodyHi); // 주둥이
  px(9, 7, 2, 1, C.nose);
  px(6, 6, 1, 1, C.eye);
  px(13, 6, 1, 1, C.eye);
  px(10, 9, 1, 2, C.tongue);
  px(6 + f, 15, 2, 2, C.body);
  px(12 - f, 15, 2, 2, C.body);
}

/** 정면으로 앉아 헥헥대며 꼬리를 살랑살랑 흔드는 귀여운 모습 */
function drawSit(px: Px, f: number) {
  px(f ? 15 : 2, 13, 3, 2, C.body); // 꼬리(좌우로 살랑)
  px(5, 9, 10, 7, C.body); // 몸
  px(8, 11, 4, 5, C.bodyHi); // 배
  px(4, 2, 12, 8, C.body); // 머리
  px(2, 2 + f, 3, 7, C.ear); // 늘어진 귀(쫑긋)
  px(15, 2 + f, 3, 7, C.ear);
  px(8, 6, 4, 3, C.bodyHi); // 주둥이
  px(9, 6, 2, 1, C.nose);
  px(6, 4, 2, 2, C.eye); // 큰 눈
  px(12, 4, 2, 2, C.eye);
  px(6, 4, 1, 1, '#ffffff');
  px(12, 4, 1, 1, '#ffffff');
  px(10, 8, 1, 2 + f, C.tongue); // 헥헥 혀
  px(6, 15, 3, 2, C.bodyHi); // 앞발
  px(11, 15, 3, 2, C.bodyHi);
}

function drawBack(px: Px, f: number) {
  px(5, 10, 10, 6, C.body);
  px(4, 3, 12, 8, C.body);
  px(2, 3, 3, 7, C.ear);
  px(15, 3, 3, 7, C.ear);
  px(9 + (f ? 1 : -1), 8, 2, 3, C.bodyHi); // 꼬리
  px(6 + f, 15, 2, 2, C.body);
  px(12 - f, 15, 2, 2, C.body);
}

function outline(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const src = img.data;
  const out = new Uint8ClampedArray(src);
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && src[(y * w + x) * 4 + 3] > 200;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (src[i + 3] > 200) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) {
        out[i] = 0x2d;
        out[i + 1] = 0x2a;
        out[i + 2] = 0x38;
        out[i + 3] = 255;
      }
    }
  }
  ctx.putImageData(new ImageData(out, w, h), 0, 0);
}

const HOLD = 22; // 이 거리 안에서는 가만히 따라 서 있는다
const SPEED = PLAYER_SPEED * 1.12;

/** 플레이어를 따라다니는 강아지 */
export class PuppyFollower {
  sprite: Phaser.GameObjects.Sprite;
  /** true 면 스스로 따라가지 않는다 (연출 중) */
  busy = false;
  facing: Dir = 'down';
  private trail: { x: number; y: number }[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    ensurePuppyAssets(scene);
    this.sprite = scene.add.sprite(x, y, PUPPY_KEY, 'down_0').setOrigin(0.5, 0.85);
    this.sprite.setDepth(y);
  }

  place(x: number, y: number) {
    this.sprite.setPosition(x, y);
    this.trail = [];
  }

  /** 정면으로 앉아 귀엽게 기다리는 모습 */
  sit() {
    this.facing = 'down';
    this.sprite.anims.play('puppy_sit', true);
  }

  /** 걷는 모습/멈춘 모습 */
  pose(dir: Dir, walking: boolean) {
    this.facing = dir;
    if (walking) this.sprite.anims.play(`puppy_walk_${dir}`, true);
    else {
      this.sprite.anims.stop();
      this.sprite.setFrame(`${dir}_0`);
    }
  }

  update(dt: number, px: number, py: number) {
    const s = this.sprite;
    if (!this.busy) {
      const last = this.trail[this.trail.length - 1];
      if (!last || Math.hypot(px - last.x, py - last.y) >= 3) {
        this.trail.push({ x: px, y: py });
        if (this.trail.length > 80) this.trail.shift();
      }
      const d = Math.hypot(px - s.x, py - s.y);
      if (d > 150) {
        this.place(px, py + 10);
      } else if (d > HOLD) {
        while (this.trail.length && Math.hypot(this.trail[0].x - s.x, this.trail[0].y - s.y) < 2) this.trail.shift();
        const t = this.trail[0] ?? { x: px, y: py };
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const len = Math.hypot(dx, dy) || 1;
        const step = Math.min(SPEED * dt * (d > 60 ? 1.6 : 1), len);
        s.x += (dx / len) * step;
        s.y += (dy / len) * step;
        const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
        this.pose(dir, true);
      } else {
        this.trail = [];
        this.pose(this.facing, false);
      }
    }
    s.setDepth(s.y);
  }

  destroy() {
    this.sprite.destroy();
  }
}
