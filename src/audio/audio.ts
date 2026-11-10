/**
 * 사운드 엔진 (Web Audio API).
 *
 * - 효과음과 BGM을 모두 코드로 합성한다. 음원 파일이 없어도 소리가 나고, 저작권 걱정이 없다.
 * - BGM은 `public/audio/bgm_<이름>.m4a`(또는 .mp3) 파일을 넣으면 그 파일이 우선 재생된다.
 *   (무료 음원을 쓰고 싶을 때: 파일만 넣으면 됨. 이름: outdoor, indoor, garden, ending)
 * - iPad/Safari는 사용자가 화면을 한 번 터치해야 소리를 낼 수 있으므로, 타이틀의 시작 버튼에서 unlock() 한다.
 * - iPad 에서는 "터치한 순간"이 아니면 새 오디오 재생을 막는다. 그래서 BGM 파일은 시작 버튼에서 재생 허락을 받아 둔
 *   오디오 하나(musicEl)만 쓰고, 장면이 바뀌면 곡(src)만 바꿔 끼운다. 이 오디오는 Web Audio 에 연결해 볼륨을 조절한다
 *   (iPad 는 오디오의 volume 값을 무시하기 때문).
 * - 오른쪽 위 🔊 버튼으로 소리를 끌 수 있다 (설정은 기억됨).
 */

/** outdoor=비탈길, hall=복도(702호 앞), office=연구실(회상), paper=교수님 첨삭, garden=보물상자, ending=크레딧 (indoor 는 합성음 예비용) */
export type BgmName = 'outdoor' | 'indoor' | 'garden' | 'ending' | 'hall' | 'office' | 'paper';

/** 음원 파일이 없을 때 대신 쓰는 합성음 트랙 */
const SYNTH_FOR: Record<BgmName, 'outdoor' | 'indoor' | 'garden' | 'ending'> = {
  outdoor: 'outdoor',
  indoor: 'indoor',
  garden: 'garden',
  ending: 'ending',
  hall: 'indoor',
  office: 'indoor',
  paper: 'indoor',
};
/** 같은 음원 파일을 함께 쓰는 이름 (크레딧은 보물상자 음악을 끊김 없이 이어서 틀어 준다) */
const FILE_ALIAS: Partial<Record<BgmName, BgmName>> = { ending: 'garden' };
export type SfxName =
  | 'blip'
  | 'select'
  | 'confirm'
  | 'knock'
  | 'door'
  | 'paper'
  | 'pickup'
  | 'fanfare'
  | 'chest'
  | 'step'
  | 'pop'
  | 'sparkle'
  | 'bark'
  | 'morph';

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

interface Track {
  bpm: number;
  /** 8분음표 단위 길이 (32 = 4마디) */
  steps: number;
  lead: (number | null)[];
  bass: (number | null)[];
  leadBase: number;
  bassBase: number;
  leadWave: OscillatorType;
  bassWave: OscillatorType;
  leadVol: number;
  bassVol: number;
  /** 멜로디 음 길이(8분음표 배수) */
  leadLen: number;
}

/** 코드 진행 4마디(마디당 8스텝)의 뿌리음을 마디 첫 박/셋째 박에 깐다 */
function bassLine(roots: number[]): (number | null)[] {
  const out: (number | null)[] = Array(32).fill(null);
  roots.forEach((r, bar) => {
    out[bar * 8] = r;
    out[bar * 8 + 4] = r + 7;
  });
  return out;
}

function melody(notes: Record<number, number>): (number | null)[] {
  const out: (number | null)[] = Array(32).fill(null);
  for (const [i, n] of Object.entries(notes)) out[Number(i)] = n;
  return out;
}

