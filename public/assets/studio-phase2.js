/* Studio Phase 2 — PWA, Pro link, collab, fonts, social batch */

(function () {
  'use strict';
  if (!document.body.classList.contains('studio-app')) return;

  var collab = { peer: null, connections: [], room: null, isHost: false, lock: false, timer: null };
  var CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function genCode() {
    return Array.from({ length: 6 }, function () {
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
  }

  function injectProLink() {
    if (document.getElementById('btnOpenPro')) return;
    var anchor = document.querySelector('header .ml-auto');
    if (!anchor) return;
    var a = document.createElement('a');
    a.id = 'btnOpenPro';
    a.href = 'obsidian.html';
    a.className = 'dock-btn rounded-lg bg-gradient-to-r from-cyan-500/30 to-orange-500/30 px-2.5 py-1.5 text-[11px] font-bold text-white ring-1 ring-cyan-400/40';
    a.textContent = '⚡ Pro Workspace';
    anchor.insertBefore(a, anchor.firstChild);
  }

  function studioSnapshot() {
    return { w: typeof baseW !== 'undefined' ? baseW : 1080, h: typeof baseH !== 'undefined' ? baseH : 1350, json: canvas.toJSON(typeof SNAP_PROPS !== 'undefined' ? SNAP_PROPS : []) };
  }

  function applyStudioRemote(data) {
    if (!data || collab.lock) return;
    collab.lock = true;
    try {
      if (data.w && data.h && typeof resizeArtboard === 'function') resizeArtboard(data.w, data.h);
      if (data.json) {
        canvas.loadFromJSON(data.json, function () {
          canvas.renderAll();
          if (typeof snapshot === 'function') snapshot();
        });
      }
      if (typeof toast === 'function') toast('Synced from collaborator');
    } finally {
      collab.lock = false;
    }
  }

  function broadcastStudio() {
    if (collab.lock) return;
    clearTimeout(collab.timer);
    collab.timer = setTimeout(function () {
      var data = studioSnapshot();
      collab.connections.forEach(function (c) {
        try { c.send({ type: 'sync', data: data }); } catch (e) {}
      });
    }, 400);
  }

  function setupConn(conn) {
    collab.connections.push(conn);
    conn.on('data', function (d) {
      if (d && d.type === 'sync') applyStudioRemote(d.data);
    });
    conn.on('close', function () {
      collab.connections = collab.connections.filter(function (c) { return c !== conn; });
    });
    conn.send({ type: 'sync', data: studioSnapshot() });
  }

  function leaveRoom() {
    collab.connections.forEach(function (c) { try { c.close(); } catch (e) {} });
    collab.connections = [];
    if (collab.peer) { collab.peer.destroy(); collab.peer = null; }
    collab.room = null;
    collab.isHost = false;
    renderCollabModal();
  }

  function hostRoom() {
    if (typeof Peer === 'undefined') return toast('PeerJS loading…');
    var code = genCode();
    collab.room = code;
    collab.isHost = true;
    if (collab.peer) collab.peer.destroy();
    collab.peer = new Peer(code);
    collab.peer.on('open', function () { renderCollabModal(); toast('Room: ' + code); });
    collab.peer.on('connection', function (conn) {
      conn.on('open', function () { setupConn(conn); });
    });
  }

  function joinRoom(code) {
    code = String(code || '').trim().toUpperCase();
    if (!code) return toast('Enter room code');
    if (typeof Peer === 'undefined') return toast('PeerJS loading…');
    collab.room = code;
    collab.isHost = false;
    if (collab.peer) collab.peer.destroy();
    collab.peer = new Peer();
    collab.peer.on('open', function () {
      var conn = collab.peer.connect(code);
      conn.on('open', function () { setupConn(conn); renderCollabModal(); });
    });
  }

  function renderCollabModal() {
    var body = document.getElementById('studioCollabBody');
    if (!body) return;
    if (collab.room) {
      body.innerHTML =
        '<div class="pro-collab-code">' + collab.room + '</div>' +
        '<p class="mt-2 text-center text-[11px] text-navy-400">' + (collab.isHost ? 'Hosting — share code' : 'Connected') + '</p>' +
        '<button type="button" id="studioCollabLeave" class="tr mt-3 w-full rounded-xl border border-red-300 py-2 text-[12px] font-semibold text-red-500">Leave room</button>';
      document.getElementById('studioCollabLeave').onclick = leaveRoom;
      return;
    }
    body.innerHTML =
      '<button type="button" id="studioCollabHost" class="tr mb-3 w-full rounded-xl bg-gradient-to-r from-flame-500 to-flame-400 py-2.5 text-[12px] font-bold text-white">Create room</button>' +
      '<div class="flex gap-2"><input id="studioCollabCode" class="num flex-1 uppercase" maxlength="6" placeholder="ABC123" />' +
      '<button type="button" id="studioCollabJoin" class="rounded-lg bg-navy-800 px-4 py-2 text-[12px] font-bold text-white">Join</button></div>';
    document.getElementById('studioCollabHost').onclick = hostRoom;
    document.getElementById('studioCollabJoin').onclick = function () {
      joinRoom(document.getElementById('studioCollabCode').value);
    };
  }

  function injectCollabUI() {
    if (document.getElementById('studioCollabModal')) return;
    var anchor = document.querySelector('header .ml-auto');
    if (anchor && !document.getElementById('btnStudioCollab')) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btnStudioCollab';
      btn.className = 'dock-btn rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-navy-100';
      btn.textContent = '👥 Live';
      btn.onclick = function () {
        renderCollabModal();
        document.getElementById('studioCollabModal').classList.add('open');
      };
      anchor.insertBefore(btn, anchor.firstChild);
    }
    document.body.insertAdjacentHTML('beforeend',
      '<div id="studioCollabModal" role="dialog" style="position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;padding:1rem;background:rgba(10,20,36,.75);opacity:0;visibility:hidden;transition:.25s">' +
      '<div class="glass w-full max-w-sm rounded-2xl p-5" style="background:#fff">' +
      '<div class="mb-3 flex items-center justify-between"><h3 class="font-display text-lg font-bold">Live Collaboration</h3>' +
      '<button type="button" id="studioCollabClose" class="text-navy-400">✕</button></div>' +
      '<div id="studioCollabBody"></div></div></div>');
    document.getElementById('studioCollabClose').onclick = function () {
      document.getElementById('studioCollabModal').classList.remove('open');
    };
    document.getElementById('studioCollabModal').addEventListener('click', function (e) {
      if (e.target.id === 'studioCollabModal') document.getElementById('studioCollabModal').classList.remove('open');
    });
    var style = document.createElement('style');
    style.textContent = '#studioCollabModal.open{opacity:1!important;visibility:visible!important}';
    document.head.appendChild(style);
    renderCollabModal();
  }

  function bindCollabCanvas() {
    if (typeof canvas === 'undefined') {
      setTimeout(bindCollabCanvas, 400);
      return;
    }
    if (canvas._studioCollabBound) return;
    canvas._studioCollabBound = true;
    ['object:modified', 'object:added', 'object:removed'].forEach(function (ev) {
      canvas.on(ev, function () {
        if (collab.room || collab.connections.length) broadcastStudio();
      });
    });
  }

  function injectFontTab() {
    if (!window.AuroraProFonts || document.getElementById('studioFontTab')) return;
    var tabs = document.querySelector('[data-tab="text"]');
    if (!tabs) return;
    /* Font upload appears in text panel via aurora-pro-fonts.js studio inject */
  }

  function registerPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {});
      });
    }
  }

  function registerCommands() {
    if (!window.AuroraToolHub) return;
    AuroraToolHub.register([
      { id: 'studio-pro', label: 'Open Pro Workspace', icon: '⚡', group: 'Quick', quick: true, run: function () { location.href = 'obsidian.html'; } },
      { id: 'studio-social', label: 'Social batch export', icon: '📦', group: 'Export', quick: true, run: function () {
        if (window.AuroraSocialBatch) AuroraSocialBatch.open();
      }},
      { id: 'studio-collab', label: 'Live collaboration', icon: '👥', group: 'Tools', run: function () {
        document.getElementById('btnStudioCollab')?.click();
      }}
    ]);
  }

  function init() {
    injectProLink();
    injectCollabUI();
    bindCollabCanvas();
    injectFontTab();
    registerPWA();
    registerCommands();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 200);
})();
