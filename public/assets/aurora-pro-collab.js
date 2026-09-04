/* Aurora Pro — PeerJS real-time collaboration */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app')) return;

  var collab = { peer: null, connections: [], room: null, isHost: false, lock: false, timer: null };
  var CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function genCode() {
    return Array.from({ length: 6 }, function () {
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
  }

  function snapshot() {
    if (window.AuroraPro && AuroraPro.commitPage) AuroraPro.commitPage();
    if (window.AuroraPro && AuroraPro.projectJSON) return AuroraPro.projectJSON();
    return { w: STATE.W, h: STATE.H, json: canvas.toDatalessJSON(['objectName', 'name', 'locked', 'blendMode']) };
  }

  function applyRemote(data) {
    if (!data || collab.lock) return;
    collab.lock = true;
    try {
      if (window.AuroraPro && AuroraPro.loadProjectData) AuroraPro.loadProjectData(data);
      else if (data.json) {
        canvas.loadFromJSON(data.json, function () {
          canvas.renderAll();
          if (typeof ENGINE !== 'undefined') ENGINE.snapshot();
          if (typeof LAYERS !== 'undefined') LAYERS.render();
          if (typeof INSPECTOR !== 'undefined') INSPECTOR.render();
        });
      }
      toast('Design synced from collaborator');
    } finally {
      collab.lock = false;
    }
  }

  function broadcast() {
    if (collab.lock) return;
    clearTimeout(collab.timer);
    collab.timer = setTimeout(function () {
      var data = snapshot();
      collab.connections.forEach(function (c) {
        try { c.send({ type: 'sync', data: data }); } catch (e) {}
      });
    }, 350);
  }

  function setupConn(conn) {
    collab.connections.push(conn);
    conn.on('data', function (d) {
      if (d && d.type === 'sync') applyRemote(d.data);
    });
    conn.on('close', function () {
      collab.connections = collab.connections.filter(function (c) { return c !== conn; });
      updateBadge();
    });
    updateBadge();
    conn.send({ type: 'sync', data: snapshot() });
  }

  function updateBadge() {
    var badge = document.getElementById('proCollabBadge');
    if (!badge) return;
    var on = collab.room || collab.connections.length > 0;
    badge.classList.toggle('on', on);
    var txt = badge.querySelector('.txt');
    if (txt) {
      if (collab.room && collab.isHost) txt.textContent = 'Hosting · ' + collab.room;
      else if (collab.room) txt.textContent = 'Room ' + collab.room;
      else txt.textContent = collab.connections.length + ' connected';
    }
  }

  function leaveRoom() {
    collab.connections.forEach(function (c) { try { c.close(); } catch (e) {} });
    collab.connections = [];
    if (collab.peer) { collab.peer.destroy(); collab.peer = null; }
    collab.room = null;
    collab.isHost = false;
    updateBadge();
    renderModal();
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
  }

  function hostRoom() {
    if (typeof Peer === 'undefined') return toast('PeerJS loading… refresh page');
    var code = genCode();
    collab.room = code;
    collab.isHost = true;
    if (collab.peer) collab.peer.destroy();
    collab.peer = new Peer(code);
    collab.peer.on('open', function () { updateBadge(); renderModal(); });
    collab.peer.on('connection', function (conn) {
      conn.on('open', function () { setupConn(conn); });
    });
    collab.peer.on('error', function () { toast('Room error — try another code'); });
    if (history.replaceState) history.replaceState(null, '', location.pathname + '?room=' + code);
    toast('Room created: ' + code);
  }

  function joinRoom(code) {
    code = String(code || '').trim().toUpperCase();
    if (!code) return toast('Enter a room code');
    if (typeof Peer === 'undefined') return toast('PeerJS loading… refresh page');
    collab.room = code;
    collab.isHost = false;
    if (collab.peer) collab.peer.destroy();
    collab.peer = new Peer();
    collab.peer.on('open', function () {
      var conn = collab.peer.connect(code);
      conn.on('open', function () { setupConn(conn); renderModal(); });
      conn.on('error', function () { toast('Could not join room'); });
    });
    collab.peer.on('error', function () { toast('Join failed — check code'); });
    toast('Joining ' + code + '…');
  }

  function copyShareLink() {
    if (!collab.room) return;
    var url = location.origin + location.pathname + '?room=' + collab.room;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { toast('Share link copied'); });
    } else {
      prompt('Copy link:', url);
    }
  }

  function renderModal() {
    var body = document.getElementById('proCollabBody');
    if (!body) return;
    if (collab.room) {
      body.innerHTML =
        '<p class="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Active room</p>' +
        '<div class="pro-collab-code">' + collab.room + '</div>' +
        '<p class="mt-2 text-center text-[11px] text-slate-400">' +
        (collab.isHost ? 'Share this code — guests can edit live' : 'Connected as guest') + '</p>' +
        '<div class="mt-4 flex flex-col gap-2">' +
        '<button type="button" id="proCollabCopy" class="chip tr w-full rounded-xl py-2.5 text-[12px] font-semibold">Copy share link</button>' +
        '<button type="button" id="proCollabPush" class="chip tr w-full rounded-xl py-2.5 text-[12px] font-semibold">Push my design to room</button>' +
        '<button type="button" id="proCollabLeave" class="tr w-full rounded-xl border border-red-400/30 py-2.5 text-[12px] font-semibold text-red-300">Leave room</button>' +
        '</div>';
      document.getElementById('proCollabCopy').onclick = copyShareLink;
      document.getElementById('proCollabPush').onclick = function () {
        broadcast();
        toast('Design pushed to room');
      };
      document.getElementById('proCollabLeave').onclick = leaveRoom;
      return;
    }
    body.innerHTML =
      '<p class="mb-3 text-[11px] leading-relaxed text-slate-400">Real-time P2P collaboration. Host a room or join with a 6-character code.</p>' +
      '<button type="button" id="proCollabHost" class="tr mb-3 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-orange-400 py-2.5 text-[12px] font-bold text-slate-950">Create room</button>' +
      '<label class="mb-1 block text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Join room</label>' +
      '<div class="flex gap-2">' +
      '<input id="proCollabJoinInput" class="fld flex-1 uppercase" maxlength="6" placeholder="ABC123" />' +
      '<button type="button" id="proCollabJoin" class="chip tr rounded-xl px-4 py-2 text-[12px] font-bold">Join</button>' +
      '</div>';
    document.getElementById('proCollabHost').onclick = hostRoom;
    document.getElementById('proCollabJoin').onclick = function () {
      joinRoom(document.getElementById('proCollabJoinInput').value);
    };
  }

  function injectUI() {
    if (document.getElementById('proCollabModal')) return;

    var anchor = document.querySelector('header.glass .ml-auto');
    if (anchor && !document.getElementById('proCollabBadge')) {
      var badge = document.createElement('span');
      badge.id = 'proCollabBadge';
      badge.innerHTML = '<span class="dot"></span><span class="txt">Live</span>';
      badge.title = 'Collaboration';
      badge.style.cursor = 'pointer';
      badge.onclick = openModal;
      anchor.insertBefore(badge, anchor.firstChild);
    }

    if (!document.getElementById('btnProCollab')) {
      var wrap = document.querySelector('#btnProSave')?.parentElement;
      if (wrap) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'btnProCollab';
        btn.className = 'tr chip rounded-lg px-2 py-1.5 text-[11px] font-semibold';
        btn.title = 'Live collaboration';
        btn.textContent = '👥 Live';
        btn.onclick = openModal;
        wrap.insertBefore(btn, wrap.firstChild);
      }
    }

    document.body.insertAdjacentHTML('beforeend',
      '<div id="proCollabModal" role="dialog" aria-modal="true">' +
      '<div class="pro-collab-card glass">' +
      '<div class="mb-3 flex items-center justify-between">' +
      '<h3 class="text-lg font-extrabold">Live Collaboration</h3>' +
      '<button type="button" id="proCollabClose" class="tr chip rounded-lg px-3 py-1.5 text-[12px]">✕</button>' +
      '</div>' +
      '<div id="proCollabBody"></div>' +
      '</div></div>');

    document.getElementById('proCollabClose').onclick = closeModal;
    document.getElementById('proCollabModal').addEventListener('click', function (e) {
      if (e.target.id === 'proCollabModal') closeModal();
    });
    renderModal();
  }

  function openModal() {
    renderModal();
    document.getElementById('proCollabModal').classList.add('open');
  }

  function closeModal() {
    document.getElementById('proCollabModal')?.classList.remove('open');
  }

  function bindCanvas() {
    if (typeof canvas === 'undefined') {
      setTimeout(bindCanvas, 300);
      return;
    }
    if (canvas._collabBound) return;
    canvas._collabBound = true;
    ['object:modified', 'object:added', 'object:removed'].forEach(function (ev) {
      canvas.on(ev, function () {
        if (collab.room || collab.connections.length) broadcast();
      });
    });
  }

  function checkUrlRoom() {
    var m = location.search.match(/[?&]room=([A-Z0-9]{4,8})/i);
    if (m) setTimeout(function () { joinRoom(m[1]); openModal(); }, 1200);
  }

  function init() {
    injectUI();
    bindCanvas();
    checkUrlRoom();
    if (window.AuroraToolHub) {
      AuroraToolHub.register([
        { id: 'pro-collab', label: 'Live collaboration', icon: '👥', group: 'Pro', quick: true, run: openModal }
      ]);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 400);

  window.AuroraProCollab = { open: openModal, leave: leaveRoom, host: hostRoom, join: joinRoom };
})();
