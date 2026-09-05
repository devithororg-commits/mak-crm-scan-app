/* Aurora Studio SW v33 — homepage never cached */

const PPT_PATTERNS = ['aurora-ppt.html', 'aurora-ppt-spa.js', 'aurora-ppt-spa.css'];
const HOME_PATTERNS = ['/', '/index.html', '/start.html', '/hub.html', 'aurora-home.'];

function isPpt(url) {
  return PPT_PATTERNS.some(function (p) { return url.indexOf(p) !== -1; });
}

function isHomepage(url) {
  var path = url.replace(self.location.origin, '').split('?')[0].split('#')[0];
  if (path === '' || path === '/') return true;
  return HOME_PATTERNS.some(function (p) {
    return path === p || path.endsWith(p) || path.indexOf(p) !== -1;
  });
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
        if (u.indexOf('apptesting.in') < 0) return;
        var path = u.replace(self.location.origin, '').split('?')[0];
        var isHome = path === '' || path === '/' || path.endsWith('/start.html') ||
          path.endsWith('/hub.html') || path.indexOf('index.html') >= 0;
        if (isHome) client.navigate(path + '?v=33');
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
