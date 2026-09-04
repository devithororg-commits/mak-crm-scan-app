/* Obsidian Pro — Mobile Focus Mode */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app')) return;

  var MOBILE_MQ = window.matchMedia('(max-width: 767px)');
  var moreOpen = false;

  function isMobile() {
    return MOBILE_MQ.matches;
  }

  function $(sel) { return document.querySelector(sel); }

  function click(sel) {
    var el = $(sel);
    if (el) el.click();
  }

  function runTab(tab) {
    if (window.AuroraToolHub && AuroraToolHub.runTab) AuroraToolHub.runTab(tab);
    else if (typeof DRAWER !== 'undefined') DRAWER.open(tab);
  }

  function syncFocusMode() {
    document.body.classList.toggle('obsidian-focus-mode', isMobile());
    if (!isMobile()) closeMoreMenu();
  }

  function closeMoreMenu() {
    moreOpen = false;
    $('#obsidianMoreMenu')?.classList.remove('open');
    $('#obsidianMoreBackdrop')?.classList.remove('open');
  }

  function toggleMoreMenu() {
    moreOpen = !moreOpen;
    $('#obsidianMoreMenu')?.classList.toggle('open', moreOpen);
    $('#obsidianMoreBackdrop')?.classList.toggle('open', moreOpen);
  }

  function setNavActive(id) {
    document.querySelectorAll('.obsidian-bottom-nav [data-mnav]').forEach(function (b) {
      b.classList.toggle('on', b.dataset.mnav === id);
    });
  }

  function mobileFit() {
    if (!isMobile() || typeof ENGINE === 'undefined') return;
    setTimeout(function () {
      ENGINE.fit();
      if (typeof CTX !== 'undefined') CTX.update();
      if (window.AuroraEditPopup) AuroraEditPopup.update(true);
    }, 80);
  }

  function injectMoreButton() {
    if ($('#btnObsidianMore')) return;
    var anchor = $('header.glass .ml-auto');
    if (!anchor) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btnObsidianMore';
    btn.className = 'tr chip rounded-lg hidden';
    btn.title = 'More tools';
    btn.setAttribute('aria-label', 'More tools');
    btn.textContent = '⋯';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMoreMenu();
    });
    anchor.insertBefore(btn, anchor.firstChild);
  }

  function injectMoreMenu() {
    if ($('#obsidianMoreMenu')) return;

    var backdrop = document.createElement('div');
    backdrop.id = 'obsidianMoreBackdrop';
    backdrop.className = 'obsidian-more-backdrop';
    backdrop.addEventListener('click', closeMoreMenu);
    document.body.appendChild(backdrop);

    var menu = document.createElement('div');
    menu.id = 'obsidianMoreMenu';
    menu.className = 'obsidian-more-menu glass';
    menu.innerHTML =
      '<button type="button" data-act="undo">↶ Undo</button>' +
      '<button type="button" data-act="redo">↷ Redo</button>' +
      '<div class="obs-more-divider"></div>' +
      '<button type="button" data-act="zoom-in">+ Zoom in</button>' +
      '<button type="button" data-act="zoom-out">− Zoom out</button>' +
      '<button type="button" data-act="zoom-fit">⊡ Fit canvas</button>' +
      '<div class="obs-more-divider"></div>' +
      '<button type="button" data-act="save">💾 Save</button>' +
      '<button type="button" data-act="load">↺ Load</button>' +
      '<button type="button" data-act="ai">✦ AI Assistant</button>' +
      '<div class="obs-more-divider"></div>' +
      '<button type="button" data-act="page-add">＋ Add page</button>' +
      '<button type="button" data-act="palette">⌘ Command palette</button>';

    menu.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.dataset.act;
      closeMoreMenu();
      if (act === 'undo') click('#undo');
      if (act === 'redo') click('#redo');
      if (act === 'zoom-in') click('#zoomIn');
      if (act === 'zoom-out') click('#zoomOut');
      if (act === 'zoom-fit') { click('#zoomFit'); mobileFit(); }
      if (act === 'save') click('#btnProSave');
      if (act === 'load') click('#btnProLoad');
      if (act === 'ai') click('#btnAiPanel');
      if (act === 'page-add') click('#proPgAdd');
      if (act === 'palette' && window.AuroraToolHub) AuroraToolHub.openPalette();
    });

    document.body.appendChild(menu);
  }

  function injectBottomNav() {
    if ($('.obsidian-bottom-nav')) return;
    var nav = document.createElement('nav');
    nav.className = 'obsidian-bottom-nav';
    nav.setAttribute('aria-label', 'Mobile tools');
    nav.innerHTML =
      '<button type="button" data-mnav="templates"><span class="obs-nav-icon">▦</span><span>Templates</span></button>' +
      '<button type="button" data-mnav="text"><span class="obs-nav-icon">T</span><span>Text</span></button>' +
      '<button type="button" data-mnav="fit" class="obs-nav-primary"><span class="obs-nav-icon">⊡</span><span>Fit</span></button>' +
      '<button type="button" data-mnav="inspector"><span class="obs-nav-icon">◨</span><span>Layers</span></button>' +
      '<button type="button" data-mnav="export"><span class="obs-nav-icon">⤓</span><span>Export</span></button>';

    nav.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mnav]');
      if (!b) return;
      var id = b.dataset.mnav;
      setNavActive(id);
      if (id === 'templates') {
        runTab('templates');
        $('#leftDrawer')?.classList.remove('drawer-collapsed');
      }
      if (id === 'text') {
        runTab('text');
        $('#leftDrawer')?.classList.remove('drawer-collapsed');
      }
      if (id === 'fit') {
        click('#zoomFit');
        mobileFit();
        document.body.classList.remove('obsidian-panel-right');
        $('#leftDrawer')?.classList.add('drawer-collapsed');
        setNavActive('fit');
      }
      if (id === 'inspector') {
        click('#toggleRight');
      }
      if (id === 'export') click('#btnExport');
    });

    document.body.appendChild(nav);
  }

  function bindCanvasEvents() {
    if (typeof canvas === 'undefined') {
      setTimeout(bindCanvasEvents, 250);
      return;
    }
    if (canvas._mobileFocusBound) return;
    canvas._mobileFocusBound = true;
    canvas.on('selection:created', function () { if (isMobile()) setNavActive(''); });
    canvas.on('selection:cleared', function () { if (isMobile()) setNavActive(''); });
  }

  function onViewportChange() {
    syncFocusMode();
    if (isMobile()) mobileFit();
  }

  function init() {
    injectMoreButton();
    injectMoreMenu();
    injectBottomNav();
    syncFocusMode();
    bindCanvasEvents();

    MOBILE_MQ.addEventListener('change', onViewportChange);
    window.addEventListener('resize', onViewportChange, { passive: true });
    window.addEventListener('orientationchange', function () {
      setTimeout(onViewportChange, 120);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMoreMenu();
    });

    /* Auto-fit after pro scripts boot */
    setTimeout(mobileFit, 600);
    setTimeout(mobileFit, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 50);
  }

  window.ObsidianMobile = {
    isMobile: isMobile,
    fit: mobileFit,
    refresh: syncFocusMode
  };
})();
