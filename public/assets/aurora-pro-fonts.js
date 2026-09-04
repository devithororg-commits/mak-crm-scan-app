/* Aurora Pro — Custom font upload (TTF/OTF/WOFF/WOFF2) */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app') && !document.body.classList.contains('studio-app')) return;

  var LS_KEY = 'aurora-custom-fonts';
  var ACCEPT = '.ttf,.otf,.woff,.woff2';

  function loadStored() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { return []; }
  }

  function saveStored(list) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function injectFontFace(name, dataUrl) {
    var id = 'aurora-font-' + name.replace(/\W+/g, '-').toLowerCase();
    if (document.getElementById(id)) return;
    var style = document.createElement('style');
    style.id = id;
    style.textContent = '@font-face{font-family:"' + name.replace(/"/g, '') + '";src:url("' + dataUrl + '");font-display:swap;}';
    document.head.appendChild(style);
  }

  function restoreFonts() {
    loadStored().forEach(function (f) {
      if (f.name && f.data) injectFontFace(f.name, f.data);
    });
  }

  function addToPickers(name) {
    document.querySelectorAll('select#tFont, select#ctxFont, select[id*="Font"]').forEach(function (sel) {
      if ([].some.call(sel.options, function (o) { return o.value === name || o.text === name; })) return;
      var opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name + ' (custom)';
      sel.appendChild(opt);
    });
    if (typeof FONTS !== 'undefined' && FONTS.custom) {
      if (FONTS.custom.indexOf(name) < 0) FONTS.custom.push(name);
    }
  }

  function handleFiles(files) {
    [].forEach.call(files, function (file) {
      var ext = (file.name.split('.').pop() || '').toLowerCase();
      if (['ttf', 'otf', 'woff', 'woff2'].indexOf(ext) < 0) {
        if (typeof toast === 'function') toast('Only TTF, OTF, WOFF, WOFF2 fonts');
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        if (typeof toast === 'function') toast('Font must be under 4MB');
        return;
      }
      var rd = new FileReader();
      rd.onload = function () {
        var name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
        var data = rd.result;
        injectFontFace(name, data);
        var list = loadStored();
        list = list.filter(function (f) { return f.name !== name; });
        list.unshift({ name: name, data: data });
        if (list.length > 12) list = list.slice(0, 12);
        saveStored(list);
        addToPickers(name);
        if (typeof toast === 'function') toast('Font loaded: ' + name);
        renderList();
      };
      rd.readAsDataURL(file);
    });
  }

  function removeFont(name) {
    var list = loadStored().filter(function (f) { return f.name !== name; });
    saveStored(list);
    var id = 'aurora-font-' + name.replace(/\W+/g, '-').toLowerCase();
    document.getElementById(id)?.remove();
    renderList();
    if (typeof toast === 'function') toast('Font removed');
  }

  function renderList() {
    var host = document.getElementById('proFontList');
    if (!host) return;
    var list = loadStored();
    if (!list.length) {
      host.innerHTML = '<p class="text-[10px] text-slate-500">No custom fonts yet.</p>';
      return;
    }
    host.innerHTML = list.map(function (f) {
      return '<div class="pro-font-chip"><span>' + f.name + '</span>' +
        '<button type="button" data-rm-font="' + f.name.replace(/"/g, '') + '">Remove</button></div>';
    }).join('');
    host.querySelectorAll('[data-rm-font]').forEach(function (b) {
      b.onclick = function () { removeFont(b.dataset.rmFont); };
    });
  }

  function fontUploadHTML() {
    return '<div class="pro-font-block mt-4">' +
      '<p class="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Upload fonts</p>' +
      '<div class="pro-font-upload-zone" id="proFontDrop">' +
      '<p class="text-[11px] font-semibold text-slate-300">Drop TTF / OTF / WOFF</p>' +
      '<p class="mt-1 text-[10px] text-slate-500">or click to browse · max 4MB</p>' +
      '</div>' +
      '<input type="file" id="proFontInput" accept="' + ACCEPT + '" multiple class="hidden" />' +
      '<div id="proFontList" class="mt-3 space-y-1.5"></div></div>';
  }

  function bindUploadZone() {
    var drop = document.getElementById('proFontDrop');
    var input = document.getElementById('proFontInput');
    if (!drop || drop._bound) return;
    drop._bound = true;
    drop.onclick = function () { input.click(); };
    input.onchange = function () { handleFiles(input.files); input.value = ''; };
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.classList.remove('drag');
        if (ev === 'drop' && e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
      });
    });
    renderList();
  }

  function injectIntoDrawer() {
    var drawer = document.getElementById('drawer');
    if (!drawer || drawer.querySelector('.pro-font-block')) return;
    var textPanel = drawer.querySelector('#tFont')?.closest('section');
    if (textPanel) {
      textPanel.insertAdjacentHTML('beforeend', fontUploadHTML());
      bindUploadZone();
    }
  }

  function injectStudioPanel() {
    if (!document.body.classList.contains('studio-app')) return;
    var panel = document.getElementById('leftPanel');
    if (!panel || document.getElementById('studioFontBlock')) return;
    var div = document.createElement('div');
    div.id = 'studioFontBlock';
    div.className = 'hidden border-t border-navy-100 p-3';
    div.innerHTML = fontUploadHTML();
    panel.appendChild(div);
    bindUploadZone();
  }

  function watchDrawer() {
    if (document.body.classList.contains('obsidian-app')) {
      var obs = new MutationObserver(function () { injectIntoDrawer(); });
      var drawer = document.getElementById('drawer');
      if (drawer) obs.observe(drawer, { childList: true, subtree: true });
      setInterval(injectIntoDrawer, 2000);
    }
  }

  function init() {
    restoreFonts();
    loadStored().forEach(function (f) { addToPickers(f.name); });
    watchDrawer();
    injectStudioPanel();
    if (window.AuroraToolHub) {
      AuroraToolHub.register([
        { id: 'pro-fonts', label: 'Upload custom font', icon: 'Aa', group: 'Brand', run: function () {
          if (document.getElementById('proFontInput')) document.getElementById('proFontInput').click();
          else if (document.getElementById('studioFontInput')) document.getElementById('studioFontInput').click();
        }}
      ]);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 500);

  window.AuroraProFonts = { upload: handleFiles, list: loadStored, html: fontUploadHTML };
})();
