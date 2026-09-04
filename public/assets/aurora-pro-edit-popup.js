/* Aurora Pro — contextual edit popup beside selected object */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app')) return;

  var popup = null;
  var pinned = false;
  var editingText = false;
  var lastObj = null;
  var PANEL_W = 268;

  function fontOptions(selected) {
    if (typeof FONTS === 'undefined') return '<option>Inter</option>';
    return Object.values(FONTS).flat().map(function (f) {
      return '<option' + (selected === f ? ' selected' : '') + '>' + f + '</option>';
    }).join('');
  }

  function getTypeLabel(o) {
    if (!o) return 'Object';
    if (o.type === 'textbox' || o.type === 'i-text') return 'Text';
    if (o.type === 'image') return 'Image';
    if (o.type === 'group') return 'Group';
    if (o.type === 'rect' || o.type === 'circle' || o.type === 'triangle' || o.type === 'polygon' || o.type === 'path') return 'Shape';
    return o.objectName || o.type || 'Object';
  }

  function isText(o) {
    return o && (o.type === 'textbox' || o.type === 'i-text');
  }

  function isShape(o) {
    return o && ['rect', 'circle', 'triangle', 'polygon', 'path', 'ellipse', 'line'].indexOf(o.type) >= 0;
  }

  function push() {
    canvas.requestRenderAll();
    if (typeof ENGINE !== 'undefined') ENGINE.snapshot();
    if (typeof LAYERS !== 'undefined') LAYERS.render();
    if (typeof INSPECTOR !== 'undefined') INSPECTOR.render();
  }

  function styled(o, patch) {
    if (o.setSelectionStyles && o.isEditing && o.selectionStart !== o.selectionEnd) {
      o.setSelectionStyles(patch);
    } else {
      o.set(patch);
    }
    push();
  }

  function ensurePopup() {
    if (popup) return popup;
    var host = document.querySelector('main');
    if (!host) return null;
    popup = document.createElement('div');
    popup.id = 'proEditPopup';
    popup.className = 'pro-edit-popup glass hidden';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-label', 'Quick edit controls');
    host.appendChild(popup);
    popup.addEventListener('mousedown', function (e) { e.stopPropagation(); });
    popup.addEventListener('click', function (e) { e.stopPropagation(); });
    return popup;
  }

  function hide() {
    if (!popup) return;
    if (pinned || editingText) return;
    popup.classList.add('hidden');
  }

  function forceHide() {
    pinned = false;
    editingText = false;
    if (popup) popup.classList.add('hidden');
    var bar = document.getElementById('ctxBar');
    if (bar) bar.classList.add('hidden');
  }

  function fillColor(o) {
    if (typeof o.fill === 'string' && o.fill && o.fill.indexOf('#') === 0) return o.fill;
    return '#f8fafc';
  }

  function renderBody(o) {
    var html = '';
    var type = getTypeLabel(o);

    if (isText(o)) {
      html +=
        '<section class="pro-edit-section">' +
        '<p class="pro-edit-label">Content</p>' +
        '<textarea id="pepText" class="fld pro-edit-textarea" rows="3">' + esc(o.text || '') + '</textarea>' +
        '</section>' +
        '<section class="pro-edit-section">' +
        '<p class="pro-edit-label">Typography</p>' +
        '<select id="pepFont" class="fld">' + fontOptions(o.fontFamily) + '</select>' +
        '<div class="pro-edit-row mt-1.5">' +
        '<input id="pepSize" class="fld w-16" type="number" min="6" max="400" value="' + Math.round(o.fontSize || 24) + '" title="Size" />' +
        '<div class="pro-edit-btns">' +
        '<button type="button" data-pep="bold" class="chip tr pep-style' + ((o.fontWeight === 'bold' || o.fontWeight >= 700) ? ' on' : '') + '">B</button>' +
        '<button type="button" data-pep="italic" class="chip tr pep-style' + (o.fontStyle === 'italic' ? ' on' : '') + '">I</button>' +
        '<button type="button" data-pep="underline" class="chip tr pep-style' + (o.underline ? ' on' : '') + '">U</button>' +
        '<button type="button" data-pep="linethrough" class="chip tr pep-style' + (o.linethrough ? ' on' : '') + '">S</button>' +
        '</div></div>' +
        '<div class="pro-edit-align mt-1.5">' +
        ['left', 'center', 'right', 'justify'].map(function (a) {
          return '<button type="button" data-align="' + a + '" class="chip tr pep-align' + (o.textAlign === a ? ' on' : '') + '">' + a[0].toUpperCase() + '</button>';
        }).join('') +
        '</div>' +
        '<label class="pro-edit-mini mt-1.5">Tracking <input id="pepTrack" type="range" min="-100" max="900" value="' + (o.charSpacing || 0) + '" /></label>' +
        '<label class="pro-edit-mini">Leading <input id="pepLead" type="range" min="70" max="240" value="' + Math.round((o.lineHeight || 1.16) * 100) + '" /></label>' +
        '<div class="pro-edit-row mt-1.5">' +
        '<span class="pro-edit-mini">Colour</span>' +
        '<input id="pepFill" type="color" value="' + fillColor(o) + '" class="pro-edit-color" />' +
        '<button type="button" id="pepFillSel" class="chip tr flex-1 text-[10px]">Apply to highlight</button>' +
        '</div></section>';
    }

    if (o.type === 'image') {
      html +=
        '<section class="pro-edit-section">' +
        '<p class="pro-edit-label">Image</p>' +
        '<button type="button" id="pepRemoveBg" class="chip tr w-full rounded-lg py-2 text-[11px] font-semibold">✦ Remove background</button>' +
        '<div class="pro-edit-row mt-1.5">' +
        '<button type="button" data-pep="flipX" class="chip tr flex-1 text-[10px]">Flip H</button>' +
        '<button type="button" data-pep="flipY" class="chip tr flex-1 text-[10px]">Flip V</button>' +
        '</div></section>';
    }

    if (isShape(o)) {
      html +=
        '<section class="pro-edit-section">' +
        '<p class="pro-edit-label">Shape</p>' +
        '<div class="pro-edit-row">' +
        '<span class="pro-edit-mini">Fill</span><input id="pepShapeFill" type="color" value="' + fillColor(o) + '" class="pro-edit-color" />' +
        '<span class="pro-edit-mini">Stroke</span><input id="pepStroke" type="color" value="' + (o.stroke || '#000000') + '" class="pro-edit-color" />' +
        '</div>' +
        '<label class="pro-edit-mini mt-1">Stroke width <input id="pepStrokeW" class="fld" type="number" min="0" max="80" value="' + (o.strokeWidth || 0) + '" /></label>' +
        (o.rx !== undefined ? '<label class="pro-edit-mini">Corner radius <input id="pepRadius" type="range" min="0" max="200" value="' + (o.rx || 0) + '" /></label>' : '') +
        '</section>';
    }

    html +=
      '<section class="pro-edit-section">' +
      '<p class="pro-edit-label">Common</p>' +
      '<label class="pro-edit-mini">Opacity <input id="pepOpacity" type="range" min="0" max="100" value="' + Math.round((o.opacity ?? 1) * 100) + '" /></label>' +
      '<label class="pro-edit-mini">Rotation <input id="pepAngle" type="range" min="-180" max="180" value="' + Math.round(o.angle || 0) + '" /></label>' +
      '<div class="pro-edit-row mt-1">' +
      '<button type="button" data-pep="front" class="chip tr flex-1 text-[10px]">⤒ Front</button>' +
      '<button type="button" data-pep="back" class="chip tr flex-1 text-[10px]">⤓ Back</button>' +
      '<button type="button" data-pep="dup" class="chip tr flex-1 text-[10px]">⧉ Dup</button>' +
      '</div>' +
      '<button type="button" data-pep="del" class="chip tr mt-1 w-full rounded-lg py-1.5 text-[11px] text-rose-300">Delete</button>' +
      '</section>';

    return { html: html, type: type };
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function positionPopup(o) {
    if (!popup || !o) return;
    var r = o.getBoundingRect(true, true);
    var main = document.querySelector('main');
    var wrap = document.getElementById('stageWrap');
    if (!main || !wrap) return;
    var mainRect = main.getBoundingClientRect();
    var canvRect = canvas.getElement().getBoundingClientRect();
    var scrollL = wrap.scrollLeft || 0;
    var scrollT = wrap.scrollTop || 0;

    var selLeft = canvRect.left - mainRect.left + r.left;
    var selTop = canvRect.top - mainRect.top + r.top;
    var selRight = selLeft + r.width;
    var selBottom = selTop + r.height;

    var left = selRight + 14;
    var top = selTop;
    if (left + PANEL_W > mainRect.width - 8) {
      left = selLeft - PANEL_W - 14;
    }
    if (left < 8) left = 8;
    top = Math.max(8, Math.min(mainRect.height - popup.offsetHeight - 8, top));
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
    popup.style.transform = 'none';
  }

  function bindControls(o) {
    if (!popup) return;

    if (isText(o)) {
      var pepText = popup.querySelector('#pepText');
      if (pepText) {
        pepText.oninput = function (e) {
          o.set('text', e.target.value);
          canvas.requestRenderAll();
          if (typeof LAYERS !== 'undefined') LAYERS.render();
        };
        pepText.onchange = function () { if (typeof ENGINE !== 'undefined') ENGINE.snapshot(); };
        pepText.onfocus = function () { editingText = true; pinned = true; };
        pepText.onblur = function () {
          editingText = false;
          setTimeout(function () {
            if (!popup.contains(document.activeElement)) pinned = false;
          }, 120);
        };
      }
      popup.querySelector('#pepFont')?.addEventListener('change', function (e) { styled(o, { fontFamily: e.target.value }); });
      popup.querySelector('#pepSize')?.addEventListener('change', function (e) {
        styled(o, { fontSize: Math.max(6, +e.target.value || o.fontSize) });
      });
      popup.querySelectorAll('.pep-style').forEach(function (b) {
        b.onclick = function () {
          var k = b.dataset.pep;
          var cur = (o.isEditing && o.selectionStart !== o.selectionEnd) ? (o.getSelectionStyles()[0] || {}) : o;
          if (k === 'bold') styled(o, { fontWeight: (cur.fontWeight === 'bold' || cur.fontWeight >= 700) ? 'normal' : 'bold' });
          if (k === 'italic') styled(o, { fontStyle: cur.fontStyle === 'italic' ? 'normal' : 'italic' });
          if (k === 'underline') styled(o, { underline: !cur.underline });
          if (k === 'linethrough') styled(o, { linethrough: !cur.linethrough });
          update();
        };
      });
      popup.querySelectorAll('.pep-align').forEach(function (b) {
        b.onclick = function () { o.set('textAlign', b.dataset.align); push(); update(); };
      });
      popup.querySelector('#pepTrack')?.addEventListener('input', function (e) {
        o.set('charSpacing', +e.target.value); canvas.requestRenderAll();
      });
      popup.querySelector('#pepTrack')?.addEventListener('change', function () { if (typeof ENGINE !== 'undefined') ENGINE.snapshot(); });
      popup.querySelector('#pepLead')?.addEventListener('input', function (e) {
        o.set('lineHeight', +e.target.value / 100); canvas.requestRenderAll();
      });
      popup.querySelector('#pepLead')?.addEventListener('change', function () { if (typeof ENGINE !== 'undefined') ENGINE.snapshot(); });
      popup.querySelector('#pepFill')?.addEventListener('input', function (e) { styled(o, { fill: e.target.value }); });
      popup.querySelector('#pepFillSel')?.addEventListener('click', function () {
        if (!(o.isEditing && o.selectionStart !== o.selectionEnd)) return toast('Double-click text and highlight words first');
        o.setSelectionStyles({ fill: popup.querySelector('#pepFill').value });
        push();
        toast('Highlight recoloured');
      });
    }

    if (o.type === 'image') {
      popup.querySelector('#pepRemoveBg')?.addEventListener('click', function () {
        if (window.AuroraPro && AuroraPro.removeBackground) AuroraPro.removeBackground();
        else toast('Select an image');
      });
      popup.querySelector('[data-pep="flipX"]')?.addEventListener('click', function () { o.set('flipX', !o.flipX); push(); });
      popup.querySelector('[data-pep="flipY"]')?.addEventListener('click', function () { o.set('flipY', !o.flipY); push(); });
    }

    if (isShape(o)) {
      popup.querySelector('#pepShapeFill')?.addEventListener('input', function (e) { o.set('fill', e.target.value); canvas.requestRenderAll(); });
      popup.querySelector('#pepShapeFill')?.addEventListener('change', function () { if (typeof ENGINE !== 'undefined') ENGINE.snapshot(); });
      popup.querySelector('#pepStroke')?.addEventListener('input', function (e) { o.set('stroke', e.target.value); canvas.requestRenderAll(); });
      popup.querySelector('#pepStrokeW')?.addEventListener('change', function (e) {
        o.set('strokeWidth', Math.max(0, +e.target.value || 0)); push();
      });
      popup.querySelector('#pepRadius')?.addEventListener('input', function (e) {
        o.set({ rx: +e.target.value, ry: +e.target.value }); canvas.requestRenderAll();
      });
    }

    popup.querySelector('#pepOpacity')?.addEventListener('input', function (e) {
      o.set('opacity', +e.target.value / 100); canvas.requestRenderAll();
    });
    popup.querySelector('#pepOpacity')?.addEventListener('change', function () { if (typeof ENGINE !== 'undefined') ENGINE.snapshot(); });
    popup.querySelector('#pepAngle')?.addEventListener('input', function (e) {
      o.rotate(+e.target.value); canvas.requestRenderAll();
    });
    popup.querySelector('#pepAngle')?.addEventListener('change', function () { if (typeof ENGINE !== 'undefined') ENGINE.snapshot(); });

    popup.querySelector('[data-pep="front"]')?.addEventListener('click', function () { o.bringToFront(); push(); });
    popup.querySelector('[data-pep="back"]')?.addEventListener('click', function () { o.sendToBack(); push(); });
    popup.querySelector('[data-pep="dup"]')?.addEventListener('click', function () {
      o.clone(function (c) {
        c.set({ left: (o.left || 0) + 34, top: (o.top || 0) + 34, objectName: (o.objectName || 'Copy') + ' copy' });
        canvas.add(c);
        canvas.setActiveObject(c);
        push();
        update();
      }, ['objectName']);
    });
    popup.querySelector('[data-pep="del"]')?.addEventListener('click', function () {
      canvas.remove(o);
      canvas.discardActiveObject();
      push();
      forceHide();
      if (typeof INSPECTOR !== 'undefined') INSPECTOR.render();
    });

    var nameInput = popup.querySelector('#pepName');
    if (nameInput) {
      nameInput.onchange = function (e) {
        o.objectName = e.target.value.trim() || o.objectName || 'Object';
        push();
        if (typeof LAYERS !== 'undefined') LAYERS.render();
      };
    }
  }

  function update(repositionOnly) {
    var el = ensurePopup();
    if (!el || typeof canvas === 'undefined') return;

    var o = canvas.getActiveObject();
    var bar = document.getElementById('ctxBar');
    if (bar) bar.classList.add('hidden');

    if (!o) {
      lastObj = null;
      if (!pinned && !editingText) el.classList.add('hidden');
      return;
    }

    if (repositionOnly && o === lastObj && !el.classList.contains('hidden')) {
      positionPopup(o);
      return;
    }

    lastObj = o;

    var body = renderBody(o);
    var hasSelection = o.isEditing && o.selectionStart !== o.selectionEnd;
    el.innerHTML =
      '<div class="pro-edit-head">' +
      '<div class="pro-edit-head-left">' +
      '<span class="pro-edit-type">' + body.type + '</span>' +
      (hasSelection ? '<span class="pro-edit-hint">· word selected</span>' : '') +
      '</div>' +
      '<div class="pro-edit-head-actions">' +
      '<button type="button" id="pepPin" class="chip tr pep-pin' + (pinned ? ' on' : '') + '" title="Pin popup">📌</button>' +
      '<button type="button" id="pepClose" class="chip tr" title="Close">✕</button>' +
      '</div></div>' +
      '<input id="pepName" class="fld pro-edit-name" value="' + esc(o.objectName || body.type) + '" placeholder="Layer name" />' +
      '<div class="pro-edit-body">' + body.html + '</div>';

    el.classList.remove('hidden');
    positionPopup(o);

    el.querySelector('#pepPin')?.addEventListener('click', function () {
      pinned = !pinned;
      el.querySelector('#pepPin')?.classList.toggle('on', pinned);
    });
    el.querySelector('#pepClose')?.addEventListener('click', forceHide);

    bindControls(o);
  }

  function bindCanvas() {
    if (!canvas || canvas._editPopupBound) return;
    canvas._editPopupBound = true;

    ['selection:created', 'selection:updated', 'object:modified'].forEach(function (ev) {
      canvas.on(ev, function () { update(false); });
    });
    ['object:moving', 'object:scaling', 'object:rotating'].forEach(function (ev) {
      canvas.on(ev, function () { update(true); });
    });
    canvas.on('selection:cleared', function () {
      if (!pinned && !editingText) forceHide();
      else update();
    });
    canvas.on('text:editing:entered', function () {
      pinned = true;
      editingText = true;
      update();
    });
    canvas.on('text:editing:exited', function () {
      editingText = false;
      update();
    });
    canvas.on('text:selection:changed', function () { update(false); });
    canvas.on('text:changed', function () {
      if (typeof LAYERS !== 'undefined') LAYERS.render();
      update(true);
    });

    var wrap = document.getElementById('stageWrap');
    if (wrap) wrap.addEventListener('scroll', function () { update(true); });
    window.addEventListener('resize', function () { update(true); });
  }

  function patchCtx() {
    if (typeof CTX !== 'undefined' && CTX.update) {
      CTX.update = function () { update(); };
    }
  }

  function registerCommands() {
    if (!window.AuroraToolHub) return;
    AuroraToolHub.register([
      { id: 'edit-popup', label: 'Toggle quick edit popup', icon: '✎', group: 'Quick', quick: true, run: function () {
        var o = canvas.getActiveObject();
        if (!o) return toast('Select an object first');
        pinned = !pinned;
        update();
        toast(pinned ? 'Edit popup pinned' : 'Edit popup follows selection');
      } }
    ]);
  }

  function init() {
    ensurePopup();
    patchCtx();
    bindCanvas();
    registerCommands();
    setTimeout(update, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 80);
  }

  window.AuroraEditPopup = { update: update, hide: forceHide };
})();
