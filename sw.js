// もじガチャ オフライン用（ネットがあれば最新版を取りに行き、なければ保存しておいた版で動く）
const CACHE='mojigacha-v1.5';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('mojigacha-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);
  // アプリ本体：ネット優先（更新をすぐ反映）→ だめなら保存版
  if(req.mode==='navigate'||(url.origin===location.origin&&/index\.html$|\/$/.test(url.pathname))){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));return r}).catch(()=>caches.match('index.html').then(r=>r||caches.match('./'))));return}
  // フォントやアイコン：保存版優先
  if(url.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r})))}
});
