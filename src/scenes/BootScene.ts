import Phaser from 'phaser';
import { makeStoryTextures } from './storyTextures';

export type Dir = 'down' | 'up' | 'left' | 'right';

// 프레임 24x36 그림 + 사방 1px 여백(외곽선용)
export const PLAYER_FRAME_W = 26;
export const PLAYER_FRAME_H = 38;
/** 발 위치(스프라이트 기준점 y) */
export const PLAYER_ORIGIN_Y = 37 / 38;

const DIRS: Dir[] = ['down', 'up', 'left', 'right'];

const OUTLINE: [number, number, number] = [0x2d, 0x2a, 0x38];

const PLAYER_PALETTE = {
  skin: '#f6cfa8',
  skinSh: '#e4b48c',
  hair: '#3a2a28',
  hairHi: '#5a443f',
  blazer: '#4a4a58',
  blazerHi: '#63637a',
  blazerSh: '#383844',
  white: '#f7f4ee',
  pants: '#34343f',
  shoe: '#1f1c26',
  lip: '#d0453b',
  eye: '#2a2024',
  blush: '#f2a39a',
  silver: '#dcdce6',
};

type Palette = typeof PLAYER_PALETTE;

/** 배달부 NPC(임시) 팔레트: 같은 도트 틀에 색만 바꿔 재사용 */
const PIZZA_PALETTE: Palette = {
  ...PLAYER_PALETTE,
  hair: '#3d2817',
  hairHi: '#5b3d24',
  blazer: '#d94b3a',
  blazerHi: '#ef6a58',
  blazerSh: '#a9372b',
  white: '#ffd25e',
  pants: '#2f3a5a',
};

/** 본관 근처에서 겁먹은 신입생 NPC */
const STUDENT_PALETTE: Palette = {
  ...PLAYER_PALETTE,
  hair: '#5a3a2a',
  hairHi: '#7a5a42',
  blazer: '#7fb2e5',
  blazerHi: '#a4cbf0',
  blazerSh: '#5a8cbf',
  white: '#f4eadb',
  pants: '#4a4a5a',
  shoe: '#f2efe8',
};

/** 강아지가 사람으로 변한 모습(엔딩) — 후드티를 입은 개발자 */
const DEV_PALETTE: Palette = {
  ...PLAYER_PALETTE,
  skin: '#f0c6a0',
  skinSh: '#d9a97f',
  hair: '#2a2024',
  hairHi: '#4a3a3c',
  blazer: '#5a6a8a',
  blazerHi: '#7a8aaa',
  blazerSh: '#43506a',
  white: '#e8e8ee',
  pants: '#3a4a6a',
  shoe: '#f2efe8',
};

/** 제자 3명(현서·창현·태진) — 사람 모습. 제공해 주신 그림을 참고한 도트 */
const KIDS: Record<string, { pal: Palette; style: 'long' | 'short' | 'spiky' }> = {
  kid_hs: {
    style: 'long',
    pal: { ...PLAYER_PALETTE, hair: '#8a5a34', hairHi: '#b07a4a', blazer: '#dcc3a0', blazerHi: '#ecd9bd', blazerSh: '#b89c78', white: '#f4eadb', pants: '#6f8fba', shoe: '#f2efe8' },
  },
  kid_ty: {
    style: 'short',
    pal: { ...PLAYER_PALETTE, hair: '#1f1b20', hairHi: '#3a343c', blazer: '#efe3cb', blazerHi: '#fbf3e2', blazerSh: '#cdbf9f', white: '#efe3cb', pants: '#34343f', shoe: '#f2efe8' },
  },
  // 박성대 교수님: 짧은 검은 머리, 회색 재킷에 분홍 체크 셔츠
  prof_ps: {
    style: 'short',
    pal: { ...PLAYER_PALETTE, skin: '#ecc09a', skinSh: '#d4a47e', hair: '#1c1a1e', hairHi: '#34303a', blazer: '#9a9ca6', blazerHi: '#b4b6c0', blazerSh: '#777984', white: '#e6a5ba', pants: '#2f3340', shoe: '#2a2630' },
  },
  kid_ch: {
    style: 'spiky',
    pal: { ...PLAYER_PALETTE, skin: '#e9b98d', skinSh: '#d19c72', hair: '#2a2024', hairHi: '#4a3a3c', blazer: '#cfcad0', blazerHi: '#e3dfe5', blazerSh: '#a8a2ab', white: '#cfcad0', pants: '#3a3846', shoe: '#f2efe8' },
  },
};

/** 병아리 3마리(같은 제자들의 병아리 모습) */
interface ChickDef {
  hair: 'long' | 'messy' | 'spiky';
  hairC: string;
  hairHi: string;
  cloth: string;
  clothHi: string;
  clothSh: string;
  inner: string;
  bottom: string;
  shoes?: string;
  skirt?: boolean;
  goatee?: boolean;
  /** 수염 단계 (0 없음, 1 염소수염, 2 덥수룩, 3 바닥까지). 없으면 goatee 로 정한다 */
  beard?: 0 | 1 | 2 | 3;
  grumpy?: boolean;
}
const CHICK_BODY = '#ffd84a';
const CHICK_BODY_HI = '#ffe98a';
const CHICK_BODY_SH = '#f0b52e';
const CHICK_ORANGE = '#f29a2e';
const CHICKS: Record<string, ChickDef> = {
  chick_hs: { hair: 'long', hairC: '#8a5a34', hairHi: '#b07a4a', cloth: '#dcc3a0', clothHi: '#ecd9bd', clothSh: '#b89c78', inner: '#f4eadb', bottom: '#2e3350', skirt: true },
  chick_ty: { hair: 'messy', hairC: '#1f1b20', hairHi: '#3a343c', cloth: '#efe3cb', clothHi: '#fbf3e2', clothSh: '#cdbf9f', inner: '#ffffff', bottom: '#2f3350', shoes: '#f2efe8' },
  chick_ch: { hair: 'spiky', hairC: '#2a2024', hairHi: '#4a3a3c', cloth: '#2b3350', clothHi: '#44507a', clothSh: '#1d2238', inner: '#d6d2da', bottom: '#2b3350', goatee: true, grumpy: true },
  // 복도 "교수님 오인 소동": 면도한 창현, 다시 자라난 덥수룩 수염, 바닥까지 닿는 수염
  chick_ch_shaved: { hair: 'spiky', hairC: '#2a2024', hairHi: '#4a3a3c', cloth: '#2b3350', clothHi: '#44507a', clothSh: '#1d2238', inner: '#d6d2da', bottom: '#2b3350', beard: 0, grumpy: true },
  chick_ch_beard2: { hair: 'spiky', hairC: '#2a2024', hairHi: '#4a3a3c', cloth: '#2b3350', clothHi: '#44507a', clothSh: '#1d2238', inner: '#d6d2da', bottom: '#2b3350', beard: 2, grumpy: true },
  chick_ch_beard3: { hair: 'spiky', hairC: '#2a2024', hairHi: '#4a3a3c', cloth: '#2b3350', clothHi: '#44507a', clothSh: '#1d2238', inner: '#d6d2da', bottom: '#2b3350', beard: 3, grumpy: true },
  // 과제를 내러 온 병아리 신입생들
  chick_f1: { hair: 'messy', hairC: '#8a5a34', hairHi: '#b07a4a', cloth: '#6bbf7a', clothHi: '#8fd49a', clothSh: '#4f9a5a', inner: '#ffffff', bottom: '#4a4a5a', shoes: '#f2efe8' },
  chick_f2: { hair: 'long', hairC: '#5a3a2a', hairHi: '#7a5a42', cloth: '#ff8fc0', clothHi: '#ffb3d4', clothSh: '#d96a9a', inner: '#ffffff', bottom: '#2e3350', skirt: true },
  chick_f3: { hair: 'spiky', hairC: '#c98a3a', hairHi: '#e0a85a', cloth: '#7fb2e5', clothHi: '#a4cbf0', clothSh: '#5a8cbf', inner: '#ffffff', bottom: '#34343f', shoes: '#f2efe8' },
};

