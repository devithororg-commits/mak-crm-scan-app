/* Aurora Studio — offline cache for core assets */
const CACHE = 'aurora-pro-v17';
const PPT_ASSETS = [
  './aurora-ppt.html',
  './assets/aurora-ppt-spa.js',
  './assets/aurora-ppt-spa.css',
];

const ASSETS = [
  './',
  './obsidian.html',
  './index.html',
  './aurora-ppt.html',
  './aurora-ppt/index.html',
  './studio.html',
  './showcase.html',
  './assets/aurora-pro.css',
  './assets/aurora-pro.js',
  './assets/aurora-pro-suite.css',
  './assets/aurora-pro-suite.js',
  './assets/aurora-pro-extras.css',
  './assets/aurora-pro-extras.js',
  './assets/aurora-pro-phase2.css',
  './assets/aurora-pro-phase2.js',
  './assets/aurora-pro-pathfinder.css',
  './assets/aurora-pro-pathfinder.js',
  './assets/aurora-pro-edit-popup.css',
  './assets/aurora-pro-edit-popup.js',
  './assets/aurora-pro-collab.css',
  './assets/aurora-pro-collab.js',
  './assets/aurora-pro-social-batch.css',
  './assets/aurora-pro-social-batch.js',
  './assets/aurora-pro-fonts.css',
  './assets/aurora-pro-fonts.js',
  './assets/aurora-obsidian-mobile.css',
  './assets/aurora-obsidian-mobile.js',
  './assets/aurora-obsidian-canva-mobile.js',
  './assets/studio-phase2.js',
  './assets/aurora-responsive.css',
  './assets/aurora-responsive.js',
  './assets/aurora-controls.css',
  './assets/aurora-controls.js',
  './assets/aurora-toolhub.css',
  './assets/aurora-toolhub.js',
  './manifest.json',
];

function isPptAsset(url) {
  return PPT_ASSETS.some(function (p) { return url.indexOf(p.replace('./', '')) !== -1; });
}

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS).catch(function () { /* partial cache ok */ });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;

  /* PPT editor: always fetch fresh JS/CSS from network first */
  if (isPptAsset(url)) {
    e.respondWith(
      fetch(e.request).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(e.request);
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request).then(function (res) {
        if (res && res.status === 200 && url.indexOf(self.location.origin) === 0) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return cached; });
    })
  );
});
