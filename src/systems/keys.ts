/**
 * 방향키(WASD 포함) 눌림 상태를 게임 전체에서 기억한다.
 *
 * Phaser 의 키 상태는 장면(맵)을 새로 만들 때마다 초기화되어, 방향키를 누른 채 문을 지나가면
 * 새 맵에서 키를 다시 누를 때까지 멈춰 있었다(특히 아이패드 키보드는 누르고 있어도 신호를 반복해 보내지 않는다).
 * 여기서는 창(window)의 keydown/keyup 을 한 번만 듣고, 맵이 바뀌어도 상태를 유지한다.
 */
const held = new Set<string>();

const MOVE_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS']);

window.addEventListener('keydown', (e) => {
  if (!MOVE_KEYS.has(e.code)) return;
  held.add(e.code);
  // 방향키로 페이지가 스크롤되지 않게
  if (e.code.startsWith('Arrow')) e.preventDefault();
});
window.addEventListener('keyup', (e) => held.delete(e.code));
// 창을 벗어나면(다른 앱, 탭 전환) keyup 을 못 받으므로 모두 놓은 것으로 본다
window.addEventListener('blur', () => held.clear());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) held.clear();
});

/** 지금 누르고 있는 방향 (-1, 0, 1) */
export function heldDirection() {
  let x = 0;
  let y = 0;
  if (held.has('ArrowLeft') || held.has('KeyA')) x -= 1;
  if (held.has('ArrowRight') || held.has('KeyD')) x += 1;
  if (held.has('ArrowUp') || held.has('KeyW')) y -= 1;
  if (held.has('ArrowDown') || held.has('KeyS')) y += 1;
  return { x, y };
}