/** 배달부 모자 색 */
const CAP = '#d94b3a';
const CAP_HI = '#ef6a58';
const CAP_SH = '#a9372b';

/** 투명 픽셀 중 불투명 픽셀과 맞닿은 곳에 1px 외곽선을 입힌다 (도트 느낌을 살리는 핵심 처리) */
function outline(ctx: CanvasRenderingContext2D, w: number, h: number, color = OUTLINE) {
  const img = ctx.getImageData(0, 0, w, h);
  const src = img.data;
  const out = new Uint8ClampedArray(src);
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && src[(y * w + x) * 4 + 3] > 200;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (src[i + 3] !== 0) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) {
        out[i] = color[0];
        out[i + 1] = color[1];
        out[i + 2] = color[2];
        out[i + 3] = 255;
      }
    }
  }
  ctx.putImageData(new ImageData(out, w, h), 0, 0);
}

/** 이미 그려진 그림 "뒤"에 부드러운 바닥 그림자를 깐다 */
function groundShadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = 'rgba(30, 40, 20, 0.28)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function disc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color;
  for (let y = -r; y <= r; y++) {
    const hw = Math.floor(Math.sqrt(r * r - y * y) + 0.5);
    ctx.fillRect(cx - hw, cy + y, hw * 2, 1);
  }
}

/**
 * 임시(시안) 그래픽 생성기. 이미지 파일 없이 코드로 도트를 그린다.
 * 이후 실제 에셋/맞춤 그림으로 교체 가능.
 */
export class BootScene extends Phaser.Scene {
  private pal: Palette = PLAYER_PALETTE;
  /** 'bob' = 단발 머리(교수님), 'cap' = 챙 달린 모자(배달부), 'short' = 짧은 머리 */
  private style: 'bob' | 'cap' | 'short' | 'long' | 'spiky' = 'bob';

  constructor() {
    super('boot');
  }

  create() {
    this.makeCharacter('player', PLAYER_PALETTE);
    this.makeCharacter('npc_pizza', PIZZA_PALETTE, 'cap');
    this.makeCharacter('npc_student', STUDENT_PALETTE, 'short');
    this.makeCharacter('man_dev', DEV_PALETTE, 'short');
    this.makeBull('bull_senior');
    for (const [key, k] of Object.entries(KIDS)) this.makeCharacter(key, k.pal, k.style);
    for (const [key, c] of Object.entries(CHICKS)) this.makeChick(key, c);
    this.makeTrees();
    this.makeProps();
    this.makeInterior();
    this.makeCampusObjects();
    this.makeBubble();
    this.makeEvent();
    makeStoryTextures(this);
    this.makeMarker();
    this.scene.start('world');
  }

  private canvas(key: string, w: number, h: number) {
    const tex = this.textures.createCanvas(key, w, h)!;
    const ctx = tex.context;
    ctx.imageSmoothingEnabled = false;
    return { tex, ctx };
  }

  // ───────────────────────── 교수님 캐릭터 ─────────────────────────

  /** 단발 웨이브 머리 + 어두운 블레이저 + 흰 상의 (제공해 주신 사진 참고). 방향 4 × 프레임 3 */
  private makeCharacter(key: string, pal: Palette, style: 'bob' | 'cap' | 'short' | 'long' | 'spiky' = 'bob') {
    this.pal = pal;
    this.style = style;
    const cols = 3; // 0 = 서 있기, 1·2 = 걷기
    const { tex, ctx } = this.canvas(key, PLAYER_FRAME_W * cols, PLAYER_FRAME_H * DIRS.length);

    DIRS.forEach((dir, row) => {
      for (let f = 0; f < cols; f++) {
        const ox = f * PLAYER_FRAME_W;
        const oy = row * PLAYER_FRAME_H;
        const mirror = dir === 'right';
        const px = (x: number, y: number, w: number, h: number, color: string) => {
          const X = mirror ? 24 - x - w : x;
          ctx.fillStyle = color;
          ctx.fillRect(ox + 1 + X, oy + 1 + y, w, h);
        };
        const swing = f === 1 ? 1 : f === 2 ? -1 : 0;
        if (dir === 'down') this.drawFront(px, f, swing);
        else if (dir === 'up') this.drawBack(px, f, swing);
        else this.drawSide(px, f, swing);
      }
    });

    outline(ctx, PLAYER_FRAME_W * cols, PLAYER_FRAME_H * DIRS.length);

    // 프레임별 그림자 + 프레임 등록
    DIRS.forEach((dir, row) => {
      for (let f = 0; f < cols; f++) {
        const ox = f * PLAYER_FRAME_W;
        const oy = row * PLAYER_FRAME_H;
        groundShadow(ctx, ox + 13, oy + 36, 8, 2.4);
        tex.add(`${dir}_${f}`, 0, ox, oy, PLAYER_FRAME_W, PLAYER_FRAME_H);
      }
    });
    tex.refresh();

    for (const dir of DIRS) {
      this.anims.create({
        key: `${key}_walk_${dir}`,
        frames: [1, 0, 2, 0].map((f) => ({ key, frame: `${dir}_${f}` })),
        frameRate: 7,
        repeat: -1,
      });
    }
  }

