import Phaser from 'phaser';
import { TILE } from '../config';
import type { Building, MapData } from '../map/types';

/** 맵의 바닥·건물·나무·소품을 그린다 (시안 그래픽: 이미지 파일 없이 코드로 도트를 그림) */
export function renderMap(scene: Phaser.Scene, map: MapData) {
  if (map.theme === 'outdoor') drawOutdoorGround(scene, map);
  else drawIndoorGround(scene, map);

  map.buildings.forEach((b, i) => {
    const key = `building_${map.id}_${i}`;
    if (!scene.textures.exists(key)) paintBuilding(scene, key, b);
    scene.add
      .image(b.tx * TILE, b.ty * TILE, key)
      .setOrigin(0, 0)
      .setDepth((b.ty + b.th) * TILE);
  });

  for (const t of map.trees) {
    const y = t.ty * TILE + TILE;
    scene.add
      .image(t.tx * TILE + TILE / 2, y + 2, t.kind === 'pine' ? 'tree_pine' : 'tree_oak')
      .setOrigin(0.5, 1)
      .setDepth(y);
  }

  for (const p of map.props) {
    const y = p.ty * TILE + TILE;
    scene.add
      .image(p.tx * TILE + TILE / 2, y, p.kind)
      .setOrigin(0.5, 1)
      .setDepth(y);
  }

  // 장식(포스터, 창문, 깔개): 칸 왼쪽 아래 기준
  for (const d of map.decor ?? []) {
    const y = (d.ty + 1) * TILE;
    scene.add
      .image(d.tx * TILE, y, d.texture)
      .setOrigin(0, 1)
      .setDepth(d.depth ?? y);
  }
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function drawOutdoorGround(scene: Phaser.Scene, map: MapData) {
  const { w, h, ground } = map;
  const key = `ground_${map.id}`;
  if (!scene.textures.exists(key)) {
    const tex = scene.textures.createCanvas(key, w * TILE, h * TILE)!;
    const ctx = tex.context;
    const rand = seeded(42);
    const grass = ['#8fd16a', '#87c963', '#93d56e'];
    const isPath = (x: number, y: number) => {
      const v = ground[y]?.[x] ?? 0;
      return v === 1 || v === 2;
    };

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const px = x * TILE;
        const py = y * TILE;
        const g = ground[y][x];
        if (g === 3) {
          // 옹벽(돌담): 위쪽 윗면(걸침돌) + 벽돌 무늬 + 아래 그림자. 바닥 칸만큼 높이 차이를 표현
          const topEdge = ground[y - 1]?.[x] !== 3;
          const bottomEdge = ground[y + 1]?.[x] !== 3;
          ctx.fillStyle = '#aaa6b3';
          ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = '#8b8794';
          for (let r = 0; r < 2; r++) {
            const yy = py + r * 8;
            ctx.fillRect(px, yy + 7, TILE, 1);
            const off = (r + y) % 2 === 0 ? 0 : 8;
            ctx.fillRect(px + off + 7, yy, 1, 8);
          }
          ctx.fillStyle = '#bdb9c6';
          for (let i = 0; i < 3; i++) ctx.fillRect(px + 1 + ((i * 5 + x * 3) % 12), py + 1 + ((i * 7 + y) % 5) * 3, 2, 1);
          if (topEdge) {
            ctx.fillStyle = '#e2dee8';
            ctx.fillRect(px, py, TILE, 3);
            ctx.fillStyle = '#7a7684';
            ctx.fillRect(px, py + 3, TILE, 1);
          }
          if (bottomEdge) {
            ctx.fillStyle = '#6f6b7a';
            ctx.fillRect(px, py + TILE - 3, TILE, 3);
          }
          ctx.fillStyle = '#4a4655';
          if (ground[y]?.[x - 1] !== 3) ctx.fillRect(px, py, 1, TILE);
          if (ground[y]?.[x + 1] !== 3) ctx.fillRect(px + TILE - 1, py, 1, TILE);
        } else if (g === 0) {
          // 잔디: 체커 느낌의 은은한 두 톤 + 풀잎
          ctx.fillStyle = (x + y) % 2 === 0 ? grass[0] : grass[1];
          if (rand() < 0.18) ctx.fillStyle = grass[2];
          ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = '#74bb5c';
          for (let i = 0; i < 2; i++) {
            const gx = px + 1 + Math.floor(rand() * 13);
            const gy = py + 2 + Math.floor(rand() * 12);
            ctx.fillRect(gx, gy, 1, 2);
            ctx.fillRect(gx + 1, gy + 1, 1, 1);
          }
          // 옹벽 바로 아래는 그림자가 져서 높이 차이가 느껴지게
          if (ground[y - 1]?.[x] === 3) {
            ctx.fillStyle = 'rgba(30, 50, 40, 0.28)';
            ctx.fillRect(px, py, TILE, 5);
          }
          // 길 가장자리 잔디는 살짝 어둡게(길이 돋보이도록)
          if (isPath(x, y - 1) || isPath(x - 1, y) || isPath(x + 1, y)) {
            ctx.fillStyle = 'rgba(40, 90, 40, 0.10)';
            ctx.fillRect(px, py, TILE, TILE);
          }
        } else {
          // 길: 따뜻한 흙길 + 자갈
          ctx.fillStyle = (x + y) % 2 === 0 ? '#ead9ac' : '#e4d1a2';
          ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = '#d3bd8a';
          for (let i = 0; i < 3; i++) ctx.fillRect(px + 1 + Math.floor(rand() * 13), py + 1 + Math.floor(rand() * 13), 2, 1);
          ctx.fillStyle = '#f5e9c8';
          ctx.fillRect(px + 2 + Math.floor(rand() * 11), py + 2 + Math.floor(rand() * 11), 1, 1);
          // 잔디와 맞닿는 가장자리: 안쪽 밝은 선 + 바깥 짙은 선
          const edge = (dx: number, dy: number) => !isPath(x + dx, y + dy);
          ctx.fillStyle = '#b89b63';
          if (edge(0, -1)) ctx.fillRect(px, py, TILE, 1);
          if (edge(0, 1)) ctx.fillRect(px, py + TILE - 1, TILE, 1);
          if (edge(-1, 0)) ctx.fillRect(px, py, 1, TILE);
          if (edge(1, 0)) ctx.fillRect(px + TILE - 1, py, 1, TILE);
          ctx.fillStyle = '#f7edcf';
          if (edge(0, -1)) ctx.fillRect(px, py + 1, TILE, 1);
          if (edge(-1, 0)) ctx.fillRect(px + 1, py, 1, TILE);

          if (g === 2) {
            // 계단: 가로 단 4px씩, 위쪽 면은 밝고 단 아래는 어둡게
            for (let s = 0; s < 4; s++) {
              ctx.fillStyle = '#f2e3b8';
              ctx.fillRect(px, py + s * 4, TILE, 2);
              ctx.fillStyle = '#b89b63';
              ctx.fillRect(px, py + s * 4 + 2, TILE, 1);
              ctx.fillStyle = '#9d8250';
              ctx.fillRect(px, py + s * 4 + 3, TILE, 1);
            }
          }
        }
      }
    }

    // 꽃과 풀 장식 (길·건물·나무 칸 제외)
    const flowers = ['#fff4f0', '#ffb3c7', '#ffe066', '#c7a6ff'];
    let n = 0;
    let guard = 0;
    const flowerTarget = map.flowerCount ?? 260;
    while (n < flowerTarget && guard++ < flowerTarget * 12) {
      const x = 1 + Math.floor(rand() * (w - 2));
      const y = 1 + Math.floor(rand() * (h - 2));
      if (ground[y][x] !== 0 || map.solid[y][x]) continue;
      const px = x * TILE + 2 + Math.floor(rand() * 11);
      const py = y * TILE + 2 + Math.floor(rand() * 11);
      ctx.fillStyle = '#5fa84d';
      ctx.fillRect(px, py + 1, 1, 2);
      ctx.fillStyle = flowers[Math.floor(rand() * flowers.length)];
      ctx.fillRect(px - 1, py, 3, 1);
      ctx.fillRect(px, py - 1, 1, 3);
      ctx.fillStyle = '#ffe066';
      ctx.fillRect(px, py, 1, 1);
      n++;
    }
    tex.refresh();
  }
  scene.add.image(0, 0, key).setOrigin(0, 0).setDepth(0);
}

