// ポケット基礎ノートのオフライン対応。tools/build_mobile.py が作る（VERSION は中身から自動で決まる）
const VERSION = '0b8762e50b';
const CACHE = 'pocket-notes-' + VERSION;
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon.svg", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener('install', e => {
  // ブラウザのHTTPキャッシュ（GitHub Pagesは10分）を経由せず、必ずサーバーから取得する
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('pocket-notes-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
// ネット優先（新しい内容があればそれを使う）・オフラインのときはキャッシュ
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