const TRACKS: Record<'outdoor' | 'indoor' | 'garden' | 'ending', Track> = {
  // 본관 앞~비탈길: 가볍고 밝은 걷기 음악 (C장조)
  outdoor: {
    bpm: 100,
    steps: 32,
    lead: melody({ 0: 0, 2: 4, 4: 7, 6: 4, 8: 9, 10: 7, 12: 4, 14: 2, 16: 0, 18: 4, 20: 7, 22: 12, 24: 11, 26: 9, 28: 7, 30: 4 }),
    bass: bassLine([0, -3, -7, -5]),
    leadBase: 72,
    bassBase: 48,
    leadWave: 'square',
    bassWave: 'triangle',
    leadVol: 0.045,
    bassVol: 0.11,
    leadLen: 1.6,
  },
  // 산학협력관 안: 차분하고 따뜻한 음악 (F장조)
  indoor: {
    bpm: 76,
    steps: 32,
    lead: melody({ 0: 0, 3: 4, 4: 7, 7: 4, 8: 9, 11: 7, 12: 4, 14: 2, 16: 0, 19: 4, 20: 7, 22: 12, 24: 9, 26: 7, 28: 4 }),
    bass: bassLine([0, -3, -7, -5]),
    leadBase: 65,
    bassBase: 41,
    leadWave: 'triangle',
    bassWave: 'sine',
    leadVol: 0.09,
    bassVol: 0.13,
    leadLen: 2.4,
  },
  // 비밀 정원: 오르골 같은 반짝이는 아르페지오
  garden: {
    bpm: 88,
    steps: 32,
    lead: melody({
      0: 0, 1: 4, 2: 7, 3: 12, 4: 7, 5: 4, 6: 0, 7: 4,
      8: 2, 9: 5, 10: 9, 11: 14, 12: 9, 13: 5, 14: 2, 15: 5,
      16: 4, 17: 7, 18: 11, 19: 16, 20: 11, 21: 7, 22: 4, 23: 7,
      24: 0, 25: 4, 26: 7, 27: 12, 28: 7, 29: 4, 30: 2,
    }),
    bass: bassLine([0, 2, 4, 0]),
    leadBase: 72,
    bassBase: 48,
    leadWave: 'sine',
    bassWave: 'triangle',
    leadVol: 0.07,
    bassVol: 0.09,
    leadLen: 1.2,
  },
  // 엔딩 크레딧: 느리고 뭉클한 음악 (A단조)
  ending: {
    bpm: 66,
    steps: 32,
    lead: melody({ 0: 0, 4: 7, 8: 5, 11: 3, 12: 2, 16: 0, 20: 7, 24: 9, 27: 7, 28: 5, 30: 3 }),
    bass: bassLine([0, -4, 3, -2]),
    leadBase: 69,
    bassBase: 45,
    leadWave: 'sine',
    bassWave: 'triangle',
    leadVol: 0.1,
    bassVol: 0.1,
    leadLen: 3.2,
  },
};

const MUTE_KEY = 'ddokddok.muted';

