import { audio } from '../audio/audio';

/**
 * 화면 전체를 덮는 오버레이 모음 (DOM이라 한글이 선명함).
 * 타이틀 · 이미지 카드(책/사진/선물) · 과제지 뷰어 · 엔딩 크레딧 · "똑똑" 글자 효과
 */

/** 오버레이 공통 상태 */
export const uiState = {
  /** 마지막으로 오버레이가 닫힌 시각. 같은 키 입력이 곧바로 게임 조작으로 이어지지 않게 하는 데 사용 */
  closedAt: 0,
  /** 타이틀에서 시작을 눌렀는지 */
  started: false,
};

const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const isConfirmKey = (e: KeyboardEvent) => e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE';

// ───────────────────────── 이미지 카드 ─────────────────────────

export interface CardOptions {
  /** 이미지 경로 (public/ 기준, 예: 'images/gift.png'). 없거나 못 불러오면 도트 그림으로 대신 보여줌 */
  src?: string;
  caption?: string;
  text?: string;
  /** 이미지가 없을 때 대신 그릴 그림 */
  kind?: 'book' | 'gift' | 'wedding';
  /** 이미지가 없을 때 아래에 작게 보여주는 안내 */
  placeholder?: string;
  /** 글자만 보여주는 카드 (이미지/그림 영역을 숨김) */
  hideMedia?: boolean;
  /** 종이 쪽지 모양으로 보여준다 */
  note?: boolean;
  /** 달력 한 장 모양으로 보여준다 (종이 넘김 효과) */
  calendar?: boolean;
  /** 벽 포스터 모양으로 보여준다 (값은 배경색) */
  poster?: string;
  /** 있으면 "탭하면 닫기" 대신 이 글자의 버튼을 눌러야 넘어간다 */
  button?: string;
}

function placeholderArt(kind: CardOptions['kind']) {
  const c = document.createElement('canvas');
  c.width = 48;
  c.height = 36;
  const g = c.getContext('2d')!;
  const r = (x: number, y: number, w: number, h: number, col: string) => {
    g.fillStyle = col;
    g.fillRect(x, y, w, h);
  };
  r(0, 0, 48, 36, '#fffaf0');
  if (kind === 'gift') {
    r(14, 14, 20, 16, '#e0708f');
    r(14, 14, 20, 4, '#f08aa8');
    r(22, 14, 4, 16, '#ffd25e');
    r(12, 10, 24, 5, '#e0708f');
    r(22, 10, 4, 5, '#ffd25e');
    r(16, 6, 6, 4, '#ffd25e');
    r(26, 6, 6, 4, '#ffd25e');
  } else if (kind === 'wedding') {
    r(8, 8, 32, 22, '#f4d6e0');
    r(14, 12, 8, 8, '#f6cfa8');
    r(26, 12, 8, 8, '#f6cfa8');
    r(12, 20, 12, 10, '#f7f4ee');
    r(24, 20, 12, 10, '#43434f');
    r(22, 6, 4, 3, '#ef5a7a');
    r(21, 5, 2, 2, '#ef5a7a');
    r(25, 5, 2, 2, '#ef5a7a');
  } else {
    r(10, 10, 8, 20, '#d94b3a');
    r(18, 8, 8, 22, '#4f8fd0');
    r(26, 12, 8, 18, '#5aa86a');
    r(34, 10, 6, 20, '#ffd25e');
    r(8, 30, 34, 2, '#7a5233');
  }
  return c;
}

class ImageCard {
  isOpen = false;

