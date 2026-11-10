import { audio } from '../audio/audio';
import { gameState, type Flags } from '../state/gameState';
import { setPortrait } from './portraits';

export interface DChoice {
  label: string;
  next?: string;
  set?: Flags;
}

export interface DNode {
  speaker?: string;
  /** 얼굴 아이콘 키 (ui/portraits.ts). 없으면 아이콘 없이 표시 */
  portrait?: string;
  text: string;
  /** 다음 노드. 없으면 대화 종료 */
  next?: string;
  /** 이 노드를 보여줄 때 켜지는 플래그 */
  set?: Flags;
  /** 선택지 (1~2개 권장) */
  choices?: DChoice[];
}

export type Script = Record<string, DNode>;

const TYPE_MS = 24;
/** 개발 중 자동 테스트용: 콘솔에서 window.__ddokFast = true 로 글자 출력을 거의 즉시로 만든다 */
const fast = () => import.meta.env.DEV && (window as unknown as { __ddokFast?: boolean }).__ddokFast === true;
/** 문장부호 뒤에서 잠깐 쉬어 읽는 리듬을 만든다 (ms) */
const PAUSE_STRONG = 150; // . ! ? …
const PAUSE_WEAK = 70; // , 줄바꿈

/**
 * 화면 하단 대화창 (DOM이라 한글이 선명함).
 * - 글자가 한 자씩 나타나며, 탭/클릭 또는 Space·Enter·E 로 넘김 (타이핑 중이면 먼저 전체 표시)
 * - 선택지는 터치/클릭, 숫자키(1·2), 방향키(↑↓/W·S) + Enter 로 선택
 */
class DialogueUI {
  isOpen = false;
  /** 마지막으로 닫힌 시각. 같은 키 입력이 곧바로 월드 상호작용으로 이어지는 것을 막는 데 사용 */
  closedAt = 0;

  private typingTimer: number | null = null;
  private full = '';
  private typing = false;
  private afterTyping: (() => void) | null = null;
  private onAdvance: (() => void) | null = null;
  private onChoose: ((i: number) => void) | null = null;
  private choiceCount = 0;
  private selected = 0;
  private bound = false;
  private keyHandler = (e: KeyboardEvent) => this.handleKey(e);

  private get root() {
    return document.getElementById('dialogue') as HTMLDivElement;
  }
  private get speakerEl() {
    return this.root.querySelector('.d-speaker') as HTMLDivElement;
  }
  private get textEl() {
    return this.root.querySelector('.d-text') as HTMLDivElement;
  }
  private get choicesEl() {
    return this.root.querySelector('.d-choices') as HTMLDivElement;
  }
  private get portraitEl() {
    return this.root.querySelector('.d-portrait') as HTMLCanvasElement;
  }
  private get nextEl() {
    return this.root.querySelector('.d-next') as HTMLDivElement;
  }

  /** 스크립트를 처음부터 끝까지 진행한다. 대화가 끝나면 resolve */
  async run(script: Script, start = 'start') {
    this.open();
    try {
      let key: string | undefined = start;
      let guard = 0;
      while (key && guard++ < 200) {
        const node: DNode | undefined = script[key];
        if (!node) break;
        gameState.setMany(node.set);
        if (node.choices && node.choices.length) {
          const idx: number = await this.showChoices(node);
          const picked: DChoice = node.choices[idx];
          gameState.setMany(picked.set);
          key = picked.next;
        } else {
          await this.showText(node);
          key = node.next;
        }
      }
    } finally {
      this.close();
    }
  }

  /** 선택지 메뉴만 띄우고 고른 번호(0부터)를 돌려준다 */
  async pick(text: string, labels: string[], speaker?: string): Promise<number> {
    this.open();
    try {
      return await this.showChoices({ text, speaker, choices: labels.map((label) => ({ label })) });
    } finally {
      this.close();
    }
  }

  /** 한 줄짜리 안내/대사 */
  say(text: string, speaker?: string) {
    return this.run({ start: { text, speaker } });
  }

  // ───────────────────────── 내부 ─────────────────────────

