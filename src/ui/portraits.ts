/**
 * 대화창 얼굴 아이콘 (24x24 도트). 이미지 파일 없이 코드로 그린다.
 * 새 인물은 PORTRAITS 에 그리기 함수를 추가하고, 대사 노드의 `portrait` 에 키를 적으면 된다.
 */

type Px = (x: number, y: number, w: number, h: number, c: string) => void;

const SKIN = '#f6cfa8';
const SKIN_SH = '#e4b48c';
const BLUSH = '#f2a39a';
const OUTLINE: [number, number, number] = [0x2d, 0x2a, 0x38];

/** 교수님: 단발 웨이브 머리, 어두운 블레이저, 흰 상의, 붉은 입술, 작은 귀걸이 */
function professor(px: Px) {
  // 몸(블레이저) + 흰 상의 + 라펠
  px(3, 18, 18, 6, '#4a4a58');
  px(5, 17, 14, 1, '#4a4a58');
  px(3, 18, 18, 1, '#63637a');
  px(10, 18, 4, 4, '#f7f4ee');
  px(11, 22, 2, 1, '#f7f4ee');
  px(9, 18, 1, 5, '#63637a');
  px(14, 18, 1, 5, '#63637a');
  // 목, 얼굴
  px(10, 16, 4, 2, SKIN_SH);
  px(7, 6, 10, 10, SKIN);
  // 단발 웨이브 머리
  px(5, 3, 14, 5, '#3a2a28');
  px(7, 7, 3, 2, '#3a2a28');
  px(12, 7, 5, 2, '#3a2a28');
  px(4, 5, 4, 13, '#3a2a28');
  px(16, 5, 4, 13, '#3a2a28');
  px(3, 15, 2, 3, '#3a2a28');
  px(19, 15, 2, 3, '#3a2a28');
  px(8, 4, 4, 1, '#5a443f');
  px(4, 7, 1, 5, '#5a443f');
  // 눈썹, 눈, 볼터치, 입술, 귀걸이
  px(8, 9, 2, 1, '#3a2a28');
  px(14, 9, 2, 1, '#3a2a28');
  px(9, 10, 1, 2, '#2a2024');
  px(14, 10, 1, 2, '#2a2024');
  px(8, 12, 2, 1, BLUSH);
  px(14, 12, 2, 1, BLUSH);
  px(11, 14, 2, 1, '#d0453b');
  px(7, 13, 1, 1, '#dcdce6');
  px(16, 13, 1, 1, '#dcdce6');
}

/** 피자 배달부 (임시): 빨간 모자와 재킷 */
function pizza(px: Px) {
  px(3, 18, 18, 6, '#d94b3a');
  px(5, 17, 14, 1, '#d94b3a');
  px(3, 18, 18, 1, '#ef6a58');
  px(10, 17, 4, 2, '#ffd25e');
  px(10, 16, 4, 1, SKIN_SH);
  px(7, 8, 10, 8, SKIN);
  px(6, 9, 1, 4, '#6b3f22');
  px(17, 9, 1, 4, '#6b3f22');
  // 모자
  px(6, 3, 12, 5, '#d94b3a');
  px(7, 2, 10, 1, '#d94b3a');
  px(8, 3, 4, 1, '#ef6a58');
  px(5, 8, 14, 1, '#a9372b');
  px(4, 8, 2, 1, '#a9372b');
  // 얼굴
  px(8, 11, 1, 2, '#2a2024');
  px(15, 11, 1, 2, '#2a2024');
  px(7, 13, 2, 1, BLUSH);
  px(15, 13, 2, 1, BLUSH);
  px(9, 14, 6, 1, '#6b3f22');
  px(10, 15, 4, 1, '#d0453b');
}

/** 아이템 카드용: 수덕전 딸기파르페 */
function parfait(px: Px) {
  // 딸기와 잎
  px(9, 6, 3, 3, '#e03b4d');
  px(12, 5, 3, 4, '#e03b4d');
  px(15, 7, 3, 2, '#e03b4d');
  px(10, 6, 1, 1, '#ff8a96');
  px(11, 4, 3, 1, '#4fa65a');
  // 생크림 + 컵 층
  px(7, 9, 10, 2, '#fff6f0');
  px(6, 11, 12, 2, '#ffb3c7');
  px(6, 13, 12, 2, '#fff6f0');
  px(6, 15, 12, 2, '#ff8fb0');
  px(7, 17, 10, 2, '#e6f4fa');
  px(8, 19, 8, 1, '#cfe3ee');
  px(11, 20, 2, 2, '#cfd8e0');
  px(8, 22, 8, 1, '#cfd8e0');
  // 반짝임
  px(3, 5, 1, 3, '#ffd25e');
  px(2, 6, 3, 1, '#ffd25e');
  px(20, 12, 1, 3, '#ffd25e');
  px(19, 13, 3, 1, '#ffd25e');
}