  show(opt: CardOptions) {
    return new Promise<void>((resolve) => {
      const root = el('card');
      const media = root.querySelector('.card-media') as HTMLElement;
      const cap = root.querySelector('.card-caption') as HTMLElement;
      const txt = root.querySelector('.card-text') as HTMLElement;
      media.replaceChildren();
      cap.textContent = opt.caption ?? '';
      txt.textContent = opt.text ?? '';
      cap.style.display = opt.caption ? 'block' : 'none';
      txt.style.display = opt.text ? 'block' : 'none';
      media.style.display = opt.hideMedia ? 'none' : '';
      root.classList.toggle('note', !!opt.note);
      root.classList.toggle('poster', !!opt.poster);
      root.classList.toggle('cal', !!opt.calendar);
      if (opt.calendar) {
        const frame = root.querySelector('.card-frame') as HTMLElement;
        frame.classList.remove('flip');
        void frame.offsetWidth; // 애니메이션을 처음부터 다시 재생
        frame.classList.add('flip');
      }
      root.style.setProperty('--paper', opt.poster ?? '');
      const hint = root.querySelector('.card-hint') as HTMLElement;
      hint.replaceChildren();
      if (opt.button) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'px-btn primary';
        b.textContent = opt.button;
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          finish();
        });
        hint.append(b);
      } else {
        hint.textContent = '탭하거나 Space 를 눌러 닫기';
      }

      const fallback = () => {
        media.replaceChildren(placeholderArt(opt.kind));
        if (opt.placeholder) {
          const small = document.createElement('div');
          small.style.cssText = 'font-size:0.72em;opacity:0.6;margin-bottom:8px';
          small.textContent = opt.placeholder;
          media.append(small);
        }
      };
      if (opt.hideMedia) {
        // 이미지 없이 글자만
      } else if (opt.src) {
        const img = new Image();
        img.onload = () => media.replaceChildren(img);
        img.onerror = fallback;
        img.src = opt.src;
        img.alt = opt.caption ?? '';
      } else {
        fallback();
      }

      const openedAt = performance.now();
      const finish = () => {
        if (performance.now() - openedAt < 350) return; // 열자마자 닫히는 것을 방지
        root.removeEventListener('pointerdown', onPointer);
        window.removeEventListener('keydown', onKey);
        root.hidden = true;
        this.isOpen = false;
        uiState.closedAt = performance.now();
        resolve();
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.repeat) return;
        if (isConfirmKey(e) || e.code === 'Escape') {
          e.preventDefault();
          finish();
        }
      };
      const onPointer = () => {
        if (!opt.button) finish();
      };
      root.addEventListener('pointerdown', onPointer);
      window.addEventListener('keydown', onKey);
      root.hidden = false;
      this.isOpen = true;
      audio.sfx('paper');
    });
  }
}

export const imageCard = new ImageCard();

// ───────────────────────── 4컷 만화 뷰어 ─────────────────────────

/** 이미지를 화면에 맞춰 보여주고, 누르면 확대/축소. [닫기]로 돌아간다 */
class ComicViewer {
  isOpen = false;

  show(src: string, title: string) {
    return new Promise<void>((resolve) => {
      const root = el('comic');
      const scroll = root.querySelector('.comic-scroll') as HTMLElement;
      const img = root.querySelector('img') as HTMLImageElement;
      const ttl = root.querySelector('.comic-title') as HTMLElement;
      const hint = root.querySelector('.comic-hint') as HTMLElement;
      const closeBtn = root.querySelector('.close') as HTMLButtonElement;
      ttl.textContent = title;
      img.src = src;
      img.alt = title;
      root.classList.remove('zoom');
      scroll.scrollTo(0, 0);
      hint.textContent = '그림을 누르면 확대돼요';

      const toggle = () => {
        const z = root.classList.toggle('zoom');
        hint.textContent = z ? '그림을 누르면 줄어들어요 · 밀어서 둘러보기' : '그림을 누르면 확대돼요';
        scroll.scrollTo(0, 0);
        audio.sfx('select');
      };
      const openedAt = performance.now();
      const finish = () => {
        if (performance.now() - openedAt < 350) return;
        img.removeEventListener('click', toggle);
        closeBtn.removeEventListener('click', finish);
        window.removeEventListener('keydown', onKey);
        root.hidden = true;
        this.isOpen = false;
        uiState.closedAt = performance.now();
        resolve();
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.repeat) return;
        if (e.code === 'Escape' || isConfirmKey(e)) {
          e.preventDefault();
          finish();
        }
      };
      img.addEventListener('click', toggle);
      closeBtn.addEventListener('click', finish);
      window.addEventListener('keydown', onKey);
      root.hidden = false;
      this.isOpen = true;
      audio.sfx('paper');
    });
  }
}