  private drawFront(px: (x: number, y: number, w: number, h: number, c: string) => void, f: number, a: number) {
    const lift1 = f === 1 ? 1 : 0;
    const lift2 = f === 2 ? 1 : 0;
    // 다리 + 신발
    px(8, 28, 4, 5 - lift1, this.pal.pants);
    px(12, 28, 4, 5 - lift2, this.pal.pants);
    px(7, 33 - lift1, 5, 2, this.pal.shoe);
    px(12, 33 - lift2, 5, 2, this.pal.shoe);
    // 몸 (블레이저)
    px(6, 16, 12, 13, this.pal.blazer);
    px(6, 16, 12, 1, this.pal.blazerHi);
    px(6, 27, 12, 2, this.pal.blazerSh);
    // 흰 상의 + 라펠
    px(10, 16, 4, 7, this.pal.white);
    px(11, 23, 2, 1, this.pal.white);
    px(9, 17, 1, 7, this.pal.blazerHi);
    px(14, 17, 1, 7, this.pal.blazerHi);
    px(12, 25, 1, 1, '#1f1c26');
    // 팔
    px(4, 17 + a, 3, 10, this.pal.blazer);
    px(4, 17 + a, 1, 10, this.pal.blazerHi);
    px(4, 26 + a, 3, 2, this.pal.skin);
    px(17, 17 - a, 3, 10, this.pal.blazer);
    px(19, 17 - a, 1, 10, this.pal.blazerSh);
    px(17, 26 - a, 3, 2, this.pal.skin);
    // 목, 얼굴
    px(10, 14, 4, 3, this.pal.skinSh);
    px(7, 3, 10, 12, this.pal.skin);
    if (this.style === 'cap') {
      // 남자 배달부: 챙 달린 모자 + 짧은 구레나룻, 재킷 가슴에 노란 띠
      px(6, 22, 12, 1, this.pal.white);
      px(7, 0, 10, 1, CAP);
      px(6, 1, 12, 5, CAP);
      px(6, 1, 12, 1, CAP_HI);
      px(10, 3, 4, 2, '#fff6d8');
      px(5, 6, 14, 2, CAP_SH);
      px(6, 8, 2, 5, this.pal.hair);
      px(16, 8, 2, 5, this.pal.hair);
      px(8, 9, 2, 1, this.pal.hair);
      px(14, 9, 2, 1, this.pal.hair);
      px(9, 10, 1, 2, this.pal.eye);
      px(14, 10, 1, 2, this.pal.eye);
      px(11, 12, 2, 1, this.pal.skinSh);
      px(10, 13, 4, 1, '#b5523f');
      return;
    }
    if (this.style === 'short' || this.style === 'spiky') {
      // 짧은 머리: 앞머리 + 옆머리, 웃는 입
      px(7, 0, 10, 1, this.pal.hair);
      px(6, 1, 12, 5, this.pal.hair);
      px(7, 5, 3, 2, this.pal.hair);
      px(14, 5, 3, 2, this.pal.hair);
      px(5, 3, 3, 7, this.pal.hair);
      px(16, 3, 3, 7, this.pal.hair);
      px(8, 2, 4, 1, this.pal.hairHi);
      px(8, 8, 2, 1, this.pal.hair);
      px(14, 8, 2, 1, this.pal.hair);
      px(9, 9, 1, 2, this.pal.eye);
      px(14, 9, 1, 2, this.pal.eye);
      px(8, 11, 2, 1, this.pal.blush);
      px(14, 11, 2, 1, this.pal.blush);
      px(10, 13, 4, 1, '#b5523f');
      if (this.style === 'spiky') {
        // 세운 머리 결 + 짙은 눈썹 + 콧수염·턱수염
        px(7, 0, 2, 1, this.pal.hairHi);
        px(11, 0, 2, 1, this.pal.hairHi);
        px(15, 1, 2, 1, this.pal.hairHi);
        px(8, 7, 3, 1, this.pal.hair);
        px(13, 7, 3, 1, this.pal.hair);
        px(9, 12, 6, 1, this.pal.hair);
        px(10, 13, 4, 2, this.pal.hair);
      }
      return;
    }
    // 단발 웨이브 머리
    px(6, 1, 12, 5, this.pal.hair);
    px(7, 5, 3, 2, this.pal.hair);
    px(12, 5, 5, 2, this.pal.hair);
    px(5, 3, 3, 13, this.pal.hair);
    px(16, 3, 3, 13, this.pal.hair);
    px(4, 13, 2, 3, this.pal.hair);
    px(18, 13, 2, 3, this.pal.hair);
    px(8, 2, 4, 1, this.pal.hairHi);
    px(5, 5, 1, 4, this.pal.hairHi);
    // 눈썹, 눈, 볼터치, 입술, 귀걸이
    px(8, 8, 2, 1, this.pal.hair);
    px(14, 8, 2, 1, this.pal.hair);
    px(9, 9, 1, 2, this.pal.eye);
    px(14, 9, 1, 2, this.pal.eye);
    px(8, 11, 2, 1, this.pal.blush);
    px(14, 11, 2, 1, this.pal.blush);
    px(11, 13, 2, 1, this.pal.lip);
    px(7, 12, 1, 1, this.pal.silver);
    px(16, 12, 1, 1, this.pal.silver);
    if (this.style === 'long') {
      // 어깨 아래로 흐르는 긴 웨이브
      px(4, 15, 3, 9, this.pal.hair);
      px(17, 15, 3, 9, this.pal.hair);
      px(4, 17, 1, 5, this.pal.hairHi);
      px(5, 23, 2, 2, this.pal.hair);
      px(17, 23, 2, 2, this.pal.hair);
    }
  }

  private drawBack(px: (x: number, y: number, w: number, h: number, c: string) => void, f: number, a: number) {
    const lift1 = f === 1 ? 1 : 0;
    const lift2 = f === 2 ? 1 : 0;
    px(8, 28, 4, 5 - lift1, this.pal.pants);
    px(12, 28, 4, 5 - lift2, this.pal.pants);
    px(7, 33 - lift1, 5, 2, this.pal.shoe);
    px(12, 33 - lift2, 5, 2, this.pal.shoe);
    px(6, 16, 12, 13, this.pal.blazer);
    px(6, 16, 12, 1, this.pal.blazerHi);
    px(6, 27, 12, 2, this.pal.blazerSh);
    px(12, 17, 1, 10, this.pal.blazerSh);
    px(4, 17 - a, 3, 10, this.pal.blazer);
    px(4, 26 - a, 3, 2, this.pal.skin);
    px(17, 17 + a, 3, 10, this.pal.blazer);
    px(17, 26 + a, 3, 2, this.pal.skin);
    px(10, 14, 4, 3, this.pal.skinSh);
    px(7, 3, 10, 12, this.pal.skin);
    if (this.style === 'cap') {
      px(6, 22, 12, 1, this.pal.white);
      px(7, 0, 10, 1, CAP);
      px(6, 1, 12, 7, CAP);
      px(6, 1, 12, 1, CAP_HI);
      px(5, 8, 14, 1, CAP_SH);
      px(7, 9, 10, 5, this.pal.hair);
      return;
    }
    if (this.style === 'short' || this.style === 'spiky') {
      px(5, 1, 14, 12, this.pal.hair);
      px(8, 2, 5, 1, this.pal.hairHi);
      return;
    }
    // 뒷머리: 전체를 덮는 단발 웨이브
    px(5, 1, 14, this.style === 'long' ? 23 : 15, this.pal.hair);
    px(4, 13, 2, 3, this.pal.hair);
    px(18, 13, 2, 3, this.pal.hair);
    px(8, 2, 5, 1, this.pal.hairHi);
    px(7, 6, 1, 6, this.pal.hairHi);
  }

