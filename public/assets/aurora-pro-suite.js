/* Aurora Pro Suite — Magic Resize, snap++, context menu, effects, AI, layout */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app')) return;

  var SNAP_PROPS = ['objectName', 'locked', 'blendMode', 'name', 'constraints', 'autoLayout', 'variantKey'];
  var snapForcedOff = false;
  var eraserActive = false;
  var eraserBrush = 24;

  var MAGIC_PRESETS = [
    ['Instagram Post', 1080, 1080],
    ['Instagram Story', 1080, 1920],
    ['Facebook Cover', 820, 312],
    ['LinkedIn Banner', 1584, 396],
    ['YouTube Thumb', 1280, 720],
    ['Twitter/X Header', 1500, 500],
    ['A4 Print', 2480, 3508],
    ['Presentation 16:9', 1920, 1080]
  ];

  var STROKES = {
    none: { stroke: null, strokeWidth: 0 },
    hairline: { stroke: '#0f172a', strokeWidth: 1, paintFirst: 'stroke' },
    bold: { stroke: '#0f172a', strokeWidth: 6, paintFirst: 'stroke' },
    neon: { stroke: '#22d3ee', strokeWidth: 4, paintFirst: 'stroke' },
    ghost: { fill: 'transparent', stroke: '#e2e8f0', strokeWidth: 3, paintFirst: 'stroke' }
  };

  /* ── Magic Resize ── */
  function magicResize(w, h) {
    if (!w || !h) return;
    if (window.AuroraPro && AuroraPro.commitPage) AuroraPro.commitPage();
    var sx = w / STATE.W;
    var sy = h / STATE.H;
    canvas.getObjects().forEach(function (o) {
      if (o.objectName === '__guide') return;
      o.set({
        left: (o.left || 0) * sx,
        top: (o.top || 0) * sy,
        scaleX: (o.scaleX || 1) * sx,
        scaleY: (o.scaleY || 1) * sy
      });
      o.setCoords();
    });
    ENGINE.resize(w, h);
    applyConstraintsOnResize(sx, sy);
    canvas.requestRenderAll();
    ENGINE.snapshot();
    LAYERS.render();
    INSPECTOR.render();
    toast('Magic Resize → ' + w + '×' + h);
    closeMagicModal();
  }

  function openMagicModal() {
    var m = document.getElementById('proMagicModal');
    if (!m) return;
    m.classList.add('open');
    if (window.AuroraControls && AuroraControls.focusTrap) {
      window._proMagicRelease = AuroraControls.focusTrap(m.querySelector('.glass'), {
        onClose: closeMagicModal,
        focus: document.getElementById('proMagicClose')
      });
    }
  }

  function closeMagicModal() {
    var m = document.getElementById('proMagicModal');
    if (!m) return;
    m.classList.remove('open');
    if (window._proMagicRelease) { window._proMagicRelease(); window._proMagicRelease = null; }
  }

  function injectMagicModal() {
    if (document.getElementById('proMagicModal')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<div id="proMagicModal" role="dialog" aria-modal="true">' +
      '<div class="glass w-full max-w-2xl rounded-2xl p-5">' +
      '<div class="mb-4 flex items-center justify-between">' +
      '<div><h3 class="text-lg font-extrabold">Magic Resize</h3>' +
      '<p class="text-[11px] text-slate-400">Scale entire design to a new format — Canva-style</p></div>' +
      '<button type="button" id="proMagicClose" class="tr chip rounded-lg px-3 py-1.5 text-[12px]">✕</button></div>' +
      '<div class="pro-magic-grid">' +
      MAGIC_PRESETS.map(function (p) {
        return '<button type="button" class="chip tr rounded-xl px-3 py-3 text-left text-[11px]" data-mw="' + p[1] + '" data-mh="' + p[2] + '">' +
          '<span class="block font-bold text-slate-100">' + p[0] + '</span>' +
          '<span class="text-slate-500">' + p[1] + '×' + p[2] + '</span></button>';
      }).join('') +
      '</div></div></div>');
    document.getElementById('proMagicClose').onclick = closeMagicModal;
    document.getElementById('proMagicModal').addEventListener('click', function (e) {
      if (e.target.id === 'proMagicModal') closeMagicModal();
    });
    document.getElementById('proMagicModal').addEventListener('click', function (e) {
      var b = e.target.closest('[data-mw]');
      if (!b) return;
      magicResize(+b.dataset.mw, +b.dataset.mh);
    });
  }

  /* ── Enhanced snap + gap labels ── */
  function injectGapOverlay() {
    if (document.getElementById('proGapOverlay')) return;
    var el = document.createElement('div');
    el.id = 'proGapOverlay';
    document.body.appendChild(el);
  }

  function clearGapLabels() {
    var o = document.getElementById('proGapOverlay');
    if (o) o.innerHTML = '';
  }

  function showGapLabels(target) {
    clearGapLabels();
    if (!STATE.snap || snapForcedOff || !target) return;
    var overlay = document.getElementById('proGapOverlay');
    if (!overlay) return;
    var tb = target.getBoundingRect(true, true);
    var others = canvas.getObjects().filter(function (o) {
      return o !== target && o.objectName !== '__guide' && o.visible !== false;
    });
    var stage = document.getElementById('boardShell');
    if (!stage) return;
    var sr = stage.getBoundingClientRect();
    var z = STATE.zoom || 1;

    others.forEach(function (o) {
      var b = o.getBoundingRect(true, true);
      var gaps = [];
      if (Math.abs(b.top - tb.top) < 12 || Math.abs(b.top + b.height - tb.top - tb.height) < 12) {
        if (b.left > tb.left + tb.width) gaps.push({ axis: 'h', px: Math.round(b.left - tb.left - tb.width), x: tb.left + tb.width + (b.left - tb.left - tb.width) / 2, y: tb.top + tb.height / 2 });
        else if (tb.left > b.left + b.width) gaps.push({ axis: 'h', px: Math.round(tb.left - b.left - b.width), x: b.left + b.width + (tb.left - b.left - b.width) / 2, y: tb.top + tb.height / 2 });
      }
      if (Math.abs(b.left - tb.left) < 12 || Math.abs(b.left + b.width - tb.left - tb.width) < 12) {
        if (b.top > tb.top + tb.height) gaps.push({ axis: 'v', px: Math.round(b.top - tb.top - tb.height), x: tb.left + tb.width / 2, y: tb.top + tb.height + (b.top - tb.top - tb.height) / 2 });
        else if (tb.top > b.top + b.height) gaps.push({ axis: 'v', px: Math.round(tb.top - b.top - b.height), x: tb.left + tb.width / 2, y: b.top + b.height + (tb.top - b.top - b.height) / 2 });
      }
      gaps.forEach(function (g) {
        if (g.px > 0 && g.px < 800) {
          var lx = sr.left + g.x * z;
          var ly = sr.top + g.y * z;
          overlay.insertAdjacentHTML('beforeend',
            '<span class="pro-gap-label" style="left:' + lx + 'px;top:' + ly + 'px;transform:translate(-50%,-50%)">' + g.px + 'px</span>');
        }
      });
    });
  }

  function patchGuides() {
    if (typeof GUIDES === 'undefined' || GUIDES._suitePatched) return;
    var origHandle = GUIDES.handle.bind(GUIDES);
    var origClear = GUIDES.clear.bind(GUIDES);
    GUIDES.handle = function (target) {
      if (snapForcedOff) { origClear(); clearGapLabels(); return; }
      origHandle(target);
      showGapLabels(target);
    };
    GUIDES.clear = function () {
      origClear();
      clearGapLabels();
    };
    GUIDES._suitePatched = true;
  }

  function flashSnapBadge(text) {
    var b = document.getElementById('proSnapBadge');
    if (!b) return;
    b.textContent = text;
    b.classList.add('show');
    clearTimeout(b._t);
    b._t = setTimeout(function () { b.classList.remove('show'); }, 900);
  }

  /* ── Context menu ── */
  function injectContextMenu() {
    if (document.getElementById('proCtxMenu')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<div id="proCtxMenu" class="glass" role="menu">' +
      '<button type="button" data-ctx="dup">⧉ Duplicate</button>' +
      '<button type="button" data-ctx="del">🗑 Delete</button>' +
      '<hr />' +
      '<button type="button" data-ctx="front">⬆ Bring to front</button>' +
      '<button type="button" data-ctx="back">⬇ Send to back</button>' +
      '<hr />' +
      '<button type="button" data-ctx="group">⊞ Group</button>' +
      '<button type="button" data-ctx="ungroup">⊟ Ungroup</button>' +
      '<hr />' +
      '<button type="button" data-ctx="lock">🔒 Lock / Unlock</button>' +
      '<button type="button" data-ctx="hide">👁 Hide / Show</button>' +
      '</div>');
    var menu = document.getElementById('proCtxMenu');
    menu.addEventListener('click', function (e) {
      var act = e.target.closest('[data-ctx]');
      if (!act) return;
      runCtxAction(act.dataset.ctx);
      hideContextMenu();
    });
    document.addEventListener('click', function () { hideContextMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideContextMenu(); });
  }

  function showContextMenu(x, y) {
    var menu = document.getElementById('proCtxMenu');
    if (!menu) return;
    menu.style.left = Math.min(x, window.innerWidth - 200) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 280) + 'px';
    menu.classList.add('open');
  }

  function hideContextMenu() {
    var menu = document.getElementById('proCtxMenu');
    if (menu) menu.classList.remove('open');
  }

  function runCtxAction(act) {
    var o = canvas.getActiveObject();
    if (!o && act !== 'group') return toast('Nothing selected');
    if (act === 'dup' && o) {
      o.clone(function (c) {
        c.set({ left: (o.left || 0) + 34, top: (o.top || 0) + 34, objectName: (o.objectName || 'Copy') + ' copy' });
        canvas.add(c);
        canvas.setActiveObject(c);
        canvas.requestRenderAll();
        ENGINE.snapshot();
        LAYERS.render();
      }, SNAP_PROPS);
    }
    if (act === 'del' && o) {
      canvas.remove(o);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      ENGINE.snapshot();
      LAYERS.render();
      INSPECTOR.render();
    }
    if (act === 'front' && o) { o.bringToFront(); canvas.requestRenderAll(); ENGINE.snapshot(); LAYERS.render(); }
    if (act === 'back' && o) { o.sendToBack(); canvas.requestRenderAll(); ENGINE.snapshot(); LAYERS.render(); }
    if (act === 'group' && window.AuroraPro) AuroraPro.groupSel();
    if (act === 'ungroup' && window.AuroraPro) AuroraPro.ungroupSel();
    if (act === 'lock' && o) {
      o.locked = !o.locked;
      o.set({ lockMovementX: o.locked, lockMovementY: o.locked, lockRotation: o.locked, lockScalingX: o.locked, lockScalingY: o.locked, hasControls: !o.locked });
      ENGINE.snapshot();
      LAYERS.render();
    }
    if (act === 'hide' && o) { o.visible = !o.visible; canvas.requestRenderAll(); ENGINE.snapshot(); LAYERS.render(); }
  }

  function bindContextMenu() {
    canvas.on('mouse:down', function (opt) {
      var e = opt.e;
      if (e.button === 2) {
        e.preventDefault();
        if (opt.target) canvas.setActiveObject(opt.target);
        setTimeout(function () { showContextMenu(e.clientX, e.clientY); }, 0);
      }
    });
    canvas.wrapperEl.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  /* ── Alt+drag snap off, S/G shortcuts ── */
  function bindSnapShortcuts() {
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (canvas.getActiveObject() && canvas.getActiveObject().isEditing) return;
      if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        var chk = document.getElementById('snapToggle');
        if (chk) { chk.checked = !chk.checked; STATE.snap = chk.checked; flashSnapBadge('Snap ' + (chk.checked ? 'ON' : 'OFF')); toast('Smart guides ' + (chk.checked ? 'on' : 'off')); }
      }
      if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey) {
        document.getElementById('proVGrid')?.click();
        flashSnapBadge('Grid toggled');
      }
    });
    canvas.on('object:moving', function (e) {
      snapForcedOff = !!(e.e && e.e.altKey);
    });
    canvas.on('object:scaling', function (e) {
      snapForcedOff = !!(e.e && e.e.altKey);
    });
    canvas.on('mouse:up', function () { snapForcedOff = false; });
  }

  /* ── Text effects (curve, gradient, stroke) ── */
  function isText(o) { return o && /text/i.test(o.type); }

  function curveText(amount) {
    var o = canvas.getActiveObject();
    if (!isText(o)) return toast('Select a text layer');
    if (!amount) {
      o.set('path', null);
      canvas.requestRenderAll();
      ENGINE.snapshot();
      return toast('Curve removed');
    }
    var w = (o.width || 400) * (o.scaleX || 1);
    var r = Math.max(80, (w * w) / (8 * Math.abs(amount)) + Math.abs(amount) / 2);
    var sweepUp = amount > 0;
    var d = 'M 0 0 A ' + r + ' ' + r + ' 0 0 ' + (sweepUp ? 1 : 0) + ' ' + w + ' 0';
    var p = new fabric.Path(d, { fill: '', stroke: '', objectCaching: false });
    o.set({ path: p, pathAlign: 'baseline', textAlign: 'center' });
    canvas.requestRenderAll();
    ENGINE.snapshot();
  }

  function gradientFill(a, b, angle) {
    var o = canvas.getActiveObject();
    if (!o) return toast('Select an object');
    var w = o.width || 100;
    var h = o.height || 100;
    var rad = (angle || 135) * Math.PI / 180;
    var dx = Math.cos(rad) * w / 2;
    var dy = Math.sin(rad) * h / 2;
    o.set('fill', new fabric.Gradient({
      type: 'linear',
      coords: { x1: w / 2 - dx, y1: h / 2 - dy, x2: w / 2 + dx, y2: h / 2 + dy },
      colorStops: [{ offset: 0, color: a }, { offset: 1, color: b }]
    }));
    canvas.requestRenderAll();
    ENGINE.snapshot();
    INSPECTOR.render();
    toast('Gradient applied');
  }

  function applyStroke(k) {
    var o = canvas.getActiveObject();
    if (!o) return;
    o.set(STROKES[k] || STROKES.none);
    canvas.requestRenderAll();
    ENGINE.snapshot();
  }

  function patchEffectsDrawer() {
    if (typeof PANELS === 'undefined' || PANELS._effectsPatched) return;
    PANELS.effects = function () {
      return '<p class="text-[11px] text-slate-400">Curve text, gradients, and stroke presets.</p>' +
        '<p class="mt-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Curve text</p>' +
        '<input id="proFxCurve" type="range" min="-300" max="300" value="0" class="w-full" />' +
        '<div class="mt-1.5 flex gap-1.5">' +
        '<button type="button" data-fx="curve-0" class="chip tr flex-1 rounded-lg py-1.5 text-[10px]">Straight</button>' +
        '<button type="button" data-fx="curve-up" class="chip tr flex-1 rounded-lg py-1.5 text-[10px]">Arc ↑</button>' +
        '<button type="button" data-fx="curve-dn" class="chip tr flex-1 rounded-lg py-1.5 text-[10px]">Arc ↓</button></div>' +
        '<p class="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Gradient fill</p>' +
        '<div class="flex items-center gap-2">' +
        '<input id="proFxG1" type="color" value="#22d3ee" class="h-8 w-10" />' +
        '<input id="proFxG2" type="color" value="#fb923c" class="h-8 w-10" />' +
        '<input id="proFxGA" class="fld w-14" type="number" value="135" title="Angle" />' +
        '<button type="button" id="proFxGrad" class="chip tr rounded-lg px-3 py-1.5 text-[10px] font-bold">Apply</button></div>' +
        '<p class="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Stroke presets</p>' +
        '<div class="grid grid-cols-2 gap-1.5">' +
        ['none', 'hairline', 'bold', 'neon', 'ghost'].map(function (k) {
          return '<button type="button" data-stroke="' + k + '" class="chip tr rounded-lg py-2 text-[10px] capitalize">' + k + '</button>';
        }).join('') + '</div>';
    };
    var origOpen = DRAWER.open;
    var titles = { effects: 'Text & Effects' };
    DRAWER.open = function (tab) {
      if (tab === 'effects') {
        STATE.tab = tab;
        document.getElementById('leftDrawer').classList.remove('drawer-collapsed');
        document.getElementById('drawerTitle').textContent = titles.effects;
        document.getElementById('drawer').innerHTML = PANELS.effects();
        document.querySelectorAll('.railBtn').forEach(function (b) {
          b.classList.toggle('on', b.dataset.tab === tab);
        });
        bindEffectsDrawer();
        return;
      }
      return origOpen.call(DRAWER, tab);
    };
    PANELS._effectsPatched = true;
  }

  function bindEffectsDrawer() {
    var d = document.getElementById('drawer');
    d.querySelector('#proFxCurve')?.addEventListener('input', function (e) { curveText(+e.target.value); });
    d.querySelector('[data-fx="curve-0"]')?.addEventListener('click', function () { curveText(0); });
    d.querySelector('[data-fx="curve-up"]')?.addEventListener('click', function () { curveText(160); });
    d.querySelector('[data-fx="curve-dn"]')?.addEventListener('click', function () { curveText(-160); });
    d.querySelector('#proFxGrad')?.addEventListener('click', function () {
      gradientFill(d.querySelector('#proFxG1').value, d.querySelector('#proFxG2').value, +d.querySelector('#proFxGA').value);
    });
    d.querySelectorAll('[data-stroke]').forEach(function (b) {
      b.onclick = function () { applyStroke(b.dataset.stroke); };
    });
  }

  function injectEffectsRail() {
    var nav = document.querySelector('nav.obsidian-rail');
    if (!nav || document.querySelector('[data-tab="effects"]')) return;
    var btn = document.createElement('button');
    btn.className = 'railBtn tr grid h-11 w-11 place-items-center rounded-xl text-[15px]';
    btn.dataset.tab = 'effects';
    btn.setAttribute('aria-label', 'Effects');
    btn.textContent = '✨';
    nav.insertBefore(btn, nav.children[6] || null);
    btn.onclick = function () {
      if (STATE.tab === 'effects' && !document.getElementById('leftDrawer').classList.contains('drawer-collapsed')) {
        document.getElementById('leftDrawer').classList.add('drawer-collapsed');
        btn.classList.remove('on');
        return;
      }
      DRAWER.open('effects');
    };
  }

  /* ── Layer search ── */
  function patchLayers() {
    if (typeof LAYERS === 'undefined' || LAYERS._suitePatched) return;
    var section = document.querySelector('#rightInspector section');
    if (section && !document.getElementById('proLayerSearch')) {
      section.insertAdjacentHTML('afterbegin',
        '<input id="proLayerSearch" type="search" placeholder="Search layers…" autocomplete="off" />');
      document.getElementById('proLayerSearch').addEventListener('input', function () {
        LAYERS.render();
      });
    }
    var orig = LAYERS.render.bind(LAYERS);
    LAYERS.render = function () {
      orig();
      var q = (document.getElementById('proLayerSearch')?.value || '').trim().toLowerCase();
      if (!q) return;
      document.querySelectorAll('#layers .lyr').forEach(function (row) {
        var txt = (row.textContent || '').toLowerCase();
        row.style.display = txt.indexOf(q) >= 0 ? '' : 'none';
      });
    };
    LAYERS._suitePatched = true;
  }

  /* ── Transform extras in inspector ── */
  function patchInspectorTransform() {
    if (typeof INSPECTOR === 'undefined' || INSPECTOR._suitePatched) return;
    var orig = INSPECTOR.render;
    INSPECTOR.render = function () {
      orig.call(INSPECTOR);
      var o = canvas.getActiveObject();
      if (!o || document.getElementById('proTransformExtra')) return;
      var host = document.getElementById('proPosition') || document.getElementById('inspector');
      if (!host) return;
      var extra = document.createElement('section');
      extra.id = 'proTransformExtra';
      extra.className = 'glass-2 space-y-2 rounded-xl p-2.5';
      extra.innerHTML =
        '<p class="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Transform <span class="pro-badge">PRO</span></p>' +
        '<label class="text-[10px] text-slate-500">Rotation °<input id="proRot" class="fld mt-0.5" type="number" value="' + Math.round(o.angle || 0) + '" /></label>' +
        '<div class="grid grid-cols-2 gap-1.5">' +
        '<label class="text-[10px] text-slate-500">Skew X<input id="proSkX" class="fld mt-0.5" type="number" value="' + Math.round(o.skewX || 0) + '" /></label>' +
        '<label class="text-[10px] text-slate-500">Skew Y<input id="proSkY" class="fld mt-0.5" type="number" value="' + Math.round(o.skewY || 0) + '" /></label></div>' +
        '<div class="grid grid-cols-2 gap-1.5">' +
        '<button type="button" id="proFlipX" class="chip tr rounded-lg py-1.5 text-[10px]">Flip H</button>' +
        '<button type="button" id="proFlipY" class="chip tr rounded-lg py-1.5 text-[10px]">Flip V</button></div>' +
        '<label class="text-[10px] text-slate-500">Opacity %<input id="proOpacity" type="range" min="0" max="100" value="' + Math.round((o.opacity ?? 1) * 100) + '" class="w-full" /></label>';
      host.appendChild(extra);
      var push = function () { o.setCoords(); canvas.requestRenderAll(); ENGINE.snapshot(); LAYERS.render(); };
      document.getElementById('proRot').onchange = function (e) { o.rotate(+e.target.value); push(); };
      document.getElementById('proSkX').onchange = function (e) { o.set('skewX', +e.target.value); push(); };
      document.getElementById('proSkY').onchange = function (e) { o.set('skewY', +e.target.value); push(); };
      document.getElementById('proFlipX').onclick = function () { o.set('flipX', !o.flipX); push(); };
      document.getElementById('proFlipY').onclick = function () { o.set('flipY', !o.flipY); push(); };
      document.getElementById('proOpacity').oninput = function (e) { o.set('opacity', +e.target.value / 100); canvas.requestRenderAll(); };
      document.getElementById('proOpacity').onchange = function () { ENGINE.snapshot(); };
    };
    INSPECTOR._suitePatched = true;
  }

  /* ── AI Panel ── */
  function injectAiPanel() {
    if (document.getElementById('proAiPanel')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<aside id="proAiPanel" class="glass flex flex-col p-4" aria-label="AI Assistant">' +
      '<div class="mb-3 flex items-center justify-between">' +
      '<div><p class="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-400">AI Studio</p>' +
      '<h3 class="text-base font-extrabold">Design Assistant</h3></div>' +
      '<button type="button" id="proAiClose" class="tr chip rounded-lg px-2 py-1 text-[12px]">✕</button></div>' +
      '<div class="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">' +
      '<section class="glass-2 rounded-xl p-3 space-y-2">' +
      '<p class="text-[10px] font-bold uppercase text-slate-500">AI Copy</p>' +
      '<input id="proAiTopic" class="fld" placeholder="Topic e.g. Summer sale poster" />' +
      '<button type="button" id="proAiHeadline" class="chip tr w-full rounded-lg py-2 text-[11px] font-semibold">Generate headline</button>' +
      '<button type="button" id="proAiBody" class="chip tr w-full rounded-lg py-2 text-[11px]">Generate body text</button></section>' +
      '<section class="glass-2 rounded-xl p-3 space-y-2">' +
      '<p class="text-[10px] font-bold uppercase text-slate-500">Image tools</p>' +
      '<button type="button" id="proAiBgBtn" class="tr w-full rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 py-2 text-[11px] font-bold text-slate-950">✦ Remove background</button>' +
      '<button type="button" id="proAiEraser" class="chip tr w-full rounded-lg py-2 text-[11px]">🧹 Magic eraser brush</button>' +
      '<label class="text-[10px] text-slate-500">Brush size<input id="proEraserSize" type="range" min="8" max="80" value="24" class="w-full" /></label></section>' +
      '<section class="glass-2 rounded-xl p-3 space-y-2">' +
      '<p class="text-[10px] font-bold uppercase text-slate-500">Quick actions</p>' +
      '<button type="button" id="proAiVibrant" class="chip tr w-full rounded-lg py-2 text-[11px]">Make design more vibrant</button>' +
      '<button type="button" id="proAiCenter" class="chip tr w-full rounded-lg py-2 text-[11px]">Center all objects</button>' +
      '<button type="button" id="proAiShare" class="chip tr w-full rounded-lg py-2 text-[11px]">🔗 Copy share link</button></section>' +
      '<section class="glass-2 rounded-xl p-3">' +
      '<p class="text-[10px] font-bold uppercase text-slate-500 mb-2">Ask AI</p>' +
      '<textarea id="proAiPrompt" class="fld min-h-[70px] text-[11px]" placeholder="e.g. Add a bold headline about coffee shop opening"></textarea>' +
      '<button type="button" id="proAiRun" class="tr mt-2 w-full rounded-lg bg-cyan-400/20 py-2 text-[11px] font-bold text-cyan-200">Run assistant</button>' +
      '<p id="proAiReply" class="mt-2 text-[10px] text-slate-400"></p></section></div></aside>');
    document.getElementById('proAiClose').onclick = closeAiPanel;
    document.getElementById('proAiHeadline').onclick = function () { aiGenerateText('headline'); };
    document.getElementById('proAiBody').onclick = function () { aiGenerateText('body'); };
    document.getElementById('proAiBgBtn').onclick = function () {
      if (window.AuroraPro) AuroraPro.removeBackground();
    };
    document.getElementById('proAiEraser').onclick = toggleEraser;
    document.getElementById('proEraserSize').oninput = function (e) { eraserBrush = +e.target.value; };
    document.getElementById('proAiVibrant').onclick = makeVibrant;
    document.getElementById('proAiCenter').onclick = centerAll;
    document.getElementById('proAiShare').onclick = shareLink;
    document.getElementById('proAiRun').onclick = runAiAssistant;
  }

  function openAiPanel() {
    document.getElementById('proAiPanel')?.classList.add('open');
  }

  function closeAiPanel() {
    document.getElementById('proAiPanel')?.classList.remove('open');
    eraserActive = false;
    canvas.isDrawingMode = false;
    document.getElementById('proAiEraser')?.classList.remove('on');
  }

  function aiGenerateText(kind) {
    var topic = (document.getElementById('proAiTopic')?.value || 'your brand').trim();
    var lines = {
      headline: [
        'Unlock ' + topic + ' Today',
        topic + ' — Designed to Stand Out',
        'The Future of ' + topic + ' Starts Here',
        'Bold. Fresh. ' + topic + '.'
      ],
      body: [
        'Discover premium quality and modern design crafted for ' + topic + '. Limited time offers available now.',
        'Join thousands who trust us for ' + topic + '. Free delivery · 30-day guarantee · 24/7 support.',
        'Elevate your ' + topic + ' experience with stunning visuals and seamless service.'
      ]
    };
    var pool = lines[kind] || lines.headline;
    var text = pool[Math.floor(Math.random() * pool.length)];
    var o = canvas.getActiveObject();
    if (o && isText(o)) {
      o.set('text', text);
      canvas.requestRenderAll();
      ENGINE.snapshot();
      LAYERS.render();
      INSPECTOR.render();
      toast('Text updated');
      return;
    }
    var t = new fabric.Textbox(text, {
      width: Math.min(760, STATE.W * 0.74),
      fontFamily: 'Sora',
      fontSize: kind === 'headline' ? 72 : 32,
      fontWeight: kind === 'headline' ? '800' : '500',
      fill: '#f8fafc',
      textAlign: 'center',
      objectName: kind === 'headline' ? 'AI Headline' : 'AI Body'
    });
    ENGINE.add(t);
    toast('AI text added');
  }

  function runAiAssistant() {
    var prompt = (document.getElementById('proAiPrompt')?.value || '').trim().toLowerCase();
    var reply = document.getElementById('proAiReply');
    if (!prompt) return toast('Enter a prompt');
    if (/headline|title|heading/.test(prompt)) {
      aiGenerateText('headline');
      if (reply) reply.textContent = 'Added a headline based on your prompt.';
    } else if (/body|paragraph|sub/.test(prompt)) {
      aiGenerateText('body');
      if (reply) reply.textContent = 'Added body copy based on your prompt.';
    } else if (/vibrant|color|bright/.test(prompt)) {
      makeVibrant();
      if (reply) reply.textContent = 'Boosted saturation and contrast across objects.';
    } else if (/center|align/.test(prompt)) {
      centerAll();
      if (reply) reply.textContent = 'Centered all objects on the artboard.';
    } else if (/background|remove bg|cutout/.test(prompt)) {
      if (window.AuroraPro) AuroraPro.removeBackground();
      if (reply) reply.textContent = 'Running background removal on selected image…';
    } else if (/resize|instagram|story|youtube/.test(prompt)) {
      openMagicModal();
      if (reply) reply.textContent = 'Opened Magic Resize — pick a format.';
    } else {
      aiGenerateText('headline');
      if (reply) reply.textContent = 'Created headline text. Try: "add body text", "make vibrant", "remove background".';
    }
  }

  function makeVibrant() {
    canvas.getObjects().forEach(function (o) {
      if (o.objectName === '__guide') return;
      if (o.type === 'image') {
        var f = fabric.Image.filters;
        o.filters = [new f.Saturation({ saturation: 0.35 }), new f.Contrast({ contrast: 0.15 })];
        o.applyFilters();
      } else if (o.fill && typeof o.fill === 'string' && o.fill.indexOf('#') === 0) {
        o.set('opacity', Math.min(1, (o.opacity || 1) + 0.05));
      }
    });
    canvas.requestRenderAll();
    ENGINE.snapshot();
    toast('Design boosted');
  }

  function centerAll() {
    canvas.getObjects().forEach(function (o) {
      if (o.objectName === '__guide' || o.locked) return;
      o.set({ originX: 'center', originY: 'center', left: STATE.W / 2, top: STATE.H / 2 });
      o.setCoords();
    });
    canvas.requestRenderAll();
    ENGINE.snapshot();
    toast('Objects centered');
  }

  function shareLink() {
    try {
      var data = window.AuroraPro ? AuroraPro.projectJSON() : { w: STATE.W, h: STATE.H };
      var enc = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      var url = location.origin + location.pathname + '#view=' + enc;
      if (url.length > 60000) return toast('Design too large for link — save to library instead');
      navigator.clipboard?.writeText(url).then(function () { toast('Share link copied'); }, function () { prompt('Copy link', url); });
    } catch (e) { toast('Could not build share link'); }
  }

  function readOnlyBoot() {
    var m = location.hash.match(/#view=(.+)$/);
    if (!m) return;
    try {
      var data = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
      location.hash = '';
      setTimeout(function () {
        if (window.AuroraProSuite) AuroraProSuite.openShared(data);
      }, 600);
    } catch (e) { toast('Shared link unreadable'); }
  }

  /* Magic eraser — brush erase on images */
  function toggleEraser() {
    eraserActive = !eraserActive;
    var btn = document.getElementById('proAiEraser');
    if (btn) btn.classList.toggle('on', eraserActive);
    if (eraserActive) {
      canvas.isDrawingMode = false;
      canvas.defaultCursor = 'crosshair';
      toast('Eraser on — click & drag on image');
    } else {
      canvas.defaultCursor = 'default';
      toast('Eraser off');
    }
  }

  function bindEraser() {
    var erasing = false;
    canvas.on('mouse:down', function (opt) {
      if (!eraserActive) return;
      var o = canvas.getActiveObject();
      if (!o || o.type !== 'image') { toast('Select an image first'); return; }
      erasing = true;
      eraseAt(opt, o);
    });
    canvas.on('mouse:move', function (opt) {
      if (!eraserActive || !erasing) return;
      var o = canvas.getActiveObject();
      if (o && o.type === 'image') eraseAt(opt, o);
    });
    canvas.on('mouse:up', function () {
      if (erasing) { erasing = false; ENGINE.snapshot(); }
    });
  }

  function eraseAt(opt, o) {
    try {
      var el = o._element;
      var w = el.naturalWidth || el.width;
      var h = el.naturalHeight || el.height;
      var cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
      var ctx = cv.getContext('2d');
      ctx.drawImage(el, 0, 0);
      var ptr = canvas.getPointer(opt.e);
      var lx = (ptr.x - (o.left || 0)) / (o.scaleX || 1) + (o.originX === 'center' ? w / 2 : 0);
      var ly = (ptr.y - (o.top || 0)) / (o.scaleY || 1) + (o.originY === 'center' ? h / 2 : 0);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(lx, ly, eraserBrush, 0, Math.PI * 2);
      ctx.fill();
      fabric.Image.fromURL(cv.toDataURL('image/png'), function (img) {
        img.set({
          left: o.left, top: o.top, angle: o.angle, scaleX: o.scaleX, scaleY: o.scaleY,
          originX: o.originX, originY: o.originY, objectName: o.objectName
        });
        canvas.remove(o);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
      });
    } catch (e) { /* cross-origin */ }
  }

  /* ── Auto-layout frame ── */
  function createAutoLayoutFrame(dir) {
    var gap = 16;
    var pad = 24;
    var sel = canvas.getActiveObjects ? canvas.getActiveObjects() : [];
    if (!sel.length && canvas.getActiveObject()) sel = [canvas.getActiveObject()];
    if (!sel.length) return toast('Select objects for auto-layout frame');
    var minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
    sel.forEach(function (o) {
      var b = o.getBoundingRect(true, true);
      minL = Math.min(minL, b.left);
      minT = Math.min(minT, b.top);
      maxR = Math.max(maxR, b.left + b.width);
      maxB = Math.max(maxB, b.top + b.height);
    });
    var frame = new fabric.Rect({
      left: minL - pad,
      top: minT - pad,
      width: maxR - minL + pad * 2,
      height: maxB - minT + pad * 2,
      fill: 'rgba(34,211,238,.06)',
      stroke: 'rgba(34,211,238,.35)',
      strokeWidth: 2,
      rx: 12,
      ry: 12,
      objectName: 'Auto-layout frame',
      autoLayout: { direction: dir || 'v', gap: gap, padding: pad }
    });
    canvas.add(frame);
    frame.sendToBack();
    reflowAutoLayout(frame);
    canvas.setActiveObject(frame);
    canvas.requestRenderAll();
    ENGINE.snapshot();
    LAYERS.render();
    toast('Auto-layout frame created');
  }

  function reflowAutoLayout(frame) {
    if (!frame || !frame.autoLayout) return;
    var al = frame.autoLayout;
    var children = canvas.getObjects().filter(function (o) {
      if (o === frame || o.objectName === '__guide') return false;
      var b = o.getBoundingRect(true, true);
      var f = frame.getBoundingRect(true, true);
      return b.left >= f.left && b.top >= f.top && b.left + b.width <= f.left + f.width && b.top + b.height <= f.top + f.height;
    });
    if (!children.length) return;
    var x = frame.left + al.padding;
    var y = frame.top + al.padding;
    children.forEach(function (o) {
      if (al.direction === 'v') {
        o.set({ left: x, top: y, originX: 'left', originY: 'top' });
        o.setCoords();
        y += o.getBoundingRect(true, true).height + al.gap;
      } else {
        o.set({ left: x, top: y, originX: 'left', originY: 'top' });
        o.setCoords();
        x += o.getBoundingRect(true, true).width + al.gap;
      }
    });
    canvas.requestRenderAll();
  }

  /* ── Constraints ── */
  function applyConstraintsOnResize(sx, sy) {
    canvas.getObjects().forEach(function (o) {
      if (!o.constraints || o.objectName === '__guide') return;
      var c = o.constraints;
      if (c.right) o.set('left', (o.left || 0) * sx);
      if (c.bottom) o.set('top', (o.top || 0) * sy);
      if (c.hCenter) o.set('left', STATE.W / 2);
      if (c.vCenter) o.set('top', STATE.H / 2);
      o.setCoords();
    });
  }

  function setConstraints(preset) {
    var o = canvas.getActiveObject();
    if (!o) return toast('Select an object');
    var map = {
      center: { hCenter: true, vCenter: true },
      'pin-tl': { left: true, top: true },
      'pin-tr': { right: true, top: true },
      scale: { scale: true }
    };
    o.constraints = map[preset] || {};
    ENGINE.snapshot();
    toast('Constraints: ' + preset);
  }

  function injectConstraintsUI() {
    if (document.getElementById('proConstraints')) return;
    var align = document.getElementById('alignGrid');
    if (!align) return;
    var box = document.createElement('div');
    box.id = 'proConstraints';
    box.className = 'mt-2 space-y-1';
    box.innerHTML =
      '<p class="text-[9px] font-bold uppercase tracking-[.15em] text-slate-500">Constraints</p>' +
      '<div class="grid grid-cols-3 gap-1">' +
      '<button type="button" data-con="center" class="chip tr rounded py-1 text-[9px]">Center</button>' +
      '<button type="button" data-con="pin-tl" class="chip tr rounded py-1 text-[9px]">Pin TL</button>' +
      '<button type="button" data-con="pin-tr" class="chip tr rounded py-1 text-[9px]">Pin TR</button></div>' +
      '<div class="grid grid-cols-2 gap-1 mt-1">' +
      '<button type="button" data-autolayout="v" class="chip tr rounded py-1 text-[9px]">⊞ Frame ↓</button>' +
      '<button type="button" data-autolayout="h" class="chip tr rounded py-1 text-[9px]">⊞ Frame →</button></div>';
    align.parentElement.appendChild(box);
    box.querySelectorAll('[data-con]').forEach(function (b) {
      b.onclick = function () { setConstraints(b.dataset.con); };
    });
    box.querySelectorAll('[data-autolayout]').forEach(function (b) {
      b.onclick = function () { createAutoLayoutFrame(b.dataset.autolayout); };
    });
  }

  /* ── Breakpoint preview ── */
  function injectBreakpointBar() {
    if (document.getElementById('proBreakpointBar')) return;
    var pageBar = document.getElementById('proPageBar');
    var anchor = pageBar || document.querySelector('header.glass');
    if (!anchor) return;
    var bar = document.createElement('div');
    bar.id = 'proBreakpointBar';
    bar.className = 'glass';
    bar.innerHTML =
      '<span class="text-[9px] font-bold uppercase tracking-[.2em] text-slate-500 shrink-0">Preview</span>' +
      [['Full', 0], ['Mobile', 375], ['Tablet', 768], ['Desktop', 1440]].map(function (p) {
        return '<button type="button" data-bp="' + p[1] + '" class="tr chip rounded-lg px-2 py-1 text-[10px]">' + p[0] + '</button>';
      }).join('');
    anchor.insertAdjacentElement('afterend', bar);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-bp]');
      if (!b) return;
      bar.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      var w = +b.dataset.bp;
      var shell = document.getElementById('stagePad');
      if (!shell) return;
      if (!w) {
        shell.style.maxWidth = '';
        shell.style.margin = '';
        ENGINE.fit();
        toast('Full preview');
        return;
      }
      shell.style.maxWidth = w + 'px';
      shell.style.margin = '0 auto';
      ENGINE.fit();
      toast('Preview ' + w + 'px wide');
    });
  }

  /* ── Header buttons ── */
  function injectHeaderExtras() {
    var anchor = document.querySelector('header.glass .ml-auto');
    if (!anchor || document.getElementById('btnMagicResize')) return;
    var wrap = anchor.querySelector('.flex.items-center.gap-1.5');
    if (!wrap) return;
    var magic = document.createElement('button');
    magic.id = 'btnMagicResize';
    magic.type = 'button';
    magic.className = 'tr chip rounded-lg px-2 py-1.5 text-[11px] font-semibold obsidian-hide-mobile';
    magic.textContent = '⤢ Resize';
    magic.title = 'Magic Resize';
    var ai = document.createElement('button');
    ai.id = 'btnAiPanel';
    ai.type = 'button';
    ai.className = 'tr chip rounded-lg px-2 py-1.5 text-[11px] font-semibold';
    ai.textContent = '✦ AI';
    wrap.insertBefore(magic, wrap.firstChild);
    wrap.insertBefore(ai, magic.nextSibling);
    magic.onclick = openMagicModal;
    ai.onclick = openAiPanel;
  }

  function injectSnapBadge() {
    if (document.getElementById('proSnapBadge')) return;
    var b = document.createElement('div');
    b.id = 'proSnapBadge';
    b.className = 'glass-2 text-cyan-300';
    document.body.appendChild(b);
  }

  function registerCommands() {
    if (!window.AuroraToolHub) return;
    AuroraToolHub.register([
      { id: 'suite-magic', label: 'Magic Resize', icon: '⤢', group: 'Pro', quick: true, run: openMagicModal },
      { id: 'suite-ai', label: 'AI Design Assistant', icon: '✦', group: 'AI', quick: true, run: openAiPanel },
      { id: 'suite-effects', label: 'Text & Effects', icon: '✨', group: 'Pro', run: function () { DRAWER.open('effects'); } },
      { id: 'suite-share', label: 'Copy share link', icon: '🔗', group: 'Pro', run: shareLink },
      { id: 'suite-eraser', label: 'Magic eraser brush', icon: '🧹', group: 'AI', run: function () { openAiPanel(); toggleEraser(); } },
      { id: 'suite-frame-v', label: 'Auto-layout frame vertical', icon: '⊞', group: 'Layout', run: function () { createAutoLayoutFrame('v'); } },
      { id: 'suite-frame-h', label: 'Auto-layout frame horizontal', icon: '⊞', group: 'Layout', run: function () { createAutoLayoutFrame('h'); } }
    ]);
    AuroraToolHub.registerShortcuts([
      { label: 'Toggle snap', keys: 'S' },
      { label: 'Toggle grid', keys: 'G' },
      { label: 'Hold Alt while drag', keys: 'Alt = no snap' }
    ]);
  }

  function init() {
    injectGapOverlay();
    injectSnapBadge();
    injectMagicModal();
    injectContextMenu();
    injectAiPanel();
    patchGuides();
    patchEffectsDrawer();
    patchLayers();
    patchInspectorTransform();
    injectEffectsRail();
    injectConstraintsUI();
    injectBreakpointBar();
    injectHeaderExtras();
    bindContextMenu();
    bindSnapShortcuts();
    bindEraser();
    registerCommands();
    setTimeout(readOnlyBoot, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 50);
  }

  window.AuroraProSuite = {
    magicResize: magicResize,
    openAiPanel: openAiPanel,
    shareLink: shareLink,
    curveText: curveText,
    createAutoLayoutFrame: createAutoLayoutFrame,
    openShared: function (data) {
      if (!data) return;
      localStorage.setItem('aurora-pro-draft', JSON.stringify(data));
      if (window.AuroraPro && AuroraPro.loadProjectData) AuroraPro.loadProjectData(data);
      else if (window.AuroraPro) AuroraPro.loadProject();
      toast('Shared design loaded');
    }
  };
})();