export const comicViewer = new ComicViewer();

// ───────────────────────── 과제지 뷰어 ─────────────────────────

export interface PaperPage {
  title?: string;
  /** 문단. `{틀린말>고친말}` 은 빨간 펜 교정, `((말))` 은 빨간 동그라미 */
  body: string[];
  /** 교수님의 빨간 펜 코멘트 */
  notes?: string[];
  sign?: string;
  /** true 면 코멘트를 노란 형광펜 바탕으로 강조 (보물 힌트가 적힌 쪽) */
  hint?: boolean;
}

/** 교정 표시 문법을 DOM으로 바꾼다 */
function paintRichText(parent: HTMLElement, text: string) {
  const re = /\{([^>{}]+)>([^{}]+)\}|\(\(([^()]+)\)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) parent.append(document.createTextNode(text.slice(last, idx)));
    if (m[1] !== undefined) {
      const fix = document.createElement('span');
      fix.className = 'fix';
      const s = document.createElement('s');
      s.textContent = m[1];
      const em = document.createElement('em');
      em.textContent = m[2];
      fix.append(s, em);
      parent.append(fix);
    } else {
      const c = document.createElement('span');
      c.className = 'circle';
      c.textContent = m[3];
      parent.append(c);
    }
    last = idx + m[0].length;
  }
  if (last < text.length) parent.append(document.createTextNode(text.slice(last)));
}

class PaperViewer {
  isOpen = false;

  /** 과제지를 펼쳐 한 장씩 넘겨 본다. 닫히면 마지막 장까지 다 봤는지 알려 준다 */
  show(pages: PaperPage[]) {
    return new Promise<{ readAll: boolean }>((resolve) => {
      const root = el('paper');
      const sheet = root.querySelector('.sheet') as HTMLElement;
      const prev = root.querySelector('.prev') as HTMLButtonElement;
      const next = root.querySelector('.next') as HTMLButtonElement;
      const count = root.querySelector('.count') as HTMLElement;
      const seen = new Set<number>();
      let i = 0;

      const render = (animate: 'unfold' | 'flip') => {
        const page = pages[i];
        seen.add(i);
        sheet.replaceChildren();
        if (page.title) {
          const h = document.createElement('h2');
          h.textContent = page.title;
          sheet.append(h);
        }
        for (const para of page.body) {
          const p = document.createElement('p');
          paintRichText(p, para);
          sheet.append(p);
        }
        if (page.notes?.length) {
          const n = document.createElement('div');
          n.className = 'notes' + (page.hint ? ' hint' : '');
          n.innerHTML = '';
          page.notes.forEach((line, k) => {
            if (k > 0) n.append(document.createElement('br'));
            n.append(document.createTextNode(line));
          });
          sheet.append(n);
        }
        if (page.sign) {
          const s = document.createElement('div');
          s.className = 'sign';
          s.textContent = page.sign;
          sheet.append(s);
        }
        sheet.scrollTop = 0;
        sheet.classList.remove('unfold', 'flip');
        void sheet.offsetWidth; // 애니메이션 다시 시작
        sheet.classList.add(animate);
        count.textContent = `${i + 1} / ${pages.length}`;
        prev.style.visibility = i === 0 ? 'hidden' : 'visible';
        next.textContent = i === pages.length - 1 ? '닫기' : '다음 ▶';
        audio.sfx('paper');
      };

      const openedAt = performance.now();
      const close = () => {
        root.hidden = true;
        this.isOpen = false;
        window.removeEventListener('keydown', onKey);
        prev.removeEventListener('click', goPrev);
        next.removeEventListener('click', goNext);
        uiState.closedAt = performance.now();
        resolve({ readAll: seen.size === pages.length });
      };
      const goPrev = () => {
        if (i > 0) {
          i--;
          render('flip');
        }
      };
      const goNext = () => {
        if (performance.now() - openedAt < 350) return;
        if (i < pages.length - 1) {
          i++;
          render('flip');
        } else {
          close();
        }
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.repeat) return;
        if (e.code === 'ArrowLeft') {
          e.preventDefault();
          goPrev();
        } else if (e.code === 'ArrowRight' || isConfirmKey(e)) {
          e.preventDefault();
          goNext();
        } else if (e.code === 'Escape') {
          e.preventDefault();
          close();
        }
      };
      prev.addEventListener('click', goPrev);
      next.addEventListener('click', goNext);
      window.addEventListener('keydown', onKey);
      root.hidden = false;
      this.isOpen = true;
      render('unfold');
    });
  }
}

