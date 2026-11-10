import Phaser from 'phaser';

/**
 * 스토리 장면(S5~S7)에 쓰는 도트 그림: 산학협력관 복도, 702호 연구실, 비밀 정원.
 * 이미지 파일 없이 코드로 그린다. 나중에 실제 그림으로 바꾸려면 같은 이름의 텍스처를 로드하면 된다.
 */

const OUTLINE: [number, number, number] = [0x2d, 0x2a, 0x38];

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

function shadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = 'rgba(30, 40, 20, 0.26)';
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

/** 3x5 도트 숫자 (문패 숫자를 또렷하게 그리기 위한 작은 글꼴) */
const DIGITS: Record<string, string[]> = {
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
};

function digits(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  [...text].forEach((ch, i) => {
    const g = DIGITS[ch];
    if (!g) return;
    g.forEach((row, ry) => [...row].forEach((v, rx) => v === '1' && ctx.fillRect(x + i * 4 + rx, y + ry, 1, 1)));
  });
}

export function makeStoryTextures(scene: Phaser.Scene) {
  const make = (key: string, w: number, h: number) => {
    const tex = scene.textures.createCanvas(key, w, h)!;
    const ctx = tex.context;
    ctx.imageSmoothingEnabled = false;
    const r = (x: number, y: number, rw: number, rh: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, rw, rh);
    };
    return { tex, ctx, r };
  };

  // ───────────────────────── 복도 ─────────────────────────

  // 디지털콘텐츠학과 게시판 (112x44)
  {
    const { tex, ctx, r } = make('dicon_board', 112, 44);
    r(0, 0, 112, 44, '#7a5233');
    r(2, 2, 108, 40, '#2f6b4a');
    r(2, 2, 108, 2, '#3f8a60');
    // 노란 학과 이름 띠 + DICON 화살표
    r(6, 5, 66, 11, '#f2d84a');
    r(6, 5, 66, 1, '#fff08a');
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2a2410';
    ctx.fillText('디지털콘텐츠학과', 39, 14);
    r(76, 7, 24, 8, '#3f7fd0');
    r(100, 5, 2, 12, '#3f7fd0');
    r(102, 7, 2, 8, '#3f7fd0');
    r(104, 9, 2, 4, '#3f7fd0');
    ctx.font = 'bold 6px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('DICON', 88, 13);
    // 공지문과 종이들
    const colors = ['#ffffff', '#ffe6ef', '#fff6c0', '#dff2e1', '#e8e0f5', '#ffffff'];
    let seed = 7;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 8; col++) {
        const x = 6 + col * 13 + Math.floor(rnd() * 2);
        const y = 20 + row * 11 + Math.floor(rnd() * 2);
        r(x, y, 10, 9, colors[Math.floor(rnd() * colors.length)]);
        r(x + 2, y + 2, 6, 1, '#9a9aa8');
        r(x + 2, y + 4, 5, 1, '#b8b8c4');
        r(x + 2, y + 6, 6, 1, '#9a9aa8');
        r(x + 4, y - 1, 2, 2, '#d94b3a');
      }
    }
    outline(ctx, 112, 44);
    tex.refresh();
  }

  // 출입구 유리문 (32x36)
  {
    const { tex, ctx, r } = make('door_glass', 32, 36);
    r(0, 0, 32, 36, '#4a4a58');
    r(2, 2, 13, 31, '#bfe3f2');
    r(17, 2, 13, 31, '#bfe3f2');
    r(3, 3, 3, 2, '#e8f6fb');
    r(18, 3, 3, 2, '#e8f6fb');
    for (let i = 0; i < 6; i++) {
      r(4 + i, 12 - i, 1, 1, '#e8f6fb');
      r(19 + i, 12 - i, 1, 1, '#e8f6fb');
    }
    r(13, 14, 1, 8, '#d0d0d8');
    r(18, 14, 1, 8, '#d0d0d8');
    r(0, 33, 32, 3, '#3a3a46');
    outline(ctx, 32, 36);
    tex.refresh();
  }

  /** 연구실 문 (32x36). number: 문패 숫자, special: 702호 (시간표 포함), open: 열린 문 */
  const door = (key: string, number: string, mode: 'plain' | 'special' | 'open') => {
    const { tex, ctx, r } = make(key, 32, 36);
    r(0, 0, 32, 36, '#f0e2c4');
    if (mode === 'open') {
      r(3, 3, 26, 33, '#ffe9a8');
      r(3, 3, 26, 5, '#fff3c8');
      r(3, 30, 26, 6, '#d9a066');
      r(14, 12, 10, 16, '#fff6d8');
      r(5, 20, 4, 10, '#e8b84a');
      r(3, 3, 6, 33, '#a9733f');
      r(3, 3, 6, 2, '#c98f4f');
      r(7, 18, 1, 3, '#ffd25e');
      r(11, 18, 1, 14, '#fff6c0');
    } else {
      r(3, 3, 26, 33, '#a9733f');
      r(3, 3, 26, 2, '#c98f4f');
      r(5, 7, 10, 13, '#b98351');
      r(17, 7, 10, 13, '#b98351');
      r(5, 22, 10, 12, '#b98351');
      r(17, 22, 10, 12, '#b98351');
      if (mode === 'plain') {
        r(11, 9, 10, 7, '#bfe3f2');
        r(11, 9, 10, 2, '#e8f6fb');
      }
      // 문패
      if (mode === 'special') {
        r(8, 6, 16, 8, '#ffd25e');
        r(8, 6, 16, 1, '#fff08a');
        digits(ctx, number, 11, 8, '#5a3a22');
        // 문패 아래 시간표 종이: 월·금은 비어 있고 화·수·목에 수업이 몰려 있다
        r(9, 15, 14, 12, '#fffaf0');
        const cols = ['#e0ddd2', '#4f8fd0', '#5aa86a', '#e8b84a', '#e0ddd2'];
        cols.forEach((c, i) => {
          r(10 + Math.round(i * 2.6), 17, 2, 9, c);
        });
        r(9, 15, 14, 1, '#c9c4b4');
      } else {
        r(11, 17, 10, 6, '#ffd25e');
        digits(ctx, number, 14, 18, '#5a3a22');
      }
      r(25, 19, 2, 3, '#ffd25e');
    }
    outline(ctx, 32, 36);
    tex.refresh();
  };
  door('door_701', '701', 'plain');
  door('door_703', '703', 'plain');
  door('door_702', '702', 'special');
  door('door_702_open', '702', 'open');

  // 벽 포스터 3종 (14x18): 개강총회(노랑) / 3D 영상 공모전(파랑) / 모션 그래픽 동아리(보라)
  {
    const { tex, ctx, r } = make('poster_dicon', 14, 18);
    r(0, 0, 14, 18, '#ffd84a');
    r(1, 1, 12, 3, '#e8742a');
    r(2, 2, 10, 1, '#fff6d8');
    disc(ctx, 7, 9, 3, '#fff6d8');
    r(6, 8, 2, 2, '#e8742a');
    r(2, 13, 10, 1, '#b8860b');
    r(3, 15, 8, 1, '#b8860b');
    outline(ctx, 14, 18);
    tex.refresh();
  }
  {
    const { tex, ctx, r } = make('poster_3d', 14, 18);
    r(0, 0, 14, 18, '#3f6fc4');
    r(1, 1, 12, 16, '#5b8fe0');
    // 상자(큐브)
    r(4, 5, 6, 6, '#e8f0ff');
    r(4, 5, 6, 2, '#ffffff');
    r(8, 7, 2, 4, '#9db8e8');
    r(4, 11, 6, 1, '#3f6fc4');
    r(2, 14, 10, 1, '#dbe6ff');
    r(4, 16, 6, 1, '#dbe6ff');
    outline(ctx, 14, 18);
    tex.refresh();
  }
  {
    const { tex, ctx, r } = make('poster_motion', 14, 18);
    r(0, 0, 14, 18, '#5a3a8c');
    r(1, 1, 12, 16, '#7a52b8');
    disc(ctx, 4, 8, 2, '#ff8fc0');
    disc(ctx, 7, 8, 2, '#ffd25e');
    disc(ctx, 10, 8, 2, '#8fe0ff');
    r(2, 12, 10, 1, '#e6d8ff');
    r(3, 14, 8, 1, '#e6d8ff');
    outline(ctx, 14, 18);
    tex.refresh();
  }

  // ───────────────────────── 702호 연구실 ─────────────────────────

  // 이상한 벽걸이 달력 (26x30): 시간표 자리에 걸려 있다
  {
    const { tex, ctx, r } = make('calendar', 26, 30);
    r(0, 0, 26, 30, '#fffaf0');
    r(0, 0, 26, 8, '#c8372d');
    r(0, 7, 26, 1, '#9a2a22');
    r(5, 2, 2, 2, '#fffaf0'); // 고리 구멍
    r(19, 2, 2, 2, '#fffaf0');
    digits(ctx, '2006', 5, 11, '#3a3446');
    for (let rr = 0; rr < 3; rr++) {
      for (let c = 0; c < 5; c++) r(3 + c * 4, 18 + rr * 4, 3, 2, rr === 2 && c > 2 ? '#fffaf0' : '#cfc9b8');
    }
    r(11, 26, 3, 2, '#c8372d'); // 동그라미 친 날
    outline(ctx, 26, 30);
    tex.refresh();
  }

  // 결혼식 사진 액자 (18x22)
  {
    const { tex, ctx, r } = make('wedding_frame', 18, 22);
    r(0, 0, 18, 22, '#d9a441');
    r(2, 2, 14, 18, '#f4d6e0');
    // 신부(흰 옷)와 신랑(어두운 정장)
    r(4, 8, 4, 4, '#f6cfa8');
    r(10, 8, 4, 4, '#f6cfa8');
    r(4, 7, 4, 2, '#3a2a28');
    r(10, 7, 4, 2, '#231a1c');
    r(3, 12, 6, 7, '#f7f4ee');
    r(9, 12, 6, 7, '#43434f');
    r(8, 3, 2, 2, '#ef5a7a');
    r(7, 2, 1, 2, '#ef5a7a');
    r(10, 2, 1, 2, '#ef5a7a');
    outline(ctx, 18, 22);
    tex.refresh();
  }

  // 창문 (32x28)
  {
    const { tex, ctx, r } = make('office_window', 32, 28);
    r(0, 0, 32, 28, '#f7f4ee');
    r(2, 2, 28, 24, '#9fd4f0');
    r(2, 2, 28, 8, '#bfe3f2');
    disc(ctx, 9, 8, 3, '#ffffff');
    disc(ctx, 22, 12, 4, '#ffffff');
    r(2, 18, 28, 8, '#7fc66a');
    disc(ctx, 20, 20, 5, '#3f9a47');
    r(15, 1, 2, 26, '#f7f4ee');
    r(1, 13, 30, 2, '#f7f4ee');
    outline(ctx, 32, 28);
    tex.refresh();
  }

  // 책상 (48x34)
  {
    const { tex, ctx, r } = make('desk', 48, 34);
    r(0, 0, 48, 22, '#c98f4f'); // 상판
    r(0, 0, 48, 2, '#e0a966');
    r(0, 22, 48, 10, '#a9733f'); // 앞면
    r(2, 24, 20, 6, '#8a5a2b');
    r(26, 24, 20, 6, '#8a5a2b');
    r(10, 26, 4, 2, '#ffd25e');
    r(34, 26, 4, 2, '#ffd25e');
    r(1, 30, 4, 4, '#7a5233');
    r(43, 30, 4, 4, '#7a5233');
    outline(ctx, 48, 34);
    shadow(ctx, 24, 33, 22, 2.2);
    tex.refresh();
  }

  // 의자 (16x18)
  {
    const { tex, ctx, r } = make('chair', 16, 18);
    r(2, 0, 12, 9, '#8a3d31');
    r(2, 0, 12, 2, '#a4503f');
    r(1, 9, 14, 4, '#a4503f');
    r(7, 13, 2, 3, '#4a4a58');
    r(3, 16, 10, 2, '#4a4a58');
    outline(ctx, 16, 18);
    shadow(ctx, 8, 17, 7, 1.4);
    tex.refresh();
  }

  // 출력된 과제 더미 (24x14): 맨 위 종이에 빨간 펜 자국
  {
    const { tex, ctx, r } = make('papers', 24, 14);
    r(1, 8, 22, 5, '#ece6d4');
    r(2, 5, 20, 5, '#f5f0e2');
    r(0, 2, 22, 6, '#ffffff');
    r(3, 4, 12, 1, '#9a9aa8');
    r(3, 6, 15, 1, '#b8b8c4');
    // 빨간 펜 교정 자국
    r(4, 3, 7, 1, '#d02b2b');
    r(12, 5, 4, 1, '#d02b2b');
    r(15, 3, 1, 3, '#d02b2b');
    r(17, 4, 3, 1, '#d02b2b');
    outline(ctx, 24, 14);
    tex.refresh();
  }

  // 빨간 펜 (16x6)
  {
    const { tex, ctx, r } = make('red_pen', 16, 6);
    r(1, 2, 11, 3, '#d02b2b');
    r(1, 2, 11, 1, '#ef5a5a');
    r(0, 2, 2, 3, '#f7f4ee');
    r(12, 2, 2, 3, '#c9c9d2');
    r(14, 3, 2, 1, '#2a2024');
    r(4, 3, 3, 1, '#ffd25e');
    outline(ctx, 16, 6);
    tex.refresh();
  }

  // 바닥 깔개 (64x40)
  {
    const { tex, ctx, r } = make('rug', 64, 40);
    r(2, 0, 60, 40, '#b5524a');
    r(0, 2, 64, 36, '#b5524a');
    r(6, 5, 52, 30, '#f2e3c6');
    r(10, 9, 44, 22, '#c9625a');
    r(14, 13, 36, 14, '#f2e3c6');
    for (let x = 18; x < 48; x += 6) r(x, 18, 3, 4, '#b5524a');
    ctx.globalAlpha = 1;
    tex.refresh();
  }

  // ───────────────────────── 비밀 정원 ─────────────────────────

  // 보물상자 (닫힘 24x20)
  {
    const { tex, ctx, r } = make('chest', 24, 20);
    r(1, 8, 22, 11, '#8a5a2b');
    r(1, 3, 22, 6, '#a9733f');
    r(3, 1, 18, 3, '#a9733f');
    r(1, 3, 22, 1, '#c98f4f');
    r(5, 3, 3, 16, '#d9a441');
    r(16, 3, 3, 16, '#d9a441');
    r(10, 8, 4, 5, '#ffd25e');
    r(11, 10, 2, 2, '#5a3a22');
    outline(ctx, 24, 20);
    shadow(ctx, 12, 19, 11, 2);
    tex.refresh();
  }
  // 보물상자 (열림 24x30): 뚜껑이 젖혀지고 따뜻한 빛이 쏟아진다
  {
    const { tex, ctx, r } = make('chest_open', 24, 30);
    r(1, 0, 22, 6, '#a9733f');
    r(1, 0, 22, 1, '#c98f4f');
    r(5, 0, 3, 6, '#d9a441');
    r(16, 0, 3, 6, '#d9a441');
    r(2, 6, 20, 8, '#fff6c0');
    r(5, 7, 14, 5, '#ffffff');
    r(1, 14, 22, 15, '#8a5a2b');
    r(5, 14, 3, 15, '#d9a441');
    r(16, 14, 3, 15, '#d9a441');
    r(1, 14, 22, 2, '#a9733f');
    // 반짝이
    for (const [x, y] of [[0, 8], [22, 6], [11, 3]] as const) {
      r(x, y, 1, 3, '#ffd25e');
      r(x - 1, y + 1, 3, 1, '#ffd25e');
    }
    outline(ctx, 24, 30);
    shadow(ctx, 12, 29, 11, 2);
    tex.refresh();
  }

  /** 장미 덩굴 대문 (36x44). open: 문짝이 양옆으로 젖혀지고 가운데로 정원 길이 보인다 */
  const gate = (key: string, open: boolean) => {
    const { tex, ctx, r } = make(key, 36, 44);
    // 돌기둥 + 아치
    r(0, 12, 8, 32, '#a8a4b4');
    r(28, 12, 8, 32, '#a8a4b4');
    r(0, 8, 8, 5, '#c4c0cc');
    r(28, 8, 8, 5, '#c4c0cc');
    r(6, 6, 24, 7, '#a8a4b4');
    r(6, 6, 24, 2, '#c4c0cc');
    r(1, 16, 1, 24, '#8e8a9a');
    r(29, 16, 1, 24, '#8e8a9a');
    // 문
    if (open) {
      r(8, 14, 20, 30, '#8fd16a');
      r(14, 14, 8, 30, '#e2cf9a'); // 정원 길
      r(8, 14, 3, 30, '#3a3a4a');
      r(25, 14, 3, 30, '#3a3a4a');
      for (let y = 16; y < 42; y += 4) {
        r(11, y, 2, 1, '#3a3a4a');
        r(23, y, 2, 1, '#3a3a4a');
      }
    } else {
      r(8, 14, 20, 28, '#2a2833');
      for (let x = 9; x < 28; x += 3) r(x, 14, 1, 28, '#4a4a5a');
      r(8, 26, 20, 2, '#4a4a5a');
      r(16, 24, 4, 6, '#ffd25e'); // 자물쇠
      r(17, 21, 2, 4, '#c9a030');
      r(17, 26, 2, 2, '#5a3a22');
    }
    // 장미 덩굴
    const vine = (cx: number, cy: number, rr: number) => disc(ctx, cx, cy, rr, '#3f9a47');
    vine(5, 14, 5);
    vine(31, 14, 5);
    vine(18, 8, 4);
    vine(3, 26, 3);
    vine(33, 28, 3);
    vine(10, 8, 3);
    vine(26, 8, 3);
    for (const [x, y] of [[4, 12], [7, 16], [30, 11], [33, 16], [18, 6], [11, 7], [25, 7], [3, 25], [33, 27], [5, 20]] as const) {
      r(x, y, 2, 2, '#ef5a7a');
      r(x, y, 1, 1, '#ff9fb8');
    }
    outline(ctx, 36, 44);
    shadow(ctx, 18, 43, 16, 2.4);
    tex.refresh();
  };
  gate('garden_gate', false);
  gate('garden_gate_open', true);

  // 땅에 묻힌 대문: 아치 윗부분만 흙 위로 빼꼼 보인다 (36x44, 같은 자리에 놓인다)
  {
    const { tex, ctx, r } = make('garden_gate_peek', 36, 44);
    const src = scene.textures.get('garden_gate').getSourceImage() as CanvasImageSource;
    ctx.drawImage(src, 0, 4, 36, 14, 0, 28, 36, 14);
    // 흙 더미와 풀
    r(0, 37, 36, 7, '#7a5233');
    r(2, 35, 32, 3, '#8a6040');
    r(6, 33, 24, 3, '#8a6040');
    for (const [x, y, w] of [[2, 37, 5], [12, 36, 4], [22, 37, 6], [30, 36, 4]] as const) r(x, y, w, 2, '#6bbf7a');
    for (const [x, y] of [[8, 40], [18, 41], [27, 40], [4, 42]] as const) r(x, y, 2, 1, '#5a3a22');
    outline(ctx, 36, 44);
    shadow(ctx, 18, 43, 16, 2.4);
    tex.refresh();
  }
}