/** 제자(사람) 얼굴 */
function kid(o: { hair: string; hairHi: string; shirt: string; shirtHi: string; style: 'long' | 'short' | 'spiky'; skin?: string; goatee?: boolean }) {
  return (px: Px) => {
    const skin = o.skin ?? SKIN;
    px(3, 18, 18, 6, o.shirt);
    px(5, 17, 14, 1, o.shirt);
    px(3, 18, 18, 1, o.shirtHi);
    px(10, 16, 4, 2, SKIN_SH);
    px(7, 6, 10, 10, skin);
    if (o.style === 'long') {
      px(5, 3, 14, 5, o.hair);
      px(7, 7, 3, 2, o.hair);
      px(12, 7, 5, 2, o.hair);
      px(4, 5, 4, 15, o.hair);
      px(16, 5, 4, 15, o.hair);
      px(8, 4, 4, 1, o.hairHi);
    } else {
      px(6, 3, 12, 4, o.hair);
      px(7, 6, 3, 2, o.hair);
      px(14, 6, 3, 2, o.hair);
      px(5, 5, 3, 6, o.hair);
      px(16, 5, 3, 6, o.hair);
      px(8, 4, 4, 1, o.hairHi);
      if (o.style === 'spiky') {
        px(6, 2, 3, 2, o.hair);
        px(11, 1, 3, 3, o.hair);
        px(15, 2, 3, 2, o.hair);
      }
    }
    px(8, 9, 2, 1, o.hair);
    px(14, 9, 2, 1, o.hair);
    px(9, 10, 1, 2, '#2a2024');
    px(14, 10, 1, 2, '#2a2024');
    px(8, 12, 2, 1, BLUSH);
    px(14, 12, 2, 1, BLUSH);
    if (o.goatee) {
      px(9, 13, 6, 1, o.hair);
      px(10, 14, 4, 2, o.hair);
    } else {
      px(10, 14, 4, 1, '#b5523f');
    }
  };
}

/** 병아리 얼굴: 노란 동글한 머리 + 부리 + 각자의 머리 모양 */
function chick(o: { hair: string; hairHi: string; shirt: string; shirtHi: string; style: 'long' | 'messy' | 'spiky'; goatee?: boolean; grumpy?: boolean }) {
  const Y = '#ffd84a';
  const YH = '#ffe98a';
  const YS = '#f0b52e';
  return (px: Px) => {
    px(3, 19, 18, 5, o.shirt);
    px(5, 18, 14, 1, o.shirt);
    px(3, 19, 18, 1, o.shirtHi);
    px(10, 18, 4, 1, YS);
    // 머리(원)
    for (let y = -9; y <= 9; y++) {
      const hw = Math.floor(Math.sqrt(81 - y * y) + 0.5);
      px(12 - hw, 11 + y, hw * 2, 1, Y);
    }
    px(7, 5, 5, 3, YH);
    // 머리카락
    if (o.style === 'long') {
      px(3, 2, 18, 6, o.hair);
      px(2, 5, 5, 16, o.hair);
      px(17, 5, 5, 16, o.hair);
      px(7, 7, 4, 2, o.hair);
      px(12, 7, 6, 1, o.hair);
      px(6, 3, 4, 1, o.hairHi);
    } else if (o.style === 'messy') {
      px(4, 1, 16, 7, o.hair);
      px(3, 5, 4, 6, o.hair);
      px(17, 5, 4, 6, o.hair);
      px(7, 8, 3, 1, o.hair);
      px(14, 8, 4, 1, o.hair);
      px(6, 2, 4, 1, o.hairHi);
    } else {
      px(4, 3, 16, 5, o.hair);
      px(4, 6, 3, 5, o.hair);
      px(17, 6, 3, 5, o.hair);
      px(4, 1, 3, 3, o.hair);
      px(9, 0, 4, 4, o.hair);
      px(15, 1, 4, 3, o.hair);
      px(10, 1, 2, 1, o.hairHi);
    }
    // 눈 · 볼 · 부리
    if (o.grumpy) {
      px(6, 9, 5, 1, '#2a2024');
      px(13, 9, 5, 1, '#2a2024');
      px(8, 11, 2, 3, '#2a2024');
      px(14, 11, 2, 3, '#2a2024');
    } else if (o.style === 'long') {
      px(7, 10, 3, 4, '#2a2024');
      px(14, 10, 3, 4, '#2a2024');
      px(8, 10, 1, 1, '#ffffff');
      px(15, 10, 1, 1, '#ffffff');
    } else {
      px(7, 11, 3, 2, '#2a2024');
      px(14, 11, 3, 2, '#2a2024');
      px(7, 10, 4, 1, '#2a2024');
      px(14, 10, 4, 1, '#2a2024');
    }
    px(5, 14, 3, 2, '#f7a36a');
    px(16, 14, 3, 2, '#f7a36a');
    px(10, 14, 4, 2, '#f29a2e');
    px(11, 16, 2, 1, '#d77f1c');
    if (o.goatee) {
      px(9, 17, 6, 1, o.hair);
      px(10, 18, 4, 1, o.hair);
    }
  };
}

