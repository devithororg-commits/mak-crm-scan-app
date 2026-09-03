(function (global) {
  'use strict';

  var TH = { commands: [], shortcuts: [], app: '', _built: false, _activeIdx: 0 };

  function q(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  function click(sel) {
    var el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (el) el.click();
  }

  function runTab(tab) {
    var btn = document.querySelector('[data-tab="' + tab + '"]') || document.querySelector('[data-ltab="' + tab + '"]') || document.querySelector('[data-rtab="' + tab + '"]');
    if (btn) btn.click();
  }

  TH.register = function (cmds) {
    TH.commands = TH.commands.concat(cmds || []);
    if (TH._built) TH.renderPaletteList('');
  };

  TH.registerShortcuts = function (rows) {
    TH.shortcuts = TH.shortcuts.concat(rows || []);
  };

  function buildShell() {
    if (TH._built) return;
    TH._built = true;

    var palette = document.createElement('div');
    palette.id = 'auroraPalette';
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-modal', 'true');
    palette.setAttribute('aria-label', 'Command palette');
    palette.innerHTML =
      '<div class="aurora-palette-box">' +
      '<input id="auroraPaletteInput" type="search" placeholder="Search tools… (type to filter)" autocomplete="off" />' +
      '<div id="auroraPaletteList"></div>' +
      '</div>';
    document.body.appendChild(palette);

    var shortcuts = document.createElement('div');
    shortcuts.id = 'auroraShortcuts';
    shortcuts.setAttribute('role', 'dialog');
    shortcuts.setAttribute('aria-modal', 'true');
    shortcuts.setAttribute('aria-label', 'Keyboard shortcuts');
    shortcuts.innerHTML = '<div class="aurora-shortcuts-box" id="auroraShortcutsBody"></div>';
    document.body.appendChild(shortcuts);

    var dock = document.createElement('div');
    dock.id = 'auroraQuickDock';
    dock.innerHTML =
      '<div class="aurora-dock-expanded" id="auroraDockExpanded"></div>' +
      '<div class="aurora-dock-main" id="auroraDockMain"></div>';
    document.body.appendChild(dock);

    q('auroraPaletteInput').addEventListener('input', function (e) {
      TH.renderPaletteList(e.target.value);
    });
    q('auroraPaletteInput').addEventListener('keydown', function (e) {
      var items = palette.querySelectorAll('.aurora-palette-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        TH._activeIdx = Math.min(TH._activeIdx + 1, items.length - 1);
        TH.highlightItem(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        TH._activeIdx = Math.max(TH._activeIdx - 1, 0);
        TH.highlightItem(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[TH._activeIdx]) items[TH._activeIdx].click();
      } else if (e.key === 'Escape') {
        TH.closePalette();
      }
    });
    palette.addEventListener('click', function (e) {
      if (e.target === palette) TH.closePalette();
    });
    shortcuts.addEventListener('click', function (e) {
      if (e.target === shortcuts) TH.closeShortcuts();
    });

    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        TH.togglePalette();
        return;
      }
      if (!typing && e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        TH.toggleShortcuts();
        return;
      }
      if (e.key === 'Escape') {
        if (palette.classList.contains('open')) TH.closePalette();
        if (shortcuts.classList.contains('open')) TH.closeShortcuts();
        if (dock.classList.contains('expanded')) dock.classList.remove('expanded');
      }
    });
  }

  TH.highlightItem = function (items) {
    items.forEach(function (el, i) {
      el.classList.toggle('active', i === TH._activeIdx);
      if (i === TH._activeIdx) el.scrollIntoView({ block: 'nearest' });
    });
  };

  TH.renderPaletteList = function (query) {
    var list = q('auroraPaletteList');
    if (!list) return;
    var qry = (query || '').trim().toLowerCase();
    var filtered = TH.commands.filter(function (c) {
      if (!qry) return true;
      return (c.label + ' ' + (c.group || '') + ' ' + (c.keys || '')).toLowerCase().indexOf(qry) >= 0;
    });
    if (!filtered.length) {
      list.innerHTML = '<div class="aurora-palette-empty">No tools match “' + esc(qry) + '”</div>';
      return;
    }
    var groups = {};
    filtered.forEach(function (c) {
      var g = c.group || 'Tools';
      if (!groups[g]) groups[g] = [];
      groups[g].push(c);
    });
    var html = '';
    Object.keys(groups).forEach(function (g) {
      html += '<div class="aurora-palette-group">' + esc(g) + '</div>';
      groups[g].forEach(function (c) {
        html += '<button type="button" class="aurora-palette-item" data-cmd="' + esc(c.id) + '">' +
          '<span class="aurora-palette-icon">' + (c.icon || '⚡') + '</span>' +
          '<span class="aurora-palette-label">' + esc(c.label) + '</span>' +
          (c.keys ? '<span class="aurora-palette-keys">' + esc(c.keys) + '</span>' : '') +
          '</button>';
      });
    });
    list.innerHTML = html;
    TH._activeIdx = 0;
    TH.highlightItem(list.querySelectorAll('.aurora-palette-item'));
    list.querySelectorAll('.aurora-palette-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.cmd;
        var cmd = TH.commands.find(function (c) { return c.id === id; });
        if (cmd && cmd.run) {
          TH.closePalette();
          try { cmd.run(); } catch (err) { console.error('ToolHub:', err); }
        }
      });
    });
  };

  TH.openPalette = function () {
    buildShell();
    var p = q('auroraPalette');
    p.classList.add('open');
    var inp = q('auroraPaletteInput');
    inp.value = '';
    TH.renderPaletteList('');
    setTimeout(function () { inp.focus(); }, 30);
  };

  TH.closePalette = function () {
    var p = q('auroraPalette');
    if (p) p.classList.remove('open');
  };

  TH.togglePalette = function () {
    var p = q('auroraPalette');
    if (p && p.classList.contains('open')) TH.closePalette();
    else TH.openPalette();
  };

  TH.renderShortcuts = function () {
    var body = q('auroraShortcutsBody');
    if (!body) return;
    var rows = TH.shortcuts.length ? TH.shortcuts : [
      { label: 'Open command palette', keys: 'Ctrl+K' },
      { label: 'Keyboard shortcuts', keys: '?' }
    ];
    body.innerHTML = '<h2>Keyboard shortcuts</h2>' + rows.map(function (r) {
      return '<div class="aurora-shortcut-row"><span>' + esc(r.label) + '</span><kbd>' + esc(r.keys) + '</kbd></div>';
    }).join('') + '<p style="margin-top:.75rem;font-size:11px;color:#64748b">Press <kbd>?</kbd> or <kbd>Esc</kbd> to close</p>';
  };

  TH.openShortcuts = function () {
    buildShell();
    TH.renderShortcuts();
    q('auroraShortcuts').classList.add('open');
  };

  TH.closeShortcuts = function () {
    var s = q('auroraShortcuts');
    if (s) s.classList.remove('open');
  };

  TH.toggleShortcuts = function () {
    var s = q('auroraShortcuts');
    if (s && s.classList.contains('open')) TH.closeShortcuts();
    else TH.openShortcuts();
  };

  TH.renderDock = function (dockIds) {
    buildShell();
    var main = q('auroraDockMain');
    var expanded = q('auroraDockExpanded');
    if (!main) return;

    var dockCmds = dockIds
      ? TH.commands.filter(function (c) { return dockIds.indexOf(c.id) >= 0; })
      : TH.commands.filter(function (c) { return c.dock; }).slice(0, 5);

    main.innerHTML = dockCmds.map(function (c) {
      return '<button type="button" class="aurora-dock-btn" title="' + esc(c.label) + '" data-dock="' + esc(c.id) + '">' + (c.icon || '⚡') + '</button>';
    }).join('') +
      '<button type="button" class="aurora-dock-fab" id="auroraDockFab" title="All tools (Ctrl+K)">✦</button>';

    main.querySelectorAll('[data-dock]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cmd = TH.commands.find(function (c) { return c.id === btn.dataset.dock; });
        if (cmd && cmd.run) cmd.run();
      });
    });
    q('auroraDockFab').addEventListener('click', function () { TH.togglePalette(); });

    var more = TH.commands.filter(function (c) { return c.quick; });
    expanded.innerHTML = more.map(function (c) {
      return '<button type="button" class="aurora-dock-chip" data-quick="' + esc(c.id) + '">' +
        (c.icon || '') + ' ' + esc(c.label) + '</button>';
    }).join('');
    expanded.querySelectorAll('[data-quick]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cmd = TH.commands.find(function (c) { return c.id === btn.dataset.quick; });
        if (cmd && cmd.run) { cmd.run(); q('auroraQuickDock').classList.remove('expanded'); }
      });
    });

    var expandBtn = document.createElement('button');
    expandBtn.type = 'button';
    expandBtn.className = 'aurora-dock-btn';
    expandBtn.title = 'More tools';
    expandBtn.textContent = '⋯';
    expandBtn.addEventListener('click', function () {
      q('auroraQuickDock').classList.toggle('expanded');
    });
    main.insertBefore(expandBtn, q('auroraDockFab'));
  };

  TH.injectHeaderButton = function (anchorSelector) {
    buildShell();
    var anchor = document.querySelector(anchorSelector);
    if (!anchor || q('auroraHubBtn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'auroraHubBtn';
    btn.className = 'aurora-hub-trigger';
    btn.innerHTML = '<span class="aurora-hub-label">Tools</span> <span class="aurora-hub-kbd">Ctrl+K</span>';
    btn.title = 'Open command palette (Ctrl+K)';
    btn.addEventListener('click', function () { TH.togglePalette(); });
    anchor.insertBefore(btn, anchor.firstChild);
  };

  TH.init = function (opts) {
    opts = opts || {};
    TH.app = opts.app || '';
    buildShell();
    if (opts.headerAnchor) TH.injectHeaderButton(opts.headerAnchor);
    if (opts.dock) TH.renderDock(opts.dock);
    if (opts.commands) TH.register(opts.commands);
    if (opts.shortcuts) TH.registerShortcuts(opts.shortcuts);
  };

  /* Helpers exported for app scripts */
  TH.click = click;
  TH.runTab = runTab;

  global.AuroraToolHub = TH;
})(window);
