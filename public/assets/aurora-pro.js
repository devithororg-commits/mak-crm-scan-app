/* Aurora Pro — full advanced suite for Obsidian Pro workspace */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app')) return;

  var BLENDS = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion'];
  var SNAP_PROPS = ['objectName', 'locked', 'blendMode', 'name'];
  var LS_BRAND = 'aurora-pro-brand';
  var LS_COMPONENTS = 'aurora-pro-components';
  var LS_DESIGNS = 'aurora-pro-designs.v1';
  var LS_DRAFT = 'aurora-pro-draft-pages';

  var eyeActive = false;
  var penActive = false;
  var gridMode = 'off';
  var viewRulers = false;
  var viewBleed = false;
  var collabChannel = null;

  var PRO = {
    pages: [],
    pageIdx: 0,
    pgSeq: 1,
    pageLock: false,
    brand: { colors: [], fonts: [], logos: [] },
    components: []
  };

  function loadBrand() {
    try { PRO.brand = JSON.parse(localStorage.getItem(LS_BRAND) || '{"colors":[],"fonts":[],"logos":[]}'); } catch (e) { PRO.brand = { colors: [], fonts: [], logos: [] }; }
  }
  function saveBrand() { localStorage.setItem(LS_BRAND, JSON.stringify(PRO.brand)); }
  function loadComponents() {
    try { PRO.components = JSON.parse(localStorage.getItem(LS_COMPONENTS) || '[]'); } catch (e) { PRO.components = []; }
  }
  function saveComponents() { localStorage.setItem(LS_COMPONENTS, JSON.stringify(PRO.components)); }

  function applyBlendModes() {
    if (typeof canvas === 'undefined') return;
    canvas.getObjects().forEach(function (o) {
      o.globalCompositeOperation = (!o.blendMode || o.blendMode === 'normal') ? 'source-over' : o.blendMode;
    });
  }

  function distribute(axis) {
    var sel = canvas.getActiveObjects ? canvas.getActiveObjects() : [];
    if (!sel.length && canvas.getActiveObject()) sel = [canvas.getActiveObject()];
    if (sel.length < 3) { toast('Select 3+ objects to distribute'); return; }
    var sorted = sel.slice().sort(function (a, b) {
      return axis === 'x' ? (a.left - b.left) : (a.top - b.top);
    });
    var first = sorted[0], last = sorted[sorted.length - 1];
    var span = axis === 'x' ? (last.left - first.left) : (last.top - first.top);
    var gap = span / (sorted.length - 1);
    sorted.forEach(function (o, i) {
      if (axis === 'x') o.set('left', first.left + gap * i);
      else o.set('top', first.top + gap * i);
      o.setCoords();
    });
    canvas.requestRenderAll();
    ENGINE.snapshot();
    LAYERS.render();
    toast('Distributed ' + sorted.length + ' objects');
  }

  function autoLayoutStack(axis) {
    var sel = canvas.getActiveObjects ? canvas.getActiveObjects() : [];
    if (!sel.length && canvas.getActiveObject()) sel = [canvas.getActiveObject()];
    if (!sel.length) {
      sel = canvas.getObjects().filter(function (o) { return o.selectable !== false; });
    }
    if (!sel.length) return toast('Nothing to arrange');
    var gap = 16;
    var sorted = sel.slice().sort(function (a, b) {
      return axis === 'v' ? (a.top - b.top) : (a.left - b.left);
    });
    if (axis === 'v') {
      var y = sorted[0].top;
      sorted.forEach(function (o) {
        o.set({ originX: 'left', originY: 'top', left: sorted[0].left, top: y });
        o.setCoords();
        y += o.getBoundingRect(true, true).height + gap;
      });
    } else {
      var x = sorted[0].left;
      sorted.forEach(function (o) {
        o.set({ originX: 'left', originY: 'top', left: x, top: sorted[0].top });
        o.setCoords();
        x += o.getBoundingRect(true, true).width + gap;
      });
    }
    canvas.requestRenderAll();
    ENGINE.snapshot();
    LAYERS.render();
    toast('Auto-layout ' + (axis === 'v' ? 'vertical' : 'horizontal'));
  }

  function groupSel() {
    var active = canvas.getActiveObject();
    if (!active || active.type !== 'activeSelection') { toast('Select multiple objects first'); return; }
    active.toGroup(function (g) {
      g.objectName = 'Group';
      canvas.add(g);
      canvas.setActiveObject(g);
      canvas.requestRenderAll();
      ENGINE.snapshot();
      LAYERS.render();
      toast('Grouped');
    });
  }

  function ungroupSel() {
    var o = canvas.getActiveObject();
    if (!o || o.type !== 'group') { toast('Select a group'); return; }
    o.toActiveSelection();
    canvas.requestRenderAll();
    ENGINE.snapshot();
    LAYERS.render();
    toast('Ungrouped');
  }

  /* ── Multi-page artboards ── */
  function blankPage() {
    return {
      id: 'p' + (PRO.pgSeq++),
      name: 'Page ' + PRO.pgSeq,
      w: STATE.W,
      h: STATE.H,
      json: { version: '5.3.0', objects: [], background: STATE.bg || '#0b1220' }
    };
  }

  function commitPage() {
    if (PRO.pageLock || !PRO.pages.length) return;
    var p = PRO.pages[PRO.pageIdx];
    if (!p) return;
    p.json = canvas.toJSON(SNAP_PROPS);
    p.w = STATE.W;
    p.h = STATE.H;
  }

  function loadPage(i) {
    if (i < 0 || i >= PRO.pages.length) return;
    commitPage();
    PRO.pageIdx = i;
    var p = PRO.pages[i];
    PRO.pageLock = true;
    ENGINE.resize(p.w, p.h);
    canvas.loadFromJSON(p.json, function () {
      PRO.pageLock = false;
      canvas.requestRenderAll();
      adoptNames();
      applyBlendModes();
      ENGINE.snapshot();
      LAYERS.render();
      INSPECTOR.render();
      renderPageStrip();
      paintGrid();
      drawRulers();
      updateBleedOverlay();
      toast('Page ' + (i + 1));
    });
  }

  function renderPageStrip() {
    var strip = document.getElementById('proPageStrip');
    if (!strip) return;
    strip.innerHTML = PRO.pages.map(function (p, i) {
      return '<button type="button" data-pg="' + i + '" class="tr shrink-0 rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-semibold ' + (i === PRO.pageIdx ? 'on' : 'text-slate-300 hover:border-cyan-400/50') + '">' + (i + 1) + '</button>';
    }).join('');
  }

  function initPages() {
    if (PRO.pages.length) return;
    PRO.pages.push({
      id: 'p1',
      name: 'Page 1',
      w: STATE.W,
      h: STATE.H,
      json: canvas.toJSON(SNAP_PROPS)
    });
    renderPageStrip();
  }

  function addPage() {
    commitPage();
    PRO.pages.push(blankPage());
    loadPage(PRO.pages.length - 1);
    toast('Artboard added');
  }

  function dupPage() {
    commitPage();
    var c = JSON.parse(JSON.stringify(PRO.pages[PRO.pageIdx]));
    c.id = 'p' + (PRO.pgSeq++);
    PRO.pages.splice(PRO.pageIdx + 1, 0, c);
    loadPage(PRO.pageIdx + 1);
    toast('Artboard duplicated');
  }

  function delPage() {
    if (PRO.pages.length < 2) return toast('At least one artboard required');
    PRO.pages.splice(PRO.pageIdx, 1);
    loadPage(Math.max(0, PRO.pageIdx - 1));
    toast('Artboard removed');
  }

  function projectJSON() {
    commitPage();
    return {
      v: 2,
      pages: PRO.pages,
      pageIdx: PRO.pageIdx,
      w: STATE.W,
      h: STATE.H,
      brand: PRO.brand,
      updated: Date.now()
    };
  }

  function openProjectData(data) {
    if (!data) return;
    PRO.pages = (data.pages && data.pages.length) ? data.pages : [blankPage()];
    PRO.pageIdx = Math.min(data.pageIdx || 0, PRO.pages.length - 1);
    if (data.brand) { PRO.brand = data.brand; saveBrand(); }
    loadPage(PRO.pageIdx);
    closeDesignsModal();
    toast('Design loaded');
  }

  /* ── View: rulers, grid, bleed ── */
  function injectViewOverlays() {
    var shell = document.getElementById('boardShell');
    if (!shell || document.getElementById('proGridOverlay')) return;
    shell.insertAdjacentHTML('afterbegin',
      '<div id="proRulerTop" class="hidden"></div>' +
      '<div id="proRulerLeft" class="hidden"></div>' +
      '<div id="proGridOverlay" class="hidden"></div>' +
      '<div id="proBleedOverlay" class="hidden"></div>');
  }

  function paintGrid() {
    var g = document.getElementById('proGridOverlay');
    if (!g) return;
    g.classList.toggle('hidden', gridMode === 'off');
    if (gridMode === 'off') return;
    var z = STATE.zoom || 1;
    var s = Math.max(8, 50 * z);
    g.style.backgroundImage = gridMode === 'grid'
      ? 'linear-gradient(to right, rgba(34,211,238,.12) 1px, transparent 1px),linear-gradient(to bottom, rgba(34,211,238,.12) 1px, transparent 1px)'
      : 'repeating-linear-gradient(30deg, rgba(251,146,60,.18) 0 1px, transparent 1px ' + s + 'px),repeating-linear-gradient(150deg, rgba(251,146,60,.18) 0 1px, transparent 1px ' + s + 'px)';
    g.style.backgroundSize = gridMode === 'grid' ? (s + 'px ' + s + 'px') : 'auto';
  }

  function drawRulers() {
    var rt = document.getElementById('proRulerTop');
    var rl = document.getElementById('proRulerLeft');
    if (!rt || !rl || rt.classList.contains('hidden')) return;
    var shell = document.getElementById('boardShell');
    var wrap = shell ? shell.getBoundingClientRect() : null;
    var stage = document.getElementById('stageWrap');
    if (!wrap || !stage) return;
    var main = stage.getBoundingClientRect();
    var z = STATE.zoom || 1;
    var step = Math.max(25, Math.round(100 / Math.max(z, 0.05) / 25) * 25);
    var h = '', v = '';
    for (var x = 0; x <= STATE.W; x += step) {
      var L = wrap.left - main.left + x * z;
      if (L >= 0 && L <= main.width) h += '<div style="position:absolute;left:' + L + 'px;top:0;height:100%;border-left:1px solid rgba(148,163,184,.25);padding-left:2px">' + x + '</div>';
    }
    for (var y = 0; y <= STATE.H; y += step) {
      var T = wrap.top - main.top + y * z;
      if (T >= 0 && T <= main.height) v += '<div style="position:absolute;top:' + T + 'px;left:0;width:100%;border-top:1px solid rgba(148,163,184,.25);padding-left:2px">' + y + '</div>';
    }
    rt.innerHTML = h;
    rl.innerHTML = v;
  }

  function updateBleedOverlay() {
    var el = document.getElementById('proBleedOverlay');
    if (!el || el.classList.contains('hidden')) return;
    var bl = Math.max(0, +(document.getElementById('expBleed')?.value || 36)) * (STATE.zoom || 1);
    el.style.inset = bl + 'px';
  }

  function toggleView(btnId, onFn) {
    var b = document.getElementById(btnId);
    if (!b) return;
    b.onclick = function () {
      b.classList.toggle('on');
      onFn(b.classList.contains('on'));
    };
  }

  function injectViewTools() {
    if (document.getElementById('proViewTools')) return;
    var anchor = document.querySelector('header.glass label[for], header.glass #snapToggle')?.parentElement;
    if (!anchor) anchor = document.getElementById('snapToggle')?.parentElement;
    if (!anchor) return;
    var wrap = document.createElement('div');
    wrap.id = 'proViewTools';
    wrap.className = 'pro-view-tools obsidian-hide-mobile';
    wrap.innerHTML =
      '<button type="button" id="proVRuler" class="pro-view-btn tr chip rounded-lg" title="Rulers">R</button>' +
      '<button type="button" id="proVGrid" class="pro-view-btn tr chip rounded-lg" title="Grid">#</button>' +
      '<button type="button" id="proVIso" class="pro-view-btn tr chip rounded-lg" title="Isometric">◇</button>' +
      '<button type="button" id="proVBleed" class="pro-view-btn tr chip rounded-lg" title="Bleed safe zone">⊡</button>';
    anchor.parentElement.insertBefore(wrap, anchor.nextSibling);
    toggleView('proVRuler', function (on) {
      viewRulers = on;
      document.getElementById('proRulerTop')?.classList.toggle('hidden', !on);
      document.getElementById('proRulerLeft')?.classList.toggle('hidden', !on);
      drawRulers();
    });
    toggleView('proVGrid', function (on) {
      if (on) { document.getElementById('proVIso')?.classList.remove('on'); gridMode = 'grid'; }
      else gridMode = document.getElementById('proVIso')?.classList.contains('on') ? 'iso' : 'off';
      paintGrid();
    });
    toggleView('proVIso', function (on) {
      if (on) { document.getElementById('proVGrid')?.classList.remove('on'); gridMode = 'iso'; }
      else gridMode = document.getElementById('proVGrid')?.classList.contains('on') ? 'grid' : 'off';
      paintGrid();
    });
    toggleView('proVBleed', function (on) {
      viewBleed = on;
      document.getElementById('proBleedOverlay')?.classList.toggle('hidden', !on);
      updateBleedOverlay();
    });
    document.getElementById('stageWrap')?.addEventListener('scroll', drawRulers);
  }

  function injectPageBar() {
    if (document.getElementById('proPageBar')) return;
    var shell = document.querySelector('.obsidian-shell');
    var header = document.querySelector('header.glass');
    if (!shell || !header) return;
    var bar = document.createElement('div');
    bar.id = 'proPageBar';
    bar.className = 'glass';
    bar.innerHTML =
      '<span class="text-[9px] font-bold uppercase tracking-[.2em] text-slate-500 shrink-0">Pages</span>' +
      '<div id="proPageStrip"></div>' +
      '<button type="button" id="proPgAdd" class="tr chip rounded-lg px-2 py-1 text-[10px] font-semibold" title="Add page">+</button>' +
      '<button type="button" id="proPgDup" class="tr chip rounded-lg px-2 py-1 text-[10px]" title="Duplicate page">⧉</button>' +
      '<button type="button" id="proPgDel" class="tr chip rounded-lg px-2 py-1 text-[10px] text-rose-300" title="Delete page">×</button>';
    header.insertAdjacentElement('afterend', bar);
    document.getElementById('proPgAdd').onclick = addPage;
    document.getElementById('proPgDup').onclick = dupPage;
    document.getElementById('proPgDel').onclick = function () {
      if (window.AuroraControls && AuroraControls.doubleConfirm) {
        AuroraControls.doubleConfirm(document.getElementById('proPgDel'), delPage, { warn: 'Delete this page?' });
      } else if (confirm('Delete this page?')) delPage();
    };
    document.getElementById('proPageStrip').addEventListener('click', function (e) {
      var b = e.target.closest('[data-pg]');
      if (!b) return;
      loadPage(+b.dataset.pg);
    });
  }

  function patchEngineZoom() {
    if (!ENGINE || ENGINE._proPatched) return;
    var origZoom = ENGINE.applyZoom.bind(ENGINE);
    ENGINE.applyZoom = function (z) {
      origZoom(z);
      paintGrid();
      drawRulers();
      updateBleedOverlay();
    };
    var origFit = ENGINE.fit.bind(ENGINE);
    ENGINE.fit = function () {
      origFit();
      paintGrid();
      drawRulers();
    };
    ENGINE._proPatched = true;
  }

  /* ── Brand kit & components panels ── */
  function patchDrawer() {
    if (typeof PANELS === 'undefined' || PANELS._proPatched) return;

    PANELS.brandkit = function () {
      var c = PRO.brand.colors.map(function (col, i) {
        return '<button type="button" class="pro-brand-swatch" data-bc="' + i + '" style="background:' + col + '" title="' + col + '"></button>';
      }).join('') || '<p class="text-[11px] text-slate-500">No brand colors yet.</p>';
      var f = PRO.brand.fonts.map(function (font, i) {
        return '<button type="button" class="chip tr w-full rounded-xl px-3 py-2 text-left text-[14px]" style="font-family:\'' + font + '\'" data-bf="' + i + '">' + font + '</button>';
      }).join('') || '<p class="text-[11px] text-slate-500">No brand fonts yet.</p>';
      var logos = PRO.brand.logos.map(function (url, i) {
        return '<button type="button" class="chip tr overflow-hidden rounded-xl p-1" data-bl="' + i + '"><img src="' + url + '" class="h-14 w-full object-contain" alt="logo" /></button>';
      }).join('') || '<p class="text-[11px] text-slate-500 col-span-3">No logos uploaded.</p>';
      return '<p class="mb-2 text-[11px] text-slate-400">Save your brand colours, fonts and logos for one-click reuse.</p>' +
        '<p class="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Brand colours</p>' +
        '<div class="pro-brand-strip">' + c + '</div>' +
        '<div class="mt-2 flex gap-2"><input id="proBrandColor" type="color" value="#22d3ee" class="h-9 w-12 rounded-lg border border-white/10 bg-transparent" />' +
        '<button type="button" id="proBrandAddColor" class="chip tr flex-1 rounded-lg py-2 text-[11px]">+ Add colour</button></div>' +
        '<p class="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Brand fonts</p>' +
        '<div class="mt-1 space-y-1">' + f + '</div>' +
        '<button type="button" id="proBrandAddFont" class="chip tr mt-2 w-full rounded-lg py-2 text-[11px]">+ Save active text font</button>' +
        '<p class="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Logos</p>' +
        '<div class="mt-1 grid grid-cols-3 gap-2">' + logos + '</div>' +
        '<button type="button" id="proBrandAddLogo" class="chip tr mt-2 w-full rounded-lg py-2 text-[11px]">+ Upload logo</button>';
    };

    PANELS.components = function () {
      if (!PRO.components.length) {
        return '<p class="text-[11px] text-slate-400">Select objects on canvas, then save as a reusable component.</p>' +
          '<button type="button" id="proCompSave" class="chip tr mt-3 w-full rounded-xl py-3 text-[12px] font-semibold">Save selection as component</button>';
      }
      return '<button type="button" id="proCompSave" class="chip tr mb-3 w-full rounded-xl py-2.5 text-[11px] font-semibold">+ Save selection as component</button>' +
        '<div class="space-y-2">' + PRO.components.map(function (c, i) {
          return '<div class="chip flex items-center justify-between gap-2 rounded-xl px-3 py-2">' +
            '<button type="button" class="tr flex-1 text-left text-[11px] font-semibold text-slate-200" data-comp-place="' + i + '">' + c.name + '</button>' +
            '<button type="button" class="tr text-[10px] text-rose-300" data-comp-del="' + i + '">×</button></div>';
        }).join('') + '</div>';
    };

    var origOpen = DRAWER.open;
    DRAWER.open = function (tab) {
      var titles = { templates: 'Templates', text: 'Text', shapes: 'Shapes', icons: 'Icons', uploads: 'Uploads', palette: 'Colours', canvas: 'Artboard', brandkit: 'Brand Kit', components: 'Components' };
      if (tab === 'brandkit' || tab === 'components') {
        STATE.tab = tab;
        document.getElementById('leftDrawer').classList.remove('drawer-collapsed');
        document.getElementById('drawerTitle').textContent = titles[tab];
        document.getElementById('drawer').innerHTML = PANELS[tab]();
        document.querySelectorAll('.railBtn').forEach(function (b) {
          b.classList.toggle('on', b.dataset.tab === tab);
          b.setAttribute('aria-pressed', b.dataset.tab === tab ? 'true' : 'false');
        });
        bindProDrawer(tab);
        return;
      }
      return origOpen.call(DRAWER, tab);
    };
    PANELS._proPatched = true;
  }

  function bindProDrawer(tab) {
    var d = document.getElementById('drawer');
    if (tab === 'brandkit') {
      d.querySelector('#proBrandAddColor')?.addEventListener('click', function () {
        var col = document.getElementById('proBrandColor').value;
        if (PRO.brand.colors.indexOf(col) < 0) PRO.brand.colors.push(col);
        saveBrand();
        DRAWER.open('brandkit');
        toast('Brand colour saved');
      });
      d.querySelectorAll('[data-bc]').forEach(function (b) {
        b.onclick = function () {
          var col = PRO.brand.colors[+b.dataset.bc];
          var o = canvas.getActiveObject();
          if (o) {
            if (o.type === 'textbox' || o.type === 'i-text') o.set('fill', col);
            else o.set('fill', col);
            canvas.requestRenderAll();
            ENGINE.snapshot();
            INSPECTOR.render();
          }
          toast('Applied ' + col);
        };
      });
      d.querySelector('#proBrandAddFont')?.addEventListener('click', function () {
        var o = canvas.getActiveObject();
        if (!o || (o.type !== 'textbox' && o.type !== 'i-text')) return toast('Select a text object');
        var f = o.fontFamily;
        if (PRO.brand.fonts.indexOf(f) < 0) PRO.brand.fonts.push(f);
        saveBrand();
        DRAWER.open('brandkit');
        toast('Font saved to brand kit');
      });
      d.querySelectorAll('[data-bf]').forEach(function (b) {
        b.onclick = function () {
          var f = PRO.brand.fonts[+b.dataset.bf];
          var o = canvas.getActiveObject();
          if (o && (o.type === 'textbox' || o.type === 'i-text')) {
            o.set('fontFamily', f);
            canvas.requestRenderAll();
            ENGINE.snapshot();
            INSPECTOR.render();
            toast('Font applied');
          }
        };
      });
      d.querySelector('#proBrandAddLogo')?.addEventListener('click', function () {
        var inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*';
        inp.onchange = function () {
          var file = inp.files[0];
          if (!file) return;
          var r = new FileReader();
          r.onload = function () {
            PRO.brand.logos.push(r.result);
            saveBrand();
            DRAWER.open('brandkit');
            toast('Logo added');
          };
          r.readAsDataURL(file);
        };
        inp.click();
      });
      d.querySelectorAll('[data-bl]').forEach(function (b) {
        b.onclick = function () {
          var url = PRO.brand.logos[+b.dataset.bl];
          fabric.Image.fromURL(url, function (img) {
            img.set({ left: STATE.W / 2, top: STATE.H / 2, originX: 'center', originY: 'center', objectName: 'Brand logo' });
            ENGINE.add(img);
            toast('Logo placed');
          });
        };
      });
    }
    if (tab === 'components') {
      d.querySelector('#proCompSave')?.addEventListener('click', saveComponent);
      d.querySelectorAll('[data-comp-place]').forEach(function (b) {
        b.onclick = function () { placeComponent(+b.dataset.compPlace); };
      });
      d.querySelectorAll('[data-comp-del]').forEach(function (b) {
        b.onclick = function () {
          PRO.components.splice(+b.dataset.compDel, 1);
          saveComponents();
          DRAWER.open('components');
          toast('Component deleted');
        };
      });
    }
  }

  function injectRailButtons() {
    var nav = document.querySelector('nav.obsidian-rail');
    if (!nav || document.querySelector('[data-tab="brandkit"]')) return;
    var brand = document.createElement('button');
    brand.className = 'railBtn tr grid h-11 w-11 place-items-center rounded-xl text-[13px] font-bold';
    brand.dataset.tab = 'brandkit';
    brand.setAttribute('aria-label', 'Brand Kit');
    brand.textContent = 'B';
    var comp = document.createElement('button');
    comp.className = 'railBtn tr grid h-11 w-11 place-items-center rounded-xl text-[15px]';
    comp.dataset.tab = 'components';
    comp.setAttribute('aria-label', 'Components');
    comp.textContent = '⊞';
    nav.appendChild(brand);
    nav.appendChild(comp);
    [brand, comp].forEach(function (btn) {
      btn.onclick = function () {
        if (STATE.tab === btn.dataset.tab && !document.getElementById('leftDrawer').classList.contains('drawer-collapsed')) {
          document.getElementById('leftDrawer').classList.add('drawer-collapsed');
          btn.classList.remove('on');
          return;
        }
        DRAWER.open(btn.dataset.tab);
      };
    });
  }

  function saveComponent() {
    var o = canvas.getActiveObject();
    if (!o) return toast('Select objects to save');
    var name = prompt('Component name', 'My component');
    if (name === null) return;
    o.clone(function (cloned) {
      PRO.components.unshift({ id: 'c' + Date.now(), name: name.trim() || 'Component', json: cloned.toObject(SNAP_PROPS) });
      saveComponents();
      DRAWER.open('components');
      toast('Component saved');
    }, SNAP_PROPS);
  }

  function placeComponent(i) {
    var c = PRO.components[i];
    if (!c) return;
    fabric.util.enlivenObjects([c.json], function (objs) {
      objs.forEach(function (o) {
        o.set({ left: (o.left || 0) + 40, top: (o.top || 0) + 40 });
        canvas.add(o);
      });
      if (objs.length === 1) canvas.setActiveObject(objs[0]);
      canvas.requestRenderAll();
      ENGINE.snapshot();
      LAYERS.render();
      toast('Component placed');
    });
  }

  /* ── AI remove background ── */
  function removeBackground() {
    var o = canvas.getActiveObject();
    if (!o || o.type !== 'image') { toast('Select an image'); return; }
    var btn = document.getElementById('proAiBg');
    if (btn) btn.innerHTML = '<span class="spin inline-block">◌</span> Processing…';
    setTimeout(function () {
      try {
        var el = o._element;
        var w = el.naturalWidth || el.width;
        var h = el.naturalHeight || el.height;
        var cv = document.createElement('canvas');
        cv.width = w;
        cv.height = h;
        var ctx = cv.getContext('2d');
        ctx.drawImage(el, 0, 0, w, h);
        var d = ctx.getImageData(0, 0, w, h);
        var p = d.data;
        var refs = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]].map(function (pt) {
          var i = (pt[1] * w + pt[0]) * 4;
          return [p[i], p[i + 1], p[i + 2]];
        });
        var tol = 68;
        for (var i = 0; i < p.length; i += 4) {
          for (var r = 0; r < refs.length; r++) {
            var dist = Math.sqrt(Math.pow(p[i] - refs[r][0], 2) + Math.pow(p[i + 1] - refs[r][1], 2) + Math.pow(p[i + 2] - refs[r][2], 2));
            if (dist < tol) {
              p[i + 3] = Math.max(0, Math.round(p[i + 3] * Math.pow(dist / tol, 2)));
              break;
            }
          }
        }
        ctx.putImageData(d, 0, 0);
        fabric.Image.fromURL(cv.toDataURL('image/png'), function (img) {
          img.set({
            left: o.left, top: o.top, angle: o.angle, scaleX: o.scaleX, scaleY: o.scaleY,
            originX: o.originX, originY: o.originY, objectName: (o.objectName || 'Image') + ' · cutout'
          });
          canvas.remove(o);
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.requestRenderAll();
          ENGINE.snapshot();
          LAYERS.render();
          INSPECTOR.render();
          toast('Background removed');
          if (btn) btn.innerHTML = '✦ AI Remove BG';
        });
      } catch (err) {
        toast('Cannot process image');
        if (btn) btn.innerHTML = '✦ AI Remove BG';
      }
    }, 60);
  }

  /* ── Clip mask ── */
  function clipToShapeBelow() {
    var o = canvas.getActiveObject();
    if (!o || o.type !== 'image') { toast('Select an image'); return; }
    var objs = canvas.getObjects();
    var idx = objs.indexOf(o);
    if (idx < 1) return toast('Place a shape behind the image');
    var mask = objs[idx - 1];
    o.clone(function (clip) {
      clip.set({ absolutePositioned: true, originX: mask.originX, originY: mask.originY, left: mask.left, top: mask.top, scaleX: mask.scaleX, scaleY: mask.scaleY, angle: mask.angle });
      o.clipPath = clip;
      canvas.requestRenderAll();
      ENGINE.snapshot();
      toast('Clipped to shape below');
    });
  }

  /* ── Pen tool ── */
  function togglePen() {
    penActive = !penActive;
    var btn = document.getElementById('btnProPen');
    if (btn) btn.classList.toggle('on', penActive);
    if (penActive) {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = '#22d3ee';
      canvas.freeDrawingBrush.width = 4;
      toast('Pen tool on — draw on canvas');
    } else {
      canvas.isDrawingMode = false;
      toast('Pen tool off');
    }
  }

  /* ── Save / load project ── */
  function saveProject() {
    try {
      var data = projectJSON();
      localStorage.setItem('aurora-pro-draft', JSON.stringify(data));
      localStorage.setItem(LS_DRAFT, JSON.stringify(data));
      toast('Project saved locally');
      var btn = document.getElementById('btnProSave');
      if (btn && window.AuroraControls) AuroraControls.buttonFeedback(btn, '✓ Saved');
      broadcastCollab('save', data);
    } catch (e) { toast('Save failed'); }
  }

  function loadProject() {
    try {
      var raw = localStorage.getItem('aurora-pro-draft') || localStorage.getItem(LS_DRAFT);
      if (!raw) return toast('No saved project found');
      openProjectData(JSON.parse(raw));
      var btn = document.getElementById('btnProSave');
      if (btn && window.AuroraControls) AuroraControls.buttonFeedback(btn, '✓ Loaded');
    } catch (e) { toast('Could not load project'); }
  }

  function thumbnail() {
    try {
      return canvas.toDataURL({ format: 'jpeg', quality: 0.55, multiplier: Math.min(0.25, 260 / STATE.W) });
    } catch (e) { return ''; }
  }

  function designsStore() {
    return {
      all: function () { try { return JSON.parse(localStorage.getItem(LS_DESIGNS) || '[]'); } catch (e) { return []; } },
      write: function (list) { localStorage.setItem(LS_DESIGNS, JSON.stringify(list)); }
    };
  }

  function saveDesign(name) {
    commitPage();
    var store = designsStore();
    var list = store.all();
    var doc = {
      id: 'd' + Date.now(),
      name: name || ('Design ' + (list.length + 1)),
      thumb: thumbnail(),
      data: projectJSON(),
      updated: Date.now()
    };
    list.unshift(doc);
    store.write(list.slice(0, 60));
    renderDesignsGrid();
    toast('Design saved · "' + doc.name + '"');
    return doc;
  }

  function injectDesignsModal() {
    if (document.getElementById('proDesignsModal')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<div id="proDesignsModal" role="dialog" aria-modal="true" aria-labelledby="proDmTitle">' +
      '<div class="glass w-full max-w-4xl rounded-2xl p-5 shadow-2xl">' +
      '<div class="mb-4 flex items-center justify-between">' +
      '<div><h3 id="proDmTitle" class="text-lg font-extrabold text-slate-100">My Designs</h3>' +
      '<p id="proDmSub" class="text-[11px] text-slate-400">Saved locally in your browser</p></div>' +
      '<button type="button" id="proDmClose" class="tr chip rounded-lg px-3 py-1.5 text-[12px]">✕</button></div>' +
      '<div class="mb-4 flex gap-2">' +
      '<button type="button" id="proDmSave" class="tr rounded-xl bg-gradient-to-r from-cyan-400 to-orange-400 px-4 py-2 text-[12px] font-bold text-slate-950">Save current design</button></div>' +
      '<div id="proDmGrid" class="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3"></div></div></div>');
    document.getElementById('proDmClose').onclick = closeDesignsModal;
    document.getElementById('proDesignsModal').addEventListener('click', function (e) {
      if (e.target.id === 'proDesignsModal') closeDesignsModal();
    });
    document.getElementById('proDmSave').onclick = function () {
      var n = prompt('Name this design', 'Aurora Design');
      if (n !== null) saveDesign(n.trim());
    };
    document.getElementById('proDmGrid').addEventListener('click', function (e) {
      var o = e.target.closest('[data-open]');
      var r = e.target.closest('[data-ren]');
      var d = e.target.closest('[data-del]');
      var draft = e.target.closest('#proDmDraft');
      var list = designsStore().all();
      if (draft) {
        var raw = localStorage.getItem(LS_DRAFT) || localStorage.getItem('aurora-pro-draft');
        if (raw) openProjectData(JSON.parse(raw));
        return;
      }
      if (o) {
        var doc = list.find(function (x) { return x.id === o.dataset.open; });
        if (doc) openProjectData(doc.data);
      } else if (r) {
        var doc2 = list.find(function (x) { return x.id === r.dataset.ren; });
        var n = prompt('Rename design', doc2.name);
        if (n) { doc2.name = n; designsStore().write(list); renderDesignsGrid(); }
      } else if (d) {
        designsStore().write(list.filter(function (x) { return x.id !== d.dataset.del; }));
        renderDesignsGrid();
        toast('Design deleted');
      }
    });
  }

  function renderDesignsGrid() {
    var list = designsStore().all();
    var sub = document.getElementById('proDmSub');
    if (sub) sub.textContent = list.length + ' saved · stored locally';
    var grid = document.getElementById('proDmGrid');
    if (!grid) return;
    var draft = localStorage.getItem(LS_DRAFT) || localStorage.getItem('aurora-pro-draft');
    var draftCard = draft ? '<button type="button" id="proDmDraft" class="pro-dm-card tr grid aspect-[4/5] place-items-center gap-1 rounded-2xl border-2 border-dashed border-cyan-400/60 bg-cyan-400/5 text-center hover:bg-cyan-400/10"><span class="text-2xl">⟲</span><span class="text-[12px] font-bold">Restore draft</span></button>' : '';
    grid.innerHTML = draftCard + (list.length ? list.map(function (d) {
      return '<div class="pro-dm-card group overflow-hidden rounded-2xl border border-white/10 bg-white/5">' +
        '<div class="relative aspect-[4/5] bg-slate-900/50">' +
        (d.thumb ? '<img src="' + d.thumb + '" class="h-full w-full object-cover" alt="" />' : '') +
        '<div class="absolute inset-0 grid place-items-center gap-2 bg-slate-950/70 opacity-0 transition group-hover:opacity-100">' +
        '<button type="button" data-open="' + d.id + '" class="tr rounded-lg bg-cyan-400 px-3 py-1.5 text-[11px] font-bold text-slate-950">Open</button>' +
        '<button type="button" data-ren="' + d.id + '" class="tr rounded-lg bg-white/90 px-3 py-1 text-[10px] font-semibold text-slate-900">Rename</button>' +
        '<button type="button" data-del="' + d.id + '" class="tr rounded-lg bg-rose-500/90 px-3 py-1 text-[10px] font-semibold text-white">Delete</button></div></div>' +
        '<div class="px-3 py-2"><p class="truncate text-[12px] font-bold text-slate-200">' + d.name + '</p>' +
        '<p class="text-[10px] text-slate-500">' + new Date(d.updated).toLocaleString() + ' · ' + ((d.data.pages || []).length) + ' page(s)</p></div></div>';
    }).join('') : '<div class="col-span-full py-12 text-center text-slate-500"><p class="font-bold">No saved designs yet</p><p class="text-[11px]">Save your first design to build a library.</p></div>');
  }

  function openDesignsModal() {
    renderDesignsGrid();
    var m = document.getElementById('proDesignsModal');
    m.classList.add('open');
    if (window.AuroraControls && AuroraControls.focusTrap) {
      window._proDmRelease = AuroraControls.focusTrap(m.querySelector('.glass'), { onClose: closeDesignsModal, focus: document.getElementById('proDmClose') });
    }
  }

  function closeDesignsModal() {
    var m = document.getElementById('proDesignsModal');
    m.classList.remove('open');
    if (window._proDmRelease) { window._proDmRelease(); window._proDmRelease = null; }
  }

  /* ── Collaboration stub (BroadcastChannel) ── */
  function initCollab() {
    if (typeof BroadcastChannel === 'undefined') return;
    try {
      collabChannel = new BroadcastChannel('aurora-pro-collab');
      collabChannel.onmessage = function (ev) {
        if (ev.data && ev.data.type === 'save' && ev.data.payload && !PRO.pageLock) {
          toast('Design updated in another tab');
        }
      };
    } catch (e) { /* ignore */ }
  }

  function broadcastCollab(type, payload) {
    if (collabChannel) collabChannel.postMessage({ type: type, payload: payload });
  }

  function applyImageFilters(o) {
    if (!o || o.type !== 'image') return;
    var f = fabric.Image.filters;
    var arr = [];
    var v = function (id) { var el = document.getElementById(id); return el ? +el.value : 0; };
    if (v('proBright')) arr.push(new f.Brightness({ brightness: v('proBright') / 100 }));
    if (v('proContrast')) arr.push(new f.Contrast({ contrast: v('proContrast') / 100 }));
    if (v('proSat')) arr.push(new f.Saturation({ saturation: v('proSat') / 100 }));
    if (v('proBlur') > 0) arr.push(new f.Blur({ blur: v('proBlur') / 100 }));
    o.filters = arr;
    o.applyFilters();
    canvas.requestRenderAll();
  }

  function injectHeaderTools() {
    var anchor = document.querySelector('header.glass .ml-auto');
    if (!anchor) return;
    if (!document.getElementById('btnProSave')) {
      var wrap = document.createElement('div');
      wrap.className = 'flex items-center gap-1.5';
      wrap.innerHTML =
        '<button type="button" id="btnProPen" class="tr chip rounded-lg px-2 py-1.5 text-[11px]" title="Pen tool">✎</button>' +
        '<button type="button" id="btnEyedropper" class="tr chip rounded-lg px-2 py-1.5 text-[11px]" title="Eyedropper">💧</button>' +
        '<button type="button" id="btnProDesigns" class="tr chip rounded-lg px-2 py-1.5 text-[11px] font-semibold">☁ Designs</button>' +
        '<button type="button" id="btnProLoad" class="tr chip rounded-lg px-2 py-1.5 text-[11px]">↺ Load</button>' +
        '<button type="button" id="btnProSave" class="tr chip rounded-lg px-2 py-1.5 text-[11px] font-semibold">💾 Save</button>';
      anchor.insertBefore(wrap, anchor.firstChild);
      document.getElementById('btnProSave').onclick = saveProject;
      document.getElementById('btnProLoad').onclick = loadProject;
      document.getElementById('btnProDesigns').onclick = openDesignsModal;
      document.getElementById('btnProPen').onclick = togglePen;
      document.getElementById('btnEyedropper').onclick = function () {
        eyeActive = !eyeActive;
        this.classList.toggle('on', eyeActive);
        canvas.defaultCursor = eyeActive ? 'crosshair' : 'default';
        toast(eyeActive ? 'Eyedropper on — click canvas' : 'Eyedropper off');
      };
    }
    if (!document.getElementById('expDpi')) {
      var expFmt = document.getElementById('expFormat');
      if (expFmt) {
        expFmt.insertAdjacentHTML('beforeend', '<option value="pdf">PDF</option><option value="bleed">PDF + Bleed</option><option value="allpdf">All pages PDF</option>');
        var scale = document.getElementById('expScale');
        if (scale) {
          scale.insertAdjacentHTML('afterend',
            '<select id="expDpi" class="fld obsidian-hide-mobile w-20" title="Export DPI"><option value="72">72 DPI</option><option value="150" selected>150 DPI</option><option value="300">300 DPI</option></select>' +
            '<input id="expBleed" class="fld obsidian-hide-mobile w-16" type="number" value="36" min="0" title="Bleed px" placeholder="Bleed" />');
        }
      }
    }
  }

  function injectAlignExtras() {
    var grid = document.getElementById('alignGrid');
    if (!grid || document.getElementById('proAlignExtra')) return;
    var extra = document.createElement('div');
    extra.id = 'proAlignExtra';
    extra.className = 'mt-2 space-y-1.5';
    extra.innerHTML =
      '<div class="grid grid-cols-4 gap-1.5">' +
      '<button type="button" class="chip tr rounded-lg py-1.5 text-[10px]" data-dist="x" title="Distribute H">⇔</button>' +
      '<button type="button" class="chip tr rounded-lg py-1.5 text-[10px]" data-dist="y" title="Distribute V">⇕</button>' +
      '<button type="button" class="chip tr rounded-lg py-1.5 text-[10px]" data-grp="1" title="Group">⊞</button>' +
      '<button type="button" class="chip tr rounded-lg py-1.5 text-[10px]" data-grp="0" title="Ungroup">⊟</button></div>' +
      '<div class="grid grid-cols-3 gap-1.5">' +
      '<button type="button" class="chip tr rounded-lg py-1.5 text-[10px]" data-stack="v" title="Stack vertical">⬇ Stack</button>' +
      '<button type="button" class="chip tr rounded-lg py-1.5 text-[10px]" data-stack="h" title="Stack horizontal">➡ Stack</button>' +
      '<button type="button" class="chip tr rounded-lg py-1.5 text-[10px]" data-clip="1" title="Clip to shape">✂ Clip</button></div>';
    grid.parentElement.appendChild(extra);
    extra.querySelector('[data-dist="x"]').onclick = function () { distribute('x'); };
    extra.querySelector('[data-dist="y"]').onclick = function () { distribute('y'); };
    extra.querySelector('[data-grp="1"]').onclick = groupSel;
    extra.querySelector('[data-grp="0"]').onclick = ungroupSel;
    extra.querySelector('[data-stack="v"]').onclick = function () { autoLayoutStack('v'); };
    extra.querySelector('[data-stack="h"]').onclick = function () { autoLayoutStack('h'); };
    extra.querySelector('[data-clip="1"]').onclick = clipToShapeBelow;
  }

  function injectExportOptions() {
    var fmt = document.getElementById('expFormat');
    if (!fmt || fmt.querySelector('[value="webp"]')) return;
    fmt.insertAdjacentHTML('beforeend', '<option value="webp">WEBP</option>');
  }

  function dpiMult() {
    var dpi = +(document.getElementById('expDpi')?.value || 150);
    return Math.max(1, Math.min(8, dpi / 72));
  }

  function downloadUrl(url, name) {
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  }

  function renderPageDataURL(p, m) {
    return new Promise(function (res) {
      var el = document.createElement('canvas');
      var tmp = new fabric.StaticCanvas(el, { width: p.w, height: p.h });
      tmp.loadFromJSON(p.json, function () {
        tmp.renderAll();
        var d = tmp.toDataURL({ format: 'png', multiplier: m || 1 });
        tmp.dispose();
        res(d);
      });
    });
  }

  async function exportAllPagesPdf(m) {
    commitPage();
    if (!window.jspdf) { toast('PDF library not loaded'); return; }
    var jsPDF = window.jspdf.jsPDF;
    var pdf = null;
    for (var i = 0; i < PRO.pages.length; i++) {
      var p = PRO.pages[i];
      var data = await renderPageDataURL(p, m);
      var o = p.w > p.h ? 'landscape' : 'portrait';
      if (!pdf) pdf = new jsPDF({ orientation: o, unit: 'px', format: [p.w, p.h] });
      else pdf.addPage([p.w, p.h], o);
      pdf.addImage(data, 'PNG', 0, 0, p.w, p.h);
    }
    pdf.save('aurora-multipage.pdf');
    toast(PRO.pages.length + ' pages exported to PDF');
  }

  function patchExport() {
    if (typeof EXPORT === 'undefined') return;
    var orig = EXPORT.run;
    EXPORT.run = function () {
      var fmt = document.getElementById('expFormat').value;
      var mult = +document.getElementById('expScale').value;
      var m = dpiMult();
      var prevZoom = STATE.zoom;
      GUIDES.clear();
      ENGINE.applyZoom(1);

      if (fmt === 'webp') {
        var url = canvas.toDataURL({ format: 'webp', quality: 0.92, multiplier: mult });
        ENGINE.applyZoom(prevZoom);
        downloadUrl(url, 'aurora-studio-' + STATE.W + 'x' + STATE.H + '@' + mult + 'x.webp');
        toast('Exported WEBP');
        return;
      }

      if (fmt === 'pdf' && window.jspdf) {
        var data = canvas.toDataURL({ format: 'png', multiplier: m });
        var jsPDF = window.jspdf.jsPDF;
        var pdf = new jsPDF({ orientation: STATE.W > STATE.H ? 'landscape' : 'portrait', unit: 'px', format: [STATE.W, STATE.H] });
        pdf.addImage(data, 'PNG', 0, 0, STATE.W, STATE.H);
        ENGINE.applyZoom(prevZoom);
        pdf.save('aurora-studio.pdf');
        toast('PDF exported at ' + (document.getElementById('expDpi')?.value || 150) + ' DPI');
        return;
      }

      if (fmt === 'bleed' && window.jspdf) {
        var bl = Math.max(0, +(document.getElementById('expBleed')?.value || 36));
        var data2 = canvas.toDataURL({ format: 'png', multiplier: m });
        var jsPDF2 = window.jspdf.jsPDF;
        var W = STATE.W + bl * 2;
        var H = STATE.H + bl * 2;
        var pdf2 = new jsPDF2({ orientation: W > H ? 'landscape' : 'portrait', unit: 'px', format: [W, H] });
        pdf2.setFillColor(255, 255, 255);
        pdf2.rect(0, 0, W, H, 'F');
        pdf2.addImage(data2, 'PNG', bl, bl, STATE.W, STATE.H);
        pdf2.setDrawColor(0);
        pdf2.setLineWidth(0.6);
        var mk = bl * 0.7;
        [[bl, bl, -1, -1], [bl + STATE.W, bl, 1, -1], [bl, bl + STATE.H, -1, 1], [bl + STATE.W, bl + STATE.H, 1, 1]].forEach(function (pt) {
          pdf2.line(pt[0], pt[1] + pt[3] * 4, pt[0], pt[1] + pt[3] * mk);
          pdf2.line(pt[0] + pt[2] * 4, pt[1], pt[0] + pt[2] * mk, pt[1]);
        });
        pdf2.setFontSize(7);
        pdf2.text('AURORA.STUDIO · ' + STATE.W + '×' + STATE.H + 'px · ' + (document.getElementById('expDpi')?.value || 150) + ' DPI · ' + bl + 'px bleed', 6, 10);
        ENGINE.applyZoom(prevZoom);
        pdf2.save('aurora-print-ready.pdf');
        toast('Print-ready PDF with bleed marks');
        return;
      }

      if (fmt === 'allpdf') {
        ENGINE.applyZoom(prevZoom);
        exportAllPagesPdf(m);
        return;
      }

      return orig.call(EXPORT);
    };
  }

  function patchInspector() {
    if (typeof INSPECTOR === 'undefined') return;
    var orig = INSPECTOR.render;
    INSPECTOR.render = function () {
      orig.call(INSPECTOR);
      var o = canvas.getActiveObject();
      if (!o) return;
      var host = document.getElementById('inspector');
      if (!host || document.getElementById('proPosition')) return;

      var b = o.getBoundingRect(true, true);
      var isImg = o.type === 'image';
      var pro = document.createElement('div');
      pro.id = 'proPosition';
      pro.className = 'space-y-3';
      pro.innerHTML =
        '<section class="glass-2 space-y-2 rounded-xl p-2.5">' +
        '<p class="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Position &amp; size <span class="pro-badge">PRO</span></p>' +
        '<div class="grid grid-cols-2 gap-1.5">' +
        '<label class="text-[10px] text-slate-500">X<input id="proX" class="fld mt-0.5" type="number" value="' + Math.round(o.left) + '" /></label>' +
        '<label class="text-[10px] text-slate-500">Y<input id="proY" class="fld mt-0.5" type="number" value="' + Math.round(o.top) + '" /></label>' +
        '<label class="text-[10px] text-slate-500">W<input id="proW" class="fld mt-0.5" type="number" value="' + Math.round(b.width) + '" /></label>' +
        '<label class="text-[10px] text-slate-500">H<input id="proH" class="fld mt-0.5" type="number" value="' + Math.round(b.height) + '" /></label>' +
        '</div>' +
        '<label class="text-[10px] text-slate-500">Blend mode' +
        '<select id="proBlend" class="fld mt-0.5">' +
        BLENDS.map(function (m) { return '<option value="' + m + '"' + ((o.blendMode || 'normal') === m ? ' selected' : '') + '>' + m + '</option>'; }).join('') +
        '</select></label></section>' +
        (isImg ? '<section class="glass-2 space-y-2 rounded-xl p-2.5">' +
        '<p class="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Image tools <span class="pro-badge">PRO</span></p>' +
        '<button type="button" id="proAiBg" class="tr w-full rounded-lg bg-gradient-to-r from-orange-400 to-rose-400 px-3 py-2 text-[11px] font-bold text-slate-950">✦ AI Remove BG</button>' +
        '<label class="text-[10px] text-slate-500">Brightness<input id="proBright" type="range" min="-100" max="100" value="0" class="w-full" /></label>' +
        '<label class="text-[10px] text-slate-500">Contrast<input id="proContrast" type="range" min="-100" max="100" value="0" class="w-full" /></label>' +
        '<label class="text-[10px] text-slate-500">Saturation<input id="proSat" type="range" min="-100" max="100" value="0" class="w-full" /></label>' +
        '<label class="text-[10px] text-slate-500">Blur<input id="proBlur" type="range" min="0" max="100" value="0" class="w-full" /></label>' +
        '<button type="button" id="proFilterReset" class="chip tr w-full rounded-lg py-1.5 text-[10px]">Reset filters</button></section>' : '');

      host.insertBefore(pro, host.firstChild);
      document.getElementById('proAiBg')?.addEventListener('click', removeBackground);
      bindProControls(o, isImg);
    };
  }

  function bindProControls(o, isImg) {
    var push = function () { o.setCoords(); canvas.requestRenderAll(); ENGINE.snapshot(); LAYERS.render(); CTX.update(); };
    var debounce = window.AuroraControls ? AuroraControls.debounce : function (fn) { return fn; };

    function setPos() {
      o.set({ left: +document.getElementById('proX').value, top: +document.getElementById('proY').value });
      push();
    }
    function setSize() {
      var w = Math.max(1, +document.getElementById('proW').value);
      var h = Math.max(1, +document.getElementById('proH').value);
      var b = o.getBoundingRect(true, true);
      if (b.width > 0) o.scaleX = (o.scaleX || 1) * (w / b.width);
      if (b.height > 0) o.scaleY = (o.scaleY || 1) * (h / b.height);
      push();
      INSPECTOR.render();
    }

    ['proX', 'proY'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.onchange = setPos;
    });
    ['proW', 'proH'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.onchange = setSize;
    });
    var blend = document.getElementById('proBlend');
    if (blend) blend.onchange = function (e) {
      o.blendMode = e.target.value;
      applyBlendModes();
      push();
    };

    if (isImg) {
      var debouncedFilter = debounce(function () { applyImageFilters(o); }, 80);
      ['proBright', 'proContrast', 'proSat', 'proBlur'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          el.oninput = debouncedFilter;
          el.onchange = function () { applyImageFilters(o); ENGINE.snapshot(); };
        }
      });
      var reset = document.getElementById('proFilterReset');
      if (reset) reset.onclick = function () {
        ['proBright', 'proContrast', 'proSat', 'proBlur'].forEach(function (id) {
          var el = document.getElementById(id); if (el) el.value = 0;
        });
        o.filters = [];
        o.applyFilters();
        push();
      };
    }
  }

  function patchKeyboard() {
    document.addEventListener('keydown', function (e) {
      var meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === 's') { e.preventDefault(); saveProject(); }
      if (meta && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) ungroupSel(); else groupSel();
      }
      if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey) {
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
          e.preventDefault();
          togglePen();
        }
      }
    });
  }

  function patchEyedropper() {
    canvas.on('mouse:down', function (opt) {
      if (!eyeActive) return;
      var pointer = canvas.getPointer(opt.e);
      var ctx = canvas.getContext();
      var vpt = canvas.viewportTransform;
      var x = pointer.x * vpt[0] + vpt[4];
      var y = pointer.y * vpt[3] + vpt[5];
      var px = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
      var hex = '#' + [px[0], px[1], px[2]].map(function (c) { return c.toString(16).padStart(2, '0'); }).join('');
      var o = canvas.getActiveObject();
      if (o) {
        o.set('fill', hex);
        canvas.requestRenderAll();
        ENGINE.snapshot();
        INSPECTOR.render();
        toast('Picked ' + hex);
      }
      eyeActive = false;
      var btn = document.getElementById('btnEyedropper');
      if (btn) btn.classList.remove('on');
      canvas.defaultCursor = 'default';
    });
  }

  function registerToolHubCommands() {
    if (!window.AuroraToolHub) return;
    AuroraToolHub.register([
      { id: 'pro-save', label: 'Save project locally', icon: '💾', keys: 'Ctrl+S', group: 'Pro', quick: true, run: saveProject },
      { id: 'pro-load', label: 'Load saved project', icon: '↺', group: 'Pro', quick: true, run: loadProject },
      { id: 'pro-designs', label: 'My Designs library', icon: '☁', group: 'Pro', quick: true, run: openDesignsModal },
      { id: 'pro-brand', label: 'Brand Kit', icon: 'B', group: 'Pro', quick: true, run: function () { DRAWER.open('brandkit'); } },
      { id: 'pro-components', label: 'Components library', icon: '⊞', group: 'Pro', run: function () { DRAWER.open('components'); } },
      { id: 'pro-pen', label: 'Pen / draw tool', icon: '✎', keys: 'P', group: 'Pro', run: togglePen },
      { id: 'pro-eyedropper', label: 'Eyedropper tool', icon: '💧', group: 'Pro', run: function () { document.getElementById('btnEyedropper')?.click(); } },
      { id: 'pro-ai-bg', label: 'AI remove background', icon: '✦', group: 'Pro', run: removeBackground },
      { id: 'pro-clip', label: 'Clip image to shape below', icon: '✂', group: 'Pro', run: clipToShapeBelow },
      { id: 'pro-stack-v', label: 'Auto-layout stack vertical', icon: '⬇', group: 'Pro', run: function () { autoLayoutStack('v'); } },
      { id: 'pro-stack-h', label: 'Auto-layout stack horizontal', icon: '➡', group: 'Pro', run: function () { autoLayoutStack('h'); } },
      { id: 'pro-page-add', label: 'Add artboard page', icon: '+', group: 'Pages', run: addPage },
      { id: 'pro-rulers', label: 'Toggle rulers', icon: 'R', group: 'View', run: function () { document.getElementById('proVRuler')?.click(); } },
      { id: 'pro-grid', label: 'Toggle grid', icon: '#', group: 'View', run: function () { document.getElementById('proVGrid')?.click(); } },
      { id: 'pro-bleed', label: 'Toggle bleed overlay', icon: '⊡', group: 'View', run: function () { document.getElementById('proVBleed')?.click(); } },
      { id: 'pro-distribute-x', label: 'Distribute horizontally', icon: '⇔', group: 'Pro', run: function () { distribute('x'); } },
      { id: 'pro-distribute-y', label: 'Distribute vertically', icon: '⇕', group: 'Pro', run: function () { distribute('y'); } },
      { id: 'pro-group', label: 'Group objects', icon: '⊞', keys: 'Ctrl+G', group: 'Pro', run: groupSel },
      { id: 'pro-ungroup', label: 'Ungroup', icon: '⊟', keys: 'Ctrl+Shift+G', group: 'Pro', run: ungroupSel },
      { id: 'pro-export-webp', label: 'Export WEBP', icon: '🖼', group: 'Pro', run: function () { document.getElementById('expFormat').value = 'webp'; EXPORT.run(); } },
      { id: 'pro-export-pdf', label: 'Export PDF', icon: '📄', group: 'Pro', run: function () { document.getElementById('expFormat').value = 'pdf'; EXPORT.run(); } }
    ]);
    AuroraToolHub.registerShortcuts([
      { label: 'Save project', keys: 'Ctrl+S' },
      { label: 'Pen tool', keys: 'P' },
      { label: 'Group / Ungroup', keys: 'Ctrl+G / Ctrl+Shift+G' }
    ]);
  }

  function scheduleAutosave() {
    clearTimeout(window._proAutoT);
    window._proAutoT = setTimeout(function () {
      try {
        commitPage();
        localStorage.setItem(LS_DRAFT, JSON.stringify(projectJSON()));
      } catch (e) { /* ignore quota */ }
    }, 1500);
  }

  function init() {
    loadBrand();
    loadComponents();
    patchDrawer();
    patchInspector();
    patchExport();
    patchKeyboard();
    patchEngineZoom();
    injectViewOverlays();
    injectHeaderTools();
    injectViewTools();
    injectPageBar();
    injectRailButtons();
    injectAlignExtras();
    injectExportOptions();
    injectDesignsModal();
    patchEyedropper();
    canvas.on('path:created', function (e) {
      if (e.path) {
        e.path.objectName = 'Pen stroke';
        ENGINE.snapshot();
        LAYERS.render();
      }
    });
    initCollab();
    registerToolHubCommands();

    if (typeof ENGINE !== 'undefined') {
      var origSnap = ENGINE.snapshot;
      ENGINE.snapshot = function () {
        origSnap.call(ENGINE);
        applyBlendModes();
        if (!PRO.pageLock) scheduleAutosave();
      };
    }

    ['object:added', 'object:removed', 'object:modified'].forEach(function (ev) {
      canvas.on(ev, scheduleAutosave);
    });

    setTimeout(function () {
      initPages();
      renderPageStrip();
    }, 800);

    window.addEventListener('resize', function () {
      drawRulers();
      updateBleedOverlay();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

  window.AuroraPro = {
    saveProject: saveProject,
    loadProject: loadProject,
    distribute: distribute,
    groupSel: groupSel,
    ungroupSel: ungroupSel,
    addPage: addPage,
    openDesigns: openDesignsModal,
    removeBackground: removeBackground,
    autoLayoutStack: autoLayoutStack,
    clipToShapeBelow: clipToShapeBelow,
    togglePen: togglePen,
    projectJSON: projectJSON
  };
})();