  /** 왼쪽을 보는 모습. 오른쪽은 px가 좌우 반전해서 그린다. */
  private drawSide(px: (x: number, y: number, w: number, h: number, c: string) => void, f: number, a: number) {
    // 다리 (걸을 때 앞뒤로 벌어짐)
    if (f === 0) {
      px(9, 28, 6, 5, this.pal.pants);
      px(7, 33, 8, 2, this.pal.shoe);
    } else {
      const frontLift = f === 2 ? 1 : 0;
      const backLift = f === 1 ? 1 : 0;
      px(6, 28, 4, 5 - frontLift, this.pal.pants);
      px(4, 33 - frontLift, 6, 2, this.pal.shoe);
      px(13, 28, 4, 5 - backLift, this.pal.pants);
      px(12, 33 - backLift, 6, 2, this.pal.shoe);
    }
    // 몸
    px(8, 16, 9, 13, this.pal.blazer);
    px(8, 16, 9, 1, this.pal.blazerHi);
    px(8, 27, 9, 2, this.pal.blazerSh);
    px(8, 16, 2, 6, this.pal.white);
    // 팔 (앞뒤로 흔들림)
    px(10 + a, 17, 4, 10, this.pal.blazerHi);
    px(10 + a, 26, 4, 2, this.pal.skin);
    // 목, 얼굴
    px(9, 14, 4, 3, this.pal.skinSh);
    px(6, 3, 10, 12, this.pal.skin);
    if (this.style === 'cap') {
      // 남자 배달부(옆모습): 앞으로 튀어나온 모자 챙 + 뒤쪽 짧은 머리
      px(8, 22, 9, 1, this.pal.white);
      px(6, 0, 10, 1, CAP);
      px(5, 1, 12, 5, CAP);
      px(5, 1, 12, 1, CAP_HI);
      px(2, 5, 7, 2, CAP_SH);
      px(5, 6, 12, 1, CAP_SH);
      px(12, 7, 4, 6, this.pal.hair);
      px(10, 10, 2, 2, this.pal.skinSh);
      px(6, 8, 2, 1, this.pal.hair);
      px(7, 9, 1, 2, this.pal.eye);
      px(6, 13, 2, 1, '#b5523f');
      return;
    }
    if (this.style === 'short' || this.style === 'spiky') {
      px(5, 1, 12, 5, this.pal.hair);
      px(10, 3, 6, 9, this.pal.hair);
      px(6, 5, 3, 2, this.pal.hair);
      px(11, 2, 4, 1, this.pal.hairHi);
      px(10, 10, 2, 2, this.pal.skinSh);
      px(6, 8, 2, 1, this.pal.hair);
      px(7, 9, 1, 2, this.pal.eye);
      px(7, 11, 1, 1, this.pal.blush);
      px(6, 13, 2, 1, '#b5523f');
      if (this.style === 'spiky') {
        px(6, 12, 2, 1, this.pal.hair);
        px(7, 13, 3, 2, this.pal.hair);
        px(6, 7, 3, 1, this.pal.hair);
      }
      return;
    }
    // 머리: 뒤쪽으로 풍성한 단발
    px(5, 1, 12, 5, this.pal.hair);
    px(10, 3, 7, this.style === 'long' ? 20 : 13, this.pal.hair);
    px(15, 13, 3, 3, this.pal.hair);
    px(6, 5, 3, 3, this.pal.hair);
    px(11, 2, 4, 1, this.pal.hairHi);
    // 눈, 볼터치, 입술, 귀걸이
    px(7, 9, 1, 2, this.pal.eye);
    px(6, 8, 2, 1, this.pal.hair);
    px(7, 11, 1, 1, this.pal.blush);
    px(6, 13, 2, 1, this.pal.lip);
    px(11, 12, 1, 1, this.pal.silver);
  }

  // ───────────────────────── 병아리 캐릭터 ─────────────────────────

