/* Studio Phase 2 — GIF export, PWA, Pro workspace link */

(function () {
  'use strict';
  if (!document.body.classList.contains('studio-app')) return;

  function exportStudioGif() {
    if (typeof GIF === 'undefined') return toast('GIF library loading…');
    toast('Generating GIF…');
    commitPage();
    var frames = 10;
    var gif = new GIF({
      workers: 2,
      quality: 12,
      workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
    });
    var objs = canvas.getObjects();
    var originals = objs.map(function (o) { return { o: o, op: o.opacity ?? 1 }; });
    function next(i) {
      if (i >= frames) {
        originals.forEach(function (x) { x.o.set('opacity', x.op); });
        canvas.renderAll();
        gif.on('finished', function (blob) {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'aurora-studio.gif';
          a.click();
          toast('GIF exported');
        });
        gif.render();
        return;
      }
      originals.forEach(function (x, idx) {
        x.o.set('opacity', Math.min(1, i / frames + idx * 0.02));
      });
      canvas.renderAll();
      setTimeout(function () {
        gif.addFrame(canvas.getElement(), { copy: true, delay: 90 });
        next(i + 1);
      }, 50);
    }
    next(0);
  }

  function injectProLink() {
    if (document.getElementById('btnOpenPro')) return;
    var anchor = document.querySelector('header .ml-auto');
    if (!anchor) return;
    var a = document.createElement('a');
    a.id = 'btnOpenPro';
    a.href = 'obsidian.html';
    a.className = 'dock-btn rounded-lg bg-gradient-to-r from-cyan-500/30 to-orange-500/30 px-2.5 py-1.5 text-[11px] font-bold text-white ring-1 ring-cyan-400/40';
    a.textContent = '⚡ Pro Workspace';
    anchor.insertBefore(a, anchor.firstChild);
  }

  function patchExport() {
    var menu = document.getElementById('expMenu');
    if (!menu || menu.querySelector('[data-exp="gif"]')) return;
    var btn = document.createElement('button');
    btn.dataset.exp = 'gif';
    btn.className = 'tr flex w-full items-center justify-between rounded-xl px-3 py-2 text-[12px] font-semibold hover:bg-navy-50';
    btn.innerHTML = 'GIF Animation <span class="text-[10px] text-flame-600">Fade in</span>';
    var jsonBtn = menu.querySelector('[data-exp="json"]');
    if (jsonBtn) jsonBtn.insertAdjacentElement('beforebegin', btn);
    menu.addEventListener('click', function (e) {
      if (e.target.closest('[data-exp="gif"]')) exportStudioGif();
    });
  }

  function registerPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () {});
      });
    }
  }

  function registerCommands() {
    if (!window.AuroraToolHub) return;
    AuroraToolHub.register([
      { id: 'studio-gif', label: 'Export GIF animation', icon: '🎞', group: 'Export', quick: true, run: exportStudioGif },
      { id: 'studio-pro', label: 'Open Pro Workspace', icon: '⚡', group: 'Quick', quick: true, run: function () { location.href = 'obsidian.html'; } }
    ]);
  }

  function init() {
    injectProLink();
    patchExport();
    registerPWA();
    registerCommands();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 100);
})();
