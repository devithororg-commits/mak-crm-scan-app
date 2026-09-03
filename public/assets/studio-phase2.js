/* Studio Phase 2 — PWA, Pro workspace link */

(function () {
  'use strict';
  if (!document.body.classList.contains('studio-app')) return;

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
      { id: 'studio-pro', label: 'Open Pro Workspace', icon: '⚡', group: 'Quick', quick: true, run: function () { location.href = 'obsidian.html'; } }
    ]);
  }

  function init() {
    injectProLink();
    registerPWA();
    registerCommands();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 100);
})();