  /** 병아리 3마리: 동글한 노란 머리 + 옷 입은 몸. 교수님과 같은 크기·외곽선·걷기 프레임 */
  private makeChick(key: string, d: ChickDef) {
    const cols = 3;
    const W = PLAYER_FRAME_W * cols;
    const H = PLAYER_FRAME_H * DIRS.length;
    const { tex, ctx } = this.canvas(key, W, H);
    DIRS.forEach((dir, row) => {
      for (let f = 0; f < cols; f++) {
        const ox = f * PLAYER_FRAME_W;
        const oy = row * PLAYER_FRAME_H;
        const mirror = dir === 'right';
        const px = (x: number, y: number, w: number, h: number, color: string) => {
          const X = mirror ? 24 - x - w : x;
          ctx.fillStyle = color;
          ctx.fillRect(ox + 1 + X, oy + 1 + y, w, h);
        };
        this.drawChick(px, dir, f, d);
      }
    });
    outline(ctx, W, H);
    DIRS.forEach((dir, row) => {
      for (let f = 0; f < cols; f++) {
        const ox = f * PLAYER_FRAME_W;
        const oy = row * PLAYER_FRAME_H;
        groundShadow(ctx, ox + 13, oy + 36, 8, 2.4);
        tex.add(`${dir}_${f}`, 0, ox, oy, PLAYER_FRAME_W, PLAYER_FRAME_H);
      }
    });
    tex.refresh();
    for (const dir of DIRS) {
      this.anims.create({
        key: `${key}_walk_${dir}`,
        frames: [1, 0, 2, 0].map((f) => ({ key, frame: `${dir}_${f}` })),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  /** 703호 닭싸움 상대: 빨간 체육복을 입은 황소 선배 (병아리와 같은 틀: 26x38, 4방향 x 3프레임) */
  private makeBull(key: string) {
    const cols = 3;
    const W = PLAYER_FRAME_W * cols;
    const H = PLAYER_FRAME_H * DIRS.length;
    const { tex, ctx } = this.canvas(key, W, H);
    DIRS.forEach((dir, row) => {
      for (let f = 0; f < cols; f++) {
        const ox = f * PLAYER_FRAME_W;
        const oy = row * PLAYER_FRAME_H;
        const mirror = dir === 'right';
        const px = (x: number, y: number, w: number, h: number, color: string) => {
          const X = mirror ? 24 - x - w : x;
          ctx.fillStyle = color;
          ctx.fillRect(ox + 1 + X, oy + 1 + y, w, h);
        };
        drawBull(px, dir, f);
      }
    });
    outline(ctx, W, H);
    DIRS.forEach((dir, row) => {
      for (let f = 0; f < cols; f++) {
        const ox = f * PLAYER_FRAME_W;
        const oy = row * PLAYER_FRAME_H;
        groundShadow(ctx, ox + 13, oy + 36, 9, 2.6);
        tex.add(`${dir}_${f}`, 0, ox, oy, PLAYER_FRAME_W, PLAYER_FRAME_H);
      }
    });
    tex.refresh();
    for (const dir of DIRS) {
      this.anims.create({
        key: `${key}_walk_${dir}`,
        frames: [1, 0, 2, 0].map((f) => ({ key, frame: `${dir}_${f}` })),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  private drawChick(px: (x: number, y: number, w: number, h: number, c: string) => void, dir: Dir, f: number, d: ChickDef) {
    const bob = f === 0 ? 0 : 1; // 걸을 때 통통 튄다
    const lift1 = f === 1 ? 1 : 0;
    const lift2 = f === 2 ? 1 : 0;
    const row = (cx: number, y: number, hw: number, c: string) => px(cx - hw, y, hw * 2, 1, c);
    const head = (cx: number, cy: number, r: number, c: string) => {
      for (let y = -r; y <= r; y++) row(cx, cy + y, Math.floor(Math.sqrt(r * r - y * y) + 0.5), c);
    };
    const front = dir === 'down';
    const back = dir === 'up';
    const side = !front && !back;
    const oy = -bob; // 몸 전체 위로

    // 발(주황) — 치마/바지 아래로 짧은 다리
    if (side) {
      px(9, 31 - lift1, 2, 3 + lift1, CHICK_ORANGE);
      px(13, 31 - lift2, 2, 3 + lift2, CHICK_ORANGE);
      px(7, 34 - lift1, 5, 1, CHICK_ORANGE);
      px(12, 34 - lift2, 5, 1, CHICK_ORANGE);
      if (d.shoes) {
        px(7, 33 - lift1, 5, 2, d.shoes);
        px(12, 33 - lift2, 5, 2, d.shoes);
      }
    } else {
      px(8, 31 - lift1, 2, 3 + lift1, CHICK_ORANGE);
      px(14, 31 - lift2, 2, 3 + lift2, CHICK_ORANGE);
      px(6, 34 - lift1, 5, 1, CHICK_ORANGE);
      px(13, 34 - lift2, 5, 1, CHICK_ORANGE);
      if (d.shoes) {
        px(6, 33 - lift1, 5, 2, d.shoes);
        px(13, 33 - lift2, 5, 2, d.shoes);
      }
    }
    // 꼬리깃(뒤·옆)
    if (back) px(10, 24 + oy, 4, 4, CHICK_BODY_SH);
    if (side) px(16, 22 + oy, 3, 4, CHICK_BODY_SH);

    // 몸 + 옷 (작고 통통)
    px(7, 21 + oy, 10, 9, d.cloth);
    px(7, 21 + oy, 10, 1, d.clothHi);
    px(7, 28 + oy, 10, 2, d.skirt ? d.bottom : d.clothSh);
    if (d.skirt) {
      px(6, 28 + oy, 12, 3, d.bottom);
      px(6, 30 + oy, 12, 1, '#1d2238');
    } else {
      px(7, 28 + oy, 10, 3, d.bottom);
    }
    if (front) {
      px(10, 21 + oy, 4, 6, d.inner); // 안에 입은 옷
      px(11, 27 + oy, 2, 1, d.inner);
      px(9, 22 + oy, 1, 5, d.clothHi);
      px(14, 22 + oy, 1, 5, d.clothHi);
    }
    // 날개(팔)
    if (front || back) {
      px(4, 22 + oy + (f === 1 ? 1 : 0), 3, 7, CHICK_BODY);
      px(4, 22 + oy + (f === 1 ? 1 : 0), 1, 7, CHICK_BODY_HI);
      px(17, 22 + oy + (f === 2 ? 1 : 0), 3, 7, CHICK_BODY);
      px(19, 22 + oy + (f === 2 ? 1 : 0), 1, 7, CHICK_BODY_SH);
      px(4, 22 + oy, 3, 3, d.cloth); // 소매
      px(17, 22 + oy, 3, 3, d.cloth);
    } else {
      px(10, 22 + oy, 4, 7, d.cloth);
      px(10, 27 + oy, 4, 2, CHICK_BODY);
    }

    // 머리(노란 동그라미 r=8)
    const hy = 11 + oy;
    head(12, hy, 8, CHICK_BODY);
    head(10, hy - 2, 4, CHICK_BODY_HI);
    px(6, hy + 5, 12, 1, CHICK_BODY_SH);
    const hairBack = () => {
      // 뒷머리/옆머리
      if (d.hair === 'long') {
        px(4, hy - 9, 16, 4, d.hairC);
        px(3, hy - 6, 18, 11, d.hairC);
        px(2, hy - 2, 4, 15, d.hairC);
        px(18, hy - 2, 4, 15, d.hairC);
        px(3, hy + 9, 3, 3, d.hairC);
        px(18, hy + 9, 3, 3, d.hairC);
        px(6, hy - 5, 4, 1, d.hairHi);
      } else if (d.hair === 'messy') {
        px(4, hy - 8, 16, 8, d.hairC);
        px(3, hy - 4, 3, 5, d.hairC);
        px(18, hy - 4, 3, 5, d.hairC);
        px(7, hy - 8, 3, 1, d.hairHi);
      } else {
        px(5, hy - 8, 14, 8, d.hairC);
        px(4, hy - 4, 3, 5, d.hairC);
        px(17, hy - 4, 3, 5, d.hairC);
        // 세운 머리 결
        px(5, hy - 10, 3, 3, d.hairC);
        px(10, hy - 11, 3, 4, d.hairC);
        px(15, hy - 10, 3, 3, d.hairC);
        px(10, hy - 10, 2, 1, d.hairHi);
      }
    };

    if (back) {
      head(12, hy, 8, d.hairC);
      hairBack();
      px(8, hy - 6, 5, 1, d.hairHi);
      return;
    }
    if (front) {
      hairBack();
      // 앞머리 일부를 노란 얼굴 위에 덮는다
      const faceTop = hy - 4;
      px(5, faceTop + 1, 14, 6, CHICK_BODY);
      px(6, faceTop + 5, 12, 1, CHICK_BODY_SH);
      if (d.hair === 'long') {
        px(5, hy - 9, 14, 4, d.hairC); // 정수리까지 덮는 머리
        px(5, hy - 6, 6, 3, d.hairC); // 가르마 앞머리
        px(11, hy - 6, 8, 2, d.hairC);
        px(4, hy - 4, 3, 7, d.hairC);
        px(17, hy - 4, 3, 7, d.hairC);
      } else if (d.hair === 'messy') {
        px(5, hy - 6, 14, 3, d.hairC);
        px(7, hy - 3, 3, 1, d.hairC);
        px(14, hy - 3, 4, 1, d.hairC);
      } else {
        px(6, hy - 6, 12, 3, d.hairC);
        px(8, hy - 3, 3, 1, d.hairC);
        px(14, hy - 3, 3, 1, d.hairC);
      }
      // 얼굴: 눈, 볼터치, 부리
      if (d.grumpy) {
        px(7, hy - 1, 4, 1, '#2a2024');
        px(13, hy - 1, 4, 1, '#2a2024');
        px(8, hy + 1, 2, 2, '#2a2024');
        px(14, hy + 1, 2, 2, '#2a2024');
      } else if (d.hair === 'long') {
        px(7, hy, 3, 3, '#2a2024');
        px(14, hy, 3, 3, '#2a2024');
        px(8, hy, 1, 1, '#ffffff');
        px(15, hy, 1, 1, '#ffffff');
        px(6, hy - 1, 2, 1, '#2a2024'); // 속눈썹
        px(16, hy - 1, 2, 1, '#2a2024');
      } else {
        px(8, hy, 2, 2, '#2a2024');
        px(14, hy, 2, 2, '#2a2024');
        px(8, hy - 1, 3, 1, '#2a2024'); // 졸린 눈꺼풀
        px(14, hy - 1, 3, 1, '#2a2024');
      }
      px(5, hy + 3, 2, 2, '#f7a36a');
      px(17, hy + 3, 2, 2, '#f7a36a');
      px(11, hy + 3, 2, 1, CHICK_ORANGE);
      px(11, hy + 4, 2, 1, '#d77f1c');
      const beard = d.beard ?? (d.goatee ? 1 : 0);
      if (beard === 1) {
        px(9, hy + 5, 6, 1, d.hairC);
        px(10, hy + 6, 4, 2, d.hairC);
      } else if (beard === 2) {
        px(7, hy + 5, 10, 4, d.hairC);
        px(8, hy + 9, 8, 3, d.hairC);
        px(10, hy + 12, 4, 2, d.hairC);
        px(9, hy + 6, 1, 4, d.hairHi);
        px(13, hy + 7, 1, 4, d.hairHi);
      } else if (beard === 3) {
        // 산신령처럼 바닥까지 닿는 수염
        px(6, hy + 5, 12, 5, d.hairC);
        px(7, hy + 10, 10, 8, d.hairC);
        px(8, hy + 18, 8, 5, d.hairC);
        px(9, hy + 23, 6, 1, d.hairC);
        px(9, hy + 6, 1, 14, d.hairHi);
        px(13, hy + 8, 1, 13, d.hairHi);
        px(16, hy + 6, 1, 6, d.hairHi);
      }
      return;
    }
    // 옆모습(왼쪽을 봄, 오른쪽은 px가 반전)
    hairBack();
    px(3, hy - 4, 9, 9, CHICK_BODY);
    px(2, hy + 2, 3, 2, CHICK_ORANGE); // 부리
    if (d.hair === 'long') {
      px(4, hy - 9, 12, 4, d.hairC);
      px(4, hy - 6, 8, 3, d.hairC);
      px(12, hy - 3, 8, 14, d.hairC);
    } else if (d.hair === 'messy') {
      px(4, hy - 6, 10, 3, d.hairC);
    } else {
      px(4, hy - 6, 10, 3, d.hairC);
    }
    px(6, hy, 2, 3, '#2a2024');
    px(4, hy + 3, 2, 2, '#f7a36a');
    const beardS = d.beard ?? (d.goatee ? 1 : 0);
    if (beardS === 1) px(5, hy + 5, 4, 3, d.hairC);
    else if (beardS === 2) {
      px(4, hy + 5, 7, 5, d.hairC);
      px(5, hy + 10, 4, 2, d.hairC);
    } else if (beardS === 3) {
      px(3, hy + 5, 9, 8, d.hairC);
      px(4, hy + 13, 7, 8, d.hairC);
      px(5, hy + 21, 5, 3, d.hairC);
      px(5, hy + 7, 1, 12, d.hairHi);
    }
  }

  // ───────────────────────── 나무와 소품 ─────────────────────────

  private makeTrees() {
    // 참나무 (32x44), 발치가 아래 중앙
    {
      const { tex, ctx } = this.canvas('tree_oak', 32, 44);
      ctx.fillStyle = '#7a5233';
      ctx.fillRect(13, 28, 6, 14);
      ctx.fillStyle = '#68452a';
      ctx.fillRect(16, 28, 3, 14);
      ctx.fillRect(11, 40, 10, 2);
      disc(ctx, 16, 17, 14, '#2f7d3a');
      disc(ctx, 14, 15, 12, '#3f9a47');
      disc(ctx, 11, 11, 6, '#58b45c');
      ctx.fillStyle = '#2f7d3a';
      for (const [x, y] of [[8, 20], [20, 22], [14, 25], [22, 14]]) ctx.fillRect(x, y, 3, 2);
      ctx.fillStyle = '#7ccb74';
      for (const [x, y] of [[9, 9], [14, 7], [6, 14]]) ctx.fillRect(x, y, 2, 2);
      outline(ctx, 32, 44);
      groundShadow(ctx, 16, 42, 11, 3);
      tex.refresh();
    }
    // 소나무 (28x46)
    {
      const { tex, ctx } = this.canvas('tree_pine', 28, 46);
      ctx.fillStyle = '#6b4a2b';
      ctx.fillRect(12, 36, 4, 8);
      const tiers = [
        { y: 3, hw: 7 },
        { y: 12, hw: 10 },
        { y: 21, hw: 12 },
        { y: 29, hw: 13 },
      ];
      tiers.forEach((t, i) => {
        const h = 12;
        for (let r = 0; r < h; r++) {
          const hw = Math.round(1 + (r / (h - 1)) * t.hw);
          ctx.fillStyle = i % 2 === 0 ? '#2c7a4b' : '#35905a';
          ctx.fillRect(14 - hw, t.y + r, hw * 2, 1);
          ctx.fillStyle = '#4bb06f';
          ctx.fillRect(14 - hw, t.y + r, Math.min(2, hw), 1);
        }
        ctx.fillStyle = '#1f5c39';
        ctx.fillRect(14 - t.hw, t.y + h - 1, t.hw * 2, 1);
      });
      outline(ctx, 28, 46);
      groundShadow(ctx, 14, 44, 10, 2.6);
      tex.refresh();
    }
  }

  private makeProps() {
    // 덤불 (20x14)
    {
      const { tex, ctx } = this.canvas('bush', 20, 14);
      disc(ctx, 6, 8, 5, '#2f7d3a');
      disc(ctx, 14, 8, 5, '#2f7d3a');
      disc(ctx, 10, 6, 6, '#3f9a47');
      disc(ctx, 8, 4, 2, '#58b45c');
      ctx.fillStyle = '#ff9fb8';
      for (const [x, y] of [[5, 8], [12, 5], [15, 9], [9, 10]]) ctx.fillRect(x, y, 2, 2);
      outline(ctx, 20, 14);
      groundShadow(ctx, 10, 12, 9, 2);
      tex.refresh();
    }
    // 가로등 (10x30)
    {
      const { tex, ctx } = this.canvas('lamp', 10, 30);
      ctx.fillStyle = '#4a4a58';
      ctx.fillRect(4, 9, 2, 18);
      ctx.fillRect(2, 26, 6, 3);
      ctx.fillStyle = '#ffe9a8';
      ctx.fillRect(2, 3, 6, 6);
      ctx.fillStyle = '#fff6d0';
      ctx.fillRect(3, 4, 2, 2);
      ctx.fillStyle = '#4a4a58';
      ctx.fillRect(1, 2, 8, 1);
      ctx.fillRect(1, 9, 8, 1);
      outline(ctx, 10, 30);
      groundShadow(ctx, 5, 28, 5, 1.6);
      tex.refresh();
    }
    // 벤치 (24x14)
    {
      const { tex, ctx } = this.canvas('bench', 24, 14);
      ctx.fillStyle = '#b8834d';
      ctx.fillRect(1, 2, 22, 3);
      ctx.fillStyle = '#a9733f';
      ctx.fillRect(1, 6, 22, 3);
      ctx.fillStyle = '#5a3a22';
      ctx.fillRect(3, 9, 2, 4);
      ctx.fillRect(19, 9, 2, 4);
      outline(ctx, 24, 14);
      groundShadow(ctx, 12, 13, 11, 1.6);
      tex.refresh();
    }
    // 화단 (22x12)
    {
      const { tex, ctx } = this.canvas('flowerbed', 22, 12);
      ctx.fillStyle = '#6b4a2b';
      ctx.fillRect(1, 5, 20, 6);
      ctx.fillStyle = '#3f9a47';
      for (let x = 2; x < 20; x += 4) ctx.fillRect(x, 3, 2, 4);
      const colors = ['#ff9fb8', '#ffe066', '#fff4f0', '#ff9fb8'];
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(2 + i * 4, 2 + (i % 2), 2, 2);
      }
      outline(ctx, 22, 12);
      tex.refresh();
    }
  }


  /** 실내 오브젝트: 책장, 문, 화분 */
  private makeInterior() {
    // 책장 (32x44)
    {
      const { tex, ctx } = this.canvas('bookshelf', 32, 44);
      ctx.fillStyle = '#7a5233';
      ctx.fillRect(0, 0, 32, 42);
      ctx.fillStyle = '#4a2f1d';
      ctx.fillRect(2, 2, 28, 38);
      const colors = ['#d94b3a', '#4f8fd0', '#e8b84a', '#5aa86a', '#9b6bc4', '#e8e0cc'];
      for (let r = 0; r < 3; r++) {
        const y = 3 + r * 12;
        let x = 3;
        let i = r * 2;
        while (x < 28) {
          const bw = 2 + ((i * 7) % 3);
          ctx.fillStyle = colors[i % colors.length];
          ctx.fillRect(x, y + (i % 3), bw, 9 - (i % 3));
          x += bw + 1;
          i++;
        }
        ctx.fillStyle = '#7a5233';
        ctx.fillRect(2, y + 10, 28, 2);
      }
      outline(ctx, 32, 44);
      groundShadow(ctx, 16, 43, 14, 2);
      tex.refresh();
    }
    // 문 (32x36)
    {
      const { tex, ctx } = this.canvas('door_inner', 32, 36);
      ctx.fillStyle = '#f0e2c4';
      ctx.fillRect(0, 0, 32, 36);
      ctx.fillStyle = '#6a4630';
      ctx.fillRect(4, 4, 24, 32);
      ctx.fillStyle = '#7d5539';
      ctx.fillRect(6, 6, 9, 13);
      ctx.fillRect(17, 6, 9, 13);
      ctx.fillRect(6, 21, 9, 13);
      ctx.fillRect(17, 21, 9, 13);
      ctx.fillStyle = '#ffd25e';
      ctx.fillRect(14, 20, 2, 3);
      ctx.fillRect(17, 20, 2, 3);
      outline(ctx, 32, 36);
      tex.refresh();
    }
    // 화분 (14x24)
    {
      const { tex, ctx } = this.canvas('plant', 14, 24);
      disc(ctx, 7, 9, 5, '#2f7d3a');
      disc(ctx, 5, 8, 3, '#3f9a47');
      disc(ctx, 10, 7, 3, '#58b45c');
      ctx.fillStyle = '#3f9a47';
      ctx.fillRect(6, 12, 2, 6);
      ctx.fillStyle = '#b8693f';
      ctx.fillRect(3, 17, 8, 6);
      ctx.fillStyle = '#d58355';
      ctx.fillRect(3, 17, 8, 1);
      outline(ctx, 14, 24);
      groundShadow(ctx, 7, 23, 6, 1.5);
      tex.refresh();
    }
  }


  /** 캠퍼스 야외 오브젝트: 안내판, 자판기, 딸기파르페 아이템 */
  private makeCampusObjects() {
    // 안내판 (18x28)
    {
      const { tex, ctx } = this.canvas('sign', 18, 28);
      ctx.fillStyle = '#7a5233';
      ctx.fillRect(8, 12, 3, 14);
      ctx.fillStyle = '#c99a63';
      ctx.fillRect(1, 2, 16, 12);
      ctx.fillStyle = '#e0b87c';
      ctx.fillRect(1, 2, 16, 2);
      ctx.fillStyle = '#7a5233';
      ctx.fillRect(1, 13, 16, 1);
      ctx.fillStyle = '#5a3a22';
      // 위 화살표(→), 아래 화살표(←)
      ctx.fillRect(3, 5, 9, 1);
      ctx.fillRect(11, 4, 1, 3);
      ctx.fillRect(12, 5, 1, 1);
      ctx.fillRect(6, 9, 9, 1);
      ctx.fillRect(5, 8, 1, 3);
      ctx.fillRect(4, 9, 1, 1);
      outline(ctx, 18, 28);
      groundShadow(ctx, 9, 26, 6, 1.6);
      tex.refresh();
    }
    // 자판기 (18x30)
    {
      const { tex, ctx } = this.canvas('vending', 18, 30);
      ctx.fillStyle = '#3f7fbf';
      ctx.fillRect(1, 1, 16, 27);
      ctx.fillStyle = '#5a9bd8';
      ctx.fillRect(1, 1, 16, 2);
      ctx.fillStyle = '#bfe8f5';
      ctx.fillRect(3, 4, 12, 13);
      const cans = ['#d94b3a', '#ffd25e', '#5aa86a', '#e8e0cc'];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.fillStyle = cans[(r + c) % cans.length];
          ctx.fillRect(4 + c * 3, 5 + r * 4, 2, 3);
        }
      }
      ctx.fillStyle = '#2d5f8f';
      ctx.fillRect(3, 19, 12, 4);
      ctx.fillStyle = '#ffd25e';
      ctx.fillRect(12, 20, 2, 2);
      ctx.fillStyle = '#1a2f46';
      ctx.fillRect(4, 24, 10, 3);
      outline(ctx, 18, 30);
      groundShadow(ctx, 9, 29, 8, 1.8);
      tex.refresh();
    }
    // 파르페 표지판 (22x30): 분홍 테두리 판 위에 딸기파르페 그림
    {
      const { tex, ctx } = this.canvas('parfait_sign', 22, 30);
      ctx.fillStyle = '#7a5233';
      ctx.fillRect(10, 18, 3, 11);
      ctx.fillStyle = '#e0708f';
      ctx.fillRect(1, 1, 20, 19);
      ctx.fillStyle = '#fffaf0';
      ctx.fillRect(3, 3, 16, 15);
      ctx.fillStyle = '#e03b4d';
      ctx.fillRect(8, 4, 3, 3);
      ctx.fillRect(11, 3, 3, 4);
      ctx.fillRect(14, 5, 2, 2);
      ctx.fillStyle = '#fff6f0';
      ctx.fillRect(7, 7, 8, 2);
      ctx.fillStyle = '#ffb3c7';
      ctx.fillRect(6, 9, 10, 2);
      ctx.fillStyle = '#fff6f0';
      ctx.fillRect(6, 11, 10, 2);
      ctx.fillStyle = '#ff8fb0';
      ctx.fillRect(6, 13, 10, 2);
      ctx.fillStyle = '#cfe3ee';
      ctx.fillRect(7, 15, 8, 2);
      outline(ctx, 22, 30);
      groundShadow(ctx, 11, 28, 7, 1.6);
      tex.refresh();
    }
    // 딸기파르페 아이템 (14x18)
    {
      const { tex, ctx } = this.canvas('parfait', 14, 18);
      ctx.fillStyle = '#e03b4d';
      ctx.fillRect(4, 2, 3, 3);
      ctx.fillRect(7, 1, 3, 4);
      ctx.fillStyle = '#4fa65a';
      ctx.fillRect(6, 0, 3, 1);
      ctx.fillStyle = '#fff6f0';
      ctx.fillRect(3, 5, 8, 2);
      ctx.fillRect(2, 9, 10, 2);
      ctx.fillStyle = '#ffb3c7';
      ctx.fillRect(2, 7, 10, 2);
      ctx.fillStyle = '#ff8fb0';
      ctx.fillRect(2, 11, 10, 2);
      ctx.fillStyle = '#e6f4fa';
      ctx.fillRect(3, 13, 8, 2);
      ctx.fillStyle = '#cfd8e0';
      ctx.fillRect(6, 15, 2, 1);
      ctx.fillRect(4, 16, 6, 1);
      ctx.fillStyle = '#ffd25e';
      ctx.fillRect(0, 3, 1, 3);
      ctx.fillRect(-1, 4, 3, 1);
      ctx.fillRect(13, 8, 1, 3);
      outline(ctx, 14, 18);
      groundShadow(ctx, 7, 17, 5, 1.2);
      tex.refresh();
    }
  }


  /** 이벤트 연출용: 하트·음표 말풍선, 피자 상자 */
  private makeEvent() {
    // 하트 말풍선 (12x15)
    {
      const { tex, ctx } = this.canvas('emote_heart', 12, 15);
      ctx.fillStyle = '#fffdf2';
      ctx.fillRect(1, 1, 10, 10);
      ctx.fillRect(4, 11, 4, 2);
      ctx.fillStyle = '#ef5a7a';
      ctx.fillRect(3, 3, 2, 2);
      ctx.fillRect(7, 3, 2, 2);
      ctx.fillRect(3, 4, 6, 2);
      ctx.fillRect(4, 6, 4, 1);
      ctx.fillRect(5, 7, 2, 1);
      outline(ctx, 12, 15);
      tex.refresh();
    }
    // 음표 말풍선 (12x15)
    {
      const { tex, ctx } = this.canvas('emote_note', 12, 15);
      ctx.fillStyle = '#fffdf2';
      ctx.fillRect(1, 1, 10, 10);
      ctx.fillRect(4, 11, 4, 2);
      ctx.fillStyle = '#4f8fd0';
      ctx.fillRect(6, 2, 1, 6);
      ctx.fillRect(6, 2, 3, 1);
      ctx.fillRect(8, 3, 1, 2);
      ctx.fillRect(4, 7, 3, 2);
      outline(ctx, 12, 15);
      tex.refresh();
    }
    // 피자 상자 (20x14)
    {
      const { tex, ctx } = this.canvas('pizza_box', 20, 14);
      ctx.fillStyle = '#c98f4f';
      ctx.fillRect(0, 3, 20, 10);
      ctx.fillStyle = '#e8b57d';
      ctx.fillRect(0, 1, 20, 4);
      ctx.fillStyle = '#a9733f';
      ctx.fillRect(0, 12, 20, 1);
      // 상자 위 피자 그림
      ctx.fillStyle = '#ffd25e';
      ctx.fillRect(7, 5, 6, 5);
      ctx.fillRect(8, 10, 4, 1);
      ctx.fillStyle = '#d94b3a';
      ctx.fillRect(8, 6, 1, 1);
      ctx.fillRect(11, 7, 1, 1);
      ctx.fillRect(9, 9, 1, 1);
      outline(ctx, 20, 14);
      groundShadow(ctx, 10, 13, 8, 1.2);
      tex.refresh();
    }
  }

  /** 상호작용 가능 표시 말풍선 (!) */
  private makeBubble() {
    const { tex, ctx } = this.canvas('bubble', 12, 15);
    ctx.fillStyle = '#fffdf2';
    ctx.fillRect(1, 1, 10, 10);
    ctx.fillRect(4, 11, 4, 2);
    ctx.fillStyle = '#d0453b';
    ctx.fillRect(5, 3, 2, 4);
    ctx.fillRect(5, 8, 2, 2);
    outline(ctx, 12, 15);
    tex.refresh();
  }

  /** 탭한 곳에 보이는 작은 마커 */
  private makeMarker() {
    const { tex, ctx } = this.canvas('marker', 14, 14);
    ctx.strokeStyle = '#fff6d8';
    ctx.lineWidth = 1;
    ctx.strokeRect(1.5, 1.5, 11, 11);
    ctx.fillStyle = '#ffd25e';
    ctx.fillRect(6, 6, 2, 2);
    tex.refresh();
  }
}

/** 황소 선배 한 프레임 (좌표는 24x36 안쪽). 갈색 털, 하얀 뿔, 코뚜레, 빨간 체육복 */
function drawBull(px: (x: number, y: number, w: number, h: number, c: string) => void, dir: Dir, f: number) {
  const FUR = '#8a5a34';
  const FUR_HI = '#a8743f';
  const FUR_SH = '#6a4226';
  const MUZZLE = '#e2b98a';
  const HORN = '#f2e8d0';
  const HORN_SH = '#cfc2a0';
  const JERSEY = '#d94b3a';
  const JERSEY_HI = '#ef6a58';
  const PANTS = '#2f3a5a';
  const HOOF = '#3a2a20';
  const lift1 = f === 1 ? 1 : 0;
  const lift2 = f === 2 ? 1 : 0;
  const oy = f === 0 ? 0 : -1;
  const front = dir === 'down';
  const back = dir === 'up';
  const side = !front && !back;

  // 다리(체육복 바지) + 발굽
  px(6, 28 - lift1, 5, 6 + lift1, PANTS);
  px(13, 28 - lift2, 5, 6 + lift2, PANTS);
  px(6, 33, 5, 2, HOOF);
  px(13, 33, 5, 2, HOOF);
  // 몸통(빨간 체육복, 흰 줄)
  px(4, 17 + oy, 16, 12, JERSEY);
  px(4, 17 + oy, 16, 2, JERSEY_HI);
  if (!side) {
    px(4, 20 + oy, 1, 8, '#ffffff');
    px(19, 20 + oy, 1, 8, '#ffffff');
  }
  if (front) {
    px(10, 17 + oy, 4, 3, MUZZLE); // 목
    px(11, 21 + oy, 2, 7, '#ffffff'); // 지퍼
  }
  if (back) {
    px(9, 20 + oy, 6, 6, '#ffffff'); // 등번호 판
    px(11, 21 + oy, 2, 4, JERSEY);
  }
  // 팔(털) + 소매
  if (side) {
    px(10, 19 + oy, 5, 8, JERSEY_HI);
    px(10, 26 + oy, 5, 2, FUR);
  } else {
    px(1, 18 + oy + lift1, 3, 8, JERSEY);
    px(20, 18 + oy + lift2, 3, 8, JERSEY);
    px(1, 26 + oy + lift1, 3, 2, FUR);
    px(20, 26 + oy + lift2, 3, 2, FUR);
  }

  // 머리 (크고 네모난 소 얼굴)
  const hy = 3 + oy;
  // 뿔
  if (side) {
    px(9, hy - 1, 3, 3, HORN);
    px(10, hy - 3, 2, 2, HORN);
    px(9, hy + 1, 3, 1, HORN_SH);
  } else {
    px(1, hy + 2, 4, 2, HORN);
    px(0, hy - 1, 2, 4, HORN);
    px(19, hy + 2, 4, 2, HORN);
    px(22, hy - 1, 2, 4, HORN);
    px(1, hy + 3, 4, 1, HORN_SH);
    px(19, hy + 3, 4, 1, HORN_SH);
  }
  if (side) {
    // 옆모습: 주둥이가 앞(왼쪽)으로 튀어나온다
    px(6, hy + 1, 12, 12, FUR);
    px(6, hy + 1, 12, 2, FUR_HI);
    px(2, hy + 7, 6, 6, MUZZLE);
    px(2, hy + 9, 1, 2, '#4a2c1a');
    px(3, hy + 12, 3, 2, '#ffd25e'); // 코뚜레
    px(9, hy + 5, 2, 2, '#1f1b20');
    px(9, hy + 5, 1, 1, '#ffffff');
    px(15, hy + 4, 4, 2, FUR_SH); // 귀
    return;
  }
  px(5, hy + 1, 14, 13, FUR);
  px(5, hy + 1, 14, 2, FUR_HI);
  px(2, hy + 5, 3, 3, FUR); // 귀
  px(19, hy + 5, 3, 3, FUR);
  px(2, hy + 6, 2, 1, FUR_SH);
  px(20, hy + 6, 2, 1, FUR_SH);
  if (back) {
    px(8, hy + 2, 8, 3, FUR_SH); // 뒤통수 털
    return;
  }
  px(9, hy + 1, 6, 3, FUR_SH); // 이마 앞머리 털
  // 눈 (짙은 눈썹으로 의기양양)
  px(7, hy + 5, 3, 2, '#1f1b20');
  px(14, hy + 5, 3, 2, '#1f1b20');
  px(7, hy + 5, 1, 1, '#ffffff');
  px(14, hy + 5, 1, 1, '#ffffff');
  px(6, hy + 4, 4, 1, FUR_SH);
  px(14, hy + 4, 4, 1, FUR_SH);
  // 주둥이 + 콧구멍 + 금색 코뚜레
  px(6, hy + 9, 12, 6, MUZZLE);
  px(8, hy + 10, 2, 2, '#4a2c1a');
  px(14, hy + 10, 2, 2, '#4a2c1a');
  px(10, hy + 13, 4, 1, '#ffd25e');
  px(10, hy + 14, 1, 1, '#ffd25e');
  px(13, hy + 14, 1, 1, '#ffd25e');
}
