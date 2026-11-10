import Phaser from 'phaser';
import {
  FOOT_H,
  FOOT_W,
  GAME_HEIGHT,
  GAME_WIDTH,
  PLAYER_SPEED,
  TILE,
  YEAR_COLOR_NOW,
  YEAR_COLOR_PAST,
  YEAR_NOW,
  YEAR_PAST,
} from '../config';
import { audio, type SfxName } from '../audio/audio';
import { CARDS } from '../data/cards';
import { CUTSCENES, type CutStep } from '../data/cutscenes';
import { SCRIPTS } from '../data/dialogues';
import { PAPER_PAGES } from '../data/papers';
import { getMap, START_MAP, START_SPAWN } from '../map';
import type { Interactable, MapData, Spawn } from '../map/types';
import { renderMap } from '../render/mapRenderer';
import { clearSave, writeSave, type SaveData } from '../save/save';
import { gameState } from '../state/gameState';
import { QUEST_DONE_TEXT, currentStep } from '../state/quest';
import { findPath, nearestWalkable, type Point } from '../systems/pathfinding';
import { heldDirection } from '../systems/keys';
import { dialogue } from '../ui/dialogue';
import { SeasonEffects } from '../effects/seasonEffects';
import { PuppyFollower } from '../entities/puppy';
import { burstConfetti, burstDirt, flowerBurst } from '../effects/particles';
import { anyOverlayOpen, comicViewer, credits, imageCard, paperViewer, popText, uiState } from '../ui/overlays';
import { setGoalHint } from '../ui/hint';
import { PLAYER_ORIGIN_Y, type Dir } from './BootScene';

interface Entry {
  it: Interactable;
  rect: Phaser.Geom.Rectangle;
  sprite?: Phaser.GameObjects.Image;
  bubble: Phaser.GameObjects.Image;
  bubbleY: number;
}

/** 이 플래그가 처음 켜질 때 나는 효과음 */
const FLAG_SFX: Record<string, SfxName> = {
  got_parfait: 'pickup',
  hint_found: 'confirm',
  garden_open: 'sparkle',
  saw_banner: 'confirm',
  puppy_found: 'pickup',
  garden_dug: 'sparkle',
};

/** 컷신에 등장하는 캐릭터/물건 */
type Actor = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;

const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
/** 손가락으로 탭하기 쉽도록 상호작용 영역을 사방으로 넓히는 여유(px) */
const TAP_PAD = 6;
/** 키보드 상호작용이 가능한 거리(px) */
const KEY_RANGE = 22;

/**
 * 월드 씬: 걷기, 상호작용(NPC·오브젝트·문), 대화, 맵 이동, 퀘스트 목표 표시.
 * 맵은 `map/` 데이터로, 대사는 `data/dialogues.ts`로, 진행은 `state/`로 분리되어 있다.
 */
export class WorldScene extends Phaser.Scene {
  /** 마지막으로 화면을 만지거나 키를 누른 시각. 한참 가만히 있으면 목표 안내가 눈에 띄게 반응한다 */
  private lastInputAt = 0;
  private spawnOverride: Spawn | null = null;
  private ended = false;
  private mapId = START_MAP;
  private spawnId = START_SPAWN;

  private map!: MapData;
  private player!: Phaser.GameObjects.Sprite;
  private marker!: Phaser.GameObjects.Image;
  private arrow!: Phaser.GameObjects.Graphics;

  private entries: Entry[] = [];
  private facing: Dir = 'down';
  private facingHold = 0;
  private dirX = 0;
  private dirY = 0;
  private wasMoving = false;
  private moveGrace = 0;
  private speedScale = 0;
  /** 대화창이 캐릭터를 가리지 않도록 대화 중 카메라를 살짝 아래로 밀어 캐릭터를 위쪽에 보이게 하는 양(px) */
  private camShift = 0;
  /** 연도 표시: 목표값을 부드럽게 따라가는 값과, 지금 화면에 보이는 정수 */
  private yearValue = 0;
  private yearShown = -1;
  /** 걸어갈 지점들(픽셀 좌표). 칸 단위 경로를 직선으로 이어 지그재그를 없앤 것 */
  private path: Point[] = [];
  private pending: Interactable | null = null;
  private stuckTime = 0;
  private transitioning = false;
  /** 컷신(연출) 진행 중이면 플레이어는 움직일 수 없다 */
  private cutscene = false;
  private actors = new Map<string, Actor>();
  /** 이번 프레임에 대상을 바라보도록 정했으면 이동 방향으로 덮어쓰지 않는다 */
  private faceLock = false;
  /** 컷신 등장인물 머리 위 이름표(DOM) */
  private nameTags: { el: HTMLElement; actor: Actor }[] = [];
  /** 계절 파티클 연출 (effects/seasonConfig.ts 의 enabled 로 켜고 끔) */
  private seasons: SeasonEffects | null = null;
  /** 교수님을 따라다니는 강아지 (야외에서만. 건물 안에는 들어오지 않는다) */
  private puppy: PuppyFollower | null = null;

  constructor() {
    super('world');
  }

  init(data: { mapId?: string; spawn?: string }) {
    // 타이틀에서 "이어하기"를 골랐다면 저장된 맵과 위치에서 시작한다
    const resume = this.registry.get('resume') as SaveData | null | undefined;
    this.spawnOverride = null;
    if (!data.mapId && resume) {
      this.mapId = resume.map;
      this.spawnId = START_SPAWN;
      this.spawnOverride = { tx: resume.tx, ty: resume.ty, facing: resume.facing };
      this.registry.set('resume', null);
    } else {
      this.mapId = data.mapId ?? START_MAP;
      this.spawnId = data.spawn ?? START_SPAWN;
    }
  }

  create() {
    // 씬 인스턴스는 맵 이동 때 재사용되므로 상태를 초기화한다
    this.path = [];
    this.pending = null;
    this.stuckTime = 0;
    this.facingHold = 0;
    this.dirX = 0;
    this.dirY = 0;
    this.wasMoving = false;
    this.moveGrace = 0;
    this.speedScale = 0;
    this.camShift = 0;
    this.transitioning = false;
    this.cutscene = false;
    this.actors.clear();
    this.clearNameTags();
    this.faceLock = false;
    this.entries = [];

    this.map = getMap(this.mapId);
    this.cameras.main.setBackgroundColor('#14121c');
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.fadeIn(250, 20, 18, 28);

    renderMap(this, this.map);
    this.createInteractables();

    let spawn = this.map.spawns[this.spawnId] ?? Object.values(this.map.spawns)[0];
    const so = this.spawnOverride;
    if (so && !this.map.solid[so.ty]?.[so.tx]) spawn = so;
    this.facing = spawn.facing;
    this.player = this.add.sprite(spawn.tx * TILE + TILE / 2, spawn.ty * TILE + TILE / 2, 'player', `${this.facing}_0`);
    this.player.setOrigin(0.5, PLAYER_ORIGIN_Y);
    // 컷신에서 id로 부를 수 있도록 등록
    this.actors.set('player', this.player);
    // 강아지를 만난 뒤에는 야외 맵마다 교수님 곁에서 시작한다
    this.puppy = null;
    if (gameState.has('puppy_found') && this.map.theme !== 'indoor') {
      this.puppy = new PuppyFollower(this, this.player.x, this.player.y + 10);
      this.actors.set('puppy', this.puppy.sprite);
    }
    for (const e of this.entries) if (e.sprite) this.actors.set(e.it.id, e.sprite);

    this.marker = this.add.image(0, 0, 'marker').setVisible(false).setDepth(9000);
    this.arrow = this.add.graphics().setScrollFactor(0).setDepth(10000);
    this.updateCamera();
    this.yearValue = this.targetYear() ?? 0;
    this.yearShown = -1;
    this.updateYear(0);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onTap(p));

