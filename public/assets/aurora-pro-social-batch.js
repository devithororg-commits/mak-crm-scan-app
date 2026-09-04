/* Aurora Pro — Social size presets + batch ZIP export */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app') && !document.body.classList.contains('studio-app')) return;

  var PRESETS = [
    ['instagram-post', 'Instagram Post', 1080, 1080],
    ['instagram-story', 'Instagram Story', 1080, 1920],
    ['instagram-reel', 'Instagram Reel', 1080, 1920],
    ['facebook-post', 'Facebook Post', 1200, 630],
    ['facebook-cover', 'Facebook Cover', 820, 312],
    ['linkedin-post', 'LinkedIn Post', 1200, 627],
    ['linkedin-banner', 'LinkedIn Banner', 1584, 396],
    ['twitter-post', 'Twitter/X Post', 1600, 900],
    ['twitter-header', 'Twitter/X Header', 1500, 500],
    ['youtube-thumb', 'YouTube Thumbnail', 1280, 720],
    ['pinterest-pin', 'Pinterest Pin', 1000, 1500],
    ['whatsapp-status', 'WhatsApp Status', 1080, 1920]
  ];

  function canvasDims() {
    if (document.body.classList.contains('studio-app') && typeof baseW !== 'undefined') {
      return { w: baseW, h: baseH };
    }
    return { w: STATE.W, h: STATE.H };
  }

  function scaleJson(json, fromW, fromH, toW, toH) {
    var sx = toW / fromW;
    var sy = toH / fromH;
    var out = JSON.parse(JSON.stringify(json));
    if (out.objects) {
      out.objects.forEach(function (o) {
        if (o.objectName === '__guide') return;
        o.left = (o.left || 0) * sx;
        o.top = (o.top || 0) * sy;
        o.scaleX = (o.scaleX || 1) * sx;
        o.scaleY = (o.scaleY || 1) * sy;
      });
    }
    return out;
  }

  function renderPreset(w, h, json, name) {
    return new Promise(function (resolve) {
      var el = document.createElement('canvas');
      var tmp = new fabric.StaticCanvas(el, { width: w, height: h });
      var scaled = scaleJson(json, fromW, fromH, w, h);
      tmp.loadFromJSON(scaled, function () {
        tmp.renderAll();
        var data = tmp.toDataURL({ format: 'png', multiplier: 1 });
        tmp.dispose();
        resolve({ name: name, data: data });
      });
    });
  }

  function getBaseJson() {
    if (window.AuroraPro && AuroraPro.commitPage) AuroraPro.commitPage();
    if (document.body.classList.contains('studio-app')) {
      return canvas.toJSON(typeof SNAP_PROPS !== 'undefined' ? SNAP_PROPS : []);
    }
    return canvas.toDatalessJSON(['objectName', 'name', 'locked', 'blendMode', 'constraints', 'autoLayout']);
  }

  function runBatch(selected) {
    if (typeof JSZip === 'undefined') return toast('ZIP library loading…');
    if (!selected.length) return toast('Select at least one format');

    var btn = document.getElementById('proSocialBatchGo');
    if (btn && window.AuroraControls) AuroraControls.setLoading(btn, true);

    var dims = canvasDims();
    var json = getBaseJson();
    var fromW = dims.w;
    var fromH = dims.h;
    var zip = new JSZip();
    var chain = Promise.resolve();

    selected.forEach(function (p) {
      chain = chain.then(function () {
        return renderPreset(p[2], p[3], json, p[1]).then(function (r) {
          zip.file(p[0] + '-' + p[2] + 'x' + p[3] + '.png', r.data.split(',')[1], { base64: true });
        });
      });
    });

    chain.then(function () {
      return zip.generateAsync({ type: 'blob' });
    }).then(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'aurora-social-batch.zip';
      a.click();
      toast('Exported ' + selected.length + ' social sizes');
      closeModal();
    }).catch(function () {
      toast('Batch export failed');
    }).finally(function () {
      if (btn && window.AuroraControls) AuroraControls.setLoading(btn, false);
    });
  }

  function injectModal() {
    if (document.getElementById('proSocialBatchModal')) return;

    var rows = PRESETS.map(function (p) {
      return '<label class="pro-social-row on">' +
        '<input type="checkbox" checked data-id="' + p[0] + '" />' +
        '<span class="text-[12px] font-semibold text-slate-200">' + p[1] + '</span>' +
        '<span class="dims">' + p[2] + '×' + p[3] + '</span></label>';
    }).join('');

    document.body.insertAdjacentHTML('beforeend',
      '<div id="proSocialBatchModal" role="dialog" aria-modal="true">' +
      '<div class="pro-social-card">' +
      '<div class="flex items-center justify-between border-b border-white/8 px-4 py-3">' +
      '<div><h3 class="text-lg font-extrabold">Social Batch Export</h3>' +
      '<p class="text-[11px] text-slate-400">Export all selected sizes as PNG in one ZIP</p></div>' +
      '<button type="button" id="proSocialBatchClose" class="tr chip rounded-lg px-3 py-1.5 text-[12px]">✕</button></div>' +
      '<div class="px-4 py-2 flex gap-2">' +
      '<button type="button" id="proSocialAll" class="chip tr rounded-lg px-3 py-1.5 text-[10px] font-bold">Select all</button>' +
      '<button type="button" id="proSocialNone" class="chip tr rounded-lg px-3 py-1.5 text-[10px] font-bold">Clear</button>' +
      '</div>' +
      '<div class="pro-social-list px-4">' + rows + '</div>' +
      '<div class="border-t border-white/8 px-4 py-3">' +
      '<button type="button" id="proSocialBatchGo" class="tr w-full rounded-xl bg-gradient-to-r from-orange-400 to-cyan-400 py-2.5 text-[12px] font-bold text-slate-950">Export ZIP</button>' +
      '</div></div></div>');

    document.getElementById('proSocialBatchClose').onclick = closeModal;
    document.getElementById('proSocialBatchModal').addEventListener('click', function (e) {
      if (e.target.id === 'proSocialBatchModal') closeModal();
    });
    document.getElementById('proSocialAll').onclick = function () {
      document.querySelectorAll('#proSocialBatchModal input[type=checkbox]').forEach(function (c) {
        c.checked = true;
        c.closest('.pro-social-row').classList.add('on');
      });
    };
    document.getElementById('proSocialNone').onclick = function () {
      document.querySelectorAll('#proSocialBatchModal input[type=checkbox]').forEach(function (c) {
        c.checked = false;
        c.closest('.pro-social-row').classList.remove('on');
      });
    };
    document.querySelectorAll('#proSocialBatchModal input[type=checkbox]').forEach(function (c) {
      c.onchange = function () { c.closest('.pro-social-row').classList.toggle('on', c.checked); };
    });
    document.getElementById('proSocialBatchGo').onclick = function () {
      var ids = [];
      document.querySelectorAll('#proSocialBatchModal input:checked').forEach(function (c) {
        ids.push(c.dataset.id);
      });
      var selected = PRESETS.filter(function (p) { return ids.indexOf(p[0]) >= 0; });
      runBatch(selected);
    };
  }

  function injectButton() {
    var anchor = document.querySelector('header.glass .ml-auto') || document.querySelector('header .ml-auto');
    if (!anchor || document.getElementById('btnSocialBatch')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btnSocialBatch';
    btn.className = 'tr chip rounded-lg px-2 py-1.5 text-[11px] font-semibold obsidian-hide-mobile dock-btn rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-white';
    btn.title = 'Batch export social sizes';
    btn.textContent = '📦 Social';
    btn.onclick = openModal;
    var exp = document.getElementById('btnExport');
    if (exp) anchor.insertBefore(btn, exp);
    else anchor.appendChild(btn);
  }

  function openModal() {
    injectModal();
    document.getElementById('proSocialBatchModal').classList.add('open');
  }

  function closeModal() {
    document.getElementById('proSocialBatchModal')?.classList.remove('open');
  }

  function init() {
    injectButton();
    if (window.AuroraToolHub) {
      AuroraToolHub.register([
        { id: 'social-batch', label: 'Social batch export (ZIP)', icon: '📦', group: 'Export', quick: true, run: openModal }
      ]);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 600);

  window.AuroraSocialBatch = { open: openModal, presets: PRESETS, export: runBatch };
})();
