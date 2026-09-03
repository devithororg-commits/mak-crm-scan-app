/* Aurora Pro Extras — browser-only features (no external API) */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app')) return;

  var LS_VERSIONS = 'aurora-pro-versions.v1';
  var LS_COMMENTS = 'aurora-pro-comments.v1';
  var LS_VARIANTS = 'aurora-pro-component-variants.v1';
  var SNAP_PROPS = ['objectName', 'locked', 'blendMode', 'name', 'constraints', 'autoLayout', 'variantKey'];
  var pinMode = false;
  var comments = [];
  var pixelSnap = false;
  var aspectLock = false;

  function loadComments() {
    try { comments = JSON.parse(localStorage.getItem(LS_COMMENTS) || '[]'); } catch (e) { comments = []; }
  }
  function saveComments() { localStorage.setItem(LS_COMMENTS, JSON.stringify(comments)); }

  function versionsStore() {
    return {
      all: function () { try { return JSON.parse(localStorage.getItem(LS_VERSIONS) || '[]'); } catch (e) { return []; } },
      write: function (list) { localStorage.setItem(LS_VERSIONS, JSON.stringify(list.slice(0, 40))); }
    };
  }

  function setSync(state, label) {
    var dot = document.getElementById('proSyncDot');
    var txt = document.getElementById('proSyncTxt');
    if (!dot) return;
    dot.className = state === 'saving' ? 'saving' : state === 'dirty' ? 'dirty' : '';
    if (txt) txt.textContent = label || 'Saved';
  }

  function injectSyncIndicator() {
    if (document.getElementById('proSyncWrap')) return;
    var header = document.querySelector('header.glass');
    if (!header) return;
    var wrap = document.createElement('div');
    wrap.id = 'proSyncWrap';
    wrap.className = 'obsidian-hide-mobile';
    wrap.innerHTML = '<span id="proSyncDot"></span><span id="proSyncTxt">Ready</span>';
    var title = header.querySelector('.leading-tight');
    if (title) title.parentElement.insertBefore(wrap, title.nextSibling);
    setSync('ok', 'Ready');
  }

  function scheduleSyncDirty() {
    setSync('dirty', 'Unsaved changes');
    clearTimeout(window._proSyncT);
    window._proSyncT = setTimeout(function () {
      setSync('saving', 'Auto-saving…');
      try {
        if (window.AuroraPro && AuroraPro.commitPage) AuroraPro.commitPage();
        var data = AuroraPro.projectJSON();
        localStorage.setItem('aurora-pro-draft-pages', JSON.stringify(data));
        setTimeout(function () { setSync('ok', 'Draft saved'); }, 400);
      } catch (e) { setSync('ok', 'Ready'); }
    }, 1400);
  }

  /* ── QR Code (client-side, no API) ── */
  function addQR(text) {
    if (!text) return toast('Enter URL or text');
    if (typeof QRCode === 'undefined') return toast('QR library loading…');
    var cv = document.createElement('canvas');
    QRCode.toCanvas(cv, text, { width: 400, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } }, function (err) {
      if (err) return toast('QR failed');
      fabric.Image.fromURL(cv.toDataURL('image/png'), function (img) {
        img.set({ objectName: 'QR Code' });
        img.scaleToWidth(Math.min(280, STATE.W * 0.35));
        ENGINE.add(img);
        toast('QR code added');
      });
    });
  }

  /* ── Charts ── */
  function addChart(kind, valuesStr, color) {
    var v = valuesStr.split(',').map(function (n) { return parseFloat(n); }).filter(function (n) { return !isNaN(n); });
    if (v.length < 2) return toast('Enter 2+ numbers');
    var max = Math.max.apply(null, v);
    var W = Math.min(STATE.W, STATE.H) * 0.55;
    var H = W * 0.55;
    var parts = [];
    if (kind === 'bar') {
      var gap = W * 0.04;
      var bw = (W - gap * (v.length - 1)) / v.length;
      v.forEach(function (n, i) {
        var h = Math.max(6, H * (n / max));
        parts.push(new fabric.Rect({
          left: i * (bw + gap), top: H - h, width: bw, height: h,
          fill: color || '#22d3ee', rx: 6, ry: 6
        }));
      });
    } else {
      var total = v.reduce(function (a, b) { return a + b; }, 0);
      var ang = -Math.PI / 2;
      var R = H / 2;
      v.forEach(function (n, i) {
        var a2 = ang + (n / total) * Math.PI * 2;
        var p = 'M ' + R + ' ' + R + ' L ' + (R + R * Math.cos(ang)) + ' ' + (R + R * Math.sin(ang)) +
          ' A ' + R + ' ' + R + ' 0 ' + ((a2 - ang) > Math.PI ? 1 : 0) + ' 1 ' +
          (R + R * Math.cos(a2)) + ' ' + (R + R * Math.sin(a2)) + ' Z';
        parts.push(new fabric.Path(p, { fill: color || '#fb923c', opacity: 1 - i * 0.12 }));
        ang = a2;
      });
    }
    var g = new fabric.Group(parts, { objectName: kind === 'bar' ? 'Bar Chart' : 'Pie Chart' });
    ENGINE.add(g);
    toast('Chart added');
  }

  /* ── Pattern backgrounds ── */
  function patternBg(kind) {
    var t = document.createElement('canvas');
    var s = kind === 'noise' ? 120 : 40;
    t.width = t.height = s;
    var x = t.getContext('2d');
    x.fillStyle = '#0b1220';
    x.fillRect(0, 0, s, s);
    if (kind === 'dots') {
      x.fillStyle = 'rgba(34,211,238,.25)';
      x.beginPath();
      x.arc(s / 2, s / 2, 3, 0, 7);
      x.fill();
    } else if (kind === 'lines') {
      x.strokeStyle = 'rgba(148,163,184,.2)';
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(0, s);
      x.lineTo(s, 0);
      x.stroke();
    } else if (kind === 'cross') {
      x.strokeStyle = 'rgba(251,146,60,.3)';
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(s / 2, 0);
      x.lineTo(s / 2, s);
      x.moveTo(0, s / 2);
      x.lineTo(s, s / 2);
      x.stroke();
    } else if (kind === 'noise') {
      var d = x.createImageData(s, s);
      for (var i = 0; i < d.data.length; i += 4) {
        var v = 20 + Math.random() * 30;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
        d.data[i + 3] = 255;
      }
      x.putImageData(d, 0, 0);
    }
    var r = new fabric.Rect({
      left: 0, top: 0, width: STATE.W, height: STATE.H,
      objectName: 'Pattern · ' + kind,
      fill: new fabric.Pattern({ source: t, repeat: 'repeat' }),
      selectable: true
    });
    canvas.add(r);
    r.sendToBack();
    canvas.requestRenderAll();
    ENGINE.snapshot();
    LAYERS.render();
    toast('Pattern applied');
  }

  /* ── Magic palette ── */
  function hslHex(s) {
    var m = s.match(/[\d.]+/g).map(Number);
    var h = m[0], sa = m[1], l = m[2];
    var a = sa / 100 * Math.min(l / 100, 1 - l / 100);
    var f = function (n) {
      var k = (n + h / 30) % 12;
      var c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(255 * c).toString(16).padStart(2, '0');
    };
    return '#' + f(0) + f(8) + f(4);
  }

  function genPalette() {
    var h = Math.floor(Math.random() * 360);
    var shift = [30, 150, 180][Math.floor(Math.random() * 3)];
    return [
      'hsl(' + h + ',68%,18%)', 'hsl(' + h + ',62%,34%)',
      'hsl(' + ((h + shift) % 360) + ',88%,55%)', 'hsl(' + ((h + shift) % 360) + ',92%,72%)',
      'hsl(' + h + ',30%,96%)'
    ].map(hslHex);
  }

  /* ── Comment pins ── */
  function injectCommentLayer() {
    var shell = document.getElementById('boardShell');
    if (!shell || document.getElementById('proCommentLayer')) return;
    var layer = document.createElement('div');
    layer.id = 'proCommentLayer';
    shell.appendChild(layer);
    layer.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pin]');
      if (!b) return;
      var c = comments[+b.dataset.pin];
      if (confirm('Comment ' + (+b.dataset.pin + 1) + ': ' + c.text + '\n\nOK = resolve · Cancel = keep')) {
        c.done = !c.done;
        saveComments();
        renderPins();
      }
    });
    canvas.on('mouse:down', function (opt) {
      if (!pinMode || opt.target) return;
      var shellR = shell.getBoundingClientRect();
      var e = opt.e;
      var text = prompt('Add comment');
      if (!text) return;
      comments.push({
        x: (e.clientX - shellR.left) / shellR.width,
        y: (e.clientY - shellR.top) / shellR.height,
        text: text,
        done: false
      });
      saveComments();
      renderPins();
      pinMode = false;
      toast('Comment pinned');
    });
  }

  function renderPins() {
    var layer = document.getElementById('proCommentLayer');
    if (!layer) return;
    layer.innerHTML = comments.map(function (c, i) {
      return '<button type="button" data-pin="' + i + '" class="' + (c.done ? 'open' : 'pending') + '" style="left:' + (c.x * 100) + '%;top:' + (c.y * 100) + '%" title="' + (c.text || '').replace(/"/g, '') + '">' + (i + 1) + '</button>';
    }).join('');
  }

  /* ── Version history ── */
  function saveVersion(name) {
    if (window.AuroraPro && AuroraPro.commitPage) AuroraPro.commitPage();
    var store = versionsStore();
    var list = store.all();
    var thumb = '';
    try { thumb = canvas.toDataURL({ format: 'jpeg', quality: 0.5, multiplier: 0.2 }); } catch (e) { }
    list.unshift({
      id: 'v' + Date.now(),
      name: name || ('Version ' + (list.length + 1)),
      data: AuroraPro ? AuroraPro.projectJSON() : {},
      thumb: thumb,
      at: Date.now()
    });
    store.write(list);
    toast('Version saved');
    renderVersionsList();
  }

  function restoreVersion(id) {
    var doc = versionsStore().all().find(function (v) { return v.id === id; });
    if (!doc || !doc.data) return;
    if (window.AuroraProSuite) AuroraProSuite.openShared(doc.data);
    else if (window.AuroraPro) AuroraPro.loadProjectData(doc.data);
    closeVersionsModal();
    toast('Version restored');
  }

  function injectVersionsModal() {
    if (document.getElementById('proVersionsModal')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<div id="proVersionsModal" role="dialog">' +
      '<div class="glass w-full max-w-lg rounded-2xl p-5">' +
      '<div class="mb-3 flex items-center justify-between">' +
      '<h3 class="text-lg font-extrabold">Version History</h3>' +
      '<button type="button" id="proVerClose" class="tr chip rounded-lg px-3 py-1 text-[12px]">✕</button></div>' +
      '<button type="button" id="proVerSave" class="tr mb-3 w-full rounded-xl bg-cyan-400/20 py-2 text-[12px] font-bold text-cyan-200">Save current version</button>' +
      '<div id="proVerList" class="max-h-[50vh] space-y-2 overflow-y-auto"></div></div></div>');
    document.getElementById('proVerClose').onclick = closeVersionsModal;
    document.getElementById('proVerSave').onclick = function () {
      var n = prompt('Version name', 'Version ' + new Date().toLocaleTimeString());
      if (n !== null) saveVersion(n.trim());
    };
    document.getElementById('proVersionsModal').addEventListener('click', function (e) {
      if (e.target.id === 'proVersionsModal') closeVersionsModal();
    });
  }

  function renderVersionsList() {
    var list = document.getElementById('proVerList');
    if (!list) return;
    var versions = versionsStore().all();
    list.innerHTML = versions.length ? versions.map(function (v) {
      return '<div class="chip flex items-center gap-2 rounded-xl px-3 py-2">' +
        (v.thumb ? '<img src="' + v.thumb + '" class="h-10 w-10 rounded object-cover" alt="" />' : '') +
        '<div class="min-w-0 flex-1"><p class="truncate text-[11px] font-bold">' + v.name + '</p>' +
        '<p class="text-[9px] text-slate-500">' + new Date(v.at).toLocaleString() + '</p></div>' +
        '<button type="button" data-vrestore="' + v.id + '" class="tr text-[10px] text-cyan-300">Restore</button>' +
        '<button type="button" data-vdel="' + v.id + '" class="tr text-[10px] text-rose-300">×</button></div>';
    }).join('') : '<p class="text-[11px] text-slate-500">No saved versions yet.</p>';
    list.querySelectorAll('[data-vrestore]').forEach(function (b) {
      b.onclick = function () { restoreVersion(b.dataset.vrestore); };
    });
    list.querySelectorAll('[data-vdel]').forEach(function (b) {
      b.onclick = function () {
        versionsStore().write(versionsStore().all().filter(function (x) { return x.id !== b.dataset.vdel; }));
        renderVersionsList();
      };
    });
  }

  function openVersionsModal() {
    renderVersionsList();
    document.getElementById('proVersionsModal').classList.add('open');
  }

  function closeVersionsModal() {
    document.getElementById('proVersionsModal').classList.remove('open');
  }

  /* ── Component variants ── */
  function getVariants() {
    try { return JSON.parse(localStorage.getItem(LS_VARIANTS) || '{}'); } catch (e) { return {}; }
  }
  function saveVariants(map) { localStorage.setItem(LS_VARIANTS, JSON.stringify(map)); }

  function saveComponentVariant() {
    var o = canvas.getActiveObject();
    if (!o) return toast('Select a component object');
    var compId = o.componentId || prompt('Component ID (link variants)', 'btn-primary');
    if (!compId) return;
    var vName = prompt('Variant name', 'hover');
    if (!vName) return;
    o.clone(function (cloned) {
      var map = getVariants();
      if (!map[compId]) map[compId] = { name: compId, variants: [] };
      map[compId].variants = map[compId].variants.filter(function (v) { return v.name !== vName; });
      map[compId].variants.push({ name: vName, json: cloned.toObject(SNAP_PROPS) });
      saveVariants(map);
      o.componentId = compId;
      o.variantKey = vName;
      ENGINE.snapshot();
      toast('Variant "' + vName + '" saved');
    }, SNAP_PROPS);
  }

  function applyComponentVariant(compId, vName) {
    var map = getVariants();
    var comp = map[compId];
    if (!comp) return toast('Component not found');
    var v = comp.variants.find(function (x) { return x.name === vName; });
    if (!v) return;
    fabric.util.enlivenObjects([v.json], function (objs) {
      var o = canvas.getActiveObject();
      if (!o) return;
      var pos = { left: o.left, top: o.top };
      canvas.remove(o);
      objs[0].set(pos);
      objs[0].componentId = compId;
      objs[0].variantKey = vName;
      canvas.add(objs[0]);
      canvas.setActiveObject(objs[0]);
      canvas.requestRenderAll();
      ENGINE.snapshot();
      LAYERS.render();
      toast('Variant applied');
    });
  }

  /* ── Design lint ── */
  function runDesignLint() {
    var issues = [];
    var objs = canvas.getObjects().filter(function (o) { return o.objectName !== '__guide'; });
    if (!objs.length) issues.push({ level: 'warn', msg: 'Canvas is empty' });
    objs.forEach(function (o, i) {
      var b = o.getBoundingRect(true, true);
      if (b.left < -2 || b.top < -2 || b.left + b.width > STATE.W + 2 || b.top + b.height > STATE.H + 2) {
        issues.push({ level: 'warn', msg: '"' + (o.objectName || 'Layer ' + i) + '" extends outside artboard' });
      }
      if ((o.opacity ?? 1) < 0.35) issues.push({ level: 'warn', msg: '"' + (o.objectName || 'Layer') + '" is very faint (opacity < 35%)' });
      if ((o.type === 'textbox' || o.type === 'i-text') && (o.fontSize || 0) < 14) {
        issues.push({ level: 'err', msg: 'Text "' + (o.text || '').slice(0, 20) + '" may be too small for print' });
      }
    });
    if (objs.length > 80) issues.push({ level: 'warn', msg: objs.length + ' layers — consider simplifying' });
    if (!issues.length) issues.push({ level: 'ok', msg: 'Design looks good — no issues found' });
    return issues;
  }

  function renderLintHtml(issues) {
    return issues.map(function (i) {
      return '<p class="pro-lint-' + i.level + '">• ' + i.msg + '</p>';
    }).join('');
  }

  /* ── CSV mail merge (local) ── */
  function applyMergeToJson(json, row) {
    var j = JSON.parse(JSON.stringify(json));
    var objs = j.objects || [];
    objs.forEach(function (o) {
      if (o.type !== 'textbox' && o.type !== 'i-text') return;
      var t = o.text || '';
      Object.keys(row).forEach(function (key) {
        t = t.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'gi'), row[key]);
        t = t.replace(new RegExp('\\$' + key + '\\b', 'gi'), row[key]);
      });
      o.text = t;
    });
    return j;
  }

  function runMailMerge(csvText) {
    var lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return toast('CSV needs header + 1 row');
    var headers = lines[0].split(',').map(function (h) { return h.trim(); });
    var rows = lines.slice(1).map(function (line) {
      var vals = line.split(',');
      var row = {};
      headers.forEach(function (h, i) { row[h] = (vals[i] || '').trim(); });
      return row;
    });
    if (!window.AuroraPro) return toast('Pro not ready');
    AuroraPro.commitPage();
    var proj = AuroraPro.projectJSON();
    var templatePage = JSON.parse(JSON.stringify(proj.pages[proj.pageIdx || 0]));
    proj.pages = rows.map(function (row, idx) {
      var p = JSON.parse(JSON.stringify(templatePage));
      p.id = 'p-merge-' + idx + '-' + Date.now();
      p.name = 'Merge ' + (idx + 1);
      p.json = applyMergeToJson(p.json, row);
      return p;
    });
    proj.pageIdx = 0;
    AuroraPro.loadProjectData(proj);
    toast('Mail merge: ' + rows.length + ' pages created');
  }

  /* ── Bulk ZIP export (all pages PNG) ── */
  function exportAllPagesZip() {
    if (typeof JSZip === 'undefined') return toast('ZIP library loading…');
    if (!window.AuroraPro) return;
    AuroraPro.commitPage();
    var data = AuroraPro.projectJSON();
    var pages = data.pages || [];
    var zip = new JSZip();
    var prevZoom = STATE.zoom;
    ENGINE.applyZoom(1);
    var done = 0;
    function next(i) {
      if (i >= pages.length) {
        ENGINE.applyZoom(prevZoom);
        zip.generateAsync({ type: 'blob' }).then(function (blob) {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'aurora-pages.zip';
          a.click();
          toast('Exported ' + pages.length + ' PNGs');
        });
        return;
      }
      var p = pages[i];
      var el = document.createElement('canvas');
      var tmp = new fabric.StaticCanvas(el, { width: p.w, height: p.h });
      tmp.loadFromJSON(p.json, function () {
        tmp.renderAll();
        var url = tmp.toDataURL({ format: 'png' });
        tmp.dispose();
        zip.file('page-' + (i + 1) + '.png', url.split(',')[1], { base64: true });
        next(i + 1);
      });
    }
    if (!pages.length) {
      zip.file('page-1.png', canvas.toDataURL({ format: 'png' }).split(',')[1], { base64: true });
      ENGINE.applyZoom(prevZoom);
      zip.generateAsync({ type: 'blob' }).then(function (blob) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'aurora-export.zip';
        a.click();
        toast('ZIP exported');
      });
      return;
    }
    next(0);
  }

  /* ── Import JSON project ── */
  function importProjectJson(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var data = JSON.parse(r.result);
        if (data.pages || data.json) {
          if (window.AuroraProSuite) AuroraProSuite.openShared(data);
          else if (window.AuroraPro) AuroraPro.loadProjectData(data);
          toast('Project imported');
        } else if (data.objects) {
          canvas.loadFromJSON(data, function () {
            canvas.renderAll();
            ENGINE.snapshot();
            LAYERS.render();
            toast('Canvas JSON imported');
          });
        } else toast('Unrecognized JSON format');
      } catch (e) { toast('Invalid JSON file'); }
    };
    r.readAsText(file);
  }

  /* ── Drawer panels: assets + collab ── */
  function patchExtrasDrawers() {
    if (typeof PANELS === 'undefined' || PANELS._extrasPatched) return;

    PANELS.assets = function () {
      var pal = genPalette();
      return '<p class="text-[11px] text-slate-400">QR, charts, patterns — all offline.</p>' +
        '<p class="mt-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">QR Code</p>' +
        '<input id="proQrInput" class="fld mt-1" placeholder="https://yoursite.com" />' +
        '<button type="button" id="proQrBtn" class="chip tr mt-2 w-full rounded-lg py-2 text-[11px] font-semibold">Generate QR</button>' +
        '<p class="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Charts</p>' +
        '<input id="proChartVals" class="fld mt-1" placeholder="10,25,40,15" value="10,25,40,15" />' +
        '<div class="mt-2 flex gap-2">' +
        '<button type="button" data-chart="bar" class="chip tr flex-1 rounded-lg py-2 text-[10px]">Bar chart</button>' +
        '<button type="button" data-chart="pie" class="chip tr flex-1 rounded-lg py-2 text-[10px]">Pie chart</button></div>' +
        '<p class="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Pattern backdrop</p>' +
        '<div class="grid grid-cols-2 gap-1.5 mt-1">' +
        ['dots', 'lines', 'cross', 'noise'].map(function (k) {
          return '<button type="button" data-pattern="' + k + '" class="chip tr rounded-lg py-2 text-[10px] capitalize">' + k + '</button>';
        }).join('') + '</div>' +
        '<p class="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Magic palette</p>' +
        '<div class="pro-palette-row" id="proPalRow">' +
        pal.map(function (c) { return '<button type="button" class="pro-palette-swatch" data-pal="' + c + '" style="background:' + c + '"></button>'; }).join('') +
        '</div>' +
        '<button type="button" id="proPalGen" class="chip tr mt-2 w-full rounded-lg py-2 text-[10px]">↻ New palette</button>' +
        '<p class="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Import / Export</p>' +
        '<button type="button" id="proImportJson" class="chip tr w-full rounded-lg py-2 text-[11px]">Import JSON project</button>' +
        '<button type="button" id="proExportZip" class="chip tr mt-2 w-full rounded-lg py-2 text-[11px]">Export all pages ZIP</button>' +
        '<input id="proImportFile" type="file" accept=".json,application/json" class="hidden" />';
    };

    PANELS.collab = function () {
      var issues = runDesignLint();
      return '<p class="text-[11px] text-slate-400">Comments, versions, lint — no cloud needed.</p>' +
        '<button type="button" id="proPinMode" class="chip tr mt-2 w-full rounded-lg py-2.5 text-[11px] font-semibold">📌 Pin comment on canvas</button>' +
        '<button type="button" id="proVersionsBtn" class="chip tr w-full rounded-lg py-2 text-[11px]">🕐 Version history</button>' +
        '<button type="button" id="proSaveVariant" class="chip tr w-full rounded-lg py-2 text-[11px]">⊞ Save component variant</button>' +
        '<p class="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Mail merge (CSV)</p>' +
        '<p class="text-[9px] text-slate-500">Use {{name}} in text layers. CSV: name,title</p>' +
        '<textarea id="proCsvInput" class="fld mt-1 min-h-[60px] text-[10px]" placeholder="name,title&#10;Alice,CEO&#10;Bob,CTO"></textarea>' +
        '<button type="button" id="proCsvRun" class="chip tr mt-2 w-full rounded-lg py-2 text-[10px]">Run mail merge</button>' +
        '<p class="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Design lint</p>' +
        '<div id="proLintOut">' + renderLintHtml(issues) + '</div>' +
        '<button type="button" id="proLintRefresh" class="chip tr mt-2 w-full rounded-lg py-1.5 text-[10px]">Re-check design</button>';
    };

    var origOpen = DRAWER.open;
    DRAWER.open = function (tab) {
      if (tab === 'assets' || tab === 'collab') {
        STATE.tab = tab;
        document.getElementById('leftDrawer').classList.remove('drawer-collapsed');
        document.getElementById('drawerTitle').textContent = tab === 'assets' ? 'Assets & Tools' : 'Collab & QA';
        document.getElementById('drawer').innerHTML = PANELS[tab]();
        document.querySelectorAll('.railBtn').forEach(function (b) {
          b.classList.toggle('on', b.dataset.tab === tab);
        });
        bindExtrasDrawer(tab);
        return;
      }
      return origOpen.call(DRAWER, tab);
    };
    PANELS._extrasPatched = true;
  }

  function bindExtrasDrawer(tab) {
    var d = document.getElementById('drawer');
    if (tab === 'assets') {
      d.querySelector('#proQrBtn')?.addEventListener('click', function () {
        addQR(d.querySelector('#proQrInput').value.trim());
      });
      d.querySelectorAll('[data-chart]').forEach(function (b) {
        b.onclick = function () { addChart(b.dataset.chart, d.querySelector('#proChartVals').value); };
      });
      d.querySelectorAll('[data-pattern]').forEach(function (b) {
        b.onclick = function () { patternBg(b.dataset.pattern); };
      });
      d.querySelector('#proPalGen')?.addEventListener('click', function () {
        var row = d.querySelector('#proPalRow');
        var pal = genPalette();
        row.innerHTML = pal.map(function (c) {
          return '<button type="button" class="pro-palette-swatch" data-pal="' + c + '" style="background:' + c + '"></button>';
        }).join('');
        bindPaletteSwatches(d);
      });
      bindPaletteSwatches(d);
      d.querySelector('#proImportJson')?.addEventListener('click', function () {
        d.querySelector('#proImportFile').click();
      });
      d.querySelector('#proImportFile')?.addEventListener('change', function (e) {
        if (e.target.files[0]) importProjectJson(e.target.files[0]);
        e.target.value = '';
      });
      d.querySelector('#proExportZip')?.addEventListener('click', exportAllPagesZip);
    }
    if (tab === 'collab') {
      d.querySelector('#proPinMode')?.addEventListener('click', function () {
        pinMode = !pinMode;
        d.querySelector('#proPinMode').classList.toggle('on', pinMode);
        toast(pinMode ? 'Click canvas to pin comment' : 'Pin mode off');
      });
      d.querySelector('#proVersionsBtn')?.addEventListener('click', openVersionsModal);
      d.querySelector('#proSaveVariant')?.addEventListener('click', saveComponentVariant);
      d.querySelector('#proCsvRun')?.addEventListener('click', function () {
        runMailMerge(d.querySelector('#proCsvInput').value);
      });
      d.querySelector('#proLintRefresh')?.addEventListener('click', function () {
        d.querySelector('#proLintOut').innerHTML = renderLintHtml(runDesignLint());
      });
    }
  }

  function bindPaletteSwatches(d) {
    d.querySelectorAll('[data-pal]').forEach(function (b) {
      b.onclick = function () {
        var col = b.dataset.pal;
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
  }

  function injectExtrasRails() {
    var nav = document.querySelector('nav.obsidian-rail');
    if (!nav || document.querySelector('[data-tab="assets"]')) return;
    [['assets', '📦', 'Assets'], ['collab', '💬', 'Collab']].forEach(function (item) {
      var btn = document.createElement('button');
      btn.className = 'railBtn tr grid h-11 w-11 place-items-center rounded-xl text-[14px]';
      btn.dataset.tab = item[0];
      btn.setAttribute('aria-label', item[2]);
      btn.textContent = item[1];
      nav.appendChild(btn);
      btn.onclick = function () {
        if (STATE.tab === item[0] && !document.getElementById('leftDrawer').classList.contains('drawer-collapsed')) {
          document.getElementById('leftDrawer').classList.add('drawer-collapsed');
          btn.classList.remove('on');
          return;
        }
        DRAWER.open(item[0]);
      };
    });
  }

  /* ── UX: Alt+drag duplicate, aspect lock, pixel snap, number scrub ── */
  function bindUxEnhancements() {
    var dupClone = null;
    canvas.on('mouse:down', function (opt) {
      if (opt.e.altKey && opt.target && !opt.target.isEditing) {
        opt.target.clone(function (c) {
          c.set({ left: (opt.target.left || 0) + 20, top: (opt.target.top || 0) + 20, objectName: (opt.target.objectName || 'Copy') + ' copy' });
          canvas.add(c);
          canvas.setActiveObject(c);
          dupClone = c;
          canvas.requestRenderAll();
        }, SNAP_PROPS);
      }
    });
    canvas.on('mouse:up', function () {
      if (dupClone) { ENGINE.snapshot(); LAYERS.render(); dupClone = null; }
    });

    canvas.on('object:scaling', function (e) {
      if (!e.e || !e.e.shiftKey) return;
      var o = e.target;
      if (!o) return;
      var s = Math.max(o.scaleX || 1, o.scaleY || 1);
      o.set({ scaleX: s, scaleY: s });
    });

    canvas.on('object:moving', function (e) {
      if (!pixelSnap || !e.target) return;
      e.target.set({
        left: Math.round(e.target.left || 0),
        top: Math.round(e.target.top || 0)
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'P' && e.shiftKey && !e.ctrlKey) {
        pixelSnap = !pixelSnap;
        toast('Pixel grid snap ' + (pixelSnap ? 'on' : 'off'));
      }
    });

    patchNumberScrubbing();
  }

  function patchNumberScrubbing() {
    document.addEventListener('mousedown', function (e) {
      var label = e.target.closest('.pro-scrub-label');
      if (!label) return;
      var inputId = label.getAttribute('for') || label.dataset.for;
      var input = inputId ? document.getElementById(inputId) : label.nextElementSibling;
      if (!input || input.type !== 'number') return;
      e.preventDefault();
      var startX = e.clientX;
      var startVal = +input.value || 0;
      function move(ev) {
        var delta = ev.clientX - startX;
        input.value = Math.round(startVal + delta);
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      function up() {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      }
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
  }

  function patchInspectorScrubLabels() {
    if (typeof INSPECTOR === 'undefined' || INSPECTOR._scrubPatched) return;
    var orig = INSPECTOR.render;
    INSPECTOR.render = function () {
      orig.call(INSPECTOR);
      ['proX', 'proY', 'proW', 'proH', 'proRot', 'proSkX', 'proSkY'].forEach(function (id) {
        var inp = document.getElementById(id);
        if (!inp) return;
        var lab = inp.closest('label');
        if (lab && !lab.classList.contains('pro-scrub-label')) {
          lab.classList.add('pro-scrub-label');
          lab.title = 'Drag label to scrub value';
        }
      });
    };
    INSPECTOR._scrubPatched = true;
  }

  /* ── Print preview export (CMYK simulation — color shift only) ── */
  function exportPrintPreview() {
    var prevZoom = STATE.zoom;
    ENGINE.applyZoom(1);
    var url = canvas.toDataURL({ format: 'jpeg', quality: 0.92, multiplier: 2 });
    var img = new Image();
    img.onload = function () {
      var cv = document.createElement('canvas');
      cv.width = img.width;
      cv.height = img.height;
      var ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0);
      var d = ctx.getImageData(0, 0, cv.width, cv.height);
      var p = d.data;
      for (var i = 0; i < p.length; i += 4) {
        var r = p[i], g = p[i + 1], b = p[i + 2];
        p[i] = Math.min(255, r * 0.92);
        p[i + 1] = Math.min(255, g * 0.88);
        p[i + 2] = Math.min(255, b * 0.85);
      }
      ctx.putImageData(d, 0, 0);
      var a = document.createElement('a');
      a.href = cv.toDataURL('image/jpeg', 0.92);
      a.download = 'aurora-print-preview.jpg';
      a.click();
      ENGINE.applyZoom(prevZoom);
      toast('Print preview exported (CMYK simulation)');
    };
    img.src = url;
  }

  function registerCommands() {
    if (!window.AuroraToolHub) return;
    AuroraToolHub.register([
      { id: 'extras-assets', label: 'Assets & tools', icon: '📦', group: 'Tools', quick: true, run: function () { DRAWER.open('assets'); } },
      { id: 'extras-collab', label: 'Collab & QA', icon: '💬', group: 'Tools', run: function () { DRAWER.open('collab'); } },
      { id: 'extras-versions', label: 'Version history', icon: '🕐', group: 'Pro', run: openVersionsModal },
      { id: 'extras-zip', label: 'Export all pages ZIP', icon: '📦', group: 'Export', run: exportAllPagesZip },
      { id: 'extras-print', label: 'Print preview export', icon: '🖨', group: 'Export', run: exportPrintPreview },
      { id: 'extras-lint', label: 'Run design lint', icon: '✓', group: 'Pro', run: function () { toast(runDesignLint().map(function (i) { return i.msg; }).join(' · ')); } },
      { id: 'extras-variant', label: 'Save component variant', icon: '⊞', group: 'Pro', run: saveComponentVariant },
      { id: 'extras-pixel', label: 'Toggle pixel snap', icon: '⊞', keys: 'Shift+P', group: 'View', run: function () { pixelSnap = !pixelSnap; toast('Pixel snap ' + (pixelSnap ? 'on' : 'off')); } }
    ]);
    AuroraToolHub.registerShortcuts([
      { label: 'Pixel snap', keys: 'Shift+P' },
      { label: 'Duplicate while drag', keys: 'Alt+Drag' },
      { label: 'Lock aspect ratio', keys: 'Shift+Scale' }
    ]);
  }

  function init() {
    loadComments();
    injectSyncIndicator();
    injectCommentLayer();
    injectVersionsModal();
    patchExtrasDrawers();
    injectExtrasRails();
    patchInspectorScrubLabels();
    bindUxEnhancements();
    renderPins();
    registerCommands();

    ['object:added', 'object:removed', 'object:modified'].forEach(function (ev) {
      canvas.on(ev, scheduleSyncDirty);
    });

    if (typeof EXPORT !== 'undefined' && !EXPORT._printPatched) {
      var fmt = document.getElementById('expFormat');
      if (fmt && !fmt.querySelector('[value="print"]')) {
        fmt.insertAdjacentHTML('beforeend', '<option value="print">Print Preview</option>');
      }
      var origRun = EXPORT.run;
      EXPORT.run = function () {
        if (document.getElementById('expFormat').value === 'print') return exportPrintPreview();
        return origRun.call(EXPORT);
      };
      EXPORT._printPatched = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 120);
  }

  window.AuroraProExtras = {
    addQR: addQR,
    addChart: addChart,
    saveVersion: saveVersion,
    runDesignLint: runDesignLint,
    exportAllPagesZip: exportAllPagesZip,
    exportPrintPreview: exportPrintPreview,
    saveComponentVariant: saveComponentVariant,
    applyComponentVariant: applyComponentVariant,
    runMailMerge: runMailMerge
  };
})();
