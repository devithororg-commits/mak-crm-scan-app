/* Aurora Pro — advanced tools for Obsidian Pro workspace */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app')) return;

  var BLENDS = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion'];
  var eyeActive = false;

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

  function saveProject() {
    try {
      var data = {
        w: STATE.W, h: STATE.H, bg: STATE.bg,
        json: canvas.toJSON(['objectName', 'locked', 'blendMode', 'name'])
      };
      localStorage.setItem('aurora-pro-draft', JSON.stringify(data));
      toast('Project saved locally');
      var btn = document.getElementById('btnProSave');
      if (btn && window.AuroraControls) AuroraControls.buttonFeedback(btn, '✓ Saved');
    } catch (e) { toast('Save failed'); }
  }

  function loadProject() {
    try {
      var raw = localStorage.getItem('aurora-pro-draft');
      if (!raw) return toast('No saved project found');
      var data = JSON.parse(raw);
      STATE.W = data.w || STATE.W;
      STATE.H = data.h || STATE.H;
      ENGINE.resize(STATE.W, STATE.H);
      canvas.loadFromJSON(data.json, function () {
        canvas.renderAll();
        adoptNames();
        applyBlendModes();
        ENGINE.snapshot();
        LAYERS.render();
        INSPECTOR.render();
        toast('Project restored');
      });
    } catch (e) { toast('Could not load project'); }
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
    if (!anchor || document.getElementById('btnProSave')) return;
    var wrap = document.createElement('div');
    wrap.className = 'flex items-center gap-1.5';
    wrap.innerHTML =
      '<button id="btnEyedropper" type="button" class="tr chip rounded-lg px-2 py-1.5 text-[11px]" title="Eyedropper (pick color from canvas)">💧</button>' +
      '<button id="btnProLoad" type="button" class="tr chip rounded-lg px-2 py-1.5 text-[11px]">↺ Load</button>' +
      '<button id="btnProSave" type="button" class="tr chip rounded-lg px-2 py-1.5 text-[11px] font-semibold">💾 Save</button>';
    anchor.insertBefore(wrap, anchor.firstChild);
    document.getElementById('btnProSave').onclick = saveProject;
    document.getElementById('btnProLoad').onclick = loadProject;
    document.getElementById('btnEyedropper').onclick = function () {
      eyeActive = !eyeActive;
      this.classList.toggle('on', eyeActive);
      canvas.defaultCursor = eyeActive ? 'crosshair' : 'default';
      toast(eyeActive ? 'Eyedropper on — click canvas' : 'Eyedropper off');
    };
  }

  function injectAlignExtras() {
    var grid = document.getElementById('alignGrid');
    if (!grid || document.getElementById('proAlignExtra')) return;
    var extra = document.createElement('div');
    extra.id = 'proAlignExtra';
    extra.className = 'mt-2 grid grid-cols-4 gap-1.5';
    extra.innerHTML =
      '<button class="chip tr rounded-lg py-1.5 text-[10px]" data-dist="x" title="Distribute horizontally">⇔</button>' +
      '<button class="chip tr rounded-lg py-1.5 text-[10px]" data-dist="y" title="Distribute vertically">⇕</button>' +
      '<button class="chip tr rounded-lg py-1.5 text-[10px]" data-grp="1" title="Group Ctrl+G">⊞</button>' +
      '<button class="chip tr rounded-lg py-1.5 text-[10px]" data-grp="0" title="Ungroup">⊟</button>';
    grid.parentElement.appendChild(extra);
    extra.querySelector('[data-dist="x"]').onclick = function () { distribute('x'); };
    extra.querySelector('[data-dist="y"]').onclick = function () { distribute('y'); };
    extra.querySelector('[data-grp="1"]').onclick = groupSel;
    extra.querySelector('[data-grp="0"]').onclick = ungroupSel;
  }

  function injectExportOptions() {
    var fmt = document.getElementById('expFormat');
    if (!fmt || fmt.querySelector('[value="webp"]')) return;
    fmt.insertAdjacentHTML('beforeend', '<option value="webp">WEBP</option>');
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
        '</select></label>' +
        '</section>' +
        (isImg ? '<section class="glass-2 space-y-2 rounded-xl p-2.5">' +
        '<p class="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Image adjust <span class="pro-badge">PRO</span></p>' +
        '<label class="text-[10px] text-slate-500">Brightness<input id="proBright" type="range" min="-100" max="100" value="0" class="w-full" /></label>' +
        '<label class="text-[10px] text-slate-500">Contrast<input id="proContrast" type="range" min="-100" max="100" value="0" class="w-full" /></label>' +
        '<label class="text-[10px] text-slate-500">Saturation<input id="proSat" type="range" min="-100" max="100" value="0" class="w-full" /></label>' +
        '<label class="text-[10px] text-slate-500">Blur<input id="proBlur" type="range" min="0" max="100" value="0" class="w-full" /></label>' +
        '<button id="proFilterReset" class="chip tr w-full rounded-lg py-1.5 text-[10px]">Reset filters</button>' +
        '</section>' : '');

      host.insertBefore(pro, host.firstChild);
      bindProControls(o, isImg);
    };
  }

  function bindProControls(o, isImg) {
    var push = function () { o.setCoords(); canvas.requestRenderAll(); ENGINE.snapshot(); LAYERS.render(); CTX.update(); };
    var debounce = window.AuroraControls ? AuroraControls.debounce : function (fn) { return fn; };

    function setPos() {
      var x = +document.getElementById('proX').value;
      var y = +document.getElementById('proY').value;
      o.set({ left: x, top: y });
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
      if (el) { el.onchange = setPos; }
    });
    ['proW', 'proH'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.onchange = setSize; }
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

  function patchExport() {
    if (typeof EXPORT === 'undefined') return;
    var orig = EXPORT.run;
    EXPORT.run = function () {
      var fmt = document.getElementById('expFormat').value;
      if (fmt === 'webp') {
        var mult = +document.getElementById('expScale').value;
        var prev = STATE.zoom;
        ENGINE.applyZoom(1);
        var url = canvas.toDataURL({ format: 'webp', quality: 0.92, multiplier: mult });
        ENGINE.applyZoom(prev);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'aurora-studio-' + STATE.W + 'x' + STATE.H + '@' + mult + 'x.webp';
        a.click();
        toast('Exported WEBP');
        return;
      }
      return orig.call(EXPORT);
    };
  }

  function patchKeyboard() {
    document.addEventListener('keydown', function (e) {
      var meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === 's') { e.preventDefault(); saveProject(); }
      if (meta && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) ungroupSel(); else groupSel();
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
      var hex = '#' + [px[0], px[1], px[2]].map(function (c) {
        return c.toString(16).padStart(2, '0');
      }).join('');
      var o = canvas.getActiveObject();
      if (o) {
        if (o.type === 'textbox' || o.type === 'i-text') o.set('fill', hex);
        else o.set('fill', hex);
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
      { id: 'pro-eyedropper', label: 'Eyedropper tool', icon: '💧', group: 'Pro', run: function () { document.getElementById('btnEyedropper')?.click(); } },
      { id: 'pro-distribute-x', label: 'Distribute horizontally', icon: '⇔', group: 'Pro', run: function () { distribute('x'); } },
      { id: 'pro-distribute-y', label: 'Distribute vertically', icon: '⇕', group: 'Pro', run: function () { distribute('y'); } },
      { id: 'pro-group', label: 'Group objects', icon: '⊞', keys: 'Ctrl+G', group: 'Pro', run: groupSel },
      { id: 'pro-ungroup', label: 'Ungroup', icon: '⊟', keys: 'Ctrl+Shift+G', group: 'Pro', run: ungroupSel },
      { id: 'pro-export-webp', label: 'Export WEBP', icon: '🖼', group: 'Pro', run: function () { document.getElementById('expFormat').value = 'webp'; EXPORT.run(); } }
    ]);
    AuroraToolHub.registerShortcuts([
      { label: 'Save project', keys: 'Ctrl+S' },
      { label: 'Group / Ungroup', keys: 'Ctrl+G / Ctrl+Shift+G' }
    ]);
  }

  function init() {
    patchInspector();
    patchExport();
    patchKeyboard();
    injectHeaderTools();
    injectAlignExtras();
    injectExportOptions();
    patchEyedropper();
    registerToolHubCommands();
    if (typeof ENGINE !== 'undefined') {
      var origSnap = ENGINE.snapshot;
      ENGINE.snapshot = function () {
        origSnap.call(ENGINE);
        applyBlendModes();
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

  window.AuroraPro = { saveProject: saveProject, loadProject: loadProject, distribute: distribute, groupSel: groupSel, ungroupSel: ungroupSel };
})();
