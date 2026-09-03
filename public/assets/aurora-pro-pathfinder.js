/* Aurora Pro Pathfinder — boolean shape operations (union, subtract, intersect) */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app')) return;

  var SHAPE_TYPES = ['rect', 'circle', 'triangle', 'polygon', 'path', 'ellipse', 'line'];

  function isShape(o) {
    return o && SHAPE_TYPES.indexOf(o.type) >= 0 && o.selectable !== false &&
      !o.autoLayout && o.objectName !== '__guide';
  }

  function getSelection() {
    var sel = canvas.getActiveObjects ? canvas.getActiveObjects() : [];
    if (!sel.length && canvas.getActiveObject()) sel = [canvas.getActiveObject()];
    return sel.filter(isShape);
  }

  function renderShapeLayer(obj, w, h, offL, offT, done) {
    obj.clone(function (c) {
      var sc = new fabric.StaticCanvas(null, { width: w, height: h, backgroundColor: 'transparent' });
      c.set({
        left: (obj.left || 0) - offL,
        top: (obj.top || 0) - offT,
        originX: obj.originX || 'left',
        originY: obj.originY || 'top'
      });
      sc.add(c);
      sc.renderAll();
      var el = sc.lowerCanvasEl;
      sc.dispose();
      done(el);
    });
  }

  function booleanOp(op) {
    var sel = getSelection();
    if (sel.length < 2) return toast('Select 2+ vector shapes (rect, circle, path…)');

    var pad = 10;
    var points = [];
    sel.forEach(function (o) { points = points.concat(o.getCoords(true)); });
    var bounds = fabric.util.makeBoundingBoxFromPoints(points);
    var w = Math.ceil(bounds.width + pad * 2);
    var h = Math.ceil(bounds.height + pad * 2);
    var offL = bounds.left - pad;
    var offT = bounds.top - pad;
    var layers = [];
    var pending = sel.length;

    sel.forEach(function (o, i) {
      renderShapeLayer(o, w, h, offL, offT, function (el) {
        layers[i] = el;
        pending--;
        if (pending === 0) finish();
      });
    });

    function finish() {
      var out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      var ctx = out.getContext('2d');
      layers.forEach(function (layer, i) {
        if (i === 0) ctx.globalCompositeOperation = 'source-over';
        else if (op === 'union') ctx.globalCompositeOperation = 'source-over';
        else if (op === 'subtract') ctx.globalCompositeOperation = 'destination-out';
        else if (op === 'intersect') ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(layer, 0, 0);
      });
      fabric.Image.fromURL(out.toDataURL('image/png'), function (img) {
        img.set({
          left: offL,
          top: offT,
          objectName: 'Boolean ' + op,
          blendMode: 'normal'
        });
        sel.slice().forEach(function (o) { canvas.remove(o); });
        canvas.discardActiveObject();
        ENGINE.add(img);
        toast('Boolean ' + op + ' applied');
      });
    }
  }

  function injectPathfinderUI() {
    if (document.getElementById('proPathfinder')) return;
    var anchor = document.getElementById('proConstraints');
    if (!anchor) return;
    var box = document.createElement('div');
    box.id = 'proPathfinder';
    box.className = 'mt-2 space-y-1';
    box.innerHTML =
      '<p class="text-[9px] font-bold uppercase tracking-[.15em] text-slate-500">Pathfinder</p>' +
      '<div class="grid grid-cols-3 gap-1">' +
      '<button type="button" data-bool="union" class="chip tr rounded py-1 text-[9px]" title="Combine shapes">⊕ Union</button>' +
      '<button type="button" data-bool="subtract" class="chip tr rounded py-1 text-[9px]" title="Cut top from bottom">⊖ Subtract</button>' +
      '<button type="button" data-bool="intersect" class="chip tr rounded py-1 text-[9px]" title="Keep overlap only">⊗ Intersect</button></div>';
    anchor.parentElement.appendChild(box);
    box.querySelectorAll('[data-bool]').forEach(function (b) {
      b.onclick = function () { booleanOp(b.dataset.bool); };
    });
  }

  function registerCommands() {
    if (!window.AuroraToolHub) return;
    AuroraToolHub.register([
      { id: 'pf-union', label: 'Boolean union', icon: '⊕', group: 'Pro', run: function () { booleanOp('union'); } },
      { id: 'pf-subtract', label: 'Boolean subtract', icon: '⊖', group: 'Pro', run: function () { booleanOp('subtract'); } },
      { id: 'pf-intersect', label: 'Boolean intersect', icon: '⊗', group: 'Pro', run: function () { booleanOp('intersect'); } }
    ]);
  }

  function init() {
    setTimeout(injectPathfinderUI, 400);
    registerCommands();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 120);
  }

  window.AuroraProPathfinder = {
    booleanOp: booleanOp
  };
})();