const PORTRAITS: Record<string, { draw: (px: Px) => void; bg: string }> = {
  professor: { draw: professor, bg: '#cfe3ee' },
  pizza: { draw: pizza, bg: '#f6d9a8' },
  parfait: { draw: parfait, bg: '#ffe6ef' },
  kid_hs: { draw: kid({ hair: '#8a5a34', hairHi: '#b07a4a', shirt: '#dcc3a0', shirtHi: '#ecd9bd', style: 'long' }), bg: '#f6e8d6' },
  kid_ty: { draw: kid({ hair: '#1f1b20', hairHi: '#3a343c', shirt: '#efe3cb', shirtHi: '#fbf3e2', style: 'short' }), bg: '#e7eef6' },
  npc_student: { draw: kid({ hair: '#5a3a2a', hairHi: '#7a5a42', shirt: '#7fb2e5', shirtHi: '#a4cbf0', style: 'short' }), bg: '#e7eef6' },
  prof_ps: { draw: kid({ hair: '#1c1a1e', hairHi: '#34303a', shirt: '#9a9ca6', shirtHi: '#b4b6c0', style: 'short', skin: '#ecc09a' }), bg: '#ece4ea' },
  kid_ch: { draw: kid({ hair: '#2a2024', hairHi: '#4a3a3c', shirt: '#cfcad0', shirtHi: '#e3dfe5', style: 'spiky', skin: '#e9b98d', goatee: true }), bg: '#e6e1ea' },
  chick_hs: { draw: chick({ hair: '#8a5a34', hairHi: '#b07a4a', shirt: '#dcc3a0', shirtHi: '#ecd9bd', style: 'long' }), bg: '#fdeedd' },
  chick_ty: { draw: chick({ hair: '#1f1b20', hairHi: '#3a343c', shirt: '#efe3cb', shirtHi: '#fbf3e2', style: 'messy' }), bg: '#e7eef6' },
  chick_ch: { draw: chick({ hair: '#2a2024', hairHi: '#4a3a3c', shirt: '#2b3350', shirtHi: '#44507a', style: 'spiky', goatee: true, grumpy: true }), bg: '#e6e1ea' },
};

/** 도트 그림에 1px 외곽선을 입힌다 */
function outline(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const src = img.data;
  const out = new Uint8ClampedArray(src);
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && src[(y * w + x) * 4 + 3] > 200;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (src[i + 3] !== 0) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) {
        out[i] = OUTLINE[0];
        out[i + 1] = OUTLINE[1];
        out[i + 2] = OUTLINE[2];
        out[i + 3] = 255;
      }
    }
  }
  ctx.putImageData(new ImageData(out, w, h), 0, 0);
}

/** 캔버스에 얼굴 아이콘을 그린다. 그릴 수 있으면 true */
export function setPortrait(canvas: HTMLCanvasElement, key?: string): boolean {
  const p = key ? PORTRAITS[key] : undefined;
  if (!p) return false;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  p.draw((x, y, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  });
  outline(ctx, canvas.width, canvas.height);
  // 배경은 인물 뒤에 깐다
  ctx.save();
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  return true;
}
