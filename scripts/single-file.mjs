// 인터넷도, 서버도 없이 "파일 하나"로 열리는 백업 빌드를 만든다.
//   npm run build:single  →  dist-single/ddokddok.html  (더블클릭하면 브라우저에서 바로 실행)
// 이 폴더에는 public/ 안의 사진·음원도 함께 복사된다(images, audio). 사진을 바꿨다면 다시 만들어 주세요.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const out = 'dist-single';
const html = readFileSync(join(dist, 'index.html'), 'utf8');

// 빌드된 자바스크립트를 HTML 안으로 합친다
const m = html.match(/<script[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
if (!m) throw new Error('index.html 에서 스크립트 태그를 찾지 못했습니다. 먼저 npm run build 를 실행하세요.');
const jsPath = join(dist, m[1].replace(/^\.\//, ''));
const js = readFileSync(jsPath, 'utf8').replace(/<\/script/gi, '<\\/script');

let single = html.replace(m[0], '');
// 서비스 워커/매니페스트는 파일로 열 때는 쓸 수 없으므로 제거
single = single.replace(/<link rel="manifest"[^>]*>\s*/g, '');
// 주의: 문자열로 바꾸면 코드 안의 $ 기호가 특수 문자로 처리되어 파일이 깨지므로 반드시 함수로 치환한다
single = single.replace('</body>', () => `    <script type="module">\n${js}\n    </script>\n  </body>`);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'ddokddok.html'), single);

// 사진·음원 복사 (public/images, public/audio)
for (const dir of ['images', 'audio']) {
  const src = join('public', dir);
  if (existsSync(src) && statSync(src).isDirectory() && readdirSync(src).length) cpSync(src, join(out, dir), { recursive: true });
}
console.log(`완료: ${join(out, 'ddokddok.html')} (${(Buffer.byteLength(single) / 1024 / 1024).toFixed(2)} MB)`);
