/** 화면 상단 "다음 목표" 힌트. DOM이라 한글이 선명하다. */
const el = () => document.getElementById('goal-hint') as HTMLDivElement | null;

export function setGoalHint(text: string | null, label = '다음 목표') {
  const box = el();
  if (!box) return;
  if (!text) {
    box.hidden = true;
    return;
  }
  box.replaceChildren();
  const b = document.createElement('b');
  b.textContent = label;
  box.append(b, document.createTextNode(text));
  box.hidden = false;
}
