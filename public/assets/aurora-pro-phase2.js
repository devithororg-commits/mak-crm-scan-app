/* Aurora Pro Phase 2 — GIF export, 2D grid, video layers, PWA, onboarding */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app')) return;

  var videoRaf = null;
  var ONBOARD_KEY = 'aurora-pro-onboarded.v1';

  /* ── GIF Export ── */
  function exportGif() {
    if (typeof GIF === 'undefined') return toast('GIF library loading…');
    toast('Generating GIF…');
    if (window.AuroraPro && AuroraPro.commitPage) AuroraPro.commitPage();
    var frames = 12;
    var delay = 80;
    var gif = new GIF({
      workers: 2,
      quality: 12,
      workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
    });
    var objs = canvas.getObjects().filter(function (o) { return o.objectName !== '__guide'; });
    var originals = objs.map(function (o) { return { o: o, op: o.opacity ?? 1 }; });

    function captureFrame(i, cb) {
      originals.forEach(function (x, idx) {
        x.o.set('opacity', Math.min(1, (i / frames) + idx * 0.02));
      });
      canvas.requestRenderAll();
      setTimeout(function () {
        gif.addFrame(canvas.getElement(), { copy: true, delay: delay });
        cb();
      }, 40);
    }

    function next(i) {
      if (i >= frames) {
        originals.forEach(function (x) { x.o.set('opacity', x.op); });
        canvas.requestRenderAll();
        gif.on('finished', function (blob) {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'aurora-animation.gif';
          a.click();
          toast('GIF exported');
        });
        gif.render();
        return;
      }
      captureFrame(i, function () { next(i + 1); });
    }
    next(0);
  }

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

  /* ── Video layer ── */
  function addVideoLayer(file) {
    if (!file || !file.type.startsWith('video/')) return toast('Select a video file');
    var url = URL.createObjectURL(file);
    var video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.onloadeddata = function () {
      video.play();
      var img = new fabric.Image(video, {
        objectName: 'Video · ' + (file.name || 'clip'),
        left: STATE.W / 2,
        top: STATE.H / 2,
        originX: 'center',
        originY: 'center'
      });
      var maxW = STATE.W * 0.7;
      if (img.width > maxW) img.scaleToWidth(maxW);
      canvas.add(img);
      canvas.setActiveObject(img);
      startVideoRenderLoop();
      ENGINE.snapshot();
      LAYERS.render();
      toast('Video added — plays on canvas');
    };
  }

  function startVideoRenderLoop() {
    if (videoRaf) return;
    function tick() {
      var hasVideo = canvas.getObjects().some(function (o) {
        return o._element && o._element.tagName === 'VIDEO';
      });
      if (!hasVideo) { videoRaf = null; return; }
      canvas.getObjects().forEach(function (o) {
        if (o._element && o._element.tagName === 'VIDEO') o.dirty = true;
      });
      canvas.requestRenderAll();
      videoRaf = requestAnimationFrame(tick);
    }
    videoRaf = requestAnimationFrame(tick);
  }

  function injectVideoUpload() {
    if (document.getElementById('proVideoInput')) return;
    var inp = document.createElement('input');
    inp.id = 'proVideoInput';
    inp.type = 'file';
    inp.accept = 'video/mp4,video/webm,video/ogg';
    inp.className = 'hidden';
    document.body.appendChild(inp);
    inp.onchange = function () {
      if (inp.files[0]) addVideoLayer(inp.files[0]);
      inp.value = '';
    };
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
      '<button type="button" data-gl="merge" class="tr chip rounded-lg px-2 py-1 text-[10px]">⊕ Merge</button>' +
      '<button type="button" data-gl="video" class="tr chip rounded-lg px-2 py-1 text-[10px]">▶ Video</button>';
    bp.insertAdjacentElement('afterend', bar);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-gl]');
      if (!b) return;
      var k = b.dataset.gl;
      if (k === 'merge') return mergeSelection();
      if (k === 'video') return document.getElementById('proVideoInput').click();
      var parts = k.split('x');
      gridLayout(+parts[0], +parts[1]);
    });
  }

  /* ── PWA registration ── */
  function registerPWA() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline optional */ });
    });
  }

  /* ── Patch export for GIF ── */
  function patchExportGif() {
    var fmt = document.getElementById('expFormat');
    if (fmt && !fmt.querySelector('[value="gif"]')) {
      fmt.insertAdjacentHTML('beforeend', '<option value="gif">GIF Animation</option>');
    }
    if (typeof EXPORT === 'undefined' || EXPORT._gifPatched) return;
    var orig = EXPORT.run;
    EXPORT.run = function () {
      if (document.getElementById('expFormat').value === 'gif') return exportGif();
      return orig.call(EXPORT);
    };
    EXPORT._gifPatched = true;
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
      { id: 'p2-gif', label: 'Export GIF animation', icon: '🎞', group: 'Export', quick: true, run: exportGif },
      { id: 'p2-grid-2', label: 'Grid layout 2×2', icon: '⊞', group: 'Layout', run: function () { gridLayout(2, 2); } },
      { id: 'p2-grid-3', label: 'Grid layout 3×3', icon: '⊞', group: 'Layout', run: function () { gridLayout(3, 3); } },
      { id: 'p2-merge', label: 'Merge shapes to image', icon: '⊕', group: 'Pro', run: mergeSelection },
      { id: 'p2-video', label: 'Add video layer', icon: '▶', group: 'Pro', run: function () { document.getElementById('proVideoInput')?.click(); } },
      { id: 'p2-onboard', label: 'Show onboarding tour', icon: '?', group: 'Help', run: function () { localStorage.removeItem(ONBOARD_KEY); document.getElementById('proOnboard')?.classList.add('open'); } },
      { id: 'p2-idb', label: 'Save to device (IndexedDB)', icon: '💾', group: 'Pro', run: function () { idbSaveLarge(prompt('Name', 'Large design')); } }
    ]);
  }

  function init() {
    injectVideoUpload();
    injectOnboarding();
    injectGridLayoutBar();
    patchExportGif();
    registerPWA();
    registerCommands();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 200);
  }

  window.AuroraProPhase2 = {
    exportGif: exportGif,
    gridLayout: gridLayout,
    mergeSelection: mergeSelection,
    addVideoLayer: addVideoLayer
  };
})();