export const paperViewer = new PaperViewer();

// ───────────────────────── 엔딩 크레딧 ─────────────────────────

/** 크레딧 문구 (기획서 그대로). 큰 글씨는 {{ }} 로 감쌈 */
const CREDIT_BLOCKS: string[] = [
  '교수님, 총장 취임을 축하드립니다!',
  '오래전 702호 문을 두드리던 저희가\n오늘은 작은 캠퍼스를 만들어 다시 찾아왔습니다.',
  '{{MADE WITH LOVE}}\n기획 노현서 · 개발 정순원\n그리고 오늘 함께한 창현, 태진',
  '{{MUSIC}}\n바흐 · 슈만 · 쇼팽 · 파헬벨\n연주: Musopen(Donald Betts 외), Kimiko Ishizaka(CC0),\n미 공군 악단 (모두 퍼블릭 도메인)',
  '{{THE FINAL MOMENT}}\n{{2006 → 2026}}',
  '20년 전, 교수님과 저희의 이야기가 시작되었습니다.\n그리고 오늘, 교수님의 새로운 시작을 축하합니다.',
];

class Credits {
  isOpen = false;

  /** 크레딧을 재생하고, 마지막의 "처음으로" 버튼을 누르면 끝난다 */
  play() {
    return new Promise<void>((resolve) => {
      const root = el('credits');
      const block = root.querySelector('.block') as HTMLElement;
      const end = root.querySelector('.end') as HTMLButtonElement;
      end.hidden = true;
      block.classList.remove('show');
      root.hidden = false;
      this.isOpen = true;
      audio.bgm('ending');

      let idx = -1;
      let timer: number | undefined;
      const fill = (text: string) => {
        block.replaceChildren();
        text.split(/(\{\{.*?\}\})/).forEach((part) => {
          if (part.startsWith('{{')) {
            const big = document.createElement('span');
            big.className = 'big';
            big.textContent = part.slice(2, -2);
            block.append(big);
          } else if (part) {
            block.append(document.createTextNode(part.replace(/^\n|\n$/g, '')));
          }
        });
      };
      const showNext = () => {
        window.clearTimeout(timer);
        block.classList.remove('show');
        idx++;
        if (idx >= CREDIT_BLOCKS.length) {
          block.textContent = '“똑똑. 교수님, 저희 왔어요!”';
          block.classList.add('show');
          end.hidden = false;
          return;
        }
        timer = window.setTimeout(() => {
          fill(CREDIT_BLOCKS[idx]);
          block.classList.add('show');
          timer = window.setTimeout(showNext, 4600);
        }, 900);
      };
      // 화면을 탭하면 다음 문구로 빠르게 넘어감
      const skip = (e: Event) => {
        if (e.target === end) return;
        if (idx >= 0 && idx < CREDIT_BLOCKS.length) showNext();
      };
      end.addEventListener('click', () => {
        root.hidden = true;
        this.isOpen = false;
        root.removeEventListener('pointerdown', skip);
        uiState.closedAt = performance.now();
        resolve();
      });
      root.addEventListener('pointerdown', skip);
      showNext();
    });
  }
}

