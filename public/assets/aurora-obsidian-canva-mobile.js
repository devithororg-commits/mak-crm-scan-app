/* Obsidian Pro — Canva-style mobile contextual toolbar */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app')) return;

  var MQ = window.matchMedia('(max-width: 1023px)');
  var COARSE_MQ = window.matchMedia('(hover: none) and (pointer: coarse)');
  var activePanel = null;
  var editMode = false;
  var miniRaf = null;

  function isMobile() { return MQ.matches || (COARSE_MQ.matches && window.innerWidth <= 1100); }

  function $(sel) { return document.querySelector(sel); }

  function haptic() {
    try { if (navigator.vibrate) navigator.vibrate(10); } catch (e) {}
  }

  function getObj() {
    return typeof canvas !== 'undefined' ? canvas.getActiveObject() : null;
  }

  function kind(o) {
    if (!o) return 'none';
    if (o.type === 'textbox' || o.type === 'i-text') return 'text';
    if (o.type === 'image') return 'image';
    if (['rect', 'circle', 'triangle', 'polygon', 'path', 'ellipse', 'line'].indexOf(o.type) >= 0) return 'shape';
    if (o.type === 'group') return 'group';
    return 'generic';
  }

  function fontsList() {
    if (typeof FONTS === 'undefined') return ['Inter', 'Sora', 'Poppins'];
    return Object.values(FONTS).flat();
  }

  function push() {
    if (typeof canvas === 'undefined') return;
    canvas.requestRenderAll();
    if (typeof ENGINE !== 'undefined') ENGINE.snapshot();
    if (typeof LAYERS !== 'undefined') LAYERS.render();
    if (typeof INSPECTOR !== 'undefined') INSPECTOR.render();
  }

  function hideLegacyPopup() {
    var pop = $('#proEditPopup');
    if (pop) {
      pop.classList.add('hidden');
      pop.classList.remove('is-visible');
    }
    $('#proEditBackdrop')?.classList.add('hidden');
  }

  function enterEdit(o) {
    if (!isMobile() || !o) return;
    editMode = true;
    document.body.classList.add('obsidian-canva-edit');
    renderBar(o);
    positionMiniBar();
    hideLegacyPopup();
    haptic();
  }

  function exitEdit() {
    editMode = false;
    activePanel = null;
    document.body.classList.remove('obsidian-canva-edit', 'obsidian-canva-panel-open');
    closePanel();
    $('#obsidianMiniBar')?.classList.remove('show');
    haptic();
  }

  function renderBar(o) {
    var bar = $('#obsidianCanvaBar');
    if (!bar) return;
    var k = kind(o);
    var tools = '';

    if (k === 'text') {
      tools =
        '<button type="button" data-ctool="edit"><span class="cico">✎</span><span class="clbl">Edit</span></button>' +
        '<button type="button" data-ctool="font"><span class="cico">Ff</span><span class="clbl">Font</span></button>' +
        '<button type="button" data-ctool="style"><span class="cico">H</span><span class="clbl">Style</span></button>' +
        '<button type="button" data-ctool="size"><span class="cico">AA</span><span class="clbl">Size</span></button>' +
        '<button type="button" data-ctool="color"><span class="cico">◐</span><span class="clbl">Color</span></button>';
    } else if (k === 'image') {
      tools =
        '<button type="button" data-ctool="opacity"><span class="cico">◑</span><span class="clbl">Opacity</span></button>' +
        '<button type="button" data-ctool="flip"><span class="cico">⇄</span><span class="clbl">Flip</span></button>' +
        '<button type="button" data-ctool="size"><span class="cico">▢</span><span class="clbl">Size</span></button>';
    } else {
      tools =
        '<button type="button" data-ctool="fill"><span class="cico">◼</span><span class="clbl">Fill</span></button>' +
        '<button type="button" data-ctool="stroke"><span class="cico">▭</span><span class="clbl">Stroke</span></button>' +
        '<button type="button" data-ctool="size"><span class="cico">▢</span><span class="clbl">Size</span></button>' +
        '<button type="button" data-ctool="opacity"><span class="cico">◑</span><span class="clbl">Opacity</span></button>';
    }

    bar.innerHTML =
      '<div class="canva-bar-scroll">' + tools +
      '<button type="button" data-ctool="done" class="canva-done" aria-label="Done">✓</button></div>';
  }

  function openPanel(name, html) {
    activePanel = name;
    document.body.classList.add('obsidian-canva-panel-open');
    var panel = $('#obsidianCanvaPanel');
    if (!panel) return;
    panel.innerHTML = '<div class="canva-panel-head"><span>' + name + '</span><button type="button" id="canvaPanelClose">✕</button></div><div class="canva-panel-body">' + html + '</div>';
    panel.classList.add('open');
    $('#canvaPanelClose').onclick = closePanel;
    bindPanelActions();
    haptic();
  }

  function closePanel() {
    activePanel = null;
    document.body.classList.remove('obsidian-canva-panel-open');
    $('#obsidianCanvaPanel')?.classList.remove('open');
  }

  function panelFont(o) {
    var opts = fontsList().map(function (f) {
      return '<button type="button" class="canva-font-pick" data-font="' + f + '">' + f + '</button>';
    }).join('');
    openPanel('Font', '<div class="canva-font-grid">' + opts + '</div>');
  }

  function panelSize(o) {
    var sz = Math.round(o.fontSize || o.width * (o.scaleX || 1) || 48);
    openPanel('Size',
      '<input type="range" id="canvaSizeRange" min="8" max="200" value="' + sz + '" class="canva-range" />' +
      '<p class="canva-range-val" id="canvaSizeVal">' + sz + 'px</p>');
    var r = $('#canvaSizeRange');
    var v = $('#canvaSizeVal');
    if (!r) return;
    r.oninput = function () {
      var n = +r.value;
      if (v) v.textContent = n + 'px';
      if (kind(o) === 'text') o.set('fontSize', n);
      else {
        var sc = n / (o.width || 100);
        o.set({ scaleX: sc, scaleY: sc });
      }
      o.setCoords();
      push();
      positionMiniBar();
    };
  }

  function panelColor(o) {
    var col = o.fill || '#ffffff';
    if (typeof col === 'object') col = '#22d3ee';
    openPanel('Color',
      '<input type="color" id="canvaColorPick" value="' + String(col).slice(0, 7) + '" class="canva-color" />' +
      '<div class="canva-swatches">' +
      ['#f8fafc', '#22d3ee', '#fb923c', '#8b5cf6', '#34d399', '#f43f5e', '#101d36', '#facc15'].map(function (c) {
        return '<button type="button" class="canva-swatch" data-col="' + c + '" style="background:' + c + '"></button>';
      }).join('') + '</div>');
    $('#canvaColorPick').oninput = function (e) {
      o.set('fill', e.target.value);
      push();
    };
    document.querySelectorAll('.canva-swatch').forEach(function (b) {
      b.onclick = function () {
        o.set('fill', b.dataset.col);
        push();
        closePanel();
      };
    });
  }

  function panelStyle(o) {
    openPanel('Text style',
      '<button type="button" class="canva-style-btn" data-st="head">Heading</button>' +
      '<button type="button" class="canva-style-btn" data-st="sub">Subheading</button>' +
      '<button type="button" class="canva-style-btn" data-st="body">Body</button>');
    document.querySelectorAll('.canva-style-btn').forEach(function (b) {
      b.onclick = function () {
        var m = { head: { fontSize: 72, fontWeight: '800' }, sub: { fontSize: 36, fontWeight: '600' }, body: { fontSize: 24, fontWeight: '400' } };
        o.set(m[b.dataset.st] || m.body);
        push();
        closePanel();
      };
    });
  }

  function panelOpacity(o) {
    var op = Math.round((o.opacity ?? 1) * 100);
    openPanel('Opacity',
      '<input type="range" id="canvaOpRange" min="0" max="100" value="' + op + '" class="canva-range" />' +
      '<p class="canva-range-val">' + op + '%</p>');
    $('#canvaOpRange').oninput = function (e) {
      o.set('opacity', +e.target.value / 100);
      push();
    };
  }

  function panelFill(o) {
    panelColor(o);
  }

  function panelStroke(o) {
    var sw = o.strokeWidth || 0;
    openPanel('Stroke',
      '<input type="range" id="canvaStrokeW" min="0" max="24" value="' + sw + '" class="canva-range" />' +
      '<input type="color" id="canvaStrokeC" value="' + (o.stroke || '#22d3ee') + '" class="canva-color" />');
    $('#canvaStrokeW').oninput = function (e) { o.set('strokeWidth', +e.target.value); push(); };
    $('#canvaStrokeC').oninput = function (e) { o.set('stroke', e.target.value); push(); };
  }

  function bindPanelActions() {
    document.querySelectorAll('.canva-font-pick').forEach(function (b) {
      b.onclick = function () {
        var o = getObj();
        if (o) { o.set('fontFamily', b.dataset.font); push(); closePanel(); }
      };
    });
  }

  function handleTool(tool) {
    var o = getObj();
    if (!o) return exitEdit();

    if (tool === 'done') {
      exitEdit();
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      return;
    }
    if (tool === 'edit' && kind(o) === 'text') {
      o.enterEditing();
      o.selectAll();
      canvas.requestRenderAll();
      haptic();
      return;
    }
    if (tool === 'font') return panelFont(o);
    if (tool === 'style') return panelStyle(o);
    if (tool === 'size') return panelSize(o);
    if (tool === 'color' || tool === 'fill') return panelColor(o);
    if (tool === 'opacity') return panelOpacity(o);
    if (tool === 'stroke') return panelStroke(o);
    if (tool === 'flip') {
      o.set('flipX', !o.flipX);
      push();
      haptic();
    }
  }

  function duplicateObj() {
    var o = getObj();
    if (!o) return;
    o.clone(function (c) {
      c.set({ left: (o.left || 0) + 24, top: (o.top || 0) + 24 });
      canvas.add(c);
      canvas.setActiveObject(c);
      canvas.requestRenderAll();
      push();
      enterEdit(c);
    });
  }

  function deleteObj() {
    var o = getObj();
    if (!o) return;
    canvas.remove(o);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    push();
    exitEdit();
    haptic();
  }

  function layerAction(act) {
    var o = getObj();
    if (!o) return;
    if (act === 'front') o.bringToFront();
    if (act === 'back') o.sendToBack();
    push();
    haptic();
  }

  function positionMiniBar() {
    var mini = $('#obsidianMiniBar');
    var o = getObj();
    if (!mini || !o || !isMobile() || !editMode) return;

    cancelAnimationFrame(miniRaf);
    miniRaf = requestAnimationFrame(function () {
      var wrap = $('#stageWrap');
      if (!wrap) return;
      var rect = o.getBoundingRect(true, true);
      var zoom = typeof STATE !== 'undefined' ? STATE.zoom : 1;
      var pad = $('#stagePad');
      var padRect = pad ? pad.getBoundingClientRect() : wrap.getBoundingClientRect();
      var cx = padRect.left + rect.left + rect.width / 2;
      var top = padRect.top + rect.top - 44;
      mini.style.left = Math.max(12, Math.min(window.innerWidth - 12, cx)) + 'px';
      mini.style.top = Math.max(56, top) + 'px';
      mini.classList.add('show');
    });
  }

  function injectUI() {
    if ($('#obsidianCanvaBar')) return;

    var nav = $('.obsidian-bottom-nav');
    if (nav) nav.id = 'obsidianNavBar';

    var canvaBar = document.createElement('div');
    canvaBar.id = 'obsidianCanvaBar';
    canvaBar.className = 'obsidian-canva-bar';
    canvaBar.setAttribute('aria-label', 'Edit tools');
    document.body.appendChild(canvaBar);

    var panel = document.createElement('div');
    panel.id = 'obsidianCanvaPanel';
    panel.className = 'obsidian-canva-panel';
    document.body.appendChild(panel);

    var mini = document.createElement('div');
    mini.id = 'obsidianMiniBar';
    mini.className = 'obsidian-mini-bar';
    mini.innerHTML =
      '<button type="button" data-mini="dup" title="Duplicate">⧉</button>' +
      '<button type="button" data-mini="del" title="Delete">🗑</button>' +
      '<button type="button" data-mini="front" title="Bring front">↑</button>' +
      '<button type="button" data-mini="back" title="Send back">↓</button>';
    document.body.appendChild(mini);

    var dots = document.createElement('div');
    dots.id = 'obsidianPageDots';
    dots.className = 'obsidian-page-dots';
    document.body.appendChild(dots);

    canvaBar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ctool]');
      if (!b) return;
      handleTool(b.dataset.ctool);
    });

    mini.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mini]');
      if (!b) return;
      if (b.dataset.mini === 'dup') duplicateObj();
      if (b.dataset.mini === 'del') deleteObj();
      if (b.dataset.mini === 'front') layerAction('front');
      if (b.dataset.mini === 'back') layerAction('back');
    });

    panel.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  function syncPageDots() {
    var host = $('#obsidianPageDots');
    if (!host || !isMobile()) return;
    var strip = $('#proPageStrip');
    var buttons = strip ? strip.querySelectorAll('[data-pg]') : [];
    if (buttons.length < 2) {
      host.innerHTML = '';
      host.classList.remove('show');
      return;
    }
    host.innerHTML = '';
    buttons.forEach(function (b) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'page-dot' + (b.classList.contains('on') ? ' on' : '');
      dot.dataset.pg = b.dataset.pg;
      dot.setAttribute('aria-label', 'Page ' + (+b.dataset.pg + 1));
      dot.onclick = function () {
        b.click();
        setTimeout(syncPageDots, 80);
        haptic();
      };
      host.appendChild(dot);
    });
    host.classList.add('show');
  }

  function bindCanvas() {
    if (typeof canvas === 'undefined') {
      setTimeout(bindCanvas, 300);
      return;
    }
    if (canvas._canvaBound) return;
    canvas._canvaBound = true;

    canvas.on('selection:created', function (e) {
      if (!isMobile()) return;
      enterEdit(e.selected && e.selected[0] ? e.selected[0] : getObj());
    });
    canvas.on('selection:updated', function (e) {
      if (!isMobile()) return;
      enterEdit(e.selected && e.selected[0] ? e.selected[0] : getObj());
    });
    canvas.on('selection:cleared', function () {
      if (!isMobile()) return;
      exitEdit();
    });
    canvas.on('object:moving', positionMiniBar);
    canvas.on('object:scaling', positionMiniBar);
    canvas.on('object:rotating', positionMiniBar);
    canvas.on('after:render', function () {
      if (editMode && isMobile()) positionMiniBar();
    });

    setInterval(syncPageDots, 2000);
    setTimeout(syncPageDots, 1500);
  }

  function init() {
    injectUI();
    bindCanvas();
    MQ.addEventListener('change', function () {
      if (!MQ.matches) exitEdit();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 400);

  window.ObsidianCanvaMobile = {
    enter: enterEdit,
    exit: exitEdit,
    isEditMode: function () { return editMode; }
  };
})();
