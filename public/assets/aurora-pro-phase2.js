/* Aurora Pro Phase 2 — 2D grid, merge, PWA, onboarding */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app')) return;

  var ONBOARD_KEY = 'aurora-pro-onboarded.v1';

  /* ── 2D Grid Auto Layout (Figma-style) ── */
  function gridLayout(cols, rows, gap) {
    cols = cols || 2;
    rows = rows || 2;
    gap = gap || 16;
    var sel = canvas.getActiveObjects ? canvas.getActiveObjects() : [];
    if (!sel.length && canvas.getActiveObject()) sel = [canvas.getActiveObject()];
    if (!sel.length) {
      sel = canvas.getObjects().filter(function (o) {
        return o.objectName !== '__guide' && o.selectable !== false;
      });
    }
    if (!sel.length) return toast('Nothing to arrange');
    var pad = 32;
    var cellW = (STATE.W - pad * 2 - gap * (cols - 1)) / cols;
    var cellH = (STATE.H - pad * 2 - gap * (rows - 1)) / rows;
    sel.slice(0, cols * rows).forEach(function (o, i) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var b = o.getBoundingRect(true, true);
      var scale = Math.min(cellW / b.width, cellH / b.height, 1) * 0.92;
      o.set({
        originX: 'left',
        originY: 'top',
        left: pad + col * (cellW + gap) + (cellW - b.width * scale) / 2,
        top: pad + row * (cellH + gap) + (cellH - b.height * scale) / 2,
        scaleX: (o.scaleX || 1) * scale,
        scaleY: (o.scaleY || 1) * scale
      });
      o.setCoords();
    });
    canvas.requestRenderAll();
    ENGINE.snapshot();
    LAYERS.render();
    toast('Grid layout ' + cols + '×' + rows);
  }

  /* ── Merge shapes (flatten selection to image) ── */
  function mergeSelection() {
    var sel = canvas.getActiveObjects ? canvas.getActiveObjects() : [];
    if (!sel.length && canvas.getActiveObject()) sel = [canvas.getActiveObject()];
    if (sel.length < 2) return toast('Select 2+ objects to merge');
    var active = canvas.getActiveObject();
    if (active && active.type === 'activeSelection') {
      var dataUrl = active.toDataURL({ format: 'png', multiplier: 2 });
      fabric.Image.fromURL(dataUrl, function (img) {
        var b = active.getBoundingRect(true, true);
        img.set({
          left: b.left + b.width / 2,
          top: b.top + b.height / 2,
          originX: 'center',
          originY: 'center',
          objectName: 'Merged shape'
        });
        active.getObjects().forEach(function (o) { canvas.remove(o); });
        canvas.discardActiveObject();
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
        ENGINE.snapshot();
        LAYERS.render();
        toast('Shapes merged');
      });
    } else {
      toast('Select multiple objects with active selection');
    }
  }

  /* ── Onboarding tour ── */
  function injectOnboarding() {
    if (document.getElementById('proOnboard')) return;
    var steps = [
      { title: 'Welcome to AURORA Pro', body: 'Professional design workspace with multi-page artboards, AI tools, and print-ready export.', action: 'Next →' },
      { title: 'Command Palette', body: 'Press Ctrl+K to search every tool — Magic Resize, AI, export, layers, and more.', action: 'Next →' },
      { title: 'Magic Resize', body: 'Click ⤢ Resize in the header to convert your design to Instagram, Story, A4, YouTube sizes instantly.', action: 'Next →' },
      { title: 'AI Assistant', body: 'Click ✦ AI for text generation, background removal, eraser brush, and quick design actions.', action: 'Next →' },
      { title: 'You\'re ready!', body: 'Explore the left rail: Templates, Effects ✨, Brand Kit, Assets 📦, and Collab 💬.', action: 'Start designing →' }
    ];
    var idx = 0;
    document.body.insertAdjacentHTML('beforeend',
      '<div id="proOnboard" role="dialog" aria-modal="true">' +
      '<div class="glass w-full max-w-md rounded-2xl p-6">' +
      '<div id="proObDots" class="mb-4 flex gap-1.5 justify-center"></div>' +
      '<h3 id="proObTitle" class="text-xl font-extrabold text-slate-100"></h3>' +
      '<p id="proObBody" class="mt-2 text-sm text-slate-400"></p>' +
      '<div class="mt-5 flex gap-2">' +
      '<button type="button" id="proObSkip" class="chip tr flex-1 rounded-xl py-2.5 text-[12px]">Skip</button>' +
      '<button type="button" id="proObNext" class="tr flex-1 rounded-xl bg-gradient-to-r from-cyan-400 to-orange-400 py-2.5 text-[12px] font-bold text-slate-950"></button></div></div></div>');
    var modal = document.getElementById('proOnboard');
    function render() {
      var s = steps[idx];
      document.getElementById('proObTitle').textContent = s.title;
      document.getElementById('proObBody').textContent = s.body;
      document.getElementById('proObNext').textContent = s.action;
      document.getElementById('proObDots').innerHTML = steps.map(function (_, i) {
        return '<span class="step-dot ' + (i === idx ? 'on' : '') + '"></span>';
      }).join('');
    }
    function close() {
      modal.classList.remove('open');
      localStorage.setItem(ONBOARD_KEY, '1');
    }
    document.getElementById('proObSkip').onclick = close;
    document.getElementById('proObNext').onclick = function () {
      if (idx < steps.length - 1) { idx++; render(); }
      else close();
    };
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    if (!localStorage.getItem(ONBOARD_KEY)) {
      setTimeout(function () { render(); modal.classList.add('open'); }, 1500);
    }
  }

  /* ── Grid layout bar ── */
  function injectGridLayoutBar() {
    if (document.getElementById('proGridLayoutBar')) return;
    var bp = document.getElementById('proBreakpointBar');
    if (!bp) return;
    var bar = document.createElement('div');
    bar.id = 'proGridLayoutBar';
    bar.className = 'glass';
    bar.innerHTML =
      '<span class="text-[9px] font-bold uppercase tracking-[.2em] text-slate-500 shrink-0">Grid</span>' +
      '<button type="button" data-gl="2x2" class="tr chip rounded-lg px-2 py-1 text-[10px]">2×2</button>' +
      '<button type="button" data-gl="3x3" class="tr chip rounded-lg px-2 py-1 text-[10px]">3×3</button>' +
      '<button type="button" data-gl="4x2" class="tr chip rounded-lg px-2 py-1 text-[10px]">4×2</button>' +
      '<button type="button" data-gl="merge" class="tr chip rounded-lg px-2 py-1 text-[10px]">⊕ Merge</button>';
    bp.insertAdjacentElement('afterend', bar);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-gl]');
      if (!b) return;
      var k = b.dataset.gl;
      if (k === 'merge') return mergeSelection();
      var parts = k.split('x');
      gridLayout(+parts[0], +parts[1]);
    });
  }

  /* ── PWA registration (PPT/offline only — skip on landing pages) ── */
  function registerPWA() {
    if (!('serviceWorker' in navigator)) return;
    var path = location.pathname;
    if (path.endsWith('/') || path.endsWith('index.html') ||
        path.endsWith('start.html') || path.endsWith('hub.html')) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js?v=33').catch(function () {});
    });
  }

  /* ── IndexedDB large design storage ── */
  function idbOpen() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open('aurora-pro-db', 1);
      r.onupgradeneeded = function () {
        r.result.createObjectStore('designs', { keyPath: 'id' });
      };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }

  function idbSaveLarge(name) {
    if (!window.AuroraPro) return;
    AuroraPro.commitPage();
    idbOpen().then(function (db) {
      var tx = db.transaction('designs', 'readwrite');
      tx.objectStore('designs').put({
        id: 'large-' + Date.now(),
        name: name || 'Large design',
        data: AuroraPro.projectJSON(),
        at: Date.now()
      });
      tx.oncomplete = function () { toast('Saved to device storage (IndexedDB)'); };
    }).catch(function () { toast('IndexedDB not available'); });
  }

  function registerCommands() {
    if (!window.AuroraToolHub) return;
    AuroraToolHub.register([
      { id: 'p2-grid-2', label: 'Grid layout 2×2', icon: '⊞', group: 'Layout', run: function () { gridLayout(2, 2); } },
      { id: 'p2-grid-3', label: 'Grid layout 3×3', icon: '⊞', group: 'Layout', run: function () { gridLayout(3, 3); } },
      { id: 'p2-merge', label: 'Merge shapes to image', icon: '⊕', group: 'Pro', run: mergeSelection },
      { id: 'p2-onboard', label: 'Show onboarding tour', icon: '?', group: 'Help', run: function () { localStorage.removeItem(ONBOARD_KEY); document.getElementById('proOnboard')?.classList.add('open'); } },
      { id: 'p2-idb', label: 'Save to device (IndexedDB)', icon: '💾', group: 'Pro', run: function () { idbSaveLarge(prompt('Name', 'Large design')); } }
    ]);
  }

  function init() {
    injectOnboarding();
    injectGridLayoutBar();
    registerPWA();
    registerCommands();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 200);
  }

  window.AuroraProPhase2 = {
    gridLayout: gridLayout,
    mergeSelection: mergeSelection
  };
})();
