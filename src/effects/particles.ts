import Phaser from 'phaser';

/**
 * 컷신에서 쓰는 작은 파티클 효과 모음 (색종이, 꽃폭죽, 흙). 모두 그리고 나면 스스로 사라진다.
 * 그림 파일 없이 코드로 만든 도트(사각형, 7x7 꽃)만 쓴다.
 */

/** 성공 효과: 색종이가 터져 흩날린다 */
export function burstConfetti(scene: Phaser.Scene, x: number, y: number) {
  const colors = [0xffd25e, 0xef5a7a, 0x6bbf7a, 0x7fb2e5, 0xffffff, 0xc779b8];
  const pieces = Array.from({ length: 34 }, () => ({
    r: scene.add.rectangle(x, y, 3, 3, colors[Math.floor(Math.random() * colors.length)]).setDepth(9700),
    vx: (Math.random() - 0.5) * 120,
    vy: -(45 + Math.random() * 75),
    rot: (Math.random() - 0.5) * 8,
  }));
  scene.tweens.addCounter({
    from: 0,
    to: 1,
    duration: 1400,
    onUpdate: (tw) => {
      const k = Number(tw.getValue());
      const t = k * 1.4;
      for (const p of pieces) {
        p.r.x = x + p.vx * t;
        p.r.y = y + p.vy * t + 120 * t * t;
        p.r.rotation = p.rot * t;
        p.r.setAlpha(Math.max(0, 1 - k * k));
      }
    },
    onComplete: () => pieces.forEach((p) => p.r.destroy()),
  });
}

/** 꽃 모양 도트(7x7) 텍스처를 한 번만 만들어 두고 키 목록을 돌려준다 */
function flowerKeys(scene: Phaser.Scene): string[] {
  const colors = ['#ff8fc0', '#ffd25e', '#ffffff', '#c9a0ff', '#8fe0ff'];
  return colors.map((c, i) => {
    const key = `fx_flower${i}`;
    if (!scene.textures.exists(key)) {
      const tex = scene.textures.createCanvas(key, 7, 7)!;
      const ctx = tex.context;
      const r = (x: number, y: number, w: number, h: number, col: string) => {
        ctx.fillStyle = col;
        ctx.fillRect(x, y, w, h);
      };
      r(2, 0, 3, 2, c);
      r(2, 5, 3, 2, c);
      r(0, 2, 2, 3, c);
      r(5, 2, 2, 3, c);
      r(2, 2, 3, 3, '#ffe27a');
      tex.refresh();
    }
    return key;
  });
}

/** 꽃잎이 사방으로 팡! 하고 터진다 */
export function flowerBurst(scene: Phaser.Scene, tx: number, ty: number, n = 22) {
  const keys = flowerKeys(scene);
  const bits = Array.from({ length: n }, (_, k) => {
    const ang = (k / n) * Math.PI * 2 + Math.random() * 0.3;
    const sp = 40 + Math.random() * 38;
    const img = scene.add.image(tx, ty, keys[Math.floor(Math.random() * keys.length)]).setDepth(9800).setScale(1.4);
    return { img, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 14, spin: (Math.random() - 0.5) * 8 };
  });
  scene.tweens.addCounter({
    from: 0,
    to: 1,
    duration: 1300,
    onUpdate: (tw) => {
      const k = Number(tw.getValue());
      const t = k * 1.3;
      for (const b of bits) {
        b.img.x = tx + b.vx * t;
        b.img.y = ty + b.vy * t + 55 * t * t;
        b.img.rotation = b.spin * t;
        b.img.setAlpha(Math.max(0, 1 - k * k));
      }
    },
    onComplete: () => bits.forEach((b) => b.img.destroy()),
  });
}

/** 흙이 튀는 작은 효과 (강아지가 땅을 팔 때) */
export function burstDirt(scene: Phaser.Scene, x: number, y: number) {
  const cols = [0x7a5233, 0x9a6a40, 0x5a3a22];
  for (let i = 0; i < 4; i++) {
    const r = scene.add.rectangle(x, y - 2, 2, 2, cols[i % cols.length]).setDepth(9700);
    const vx = (Math.random() - 0.5) * 36;
    scene.tweens.add({
      targets: r,
      x: x + vx,
      y: y + 6,
      alpha: 0,
      duration: 420,
      ease: 'Quad.easeOut',
      onUpdate: (tw) => {
        r.y = y - 2 - Math.sin(Math.PI * Number(tw.progress)) * (8 + Math.random() * 2) + Number(tw.progress) * 8;
      },
      onComplete: () => r.destroy(),
    });
  }
}
