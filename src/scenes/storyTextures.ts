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

  // ───────────────────────── 701호 댄스 동아리 연습실 (UCDC) ─────────────────────────

  // 벽 전신 거울 (30x28): 연습실 느낌의 은빛 거울 + 비스듬한 반사광
  {
    const { tex, ctx, r } = make('mirror_wall', 30, 28);
    r(0, 0, 30, 28, '#5a5f70');
    r(1, 1, 28, 26, '#bfd3e3');
    r(1, 1, 28, 8, '#d6e5f0');
    for (let i = 0; i < 6; i++) r(6 + i, 3 + i * 3, 2, 3, '#f2f8fc');
    for (let i = 0; i < 4; i++) r(17 + i, 6 + i * 3, 1, 3, '#eef5fa');
    outline(ctx, 30, 28);
    tex.refresh();
  }

  // "UCDC" 현수막 (80x18): 보라 바탕에 노란 큰 글자 + 별
  {
    const { tex, ctx, r } = make('ucdc_banner', 80, 18);
    r(0, 0, 80, 18, '#2b1f4a');
    r(0, 0, 80, 2, '#ff5fa2');
    r(0, 16, 80, 2, '#5fd3ff');
    const G: Record<string, string[]> = {
      U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
      C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
      D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    };
    [...'UCDC'].forEach((ch, i) => {
      G[ch].forEach((row, y) =>
        [...row].forEach((v, x) => {
          if (v === '1') {
            r(19 + i * 11 + x * 2, 2 + y * 2 - 1, 2, 2, '#ffd25e');
          }
        }),
      );
    });
    for (const [x, y] of [[5, 7], [72, 6], [10, 12], [68, 12]] as const) {
      r(x, y, 1, 3, '#fff6d8');
      r(x - 1, y + 1, 3, 1, '#fff6d8');
    }
    outline(ctx, 80, 18);
    tex.refresh();
  }

  // 미러볼 (12x16): 천장에 매달린 반짝이는 공
  {
    const { tex, ctx, r } = make('disco_ball', 12, 16);
    r(5, 0, 1, 4, '#8a8a9a');
    disc(ctx, 6, 9, 5, '#c9ced8');
    for (let y = 5; y <= 13; y += 2) for (let x = 2; x <= 10; x += 2) if ((x + y) % 4 === 1) r(x, y, 1, 1, '#ffffff');
    r(3, 6, 2, 2, '#e9f3ff');
    outline(ctx, 12, 16);
    tex.refresh();
  }

  // 큰 스피커 (16x26)
  {
    const { tex, ctx, r } = make('speaker', 16, 26);
    r(0, 0, 16, 26, '#24222c');
    r(1, 1, 14, 24, '#33303c');
    disc(ctx, 8, 7, 4, '#16151b');
    disc(ctx, 8, 7, 2, '#4a4656');
    disc(ctx, 8, 18, 5, '#16151b');
    disc(ctx, 8, 18, 2, '#4a4656');
    r(6, 2, 4, 1, '#5fd3ff');
    outline(ctx, 16, 26);
    shadow(ctx, 8, 25, 8, 2);
    tex.refresh();
  }

  // 붐박스(카세트 라디오) (24x14)
  {
    const { tex, ctx, r } = make('boombox', 24, 14);
    r(4, 0, 16, 2, '#4a4656');
    r(0, 2, 24, 12, '#c9473a');
    r(1, 3, 22, 3, '#e05a4c');
    disc(ctx, 5, 9, 3, '#24222c');
    disc(ctx, 19, 9, 3, '#24222c');
    r(9, 7, 6, 4, '#24222c');
    r(10, 8, 4, 2, '#8fe0ff');
    outline(ctx, 24, 14);
    shadow(ctx, 12, 13, 12, 2);
    tex.refresh();
  }

  // 브레이크댄스용 박스 깔판 (44x22): 바닥에 깔린 골판지
  {
    const { tex, r } = make('cardboard', 44, 22);
    r(0, 2, 44, 18, '#c49a5e');
    r(0, 2, 44, 2, '#d6ad70');
    r(21, 2, 2, 18, '#a97f48');
    r(4, 6, 10, 1, '#a97f48');
    r(28, 13, 12, 1, '#a97f48');
    r(30, 6, 8, 4, '#e8d3a8'); // 테이프
    tex.refresh();
  }

  // 무대 조명이 바닥에 비치는 동그란 빛 (분홍, 하늘)
  for (const [key, col] of [['spot_pink', '255,95,162'], ['spot_cyan', '95,211,255']] as const) {
    const { tex, ctx } = make(key, 48, 24);
    const g = ctx.createRadialGradient(24, 12, 2, 24, 12, 24);
    g.addColorStop(0, `rgba(${col},0.38)`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g;
    ctx.save();
    ctx.scale(1, 0.5);
    ctx.beginPath();
    ctx.arc(24, 24, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    tex.refresh();
  }

  // UCDC 공연 포스터 (14x18)
  {
    const { tex, ctx, r } = make('poster_ucdc', 14, 18);
    r(0, 0, 14, 18, '#2b1f4a');
    r(1, 1, 12, 16, '#3d2c66');
    disc(ctx, 7, 7, 3, '#ffd25e');
    r(6, 10, 2, 4, '#ffd25e');
    r(3, 11, 3, 1, '#ff5fa2');
    r(8, 12, 3, 1, '#5fd3ff');
    r(2, 15, 10, 1, '#ff5fa2');
    outline(ctx, 14, 18);
    tex.refresh();
  }

  // ───────────────────────── 703호 체육대회 (닭싸움 결승전) ─────────────────────────

  // 만국기 줄 (64x12): 알록달록 삼각 깃발
  {
    const { tex, ctx, r } = make('bunting', 64, 12);
    ctx.strokeStyle = '#5a5f70';
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.quadraticCurveTo(32, 6, 64, 1);
    ctx.stroke();
    const cols = ['#ef5a7a', '#ffd25e', '#5fd3ff', '#6bbf7a', '#c9a0ff', '#ff8f3f'];
    for (let i = 0; i < 8; i++) {
      const x = 2 + i * 8;
      const y = 2 + Math.round(Math.sin((i / 7) * Math.PI) * 3);
      for (let k = 0; k < 6; k++) r(x + Math.floor(k / 2), y + k, 6 - k, 1, cols[i % cols.length]);
    }
    tex.refresh();
  }

  // "영상정보대학 체육대회" 현수막 (160x22): 흰 천 + 파랑·빨강 테두리, 한글은 도트처럼 또렷하게
  {
    const W = 160;
    const H = 22;
    const { tex, ctx, r } = make('sports_banner', W, H);
    r(0, 0, W, H, '#fffaf0');
    r(0, 0, W, 2, '#2f6fd0');
    r(0, H - 2, W, 2, '#d94b3a');
    r(2, 4, 3, 3, '#d94b3a'); // 양쪽 끈 고리
    r(W - 5, 4, 3, 3, '#d94b3a');
    // 한글은 도트 글꼴이 없으므로, 작은 글씨로 그린 뒤 흐릿한 가장자리를 잘라 도트처럼 만든다
    const tmp = document.createElement('canvas');
    tmp.width = W;
    tmp.height = H;
    const t = tmp.getContext('2d')!;
    t.fillStyle = '#000';
    t.font = 'bold 12px "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif';
    t.textBaseline = 'middle';
    t.textAlign = 'center';
    t.fillText('영상정보대학 체육대회', W / 2 - 12, H / 2 + 1);
    const img = t.getImageData(0, 0, W, H).data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) if (img[(y * W + x) * 4 + 3] > 120) r(x, y, 1, 1, '#2b2440');
    }
    digits(ctx, '2006', W - 26, 9, '#d94b3a');
    outline(ctx, W, H);
    tex.refresh();
  }

  // 운동회 천막 (64x40): 파랑·흰 줄무늬 지붕 + 기둥 + 아래 탁자
  {
    const { tex, ctx, r } = make('tent', 64, 40);
    for (let i = 0; i < 8; i++) {
      const c = i % 2 ? '#ffffff' : '#2f6fd0';
      r(i * 8, 4, 8, 10, c);
      r(i * 8 + 2, 2, 4, 2, c);
      r(i * 8, 14, 8, 3, i % 2 ? '#e8eef6' : '#2558a8'); // 처마 물결
    }
    r(2, 17, 2, 22, '#8a8a9a');
    r(60, 17, 2, 22, '#8a8a9a');
    r(10, 27, 44, 4, '#f2efe8'); // 탁자
    r(12, 31, 2, 8, '#8a8a9a');
    r(50, 31, 2, 8, '#8a8a9a');
    r(16, 23, 4, 4, '#ffd25e'); // 메달·물병
    r(24, 22, 3, 5, '#5fd3ff');
    r(30, 22, 3, 5, '#5fd3ff');
    r(40, 23, 6, 4, '#ef5a7a');
    outline(ctx, 64, 40);
    shadow(ctx, 32, 39, 30, 2.5);
    tex.refresh();
  }

  // 깃대 (12x36): 꼭대기에 펄럭이는 삼각 깃발
  for (const [key, col] of [['flagpole_red', '#ef5a7a'], ['flagpole_blue', '#2f6fd0']] as const) {
    const { tex, ctx, r } = make(key, 12, 36);
    r(1, 0, 2, 36, '#8a8a9a');
    r(1, 0, 2, 1, '#ffd25e');
    for (let k = 0; k < 8; k++) r(3, 2 + k, 9 - k, 1, col);
    outline(ctx, 12, 36);
    shadow(ctx, 2, 35, 4, 1.5);
    tex.refresh();
  }

  // 풍선 다발 (16x26)
  {
    const { tex, ctx, r } = make('balloons', 16, 26);
    r(7, 14, 1, 12, '#8a8a9a');
    r(5, 12, 1, 6, '#8a8a9a');
    r(10, 12, 1, 6, '#8a8a9a');
    disc(ctx, 5, 7, 4, '#ef5a7a');
    disc(ctx, 11, 6, 4, '#5fd3ff');
    disc(ctx, 8, 11, 4, '#ffd25e');
    r(3, 5, 1, 2, '#ffffff');
    r(9, 4, 1, 2, '#ffffff');
    r(6, 9, 1, 2, '#ffffff');
    outline(ctx, 16, 26);
    tex.refresh();
  }

  // 점수판 (30x24): 청군 3 : 2 백군
  {
    const { tex, ctx, r } = make('scoreboard', 30, 24);
    r(0, 0, 30, 20, '#2b2440');
    r(2, 2, 12, 16, '#2f6fd0');
    r(16, 2, 12, 16, '#f7f4ee');
    digits(ctx, '3', 6, 8, '#ffffff');
    digits(ctx, '2', 20, 8, '#2b2440');
    r(4, 20, 2, 4, '#5a5f70');
    r(24, 20, 2, 4, '#5a5f70');
    outline(ctx, 30, 24);
    tex.refresh();
  }

  // 닭싸움 경기장 원 (112x48): 바닥에 그린 흰 선
  {
    const { tex, ctx } = make('arena_circle', 112, 48);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(56, 24, 53, 21, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(55, 4, 2, 40);
    tex.refresh();
  }

  // 주황 고깔 (10x12)
  {
    const { tex, ctx, r } = make('cone', 10, 12);
    for (let y = 0; y < 9; y++) r(4 - Math.floor(y / 2), y, 2 + Math.floor(y / 2) * 2, 1, y === 4 || y === 5 ? '#ffffff' : '#ff8f3f');
    r(0, 9, 10, 3, '#e06a2a');
    outline(ctx, 10, 12);
    tex.refresh();
  }

  // 닭싸움 대진표 포스터 (16x18)
  {
    const { tex, ctx, r } = make('bracket', 16, 18);
    r(0, 0, 16, 18, '#fffaf0');
    r(0, 0, 16, 3, '#d94b3a');
    for (const y of [5, 9, 13]) {
      r(2, y, 4, 1, '#2b2440');
      r(10, y, 4, 1, '#2b2440');
    }
    r(6, 5, 1, 5, '#2b2440');
    r(9, 9, 1, 5, '#2b2440');
    r(6, 7, 4, 1, '#2b2440');
    r(7, 15, 2, 2, '#ffd25e');
    outline(ctx, 16, 18);
    tex.refresh();
  }

  // 과제 종이 한 장 (10x7): 복도 "교수님 오인 소동"에서 머리 위로 쌓인다
  {
    const { tex, ctx, r } = make('sheet', 10, 7);
    r(0, 0, 10, 7, '#fffaf0');
    r(2, 2, 6, 1, '#b8b8c4');
    r(2, 4, 5, 1, '#b8b8c4');
    r(7, 1, 2, 1, '#ef5a7a');
    outline(ctx, 10, 7);
    tex.refresh();
  }
}