function drawIndoorGround(scene: Phaser.Scene, map: MapData) {
  const { w, h, ground } = map;
  const key = `ground_${map.id}`;
  const hall = map.style === 'hall';
  if (!scene.textures.exists(key)) {
    const tex = scene.textures.createCanvas(key, w * TILE, h * TILE)!;
    const ctx = tex.context;
    const rect = (x: number, y: number, rw: number, rh: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, rw, rh);
    };
    const WALL_ROWS = 4;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const px = x * TILE;
        const py = y * TILE;
        if (ground[y][x] === 0) {
          if (hall) {
            // 복도: 연한 회색 타일 바닥 + 은은한 광택
            rect(px, py, TILE, TILE, (x + y) % 2 === 0 ? '#d9d3c5' : '#cfc9ba');
            rect(px, py + TILE - 1, TILE, 1, '#b9b3a4');
            rect(px + TILE - 1, py, 1, TILE, '#b9b3a4');
            rect(px + 3, py + 4, 4, 1, 'rgba(255,255,255,0.4)');
            if (y === WALL_ROWS) rect(px, py, TILE, 5, 'rgba(0,0,0,0.14)');
          } else {
            // 나무 마루: 판자 줄무늬 + 엇갈린 이음매
            rect(px, py, TILE, TILE, y % 2 === 0 ? '#cf9f66' : '#c8975d');
            rect(px, py + TILE - 1, TILE, 1, '#a9784a');
            rect(px + ((y % 2) * 8 + 4), py, 1, TILE - 1, '#b98853');
            rect(px + 3, py + 3, 3, 1, '#d9ae78');
            if (y === WALL_ROWS) rect(px, py, TILE, 5, 'rgba(0,0,0,0.14)'); // 벽 아래 그림자
          }
        } else if (y < WALL_ROWS && x > 0 && x < w - 1) {
          if (hall) {
            // 복도 벽: 위는 연한 회벽, 아래는 초록 하단 벽(학교 복도 느낌) + 걸레받이
            if (y < 2) {
              rect(px, py, TILE, TILE, '#ece7d9');
              if (y === 0) rect(px, py, TILE, 3, '#d6d0bf');
            } else {
              rect(px, py, TILE, TILE, '#86ab92');
              rect(px + 7, py, 1, TILE, '#7a9f86');
              if (y === 2) {
                rect(px, py, TILE, 2, '#f2efe4');
                rect(px, py + 2, TILE, 1, '#5f8670');
              }
              if (y === WALL_ROWS - 1) {
                rect(px, py + TILE - 5, TILE, 5, '#4f6e5a');
                rect(px, py + TILE - 5, TILE, 1, '#6f8f7b');
              }
            }
          } else {
            // 윗벽: 줄무늬 벽지 + 마지막 줄은 걸레받이
            rect(px, py, TILE, TILE, '#f1e1c1');
            rect(px + 7, py, 2, TILE, '#e7d3ab');
            if (y === 0) rect(px, py, TILE, 3, '#d9c096');
            if (y === WALL_ROWS - 1) {
              rect(px, py + TILE - 6, TILE, 6, '#8d6544');
              rect(px, py + TILE - 6, TILE, 1, '#b08358');
            }
          }
        } else {
          // 옆벽·아래벽
          rect(px, py, TILE, TILE, hall ? '#6d6a60' : '#6d4a33');
          rect(px, py, TILE, 1, hall ? '#8a877b' : '#8a6247');
          rect(px, py + TILE - 1, TILE, 1, hall ? '#4f4d45' : '#523725');
        }
      }
    }
    tex.refresh();
  }
  scene.add.image(0, 0, key).setOrigin(0, 0).setDepth(0);
}

