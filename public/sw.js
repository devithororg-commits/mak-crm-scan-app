/* Aurora Studio SW v24 — PPT assets only; homepage never cached */

const PPT_PATTERNS = ['aurora-ppt.html', 'aurora-ppt-spa.js', 'aurora-ppt-spa.css'];

function isPpt(url) {
  return PPT_PATTERNS.some(function (p) { return url.indexOf(p) !== -1; });
}

function isHomepage(url) {
  var path = url.replace(self.location.origin, '');
  return path === '/' || path === '' || path.indexOf('/index.html') !== -1 ||
    path.indexOf('aurora-home.') !== -1;
}

self.addEventListener('install', function (e) {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return caches.delete(k); }));
    }).then(function () {
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    }).then(function (clients) {
      clients.forEach(function (client) {
        var u = client.url.split('#')[0];
        if (u.indexOf('apptesting.in') >= 0 && (u.endsWith('/') || u.indexOf('index.html') >= 0)) {
          client.navigate(u.split('?')[0] + '?v=24');
        }
      });
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;

  if (isHomepage(url)) {
    e.respondWith(fetch(e.request));
    return;
  }

  if (isPpt(url)) {
    e.respondWith(
      fetch(e.request).then(function (res) {
        return res;
      }).catch(function () {
        return caches.match(e.request);
      })
    );
  }
});