    window.addEventListener('keydown', this.onKey);
    // 입력이 없는 시간 재기 (길을 잃은 듯하면 안내를 돋보이게)
    this.lastInputAt = performance.now();
    const touch = () => {
      this.lastInputAt = performance.now();
    };
    window.addEventListener('pointerdown', touch);
    window.addEventListener('keydown', touch);
    this.syncInteractables();
    audio.bgm(this.map.music);
    let known = gameState.snapshot();
    const unsub = gameState.onChange(() => {
      this.refreshHint();
      this.syncInteractables();
      // 새로 켜진 플래그에 맞는 효과음
      const now = gameState.snapshot();
      for (const [flag, sfx] of Object.entries(FLAG_SFX)) if (now[flag] && !known[flag]) audio.sfx(sfx);
      known = now;
      this.persist();
    });
    this.time.addEvent({ delay: 4000, loop: true, callback: () => this.persist() });
    this.persist();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', this.onKey);
      window.removeEventListener('pointerdown', touch);
      window.removeEventListener('keydown', touch);
      document.getElementById('goal-hint')?.classList.remove('nudge');
      this.clearNameTags();
      this.seasons?.destroy();
      this.seasons = null;
      unsub();
    });
    this.refreshHint();
    this.seasons = SeasonEffects.enabled() ? new SeasonEffects(this, this.map) : null;

    if (import.meta.env.DEV) {
      // 개발 중 확인용 (브라우저 콘솔에서 __ddok 로 접근)
      (window as unknown as { __ddok: unknown }).__ddok = {
        scene: this,
        gameState,
        audio,
        // 테스트용 순간이동 (칸 좌표)
        tp: (tx: number, ty: number) => {
          this.player.setPosition(tx * TILE + TILE / 2, ty * TILE + TILE / 2);
          this.clearPath();
        },
        state: () => ({
          map: this.mapId,
          x: this.player.x,
          y: this.player.y,
          tx: Math.floor(this.player.x / TILE),
          ty: Math.floor(this.player.y / TILE),
          facing: this.facing,
          pathLength: this.path.length,
          busy: this.isBusy(),
          dialogueOpen: dialogue.isOpen,
          year: this.yearShown,
          flags: gameState.snapshot(),
        }),
      };
    }
  }

  // ───────────────────────── 상호작용 대상 ─────────────────────────

  private createInteractables() {
    for (const it of this.map.interactables) {
      const w = it.w ?? 1;
      const h = it.h ?? (it.kind === 'npc' ? 2 : 1);
      const rect = new Phaser.Geom.Rectangle(it.tx * TILE, (it.ty - h + 1) * TILE, w * TILE, h * TILE);

      let sprite: Phaser.GameObjects.Image | undefined;
      let bubbleY = rect.y - 2;
      if (it.texture) {
        if (it.kind === 'npc') {
          const dir = it.facing ?? 'down';
          sprite = this.add
            .image(it.tx * TILE + TILE / 2, it.ty * TILE + TILE / 2, it.texture, `${dir}_0`)
            .setOrigin(0.5, PLAYER_ORIGIN_Y)
            .setDepth(it.ty * TILE + TILE / 2);
        } else {
          sprite = this.add
            .image(rect.centerX + (it.dx ?? 0), (it.ty + 1) * TILE + (it.dy ?? 0), it.texture)
            .setOrigin(0.5, 1)
            .setDepth((it.ty + 1) * TILE + (it.z ?? 0));
        }
        bubbleY = sprite.y - sprite.displayHeight * sprite.originY - 2;
      }

      if (it.float && sprite) {
        this.tweens.add({ targets: sprite, y: sprite.y - 3, duration: 900, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
      }

      const bubble = this.add
        .image(rect.centerX, bubbleY, 'bubble')
        .setOrigin(0.5, 1)
        .setDepth(9500)
        .setVisible(false);
      this.entries.push({ it, rect, sprite, bubble, bubbleY });
    }
  }

  /** 습득한 아이템처럼 `hideIf` 플래그가 켜진 대상은 사라진 것으로 본다 */
  private isActive(it: Interactable) {
    if (it.hideIf && gameState.has(it.hideIf)) return false;
    if (it.showIf && !gameState.has(it.showIf)) return false;
    return true;
  }

  private syncInteractables() {
    for (const e of this.entries) {
      const on = this.isActive(e.it);
      e.sprite?.setVisible(on);
      // 열린 문, 열린 상자처럼 플래그에 따라 그림이 바뀌는 대상
      const alt = e.it.altTexture;
      if (alt && e.sprite && e.it.texture) e.sprite.setTexture(gameState.has(alt.flag) ? alt.texture : e.it.texture);
      if (!on) e.bubble.setVisible(false);
    }
  }

  private entryOf(it: Interactable) {
    return this.entries.find((e) => e.it === it);
  }

  /** 월드 좌표에 있는 상호작용 대상 */
  private interactableAt(wx: number, wy: number): Interactable | null {
    for (const e of this.entries) {
      if (!this.isActive(e.it)) continue;
      const r = e.rect;
      if (wx >= r.x - TAP_PAD && wx <= r.right + TAP_PAD && wy >= r.y - TAP_PAD && wy <= r.bottom + TAP_PAD) return e.it;
    }
    return null;
  }

  /** 플레이어에서 영역까지의 가장 가까운 거리 */
  private distanceTo(e: Entry) {
    const px = this.player.x;
    const py = this.player.y - 4;
    const cx = Phaser.Math.Clamp(px, e.rect.x, e.rect.right);
    const cy = Phaser.Math.Clamp(py, e.rect.y, e.rect.bottom);
    return Math.hypot(px - cx, py - cy);
  }

  private nearestInteractable(range: number): Interactable | null {
    let best: Interactable | null = null;
    let bestD = range;
    for (const e of this.entries) {
      if (!this.isActive(e.it)) continue;
      const d = this.distanceTo(e);
      if (d <= bestD) {
        bestD = d;
        best = e.it;
      }
    }
    return best;
  }

  private playerTile(): Point {
    return { x: Math.floor(this.player.x / TILE), y: Math.floor(this.player.y / TILE) };
  }

  /** 대상 옆에 설 수 있는 칸 중, 지금 위치에서 가장 가까운 칸 */
  private findApproach(it: Interactable): { tile: Point; path: Point[] } | null {
    const from = this.playerTile();
    const w = it.w ?? 1;
    const h = it.h ?? (it.kind === 'npc' ? 2 : 1);
    const candidates: Point[] = [];

    if (it.approach) {
      candidates.push({ x: it.approach.tx, y: it.approach.ty });
    } else {
      for (let y = it.ty - h; y <= it.ty + 1; y++) {
        for (let x = it.tx - 1; x <= it.tx + w; x++) {
          const inside = x >= it.tx && x < it.tx + w && y > it.ty - h && y <= it.ty;
          if (!inside) candidates.push({ x, y });
        }
      }
    }

    let best: { tile: Point; path: Point[]; cost: number } | null = null;
    for (const c of candidates) {
      if (c.x < 0 || c.y < 0 || c.x >= this.map.w || c.y >= this.map.h || this.map.solid[c.y][c.x]) continue;
      const path = findPath(this.map.solid, from, c);
      if (!path) continue;
      const inColumns = c.x >= it.tx && c.x < it.tx + w;
      const inRows = c.y > it.ty - h && c.y <= it.ty;
      const corner = !inColumns && !inRows; // 대각선 모서리 칸은 피한다
      const cost = path.length + (corner ? 3 : 0) + (c.y === it.ty + 1 ? -0.5 : 0); // 정면(아래쪽)을 약간 선호
      if (!best || cost < best.cost) best = { tile: c, path, cost };
    }
    return best ? { tile: best.tile, path: best.path } : null;
  }

  // ───────────────────────── 상호작용 실행 ─────────────────────────

  private isBusy() {
    return dialogue.isOpen || this.transitioning || this.cutscene || anyOverlayOpen();
  }

  private goInteract(it: Interactable) {
    const found = this.findApproach(it);
    if (!found) return;
    this.pending = it;
    this.path = this.toWaypoints(found.path);
    this.stuckTime = 0;
    if (found.path.length === 0) {
      this.finishPath();
      return;
    }
    this.showMarker(found.tile);
  }

  private showMarker(tile: Point) {
    this.tweens.killTweensOf(this.marker);
    this.marker.setPosition(tile.x * TILE + TILE / 2, tile.y * TILE + TILE / 2).setVisible(true).setAlpha(1).setScale(1.15);
    this.tweens.add({
      targets: this.marker,
      scale: 0.8,
      alpha: 0.45,
      duration: 480,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  /** 경로를 다 걸었을 때: 대기 중인 상호작용이 있으면 실행 */
  private finishPath() {
    const it = this.pending;
    this.pending = null;
    this.path = [];
    this.marker.setVisible(false);
    this.tweens.killTweensOf(this.marker);
    if (it) {
      this.faceToward(it);
      void this.interact(it);
    }
  }

  private faceToward(it: Interactable) {
    const e = this.entryOf(it);
    if (!e) return;
    const dx = e.rect.centerX - this.player.x;
    const dy = e.rect.centerY - (this.player.y - 8);
    this.facing = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
    this.faceLock = true;
    this.player.anims.stop();
    this.player.setFrame(`${this.facing}_0`);
    // NPC는 플레이어를 바라본다
    if (it.kind === 'npc' && !it.noTurn && e.sprite && it.texture) e.sprite.setFrame(`${OPPOSITE[this.facing]}_0`);
  }

  private async interact(it: Interactable) {
    if (this.isBusy()) return;
    if (it.requires && !gameState.has(it.requires)) {
      await dialogue.say(it.lockedText ?? '지금은 열 수 없어요.');
      return;
    }
    const a = it.action;
    if (a.type === 'dialogue') {
      // 이미 이벤트를 마친 NPC는 다른 대사를 한다
      const done = a.altScript ? gameState.has(a.altScript.flag) : false;
      const script = SCRIPTS[done && a.altScript ? a.altScript.script : a.script];
      if (!script) return;
      await dialogue.run(script);
      gameState.setMany(a.set);
      if (a.cutscene && !done) await this.runCutscene(a.cutscene);
      // NPC는 대화(와 컷신)가 끝나면 원래 바라보던 방향으로 돌아간다
      const e = this.entryOf(it);
      if (it.kind === 'npc' && e?.sprite) e.sprite.setFrame(`${it.facing ?? 'down'}_0`);
    } else if (a.type === 'card') {
      await imageCard.show(CARDS[a.card]);
      gameState.setMany(a.set);
    } else if (a.type === 'shelf') {
      await this.openShelf();
    } else if (a.type === 'calendar') {
      // 달력 안에서만 연도가 바뀐다 (화면 위 연도 표시와는 무관). 다시 누르면 2006부터
      for (const id of ['cal_2006', 'cal_2014', 'cal_2026', 'cal_end']) await imageCard.show(CARDS[id]);
    } else if (a.type === 'paper') {
      // 과제지를 펼쳐 넘겨 본다. 마지막 장까지 읽으면 힌트를 얻은 것으로 본다
      audio.bgm('paper'); // 교수님 첨삭을 읽는 동안은 잔잔한 바흐
      const res = await paperViewer.show(PAPER_PAGES);
      audio.bgm(this.map.music);
      if (res.readAll) {
        gameState.setMany(a.readSet);
        const after = a.after ? SCRIPTS[a.after] : undefined;
        if (after) await dialogue.run(after);
      }
    } else {
      gameState.setMany(a.set);
      audio.sfx('door');
      this.changeMap(a.toMap, a.toSpawn);
    }
  }

  /** 책장 메뉴: 닫기를 고를 때까지 몇 번이든 다시 볼 수 있다 */
  private async openShelf() {
    for (;;) {
      const i = await dialogue.pick('[교수님의 책장]', ['교수님의 저서 발견', '체육대회의 추억', '닫기']);
      if (i === 0) {
        for (const id of ['book_found', 'book_open', 'book_end']) await imageCard.show(CARDS[id]);
      } else if (i === 1) {
        await comicViewer.show('images/sports.jpg', '체육대회의 추억');
      } else {
        break;
      }
    }
  }

  // ───────────────────────── 컷신(연출) ─────────────────────────

  private delay(ms: number) {
    return new Promise<void>((resolve) => this.time.delayedCall(ms, resolve));
  }

  private actorOf(id: string): Actor {
    const a = this.actors.get(id);
    if (!a) throw new Error(`컷신 등장인물을 찾을 수 없음: ${id}`);
    return a;
  }

  private foot(id: string): Point {
    const a = this.actorOf(id);
    return { x: a.x, y: a.y };
  }

  /** data/cutscenes.ts 의 컷신을 처음부터 끝까지 재생. 그동안 플레이어는 움직일 수 없다 */
  private async runCutscene(id: string) {
    const steps = CUTSCENES[id];
    if (!steps) return;
    this.cutscene = true;
    this.clearPath();
    this.player.anims.stop();
    this.player.setFrame(`${this.facing}_0`);
    const created: string[] = [];
    try {
      for (const step of steps) await this.runStep(step, created);
    } finally {
      // 컷신 안에서 만든 임시 캐릭터/물건은 모두 정리
      for (const cid of created) {
        this.actors.get(cid)?.destroy();
        this.actors.delete(cid);
      }
      this.cutscene = false;
    }
  }

  private async runStep(st: CutStep, created: string[]) {
    switch (st.type) {
      case 'wait':
        await this.delay(st.ms);
        break;
      case 'say': {
        const script = SCRIPTS[st.script];
        if (script) await dialogue.run(script);
        break;
      }
      case 'flag':
        gameState.setMany(st.set);
        break;
      case 'spawn': {
        const x = st.at.tx * TILE + TILE / 2;
        const y = st.at.ty * TILE + TILE / 2;
        const spr = this.add
          .sprite(x, y, st.texture, `${st.facing ?? 'down'}_0`)
          .setOrigin(0.5, PLAYER_ORIGIN_Y)
          .setDepth(y)
          .setAlpha(0);
        this.actors.set(st.id, spr);
        created.push(st.id);
        if (st.label) this.addNameTag(spr, st.label);
        break;
      }
      case 'clap':
        await this.clap(st);
        break;
      case 'puppy':
        await this.puppyAct(st);
        break;
      case 'morph':
        await this.morph(st);
        break;
      case 'flowers':
        await this.flowerFireworks(st.at, st.rounds ?? 4);
        break;
      case 'gather':
        await this.gather(st);
        break;
      case 'face':
        for (const id of st.ids) this.faceActor(id, st.toward);
        break;
      case 'emote':
        for (const id of st.ids) this.emote(id, st.kind);
        audio.sfx('pop');
        break;
      case 'item':
        await this.passItem(st, created);
        break;
      case 'confetti': {
        const f = this.foot(st.at);
        burstConfetti(this, f.x, f.y - 14);
        audio.sfx('fanfare');
        break;
      }
      case 'sfx':
        audio.sfx(st.name);
        break;
      case 'pop':
        popText(st.text, st.ms);
        break;
      case 'card':
        await imageCard.show(CARDS[st.card]);
        break;
      case 'goto':
        this.changeMap(st.map, st.spawn);
        await new Promise<void>(() => undefined); // 씬이 다시 시작되므로 이후 단계는 실행되지 않는다
        break;
      case 'credits':
        this.ended = true;
        clearSave();
        // 크레딧 아래 화면을 잠시 숨겨 두었다가, 크레딧이 끝나면 쿠키 영상(아무도 없는 정원)을 보여 준다
        this.cameras.main.setAlpha(0);
        await credits.play();
        await this.cookieScene();
        this.cameras.main.fadeOut(900, 0, 0, 0);
        await this.delay(1100);
        window.location.reload(); // 처음부터 다시 시작
        break;
      case 'leave':
        await this.leave(st);
        break;
      case 'despawn':
        await this.despawn(st);
        break;
    }
  }

  private addNameTag(actor: Actor, text: string) {
    const el = document.createElement('div');
    el.className = 'name-tag';
    el.textContent = text;
    el.style.opacity = '0';
    document.body.appendChild(el);
    this.nameTags.push({ el, actor });
  }

  private clearNameTags() {
    for (const t of this.nameTags) t.el.remove();
    this.nameTags = [];
  }

  /** 이름표를 캐릭터 머리 위 화면 좌표로 옮긴다 (캐릭터가 사라지면 함께 제거) */
  private updateNameTags() {
    if (this.nameTags.length === 0) return;
    const rect = this.game.canvas.getBoundingClientRect();
    const k = rect.width / GAME_WIDTH;
    const cam = this.cameras.main;
    this.nameTags = this.nameTags.filter((t) => {
      if (!t.actor.active) {
        t.el.remove();
        return false;
      }
      const x = rect.left + (t.actor.x - cam.scrollX) * k;
      const y = rect.top + (t.actor.y - 31 - cam.scrollY) * k;
      t.el.style.left = `${x}px`;
      t.el.style.top = `${y}px`;
      t.el.style.fontSize = `${Math.max(11, 4.2 * k)}px`;
      t.el.style.opacity = String(t.actor.alpha);
      return true;
    });
  }

  /** 제자들이 폴짝 뛰며 박수를 친다 (짝짝짝) */
  /** 강아지 연출 한 단계 */
  private async puppyAct(st: Extract<CutStep, { type: 'puppy' }>) {
    const at = st.at ? { x: st.at.tx * TILE + TILE / 2, y: st.at.ty * TILE + TILE / 2 } : null;
    if (st.act === 'appear') {
      if (this.puppy || !at) return;
      const p = new PuppyFollower(this, at.x, at.y);
      p.busy = true;
      p.sprite.setAlpha(0);
      this.puppy = p;
      this.actors.set('puppy', p.sprite);
      // 수풀에서 교수님 앞으로 폴짝 튀어나온다
      const x1 = this.player.x + (at.x < this.player.x ? -10 : 10);
      const y1 = this.player.y + 4;
      p.pose('down', false);
      p.sprite.setAlpha(1);
      await new Promise<void>((resolve) =>
        this.tweens.addCounter({
          from: 0,
          to: 1,
          duration: 700,
          ease: 'Sine.easeOut',
          onUpdate: (tw) => {
            const t = Number(tw.getValue());
            p.sprite.x = at.x + (x1 - at.x) * t;
            p.sprite.y = at.y + (y1 - at.y) * t - Math.sin(Math.PI * t) * 16;
            p.sprite.setDepth(Math.max(p.sprite.y, at.y));
          },
          onComplete: () => resolve(),
        }),
      );
      p.sprite.y = y1;
      p.pose(this.player.x < p.sprite.x ? 'left' : 'right', false);
      return;
    }
    if (st.act === 'transform') {
      // 반짝! 강아지가 사람(남자)으로 변한다
      const p0 = this.puppy;
      const x = p0 ? p0.sprite.x : this.player.x;
      const y = p0 ? p0.sprite.y : this.player.y + 18;
      const flash = this.add.circle(x, y - 8, 6, 0xffffff, 0.95).setDepth(9800);
      this.tweens.add({ targets: flash, scale: 5, alpha: 0, duration: 650, onComplete: () => flash.destroy() });
      audio.sfx('sparkle');
      burstConfetti(this, x, y - 10);
      await this.delay(260);
      p0?.destroy();
      this.puppy = null;
      this.actors.delete('puppy');
      const man = this.add.sprite(x, y, 'man_dev', 'down_0').setOrigin(0.5, PLAYER_ORIGIN_Y).setDepth(y).setAlpha(0).setScale(0.6);
      this.actors.set('man_dev', man);
      this.tweens.add({ targets: man, alpha: 1, scale: 1, duration: 420, ease: 'Back.easeOut' });
      await this.delay(500);
      return;
    }
    const p = this.puppy;
    if (!p) return;
    if (st.act === 'sit') {
      p.busy = true;
      p.sit();
    } else if (st.act === 'free') {
      p.busy = false;
    } else if (st.act === 'run' && at) {
      p.busy = true;
      const dx = at.x - p.sprite.x;
      const dy = at.y - p.sprite.y;
      const dist = Math.hypot(dx, dy);
      p.pose(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down', true);
      await new Promise<void>((resolve) =>
        this.tweens.add({ targets: p.sprite, x: at.x, y: at.y, duration: Math.max(200, (dist / 95) * 1000), onComplete: () => resolve() }),
      );
      p.pose(p.facing, false);
    } else if (st.act === 'bark') {
      const was = p.busy;
      p.busy = true;
      p.sprite.anims.stop();
      audio.sfx('bark');
      popText('멍멍!', 800);
      const base = p.sprite.y;
      for (let i = 0; i < 2; i++) {
        await new Promise<void>((resolve) =>
          this.tweens.add({ targets: p.sprite, y: base - 5, duration: 110, yoyo: true, onComplete: () => resolve() }),
        );
        p.sprite.y = base;
        await this.delay(90);
      }
      p.busy = was;
    } else if (st.act === 'dig') {
      p.busy = true;
      p.pose('up', false);
      const end = this.time.now + (st.ms ?? 1500);
      let n = 0;
      while (this.time.now < end) {
        p.sprite.setFrame(`up_${n++ % 2}`);
        p.sprite.x += n % 2 ? 1 : -1; // 파헤치며 들썩인다
        if (n % 2) audio.sfx('step');
        burstDirt(this, p.sprite.x, p.sprite.y);
        await this.delay(120);
      }
      this.cameras.main.shake(260, 0.003);
      for (let i = 0; i < 3; i++) burstDirt(this, p.sprite.x + (i - 1) * 8, p.sprite.y - 4);
      p.pose('up', false);
    }
  }

  /** 변신: 반짝 빛 + 별가루 + 꽃폭죽 + 색종이와 함께, 몸이 찌그러졌다 커지면서 모습이 바뀐다 */
  private async morph(st: Extract<CutStep, { type: 'morph' }>) {
    await Promise.all(
      st.ids.map(async (id, i) => {
        await this.delay(i * (st.stagger ?? 300));
        const a = this.actorOf(id) as Phaser.GameObjects.Sprite;
        if (!a.active) return;
        const x = a.x;
        const y = a.y;
        audio.sfx('morph');
        // 퍼지는 하얀 빛
        const flash = this.add.circle(x, y - 14, 8, 0xffffff, 0.95).setDepth(9800);
        this.tweens.add({ targets: flash, scale: 6, alpha: 0, duration: 520, onComplete: () => flash.destroy() });
        // 별가루 고리
        for (let k = 0; k < 14; k++) {
          const ang = (k / 14) * Math.PI * 2;
          const r = this.add.rectangle(x, y - 14, 3, 3, k % 2 ? 0xffd25e : 0xffffff).setDepth(9801);
          this.tweens.add({
            targets: r,
            x: x + Math.cos(ang) * 34,
            y: y - 14 + Math.sin(ang) * 30,
            alpha: 0,
            duration: 650,
            ease: 'Quad.easeOut',
            onComplete: () => r.destroy(),
          });
        }
        // 몸이 납작해졌다가 모습이 바뀌며 통통 커진다
        await new Promise<void>((resolve) =>
          this.tweens.add({ targets: a, scaleX: 1.35, scaleY: 0.55, duration: 170, ease: 'Quad.easeIn', onComplete: () => resolve() }),
        );
        a.setTexture(st.to[i], 'down_0');
        burstConfetti(this, x, y - 12);
        flowerBurst(this, x, y - 26, 16);
        await new Promise<void>((resolve) =>
          this.tweens.add({ targets: a, scaleX: 1, scaleY: 1, duration: 420, ease: 'Back.easeOut', onComplete: () => resolve() }),
        );
      }),
    );
  }

  /** 쿠키 영상: 크레딧이 끝난 뒤, 아무도 없는 정원에서 강아지가 신나게 놀다가 사람으로 변하고 하트가 뜬다 */
  private async cookieScene() {
    for (const id of ['chick_hs', 'chick_ch', 'chick_ty', 'kid_hs', 'kid_ch', 'kid_ty']) {
      this.actors.get(id)?.destroy();
      this.actors.delete(id);
    }
    this.clearNameTags();
    this.player.setVisible(false);
    document.body.classList.add('cookie');
    const p = this.puppy ?? new PuppyFollower(this, 13 * TILE + 8, 4 * TILE + 8);
    if (!this.puppy) {
      this.puppy = p;
      this.actors.set('puppy', p.sprite);
    }
    p.busy = true;
    p.sprite.setPosition(13 * TILE + 8, 4 * TILE + 8);
    p.sit();
    this.tweens.add({ targets: this.cameras.main, alpha: 1, duration: 900 });
    await this.delay(1400);
    // 귀엽게 멍멍
    await this.puppyAct({ type: 'puppy', act: 'bark' });
    await this.delay(300);
    await this.puppyAct({ type: 'puppy', act: 'bark' });
    // 정원을 폴짝폴짝 뛰어다닌다
    for (const [tx, ty] of [[10, 8], [16, 8], [16, 12], [10, 12], [13, 9]] as const) {
      await this.puppyAct({ type: 'puppy', act: 'run', at: { tx, ty } });
      const base = p.sprite.y;
      for (let k = 0; k < 2; k++) {
        await new Promise<void>((resolve) =>
          this.tweens.add({ targets: p.sprite, y: base - 6, duration: 130, yoyo: true, onComplete: () => resolve() }),
        );
        p.sprite.y = base;
      }
      if (tx === 16 && ty === 12) await this.puppyAct({ type: 'puppy', act: 'bark' });
    }
    p.sit();
    await this.delay(1200);
    await this.puppyAct({ type: 'puppy', act: 'bark' });
    // 반짝! 사람으로 변한다
    await this.puppyAct({ type: 'puppy', act: 'transform' });
    await this.delay(600);
    this.emote('man_dev', 'heart');
    audio.sfx('fanfare');
    await this.flowerFireworks('man_dev', 5);
    await this.delay(2600);
  }

  /** 꽃폭죽: 하늘로 쏘아 올린 뒤 팡! 하고 꽃잎이 사방으로 터진다 */
  private async flowerFireworks(id: string, rounds: number) {
    const f = this.foot(id);
    const spots = [
      [-34, -46],
      [32, -58],
      [0, -72],
      [-18, -34],
      [24, -36],
    ];
    for (let i = 0; i < rounds; i++) {
      const [dx, dy] = spots[i % spots.length];
      const tx = f.x + dx;
      const ty = f.y + dy;
      // 올라가는 불꽃
      const rocket = this.add.rectangle(f.x + dx * 0.3, f.y - 8, 2, 4, 0xfff6d8).setDepth(9800);
      await new Promise<void>((resolve) =>
        this.tweens.add({ targets: rocket, x: tx, y: ty, duration: 300, ease: 'Quad.easeOut', onComplete: () => resolve() }),
      );
      rocket.destroy();
      audio.sfx(i % 2 ? 'sparkle' : 'pop');
      flowerBurst(this, tx, ty);
      await this.delay(330);
    }
  }

  private async clap(st: Extract<CutStep, { type: 'clap' }>) {
    const times = st.times ?? 4;
    await Promise.all(
      st.ids.map(async (id, i) => {
        const a = this.actorOf(id);
        const baseY = a.y;
        await this.delay(i * 120);
        for (let n = 0; n < times; n++) {
          if (!a.active) return;
          audio.sfx('pop');
          a.setFrame(n % 2 === 0 ? 'down_1' : 'down_2');
          await new Promise<void>((resolve) =>
            this.tweens.add({ targets: a, y: baseY - 3, duration: 90, yoyo: true, onComplete: () => resolve() }),
          );
          a.y = baseY;
          await this.delay(110);
        }
        a.setFrame('down_0');
      }),
    );
  }

  /** 캐릭터들이 대상 둘레의 빈 자리로 모여든다 (출발지와 가까운 자리부터, 서로 겹치지 않게) */
  private async gather(st: Extract<CutStep, { type: 'gather' }>) {
    const c = this.foot(st.around);
    const start = this.actorOf(st.ids[0]);
    const radius = (st.radius ?? 2.2) * TILE;
    const cands: Point[] = [];
    for (let deg = 0; deg < 360; deg += 15) {
      const rad = (deg * Math.PI) / 180;
      for (const k of [1, 1.35]) {
        const x = c.x + Math.cos(rad) * radius * k;
        const y = c.y + Math.sin(rad) * radius * 0.85 * k;
        if (!this.canStand(x, y)) continue;
        if (Math.hypot(x - this.player.x, y - this.player.y) < 20) continue; // 교수님을 가리지 않게
        if (Math.hypot(x - c.x, y - c.y) < 18) continue;
        cands.push({ x, y });
      }
    }
    cands.sort((a, b) => Math.hypot(a.x - start.x, a.y - start.y) - Math.hypot(b.x - start.x, b.y - start.y));
    const spots: Point[] = [];
    for (const p of cands) {
      if (spots.every((q) => Math.hypot(p.x - q.x, p.y - q.y) >= 22)) spots.push(p);
      if (spots.length >= st.ids.length) break;
    }
    while (spots.length < st.ids.length) spots.push({ x: c.x - 24 - spots.length * 6, y: c.y + 4 });

    await Promise.all(
      st.ids.map(async (id, i) => {
        await this.delay(i * (st.stagger ?? 250));
        this.actorOf(id).setAlpha(1);
        await this.walkTo(id, spots[i]);
      }),
    );
  }

  /** 칸 길찾기 + 직선 다듬기로 목표 지점까지 걸어간다 */
  private async walkTo(id: string, target: Point) {
    const a = this.actorOf(id) as Phaser.GameObjects.Sprite;
    const from = { x: Math.floor(a.x / TILE), y: Math.floor(a.y / TILE) };
    const to = nearestWalkable(this.map.solid, { x: Math.floor(target.x / TILE), y: Math.floor(target.y / TILE) }) ?? from;
    const tiles = findPath(this.map.solid, from, to) ?? [];
    const pts = this.toWaypoints(tiles, { x: a.x, y: a.y });
    if (pts.length === 0 || Math.hypot(pts[pts.length - 1].x - target.x, pts[pts.length - 1].y - target.y) < TILE) {
      pts.pop();
      pts.push(target);
    }
    for (const p of pts) await this.walkSegment(a, p);
    a.anims.stop();
    a.setFrame(`${(a.getData('dir') as Dir | undefined) ?? 'down'}_0`);
  }

  private walkSegment(a: Phaser.GameObjects.Sprite, p: Point) {
    return new Promise<void>((resolve) => {
      const dx = p.x - a.x;
      const dy = p.y - a.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.5) {
        resolve();
        return;
      }
      const dir: Dir = Math.abs(dx) > Math.abs(dy) * 1.2 ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
      a.setData('dir', dir);
      a.anims.play(`${a.texture.key}_walk_${dir}`, true);
      this.tweens.add({
        targets: a,
        x: p.x,
        y: p.y,
        duration: (dist / 64) * 1000,
        ease: 'Linear',
        onUpdate: () => a.setDepth(a.y),
        onComplete: () => {
          a.setDepth(a.y);
          resolve();
        },
      });
    });
  }

  private faceActor(id: string, toward: string) {
    const a = this.actorOf(id);
    const t = this.foot(toward);
    const dx = t.x - a.x;
    const dy = t.y - a.y;
    const dir: Dir = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
    a.setFrame(`${dir}_0`);
    if (a instanceof Phaser.GameObjects.Sprite) a.setData('dir', dir);
    if (id === 'player') this.facing = dir;
  }

  /** 머리 위에 말풍선이 잠깐 떴다가 사라진다 */
  private emote(id: string, kind: 'excl' | 'heart' | 'note') {
    const a = this.actorOf(id);
    const key = kind === 'excl' ? 'bubble' : kind === 'heart' ? 'emote_heart' : 'emote_note';
    const top = a.y - a.displayHeight * a.originY;
    const img = this.add.image(a.x, top - 2, key).setOrigin(0.5, 1).setDepth(9600);
    this.tweens.add({
      targets: img,
      y: img.y - 6,
      alpha: { from: 1, to: 0 },
      delay: 650,
      duration: 450,
      onComplete: () => img.destroy(),
    });
  }

  /** 물건이 포물선을 그리며 전달된다 */
  private async passItem(st: Extract<CutStep, { type: 'item' }>, created: string[]) {
    const from = this.foot(st.from);
    const to = this.foot(st.to);
    const img = this.add.image(from.x, from.y - 14, st.texture).setOrigin(0.5, 1).setDepth(9400);
    this.actors.set(st.id, img);
    created.push(st.id);
    const x0 = img.x;
    const y0 = img.y;
    const x1 = to.x;
    const y1 = to.y - 6; // 얼굴을 가리지 않고 가슴 높이에서 받는다
    await new Promise<void>((resolve) => {
      this.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 650,
        ease: 'Sine.easeInOut',
        onUpdate: (tw) => {
          const t = Number(tw.getValue());
          img.x = x0 + (x1 - x0) * t;
          img.y = y0 + (y1 - y0) * t - Math.sin(Math.PI * t) * 18;
        },
        onComplete: () => resolve(),
      });
    });
  }

  private async leave(st: Extract<CutStep, { type: 'leave' }>) {
    const target = { x: st.to.tx * TILE + TILE / 2, y: st.to.ty * TILE + TILE / 2 };
    await Promise.all(
      st.ids.map(async (id, i) => {
        await this.delay(i * (st.stagger ?? 150));
        await this.walkTo(id, target);
        await this.despawn({ type: 'despawn', ids: [id], fade: true });
      }),
    );
  }

  private async despawn(st: Extract<CutStep, { type: 'despawn' }>) {
    await Promise.all(
      st.ids.map(async (id) => {
        const a = this.actors.get(id);
        if (!a) return;
        if (st.fade) {
          await new Promise<void>((resolve) =>
            this.tweens.add({ targets: a, alpha: 0, duration: 220, onComplete: () => resolve() }),
          );
        }
        a.destroy();
        this.actors.delete(id);
      }),
    );
  }

  /** 진행 상황을 저장한다 (새로고침해도 "이어하기"로 돌아올 수 있게) */
  private persist() {
    if (this.ended || this.transitioning) return;
    const t = this.playerTile();
    writeSave({ flags: gameState.snapshot(), map: this.mapId, tx: t.x, ty: t.y, facing: this.facing });
  }

  private changeMap(mapId: string, spawn: string) {
    this.transitioning = true;
    this.clearPath();
    this.player.anims.stop();
    this.cameras.main.fadeOut(250, 20, 18, 28);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.restart({ mapId, spawn });
    });
  }

  /** 키보드: Space / Enter / E 로 가까운 대상과 상호작용 */
  private onKey = (e: KeyboardEvent) => {
    if (e.repeat) return;
    if (e.code !== 'Space' && e.code !== 'Enter' && e.code !== 'KeyE') return;
    // 대화를 넘기던 같은 키 입력이 곧바로 새 상호작용으로 이어지지 않도록
    const sinceClose = performance.now() - Math.max(dialogue.closedAt, uiState.closedAt);
    if (this.isBusy() || sinceClose < 300) return;
    const it = this.nearestInteractable(KEY_RANGE);
    if (!it) return;
    e.preventDefault();
    this.clearPath();
    this.faceToward(it);
    void this.interact(it);
  };

  // ───────────────────────── 충돌 ─────────────────────────

  private isSolidAt(px: number, py: number) {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    if (tx < 0 || ty < 0 || tx >= this.map.w || ty >= this.map.h) return true;
    return this.map.solid[ty][tx];
  }

  /** 발 박스의 네 모서리가 모두 이동 가능한 칸이면 서 있을 수 있음 */
  private canStand(x: number, y: number) {
    const l = x - FOOT_W / 2;
    const r = x + FOOT_W / 2 - 0.01;
    const t = y - FOOT_H;
    const b = y - 0.01;
    return !(this.isSolidAt(l, t) || this.isSolidAt(r, t) || this.isSolidAt(l, b) || this.isSolidAt(r, b));
  }

  /** 축별로 따로 이동해서 벽에 닿아도 미끄러지듯 움직인다. 이동했으면 true */
  private tryMove(dx: number, dy: number) {
    let moved = false;
    if (dx !== 0 && this.canStand(this.player.x + dx, this.player.y)) {
      this.player.x += dx;
      moved = true;
    }
    if (dy !== 0 && this.canStand(this.player.x, this.player.y + dy)) {
      this.player.y += dy;
      moved = true;
    }
    return moved;
  }

  // ───────────────────────── 입력 ─────────────────────────

  private onTap(p: Phaser.Input.Pointer) {
    if (this.isBusy()) return;

    // 상호작용 대상을 탭하면: 다가가서 실행
    const hit = this.interactableAt(p.worldX, p.worldY);
    if (hit) {
      this.goInteract(hit);
      return;
    }

    // 그 외: 그 위치로 걸어가기
    const target = nearestWalkable(this.map.solid, {
      x: Math.floor(p.worldX / TILE),
      y: Math.floor(p.worldY / TILE),
    });
    if (!target) return;
    const path = findPath(this.map.solid, this.playerTile(), target);
    if (!path) return;

    this.pending = null;
    this.path = this.toWaypoints(path);
    this.stuckTime = 0;
    this.showMarker(target);
  }

  /**
   * 칸 단위 경로(A*)를 "직선으로 막힘없이 갈 수 있는 지점"만 남겨 줄인다.
   * 칸 중심을 하나씩 밟으면 대각선·직선이 번갈아 나와 캐릭터가 지그재그로 꺾이므로,
   * 최대한 길게 직선으로 이어서 방향 전환 횟수를 줄인다.
   */
  private toWaypoints(tiles: Point[], origin?: Point): Point[] {
    const pts = tiles.map((t) => ({ x: t.x * TILE + TILE / 2, y: t.y * TILE + TILE / 2 }));
    const out: Point[] = [];
    let cx = origin?.x ?? this.player.x;
    let cy = origin?.y ?? this.player.y;
    let i = 0;
    while (i < pts.length) {
      let j = i;
      for (let k = pts.length - 1; k > i; k--) {
        if (this.lineClear(cx, cy, pts[k].x, pts[k].y)) {
          j = k;
          break;
        }
      }
      out.push(pts[j]);
      cx = pts[j].x;
      cy = pts[j].y;
      i = j + 1;
    }
    return out;
  }

  /** 두 지점 사이를 발 박스로 걸어도 막히지 않는지 (3px 간격으로 검사) */
  private lineClear(x0: number, y0: number, x1: number, y1: number) {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3));
    for (let s = 1; s <= n; s++) {
      const t = s / n;
      if (!this.canStand(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return false;
    }
    return true;
  }

  private clearPath() {
    this.path = [];
    this.pending = null;
    this.marker.setVisible(false);
    this.tweens.killTweensOf(this.marker);
  }

  // ───────────────────────── 업데이트 ─────────────────────────

  update(time: number, delta: number) {
    const dt = Math.min(delta, 50) / 1000;
    this.faceLock = false;
    this.updateNameTags();

    // 이번 프레임의 "의도한 이동 방향"(단위 벡터)과, 경로를 따라갈 때 남은 거리
    let ux = 0;
    let uy = 0;
    let following = false;
    let maxStep = Infinity;

    if (!this.isBusy()) {
      // 키보드가 있으면 키보드 우선, 없으면 탭 경로
      // 맵이 바뀌어도 누르고 있던 방향키를 그대로 이어받는다 (systems/keys.ts)
      const { x: kx, y: ky } = heldDirection();

      if (kx !== 0 || ky !== 0) {
        if (this.path.length || this.pending) this.clearPath();
        const len = Math.hypot(kx, ky);
        ux = kx / len;
        uy = ky / len;
      } else if (this.path.length) {
        const next = this.path[0];
        const dx = next.x - this.player.x;
        const dy = next.y - this.player.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.75) {
          this.path.shift();
          if (!this.path.length) this.finishPath();
        } else {
          ux = dx / dist;
          uy = dy / dist;
          following = true;
          maxStep = dist;
        }
      }
    }

    // 이동: 출발할 때 아주 짧게 가속해서 갑작스러운 느낌을 줄인다
    let moved = false;
    if (ux !== 0 || uy !== 0) {
      this.speedScale = Math.min(1, this.speedScale + dt / 0.12);
      const step = Math.min(PLAYER_SPEED * dt * (0.5 + 0.5 * this.speedScale), maxStep);
      moved = this.tryMove(ux * step, uy * step);
      if (following) {
        // 어딘가에 끼어 못 움직이면 경로 포기
        this.stuckTime = moved ? 0 : this.stuckTime + dt;
        if (this.stuckTime > 0.4) this.clearPath();
      }
    } else {
      this.speedScale = 0;
    }

    // 벽을 따라 미끄러질 때 등 잠깐 못 움직여도 걷기 모션이 끊기지 않도록 짧은 유예를 둔다
    this.moveGrace = moved ? 0.12 : Math.max(0, this.moveGrace - dt);
    const walking = this.moveGrace > 0 && !this.isBusy();

    // 방향/애니메이션
    if (!this.faceLock) this.updateFacing(ux, uy, dt);
    if (walking) {
      this.player.anims.play(`player_walk_${this.facing}`, true);
      if (moved) audio.footstep(time);
    } else {
      this.player.anims.stop();
      this.player.setFrame(`${this.facing}_0`);
    }

    // 깊이 정렬(앞뒤 가림), 카메라, 말풍선, 목표 표시
    this.player.setDepth(this.player.y);
    this.checkZones();
    this.updateYear(dt);
    this.seasons?.update(dt, this.player.x / TILE, this.player.y / TILE);
    this.puppy?.update(dt, this.player.x, this.player.y);
    this.updateNudge();
    this.camShift += ((dialogue.isOpen ? 36 : 0) - this.camShift) * (1 - Math.exp(-dt / 0.12));
    this.updateCamera();
    this.updateBubbles(time);
    this.updateGoal(time);
  }

  /**
   * 바라보는 방향 결정 (대각선 이동에서 모습이 휙휙 바뀌는 것을 막기 위한 규칙).
   * 1) 이동 방향을 짧은 시간(약 0.14초) 평균 내어 순간적인 흔들림을 걸러낸다.
   * 2) 한 축이 확실히(1.8배 이상) 우세할 때만 좌우/상하를 정한다.
   * 3) 대각선은 현재 방향을 유지하고, 새로 출발할 때는 정면/뒷모습을 쓴다.
   * 4) 방향을 바꾼 뒤에는 0.35초 동안 다시 바꾸지 않는다. (멈췄다 출발할 때는 즉시 바꿈)
   */
  private updateFacing(ux: number, uy: number, dt: number) {
    this.facingHold = Math.max(0, this.facingHold - dt);
    if (ux === 0 && uy === 0) {
      this.wasMoving = false;
      return;
    }

    if (!this.wasMoving) {
      this.dirX = ux;
      this.dirY = uy;
    } else {
      const k = 1 - Math.exp(-dt / 0.14);
      this.dirX += (ux - this.dirX) * k;
      this.dirY += (uy - this.dirY) * k;
    }

    const ax = Math.abs(this.dirX);
    const ay = Math.abs(this.dirY);
    const horiz: Dir = this.dirX < 0 ? 'left' : 'right';
    const vert: Dir = this.dirY < 0 ? 'up' : 'down';
    let next: Dir;
    if (ax > ay * 1.8) next = horiz;
    else if (ay > ax * 1.8) next = vert;
    else next = this.facing === horiz || this.facing === vert ? this.facing : vert;

    if (next !== this.facing && (!this.wasMoving || this.facingHold <= 0)) {
      this.facing = next;
      this.facingHold = 0.35;
    }
    this.wasMoving = true;
  }

  /**
   * 지금 위치의 연도. 길(timeline.line)에 가장 가까운 지점이 길 위 어디쯤인지(0~1)로 정한다.
   * 본관 앞(길의 끝) = from(2026), 산학협력관 앞(길의 시작) = to(2006). 내려가면 과거, 올라가면 다시 현재.
   */
  private targetYear(): number | null {
    const t = this.map.timeline;
    if (!t) return null;
    if (t.kind === 'fixed') return t.year;

    const px = this.player.x / TILE;
    const py = this.player.y / TILE;
    let best = Infinity;
    let bestS = 0;
    let acc = 0;
    for (let i = 0; i < t.line.length - 1; i++) {
      const [ax, ay] = t.line[i];
      const [bx, by] = t.line[i + 1];
      const vx = bx - ax;
      const vy = by - ay;
      const len = Math.hypot(vx, vy);
      const u = Phaser.Math.Clamp(((px - ax) * vx + (py - ay) * vy) / (len * len), 0, 1);
      const dist = Math.hypot(px - (ax + vx * u), py - (ay + vy * u));
      if (dist < best) {
        best = dist;
        bestS = acc + len * u;
      }
      acc += len;
    }
    const frac = acc > 0 ? bestS / acc : 0;
    return t.to + (t.from - t.to) * frac;
  }

  /** 상단 연도(숫자만) 갱신. 숫자가 휙 바뀌지 않도록 목표값을 부드럽게 따라간다 */
  private updateYear(dt: number) {
    const el = document.getElementById('year');
    if (!el) return;
    const target = this.targetYear();
    if (target === null) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    this.yearValue += (target - this.yearValue) * (dt > 0 ? 1 - Math.exp(-dt / 0.18) : 1);
    const shown = Math.round(this.yearValue);
    const num = el.querySelector('.y-num');
    if (shown !== this.yearShown && num) {
      this.yearShown = shown;
      num.textContent = String(shown);
    }
    // 과거로 갈수록 흰색 → 따뜻한 세피아색 (연속값으로 계산해 색도 부드럽게 변함)
    const k = Phaser.Math.Clamp((YEAR_NOW - this.yearValue) / (YEAR_NOW - YEAR_PAST), 0, 1);
    const c = YEAR_COLOR_NOW.map((v, i) => Math.round(v + (YEAR_COLOR_PAST[i] - v) * k));
    el.style.color = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }

  /** 20초 넘게 아무 입력이 없으면 상단 목표 문구가 통통 튀며 다음 할 일을 알려 준다 */
  private updateNudge() {
    const idle = !this.isBusy() && performance.now() - this.lastInputAt > 20000;
    const hint = document.getElementById('goal-hint');
    if (hint && hint.classList.contains('nudge') !== idle) hint.classList.toggle('nudge', idle);
  }

  /** 구역에 들어서면 플래그를 켠다 (예: 산학협력관 앞 도착) */
  private checkZones() {
    if (this.isBusy()) return;
    const t = this.playerTile();
    for (const z of this.map.zones) {
      if (z.requires && !gameState.has(z.requires)) continue;
      const inside = t.x >= z.tx && t.x < z.tx + z.w && t.y >= z.ty && t.y < z.ty + z.h;
      if (inside && Object.entries(z.set).some(([k, v]) => gameState.has(k) !== v)) {
        gameState.setMany(z.set);
        if (z.cutscene) void this.runCutscene(z.cutscene);
      }
    }
  }

  /** 카메라를 직접 계산해 픽셀 단위로 고정 (화살표 위치 계산과 어긋나지 않게). 맵이 화면보다 작으면 가운데 정렬 */
  private updateCamera() {
    const cam = this.cameras.main;
    const mapW = this.map.w * TILE;
    const mapH = this.map.h * TILE;
    const sx =
      mapW <= GAME_WIDTH
        ? -Math.round((GAME_WIDTH - mapW) / 2)
        : Phaser.Math.Clamp(Math.round(this.player.x - GAME_WIDTH / 2), 0, mapW - GAME_WIDTH);
    const sy =
      mapH <= GAME_HEIGHT
        ? -Math.round((GAME_HEIGHT - mapH) / 2)
        : Phaser.Math.Clamp(Math.round(this.player.y - 16 - GAME_HEIGHT / 2 + this.camShift), 0, mapH - GAME_HEIGHT);
    cam.setScroll(sx, sy);
  }

  /** 가까이 가면 가장 가까운 상호작용 대상 위에만 말풍선(!)이 떠서 흔들린다 (여러 개가 한꺼번에 뜨면 어수선하므로) */
  private updateBubbles(time: number) {
    let nearest: Entry | null = null;
    const cookie = document.body.classList.contains('cookie'); // 쿠키 영상에서는 느낌표를 숨긴다
    if (!this.isBusy() && !cookie) {
      let best = 44;
      for (const e of this.entries) {
        if (!this.isActive(e.it)) continue;
        const d = this.distanceTo(e);
        if (d < best) {
          best = d;
          nearest = e;
        }
      }
    }
    for (const e of this.entries) {
      const on = e === nearest || (!cookie && !!e.it.beacon && this.isActive(e.it));
      e.bubble.setVisible(on);
      if (on) e.bubble.y = e.bubbleY - 2 + Math.sin(time / 230) * 1.5;
    }
  }

  // ───────────────────────── 목표 안내 ─────────────────────────

  private refreshHint() {
    const step = currentStep();
    if (step) setGoalHint(step.text);
    else setGoalHint(QUEST_DONE_TEXT, '완료');
  }

  private updateGoal(time: number) {
    const gfx = this.arrow;
    gfx.clear();
    const step = currentStep();
    if (!step?.target || this.isBusy() || document.body.classList.contains('cookie')) return;
    // 목표가 다른 맵에 있으면, 이 맵에서 그쪽으로 나가는 문을 가리킨다
    const tgt = step.target.map === this.mapId ? step.target : this.map.links?.[step.target.map];
    if (!tgt) return;

    const gx = tgt.tx * TILE + TILE / 2;
    const gy = tgt.ty * TILE + TILE / 2;
    const cam = this.cameras.main;
    const sx = gx - cam.scrollX;
    const sy = gy - cam.scrollY;
    const idleBoost = performance.now() - this.lastInputAt > 20000 ? 3 : 1;
    const bounce = Math.sin(time / (idleBoost > 1 ? 150 : 240)) * 2 * idleBoost;
    const margin = 12;

    const triangle = (cx: number, cy: number, angle: number) => {
      const pt = (lx: number, ly: number) => ({
        x: cx + lx * Math.cos(angle) - ly * Math.sin(angle),
        y: cy + lx * Math.sin(angle) + ly * Math.cos(angle),
      });
      const a = pt(7, 0);
      const b = pt(-5, -6);
      const c = pt(-5, 6);
      gfx.fillStyle(0x14121c, 1);
      gfx.fillTriangle(a.x + 1, a.y + 1, b.x + 1, b.y + 1, c.x + 1, c.y + 1);
      gfx.fillStyle(0xffd25e, 1);
      gfx.fillTriangle(a.x, a.y, b.x, b.y, c.x, c.y);
    };

    const onScreen = sx > margin && sx < GAME_WIDTH - margin && sy > margin && sy < GAME_HEIGHT - margin;
    if (onScreen) {
      // 목표가 보이면 머리 위에서 아래를 가리키는 화살표 (바로 앞까지 오면 방해되지 않게 숨김)
      if (Math.hypot(this.player.x - gx, this.player.y - gy) < 28) return;
      // 사람(NPC)이 목표면 머리 위로 더 높이 띄워 몸을 가리지 않게 한다
      const onNpc = this.map.interactables.some((it) => it.kind === 'npc' && it.tx === tgt.tx && it.ty === tgt.ty);
      triangle(sx, sy - (onNpc ? 48 : 22) + bounce, Math.PI / 2);
    } else {
      // 화면 밖이면 가장자리에서 목표 방향을 가리킴
      const cx = GAME_WIDTH / 2;
      const cy = GAME_HEIGHT / 2;
      const dx = sx - cx;
      const dy = sy - cy;
      const t = Math.min((cx - margin) / Math.abs(dx || 1e-6), (cy - margin) / Math.abs(dy || 1e-6));
      triangle(cx + dx * t, cy + dy * t, Math.atan2(dy, dx));
    }
  }
}
