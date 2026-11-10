import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config';
import { clearSave, loadSave } from './save/save';
import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';
import { gameState } from './state/gameState';
import { initSoundButton, title, uiState } from './ui/overlays';

/**
 * 시작 순서: 타이틀 화면(시작하기/이어하기) → 게임 시작.
 * 타이틀의 버튼을 누르는 순간 소리가 켜진다 (iPad는 사용자 터치가 있어야 소리를 낼 수 있음).
 * 개발 중에는 주소 뒤에 ?skiptitle 를 붙이면 타이틀을 건너뛴다.
 */
async function main() {
  initSoundButton();

  const save = loadSave();
  let choice: 'new' | 'continue' = 'new';
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('skiptitle')) {
    (document.getElementById('title') as HTMLElement).hidden = true;
    title.isOpen = false;
    uiState.started = true;
  } else {
    choice = await title.show(!!save);
  }

  const resume = choice === 'continue' ? save : null;
  if (resume) {
    gameState.setMany(resume.flags);
  } else {
    clearSave();
    gameState.reset();
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#14121c',
    pixelArt: true, // 확대해도 픽셀이 뭉개지지 않게
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      activePointers: 2,
    },
    callbacks: {
      // 이어하기: 저장된 위치에서 시작하도록 월드 씬에 전달
      preBoot: (g) => {
        if (resume) g.registry.set('resume', resume);
      },
    },
    scene: [BootScene, WorldScene],
  });

  // 창 크기가 바뀌거나(아이패드 회전, 주소창 표시/숨김 등) 화면 비율이 달라지면 캔버스를 다시 맞춘다
  const host = document.getElementById('game');
  if (host && 'ResizeObserver' in window) {
    new ResizeObserver(() => game.scale.refresh()).observe(host);
  }
  window.addEventListener('orientationchange', () => setTimeout(() => game.scale.refresh(), 200));
}

/**
 * 오프라인 대비: 한 번 접속해 두면 와이파이가 없어도 열리도록 파일들을 저장해 둔다 (배포된 주소에서만 동작).
 * 아이패드에서는 Safari 공유 버튼 → "홈 화면에 추가"로 앱처럼(전체 화면) 쓸 수 있다.
 */
function registerOffline() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator) || !/^https?:$/.test(window.location.protocol)) return;
  // 단일 파일 백업본(ddokddok.html)에는 매니페스트가 없으므로 서비스 워커도 쓰지 않는다
  if (!document.querySelector('link[rel="manifest"]')) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        const urls = performance
          .getEntriesByType('resource')
          .map((r) => r.name)
          .filter((u) => u.startsWith(window.location.origin));
        reg.active?.postMessage({ type: 'precache', urls: [window.location.href, ...urls] });
      })
      .catch(() => undefined);
  });
}

registerOffline();
void main();