function paintBuilding(scene: Phaser.Scene, key: string, b: Building) {
  const w = b.tw * TILE;
  const h = b.th * TILE;
  const tex = scene.textures.createCanvas(key, w, h)!;
  const ctx = tex.context;
  ctx.imageSmoothingEnabled = false;
  const rect = (x: number, y: number, rw: number, rh: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, rw, rh);
  };

  const THEMES = {
    red: { wall: '#e0aa84', wallDark: '#c98f69', roof: '#a4503f', roofHi: '#bf6652', eave: '#8a3d31', trim: '#f6e8cb', awning: '#4f8f5a' },
    gray: { wall: '#d3b095', wallDark: '#b8937a', roof: '#6c7d8f', roofHi: '#8497ab', eave: '#566676', trim: '#f2e6d0', awning: '#4f8f5a' },
    // 수덕전(파르페 가게): 크림색 벽 + 분홍 지붕과 차양
    pink: { wall: '#f6dfd0', wallDark: '#e6c4b3', roof: '#e88aa8', roofHi: '#f4a9c0', eave: '#c4607f', trim: '#fffaf0', awning: '#e0708f' },
  } as const;
  const theme = THEMES[b.theme];

  // 벽 + 벽돌 무늬
  rect(0, 0, w, h, theme.wall);
  for (let y = 26; y < h - 4; y += 6) {
    rect(0, y, w, 1, theme.wallDark);
    const off = ((y - 26) / 6) % 2 === 0 ? 0 : 6;
    for (let x = off; x < w; x += 12) rect(x, y, 1, 6, theme.wallDark);
  }

  // 지붕 띠 (기와 무늬) + 처마 그림자
  rect(0, 0, w, 22, theme.roof);
  for (let y = 2; y < 22; y += 5) {
    rect(0, y, w, 1, theme.roofHi);
    for (let x = ((y / 5) | 0) % 2 === 0 ? 0 : 4; x < w; x += 8) rect(x, y + 1, 1, 4, theme.roofHi);
  }
  rect(0, 22, w, 3, theme.eave);
  rect(0, 25, w, 3, 'rgba(0,0,0,0.18)');

  // 창문: 문이 있는 가운데 열은 비움
  const doorX = Math.floor(w / 2) - 10;
  const drawWindow = (x: number, y: number) => {
    rect(x - 1, y - 1, 18, 16, theme.trim);
    rect(x, y, 16, 14, '#bfe3f2');
    rect(x, y, 16, 4, '#d9f0f8');
    rect(x + 7, y, 2, 14, theme.trim);
    rect(x, y + 6, 16, 1, theme.trim);
    rect(x - 2, y + 14, 20, 2, theme.wallDark);
  };
  const nearDoor = (x: number) => x + 16 > doorX - 8 && x < doorX + 28;
  const floors = b.th >= 8 ? [34, 92] : b.th >= 6 ? [34, 64] : [34];
  for (const fy of floors) {
    for (let x = 10; x < w - 24; x += 30) {
      if (b.emblem && x === 10) continue; // 이 자리는 아래에서 메뉴판으로 채움
      if (!nearDoor(x)) drawWindow(x, fy);
    }
    const lastX = w - 26;
    if (!nearDoor(lastX)) drawWindow(lastX, fy);
  }

  // 파르페 메뉴판 (수덕전): 액자 속 딸기파르페
  if (b.emblem === 'parfait') {
    const ex = 8;
    const ey = 30;
    rect(ex - 1, ey - 1, 22, 24, '#c97a96');
    rect(ex, ey, 20, 22, '#fffaf0');
    // 딸기, 생크림, 컵
    rect(ex + 6, ey + 3, 3, 3, '#e03b4d');
    rect(ex + 9, ey + 2, 3, 4, '#e03b4d');
    rect(ex + 12, ey + 4, 3, 2, '#e03b4d');
    rect(ex + 5, ey + 6, 10, 2, '#fff6f0');
    rect(ex + 4, ey + 8, 12, 2, '#ffb3c7');
    rect(ex + 4, ey + 10, 12, 2, '#fff6f0');
    rect(ex + 4, ey + 12, 12, 2, '#ff8fb0');
    rect(ex + 5, ey + 14, 10, 2, '#cfe3ee');
    rect(ex + 9, ey + 16, 2, 2, '#9fb2c4');
    rect(ex + 6, ey + 18, 8, 1, '#9fb2c4');
  }

  // 현수막: 두 줄 문구, 양 끝을 줄로 매단 모양
  if (b.banner && b.banner.length) {
    const bx = 10;
    const bw = w - 20;
    const by = 54;
    const bh = 8 + b.banner.length * 10;
    rect(bx + 3, by - 4, 2, 5, '#6a4630');
    rect(bx + bw - 5, by - 4, 2, 5, '#6a4630');
    rect(bx, by, bw, bh, '#d94b3a');
    rect(bx, by, bw, 2, '#ef6a58');
    rect(bx, by + bh - 2, bw, 2, '#a9372b');
    rect(bx + 3, by + 3, bw - 6, 1, 'rgba(255,246,216,0.55)');
    rect(bx + 3, by + bh - 4, bw - 6, 1, 'rgba(255,246,216,0.55)');
    rect(bx, by + bh, bw, 2, 'rgba(0,0,0,0.22)');
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff6d8';
    b.banner.forEach((line, i) => ctx.fillText(line, w / 2, by + 15 + i * 10));
  }

  // 출입문 + 계단
  rect(doorX - 3, h - 36, 26, 36, theme.trim);
  rect(doorX, h - 33, 20, 33, '#6a4630');
  rect(doorX + 9, h - 33, 2, 33, '#563622');
  rect(doorX + 1, h - 32, 8, 12, '#7d5539');
  rect(doorX + 11, h - 32, 8, 12, '#7d5539');
  rect(doorX + 7, h - 16, 2, 2, '#ffd25e');
  rect(doorX + 11, h - 16, 2, 2, '#ffd25e');
  rect(doorX - 6, h - 4, 32, 4, '#cfc6b4');
  rect(doorX - 6, h - 4, 32, 1, '#e9e2d2');

  // 차양 (초록·흰색 줄무늬)
  const awW = 40;
  const awX = Math.floor(w / 2) - awW / 2;
  for (let x = 0; x < awW; x += 5) {
    rect(awX + x, h - 46, 5, 9, (x / 5) % 2 === 0 ? theme.awning : '#f4f4ea');
  }
  rect(awX, h - 38, awW, 2, 'rgba(0,0,0,0.25)');

  // 간판
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  const textW = Math.max(40, Math.ceil(ctx.measureText(b.label).width) + 14);
  const sx = Math.floor(w / 2 - textW / 2);
  rect(sx, 6, textW, 13, '#5b3a29');
  rect(sx + 1, 7, textW - 2, 11, '#7d5539');
  ctx.fillStyle = '#fff1c4';
  ctx.fillText(b.label, w / 2, 16);

  // 기단 + 외곽선
  rect(0, h - 4, w, 4, 'rgba(0,0,0,0.16)');
  ctx.fillStyle = '#2d2a38';
  ctx.fillRect(0, 0, w, 1);
  ctx.fillRect(0, h - 1, w, 1);
  ctx.fillRect(0, 0, 1, h);
  ctx.fillRect(w - 1, 0, 1, h);
  tex.refresh();
}