/** 재생 허락을 받기 위한 아주 짧은 무음 (WAV, 8bit 모노 8kHz 0.1초) */
const SILENT_WAV = (() => {
  const n = 800;
  const bytes = new Uint8Array(44 + n);
  const dv = new DataView(bytes.buffer);
  const str = (o: number, t: string) => [...t].forEach((c, i) => (bytes[o + i] = c.charCodeAt(0)));
  str(0, 'RIFF');
  dv.setUint32(4, 36 + n, true);
  str(8, 'WAVEfmt ');
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, 8000, true);
  dv.setUint32(28, 8000, true);
  dv.setUint16(32, 1, true);
  dv.setUint16(34, 8, true);
  str(36, 'data');
  dv.setUint32(40, n, true);
  bytes.fill(128, 44);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return `data:audio/wav;base64,${btoa(bin)}`;
})();

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private music!: GainNode;
  private sfxBus!: GainNode;
  private noise: AudioBuffer | null = null;

  private muted = false;
  private current: BgmName | null = null;
  private wanted: BgmName | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;

  /** BGM 파일 재생용 오디오 하나 (unlock 때 만들어 재생 허락을 받아 둔다) */
  private musicEl: HTMLAudioElement | null = null;
  private fileGain: GainNode | null = null;
  /** 지금 musicEl 에 걸려 있는 곡 주소 (null 이면 파일 재생 중 아님) */
  private fileUrl: string | null = null;
  private fileProbe = new Map<BgmName, Promise<string | null>>();
  private lastStepAt = 0;

  constructor() {
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      /* 저장소를 못 쓰는 환경 */
    }
  }

  get isMuted() {
    return this.muted;
  }

  /** 사용자 터치(클릭) 안에서 호출해야 iPad에서 소리가 난다 */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.music = this.ctx.createGain();
      this.sfxBus = this.ctx.createGain();
      this.music.gain.value = 0.5;
      this.sfxBus.gain.value = 0.9;
      this.music.connect(this.master);
      this.sfxBus.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.master.gain.value = this.muted ? 0 : 0.7;
      // 흰 잡음 1초 (발소리, 종이, 문 소리에 사용)
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf;
    }
    this.prepareMusicElement();
    this.wake();
    if (this.wanted) this.bgm(this.wanted);
  }

  /**
   * 사용자 터치 안에서 BGM 용 오디오를 만들고 무음을 한 번 재생해 둔다.
   * 이렇게 허락받은 오디오는 이후 터치 없이도 곡을 바꿔 재생할 수 있다 (iPad Safari).
   */
  private prepareMusicElement() {
    if (this.musicEl || !this.ctx) return;
    // 무음 스위치가 켜져 있어도 소리가 나게 (지원하는 Safari 에서만)
    try {
      const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
      if (session) session.type = 'playback';
    } catch {
      /* 지원하지 않음 */
    }
    const el = new Audio();
    el.loop = true;
    el.preload = 'auto';
    el.setAttribute('playsinline', '');
    el.src = SILENT_WAV;
    void el.play().catch(() => undefined);
    this.musicEl = el;
    try {
      const src = this.ctx.createMediaElementSource(el);
      this.fileGain = this.ctx.createGain();
      this.fileGain.gain.value = 0;
      src.connect(this.fileGain);
      this.fileGain.connect(this.master);
    } catch {
      this.fileGain = null; // 연결할 수 없는 브라우저: 오디오 자체 볼륨을 쓴다
    }
    // 화면을 다시 만지거나 앱으로 돌아오면 멈춘 소리를 깨운다
    const wake = () => this.wake();
    window.addEventListener('pointerdown', wake, true);
    window.addEventListener('keydown', wake, true);
    window.addEventListener('touchend', wake, true);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.wake();
    });
  }

  /** 멈춘(또는 iPad 에서 끊긴) 소리 장치와 BGM 을 다시 재생한다 */
  private wake() {
    if (!this.ctx) return;
    if (this.ctx.state !== 'running') void this.ctx.resume().catch(() => undefined);
    const el = this.musicEl;
    if (el && this.fileUrl && el.paused) void el.play().catch(() => undefined);
  }

  setMuted(m: boolean) {
    this.muted = m;
    try {
      localStorage.setItem(MUTE_KEY, m ? '1' : '0');
    } catch {
      /* 무시 */
    }
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.7, this.ctx.currentTime, 0.03);
    if (this.musicEl && !this.fileGain) this.musicEl.muted = m;
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // ───────────────────────── BGM ─────────────────────────

  /** 이름이 같으면 그대로 두고, 다르면 부드럽게 바꾼다. null 이면 정지 */
  bgm(name: BgmName | null) {
    this.wanted = name;
    if (!this.ctx) return; // 아직 unlock 전: unlock 때 다시 호출됨
    if (name === this.current) return;
    // 같은 음원 파일을 쓰는 장면으로 넘어갈 때는 끊지 않고 이어서 틀어 준다
    if (name && this.current && this.fileUrl && (FILE_ALIAS[name] ?? name) === (FILE_ALIAS[this.current] ?? this.current)) {
      this.current = name;
      return;
    }
    this.current = name;
    const ctx = this.ctx;

    this.music.gain.cancelScheduledValues(ctx.currentTime);
    this.music.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
    this.stopFile();
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (!name) return;

    window.setTimeout(async () => {
      if (this.current !== name || !this.ctx) return;
      const file = await this.probeFile(name);
      if (this.current !== name || !this.ctx) return;
      this.music.gain.cancelScheduledValues(this.ctx.currentTime);
      this.music.gain.setTargetAtTime(0.5, this.ctx.currentTime, 0.2);
      if (file) {
        this.playFile(file, name);
      } else {
        this.step = 0;
        this.nextTime = this.ctx.currentTime + 0.1;
        this.timer = window.setInterval(() => this.schedule(name), 120);
      }
    }, 280);
  }

  /** public/audio/bgm_<name>.m4a (없으면 .mp3) 가 실제 오디오 파일로 있는지 확인 */
  private probeFile(name: BgmName) {
    const key = FILE_ALIAS[name] ?? name;
    let p = this.fileProbe.get(key);
    if (!p) {
      const tryUrl = (url: string) =>
        fetch(url, { method: 'HEAD' })
          .then((r) => (r.ok && (r.headers.get('content-type') ?? '').startsWith('audio') ? url : null))
          .catch(() => null);
      p = tryUrl(`audio/bgm_${key}.m4a`).then((u) => u ?? tryUrl(`audio/bgm_${key}.mp3`));
      this.fileProbe.set(key, p);
    }
    return p;
  }

  /** 비밀 정원(보물상자, 엔딩)은 원래 볼륨, 나머지 장면은 30% 낮춘다 */
  private playFile(url: string, name: BgmName) {
    const el = this.musicEl;
    if (!el || !this.ctx) return;
    const vol = name === 'garden' || name === 'ending' ? 0.55 : 0.55 * 0.7;
    this.fileUrl = url;
    if (!el.src.endsWith(url)) el.src = url;
    el.loop = true;
    el.currentTime = 0;
    if (this.fileGain) {
      // 전체 볼륨(master 0.7)을 거치므로 그만큼 보정해 예전과 같은 크기로 맞춘다
      const g = this.fileGain.gain;
      g.cancelScheduledValues(this.ctx.currentTime);
      g.setValueAtTime(0, this.ctx.currentTime);
      g.linearRampToValueAtTime(vol / 0.7, this.ctx.currentTime + 0.6);
    } else {
      el.volume = vol;
      el.muted = this.muted;
    }
    // 막히면(아이패드 자동 재생 차단) 다음 터치 때 wake() 가 다시 재생한다
    void el.play().catch(() => undefined);
  }

  private stopFile() {
    this.fileUrl = null;
    const el = this.musicEl;
    if (!el) return;
    if (this.fileGain && this.ctx) {
      this.fileGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.fileGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
    el.pause();
  }

  private schedule(name: BgmName) {
    const ctx = this.ctx;
    if (!ctx || this.current !== name) return;
    const tr = TRACKS[SYNTH_FOR[name]];
    const stepDur = 60 / tr.bpm / 2;
    while (this.nextTime < ctx.currentTime + 0.5) {
      const i = this.step % tr.steps;
      const l = tr.lead[i];
      const b = tr.bass[i];
      if (l !== null) this.tone(midi(tr.leadBase + l), this.nextTime, stepDur * tr.leadLen, tr.leadWave, tr.leadVol, this.music);
      if (b !== null) this.tone(midi(tr.bassBase + b), this.nextTime, stepDur * 3.2, tr.bassWave, tr.bassVol, this.music);
      this.nextTime += stepDur;
      this.step++;
    }
  }

  // ───────────────────────── 효과음 ─────────────────────────

  private tone(freq: number, t: number, dur: number, type: OscillatorType, vol: number, bus: GainNode, slideTo?: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(bus);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private burst(t: number, dur: number, vol: number, freq: number, q: number, type: BiquadFilterType = 'bandpass', sweepTo?: number) {
    const ctx = this.ctx!;
    if (!this.noise) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.sfxBus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  sfx(name: SfxName) {
    const ctx = this.ctx;
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    const bus = this.sfxBus;
    switch (name) {
      case 'blip': // 대화창 글자 소리 (아주 작게)
        this.tone(520 + Math.random() * 80, t, 0.035, 'square', 0.018, bus);
        break;
      case 'select':
        this.tone(660, t, 0.06, 'triangle', 0.1, bus);
        break;
      case 'confirm':
        this.tone(660, t, 0.07, 'triangle', 0.1, bus);
        this.tone(990, t + 0.06, 0.1, 'triangle', 0.1, bus);
        break;
      case 'knock': // 똑 — 나무 문 두드리는 소리
        this.tone(190, t, 0.1, 'sine', 0.55, bus, 70);
        this.burst(t, 0.06, 0.35, 900, 1.2);
        break;
      case 'door': // 끼이익 + 딸깍
        this.burst(t, 0.55, 0.12, 380, 8, 'bandpass', 900);
        this.burst(t + 0.56, 0.05, 0.3, 1800, 2);
        break;
      case 'paper':
        this.burst(t, 0.16, 0.22, 3200, 0.7, 'highpass');
        break;
      case 'pickup':
        [72, 76, 79, 84].forEach((n, i) => this.tone(midi(n), t + i * 0.065, 0.12, 'square', 0.07, bus));
        break;
      case 'fanfare':
        [60, 64, 67, 72, 76].forEach((n, i) => this.tone(midi(n), t + i * 0.09, 0.28, 'square', 0.06, bus));
        [60, 64, 67, 72].forEach((n) => this.tone(midi(n), t + 0.5, 0.7, 'triangle', 0.09, bus));
        break;
      case 'chest':
        this.burst(t, 0.3, 0.14, 500, 4, 'bandpass', 1400);
        [76, 79, 83, 88, 91].forEach((n, i) => this.tone(midi(n), t + 0.25 + i * 0.1, 0.5, 'sine', 0.1, bus));
        break;
      case 'step':
        this.burst(t, 0.05, 0.06 + Math.random() * 0.02, 500 + Math.random() * 200, 0.8, 'lowpass');
        break;
      case 'pop':
        this.tone(520, t, 0.08, 'sine', 0.12, bus, 920);
        break;
      case 'morph': // 반짝! 경쾌하게 변신
        [79, 83, 86, 91, 95].forEach((n, i) => this.tone(midi(n), t + i * 0.055, 0.16, 'triangle', 0.09, bus));
        [103, 107, 110].forEach((n, i) => this.tone(midi(n), t + 0.3 + i * 0.05, 0.3, 'sine', 0.05, bus));
        this.burst(t, 0.25, 0.08, 5200, 0.7, 'highpass');
        break;
      case 'bark': // 멍! 멍!
        this.tone(430, t, 0.09, 'sawtooth', 0.1, bus, 250);
        this.tone(470, t + 0.17, 0.09, 'sawtooth', 0.1, bus, 270);
        break;
      case 'sparkle':
        [88, 93, 97].forEach((n, i) => this.tone(midi(n), t + i * 0.05, 0.25, 'sine', 0.06, bus));
        break;
    }
  }

  /** 걷는 동안 부드러운 발소리. 너무 자주 나지 않게 간격을 둔다 */
  footstep(now: number) {
    if (now - this.lastStepAt < 290) return;
    this.lastStepAt = now;
    this.sfx('step');
  }
}

export const audio = new AudioEngine();