  private open() {
    if (!this.bound) {
      this.root.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        if (this.choiceCount === 0) this.advance();
      });
      this.bound = true;
    }
    this.root.hidden = false;
    this.isOpen = true;
    document.body.classList.add('in-dialogue');
    window.addEventListener('keydown', this.keyHandler);
  }

  private close() {
    this.stopTyping();
    this.onAdvance = null;
    this.onChoose = null;
    this.choiceCount = 0;
    this.choicesEl.replaceChildren();
    this.root.hidden = true;
    this.isOpen = false;
    this.closedAt = performance.now();
    document.body.classList.remove('in-dialogue');
    window.removeEventListener('keydown', this.keyHandler);
  }

  private showText(node: DNode) {
    return new Promise<void>((resolve) => {
      this.onAdvance = resolve;
      this.setSpeaker(node.speaker, node.portrait);
      this.choicesEl.replaceChildren();
      this.startTyping(node.text, () => {
        this.nextEl.style.visibility = 'visible';
      });
    });
  }

  private showChoices(node: DNode) {
    return new Promise<number>((resolve) => {
      this.setSpeaker(node.speaker, node.portrait);
      this.choicesEl.replaceChildren();
      this.startTyping(node.text, () => this.renderChoices(node, resolve));
    });
  }

  private renderChoices(node: DNode, resolve: (i: number) => void) {
    const choices = node.choices ?? [];
    this.nextEl.style.visibility = 'hidden';
    this.choicesEl.replaceChildren();
    choices.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = `${i + 1}. ${c.label}`;
      b.addEventListener('pointerenter', () => this.select(i, true));
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.choose(i);
      });
      this.choicesEl.append(b);
    });
    this.choiceCount = choices.length;
    this.onChoose = resolve;
    this.select(0);
  }

  private select(i: number, sound = false) {
    if (sound && i !== this.selected) audio.sfx('select');
    this.selected = i;
    [...this.choicesEl.children].forEach((el, idx) => el.classList.toggle('sel', idx === i));
  }

  private choose(i: number) {
    const cb = this.onChoose;
    if (!cb) return;
    audio.sfx('confirm');
    this.onChoose = null;
    this.choiceCount = 0;
    this.choicesEl.replaceChildren();
    cb(i);
  }

  private setSpeaker(name?: string, portrait?: string) {
    this.speakerEl.textContent = name ?? '';
    this.speakerEl.style.display = name ? 'block' : 'none';
    this.portraitEl.style.display = setPortrait(this.portraitEl, portrait) ? 'block' : 'none';
  }

  private startTyping(text: string, after: () => void) {
    this.stopTyping();
    this.full = text;
    this.typing = true;
    this.afterTyping = after;
    this.nextEl.style.visibility = 'hidden';
    this.textEl.textContent = '';
    let i = 0;
    const tick = () => {
      i++;
      this.textEl.textContent = this.full.slice(0, i);
      if (i >= this.full.length) {
        this.finishTyping();
        return;
      }
      const ch = this.full[i - 1];
      if (i % 2 === 0 && !/\s/.test(ch)) audio.sfx('blip');
      const extra = '.!?…'.includes(ch) ? PAUSE_STRONG : ',\n'.includes(ch) ? PAUSE_WEAK : 0;
      this.typingTimer = window.setTimeout(tick, fast() ? 1 : TYPE_MS + extra);
    };
    this.typingTimer = window.setTimeout(tick, TYPE_MS);
  }

  private finishTyping() {
    this.stopTyping();
    this.textEl.textContent = this.full;
    this.typing = false;
    const cb = this.afterTyping;
    this.afterTyping = null;
    cb?.();
  }

  private stopTyping() {
    if (this.typingTimer !== null) {
      window.clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
  }

  private advance() {
    if (this.typing) {
      this.finishTyping();
      return;
    }
    const cb = this.onAdvance;
    this.onAdvance = null;
    cb?.();
  }

  private handleKey(e: KeyboardEvent) {
    if (e.repeat) return;
    const confirm = e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE';
    if (confirm) {
      e.preventDefault();
      if (this.choiceCount > 0) this.choose(this.selected);
      else this.advance();
      return;
    }
    if (this.choiceCount > 0) {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        this.select((this.selected + this.choiceCount - 1) % this.choiceCount, true);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        this.select((this.selected + 1) % this.choiceCount, true);
      } else if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3') {
        const idx = Number(e.code.slice(-1)) - 1;
        if (idx < this.choiceCount) this.choose(idx);
      }
    }
  }
}

export const dialogue = new DialogueUI();