export const credits = new Credits();

// ───────────────────────── "똑똑" 글자 효과 ─────────────────────────

let popTimer: number | undefined;
export function popText(text: string, ms = 900) {
  const p = el('pop');
  p.textContent = text;
  p.hidden = false;
  p.classList.remove('go');
  void p.offsetWidth;
  p.classList.add('go');
  window.clearTimeout(popTimer);
  popTimer = window.setTimeout(() => {
    p.hidden = true;
  }, ms);
}

// ───────────────────────── 타이틀 ─────────────────────────

/** 702호 문 도트 그림 (타이틀 장식) */
function drawTitleDoor(c: HTMLCanvasElement) {
  const g = c.getContext('2d')!;
  const r = (x: number, y: number, w: number, h: number, col: string) => {
    g.fillStyle = col;
    g.fillRect(x, y, w, h);
  };
  g.clearRect(0, 0, 32, 40);
  r(4, 2, 24, 36, '#2d2a38'); // 문틀 외곽
  r(5, 3, 22, 35, '#f0e2c4');
  r(7, 5, 18, 33, '#6a4630'); // 문
  r(15, 5, 2, 33, '#563622');
  r(8, 7, 7, 12, '#7d5539');
  r(17, 7, 7, 12, '#7d5539');
  r(8, 21, 7, 14, '#7d5539');
  r(17, 21, 7, 14, '#7d5539');
  r(12, 2, 8, 3, '#ffd25e'); // 문패
  r(13, 3, 1, 1, '#2d2a38');
  r(15, 3, 1, 1, '#2d2a38');
  r(17, 3, 1, 1, '#2d2a38');
  r(13, 21, 2, 3, '#ffd25e'); // 손잡이
  r(7, 38, 18, 2, '#ffd25e'); // 문틈 불빛
  r(5, 38, 22, 1, '#ffe9a8');
}

class Title {
  isOpen = true;

  show(canContinue: boolean) {
    return new Promise<'new' | 'continue'>((resolve) => {
      const root = el('title');
      drawTitleDoor(root.querySelector('canvas') as HTMLCanvasElement);
      const start = root.querySelector('.start') as HTMLButtonElement;
      const cont = root.querySelector('.cont') as HTMLButtonElement;
      cont.hidden = !canContinue;
      const done = (choice: 'new' | 'continue') => {
        audio.unlock(); // iPad: 사용자 터치 안에서 소리 켜기
        audio.sfx('confirm');
        uiState.started = true;
        root.hidden = true;
        this.isOpen = false;
        uiState.closedAt = performance.now();
        window.removeEventListener('keydown', onKey);
        resolve(choice);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.repeat) return;
        if (isConfirmKey(e)) {
          e.preventDefault();
          done(canContinue ? 'continue' : 'new');
        }
      };
      start.addEventListener('click', () => done('new'));
      cont.addEventListener('click', () => done('continue'));
      window.addEventListener('keydown', onKey);
      root.hidden = false;
      this.isOpen = true;
    });
  }
}

export const title = new Title();

/** 게임 조작을 막아야 하는 오버레이가 하나라도 열려 있는지 */
export function anyOverlayOpen() {
  return imageCard.isOpen || comicViewer.isOpen || paperViewer.isOpen || credits.isOpen || title.isOpen;
}

// ───────────────────────── 소리 버튼 ─────────────────────────

export function initSoundButton() {
  const btn = el<HTMLButtonElement>('sound-btn');
  const sync = () => {
    btn.textContent = audio.isMuted ? '🔇' : '🔊';
  };
  sync();
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    audio.toggleMute();
    audio.unlock();
    sync();
    audio.sfx('select');
  });
  // 게임 화면 터치와 겹치지 않도록
  btn.addEventListener('pointerdown', (e) => e.stopPropagation());
}
