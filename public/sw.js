/*
 * 오프라인 대비 서비스 워커.
 * - 한 번 접속해 두면(인터넷이 되는 곳에서) 이후에는 와이파이가 없어도 게임이 열린다.
 * - 화면(HTML)은 "인터넷 먼저, 안 되면 저장본", 나머지 파일은 "저장본 먼저"로 동작한다.
 * - 새 버전을 배포했는데 예전 파일이 보이면 아래 VERSION 숫자를 올리면 된다.
 */
const VERSION = 'v3';
const CACHE = `ddokddok-${VERSION}`;

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './manifest.webmanifest'])).catch(() => undefined));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// 페이지가 "지금 불러온 파일 목록"을 보내 주면 모두 저장해 둔다 (첫 접속에서도 오프라인 준비가 끝나도록)
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'precache' && Array.isArray(e.data.urls)) {
    e.waitUntil(
      caches.open(CACHE).then((c) =>
        Promise.all(e.data.urls.map((u) => c.add(u).catch(() => undefined))),
      ),
    );
  }
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const networkFirst = req.mode === 'navigate' || /\/(images|audio)\//.test(url.pathname);
  if (networkFirst) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./'))),
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
