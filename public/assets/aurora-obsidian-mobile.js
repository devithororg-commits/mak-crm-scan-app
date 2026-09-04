/* Obsidian Pro — Mobile Focus Mode + Phase 2 (pinch zoom, FAB, swipes) */

(function () {
  'use strict';
  if (!document.body.classList.contains('obsidian-app')) return;

  var MOBILE_MQ = window.matchMedia('(max-width: 767px)');
  var moreOpen = false;
  var fabOpen = false;
  var pinchDist = 0;
  var pinchZoom = 1;
  var lastTap = 0;
  var zoomPillTimer = null;

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
    if (!isMobile()) {
      closeMoreMenu();
      closeFabSheet();
    }
  }

  function closeMoreMenu() {
    moreOpen = false;
    $('#obsidianMoreMenu')?.classList.remove('open');
    $('#obsidianMoreBackdrop')?.classList.remove('open');
  }

  function toggleMoreMenu() {
    moreOpen = !moreOpen;
    if (moreOpen) closeFabSheet();
    $('#obsidianMoreMenu')?.classList.toggle('open', moreOpen);
    $('#obsidianMoreBackdrop')?.classList.toggle('open', moreOpen);
  }

  function closeFabSheet() {
    fabOpen = false;
    $('#obsidianFabSheet')?.classList.remove('open');
    $('#obsidianFabBackdrop')?.classList.remove('open');
    $('#obsidianFab')?.classList.remove('open');
  }

  function toggleFabSheet() {
    fabOpen = !fabOpen;
    if (fabOpen) closeMoreMenu();
    $('#obsidianFabSheet')?.classList.toggle('open', fabOpen);
    $('#obsidianFabBackdrop')?.classList.toggle('open', fabOpen);
    $('#obsidianFab')?.classList.toggle('open', fabOpen);
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
      showZoomPill();
    }, 80);
  }

  /* ── Pinch / focal zoom ── */
  function touchDist(touches) {
    var dx = touches[0].clientX - touches[1].clientX;
    var dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function zoomAtPoint(newZoom, clientX, clientY) {
    if (typeof ENGINE === 'undefined' || typeof STATE === 'undefined') return;
    var wrap = $('#stageWrap');
    if (!wrap) return;

    var rect = wrap.getBoundingClientRect();
    var oldZoom = STATE.zoom;
    var scrollX = wrap.scrollLeft + (clientX - rect.left);
    var scrollY = wrap.scrollTop + (clientY - rect.top);

    ENGINE.applyZoom(newZoom);

    var ratio = STATE.zoom / oldZoom;
    wrap.scrollLeft = scrollX * ratio - (clientX - rect.left);
    wrap.scrollTop = scrollY * ratio - (clientY - rect.top);

    if (typeof CTX !== 'undefined') CTX.update();
    if (window.AuroraEditPopup) AuroraEditPopup.update(true);
    showZoomPill();
  }

  function showZoomPill() {
    if (!isMobile() || typeof STATE === 'undefined') return;
    var pill = $('#obsidianZoomPill');
    if (!pill) return;
    pill.textContent = Math.round(STATE.zoom * 100) + '%';
    pill.classList.add('show');
    clearTimeout(zoomPillTimer);
    zoomPillTimer = setTimeout(function () {
      pill.classList.remove('show');
    }, 1200);
  }

  function injectZoomPill() {
    if ($('#obsidianZoomPill')) return;
    var pill = document.createElement('div');
    pill.id = 'obsidianZoomPill';
    pill.className = 'obsidian-zoom-pill';
    pill.setAttribute('aria-live', 'polite');
    document.body.appendChild(pill);
  }

  function bindPinchZoom() {
    var wrap = $('#stageWrap');
    if (!wrap || wrap._pinchBound) return;
    wrap._pinchBound = true;

    wrap.addEventListener('touchstart', function (e) {
      if (!isMobile() || e.touches.length !== 2) return;
      pinchDist = touchDist(e.touches);
      pinchZoom = typeof STATE !== 'undefined' ? STATE.zoom : 1;
    }, { passive: true });

    wrap.addEventListener('touchmove', function (e) {
      if (!isMobile() || e.touches.length !== 2 || !pinchDist) return;
      e.preventDefault();
      var dist = touchDist(e.touches);
      var scale = dist / pinchDist;
      var midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      var midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      zoomAtPoint(pinchZoom * scale, midX, midY);
    }, { passive: false });

    wrap.addEventListener('touchend', function () {
      pinchDist = 0;
    }, { passive: true });
  }

  function bindDoubleTapZoom() {
    var wrap = $('#stageWrap');
    if (!wrap || wrap._dblTapBound) return;
    wrap._dblTapBound = true;

    wrap.addEventListener('touchend', function (e) {
      if (!isMobile() || e.touches.length > 0) return;
      var now = Date.now();
      if (now - lastTap < 320 && e.changedTouches.length === 1) {
        var t = e.changedTouches[0];
        if (typeof STATE === 'undefined' || typeof ENGINE === 'undefined') return;
        if (STATE.zoom > 1.05) {
          mobileFit();
        } else {
          zoomAtPoint(Math.min(2.5, STATE.zoom * 1.85), t.clientX, t.clientY);
        }
        e.preventDefault();
      }
      lastTap = now;
    }, { passive: false });
  }

  /* ── Edge swipe for panels ── */
  function bindEdgeSwipes() {
    if (document._obsidianSwipeBound) return;
    document._obsidianSwipeBound = true;

    var start = null;
    var EDGE = 32;
    var MIN = 56;
    var MAX_MS = 420;

    document.addEventListener('touchstart', function (e) {
      if (!isMobile() || e.touches.length !== 1) return;
      var x = e.touches[0].clientX;
      var edge = null;
      if (x <= EDGE) edge = 'left';
      else if (x >= window.innerWidth - EDGE) edge = 'right';
      start = {
        x: x,
        y: e.touches[0].clientY,
        t: Date.now(),
        edge: edge
      };
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      if (!isMobile() || !start) return;
      var touch = e.changedTouches[0];
      var dx = touch.clientX - start.x;
      var dy = touch.clientY - start.y;
      var dt = Date.now() - start.t;
      var edge = start.edge;
      start = null;

      if (dt > MAX_MS || Math.abs(dx) < MIN || Math.abs(dy) > Math.abs(dx) * 0.85) return;

      if (edge === 'left' && dx > MIN) {
        $('#leftDrawer')?.classList.remove('drawer-collapsed');
        document.body.classList.remove('obsidian-panel-right');
        document.body.classList.add('aurora-panel-open');
        setNavActive('templates');
      }
      if (edge === 'right' && dx < -MIN) {
        document.body.classList.add('obsidian-panel-right');
        $('#leftDrawer')?.classList.add('drawer-collapsed');
        document.body.classList.add('aurora-panel-open');
        setNavActive('inspector');
      }

      /* Swipe down on open panel header area to close */
      if (!edge && dy > MIN && Math.abs(dx) < 40) {
        var drawer = $('#leftDrawer');
        var rightOpen = document.body.classList.contains('obsidian-panel-right');
        var leftOpen = drawer && !drawer.classList.contains('drawer-collapsed');
        if (rightOpen || leftOpen) {
          document.body.classList.remove('obsidian-panel-right', 'aurora-panel-open');
          drawer?.classList.add('drawer-collapsed');
          setNavActive('');
        }
      }
    }, { passive: true });
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
      if (act === 'zoom-in') { click('#zoomIn'); showZoomPill(); }
      if (act === 'zoom-out') { click('#zoomOut'); showZoomPill(); }
      if (act === 'zoom-fit') { click('#zoomFit'); mobileFit(); }
      if (act === 'save') click('#btnProSave');
      if (act === 'load') click('#btnProLoad');
      if (act === 'ai') click('#btnAiPanel');
      if (act === 'page-add') click('#proPgAdd');
      if (act === 'palette' && window.AuroraToolHub) AuroraToolHub.openPalette();
    });

    document.body.appendChild(menu);
  }

  function runFabAction(act) {
    closeFabSheet();
    document.body.classList.remove('obsidian-panel-right', 'aurora-panel-open');
    $('#leftDrawer')?.classList.add('drawer-collapsed');
    setNavActive('');

    if (act === 'text' && typeof FACTORY !== 'undefined') {
      FACTORY.text('Your headline');
      return;
    }
    if (act === 'rect' && typeof FACTORY !== 'undefined') {
      FACTORY.rect();
      return;
    }
    if (act === 'circle' && typeof FACTORY !== 'undefined') {
      FACTORY.circle();
      return;
    }
    if (act === 'upload') {
      click('#fileInput');
      return;
    }
    if (act === 'shapes') {
      runTab('shapes');
      $('#leftDrawer')?.classList.remove('drawer-collapsed');
      document.body.classList.add('aurora-panel-open');
      setNavActive('templates');
      return;
    }
    if (act === 'templates') {
      runTab('templates');
      $('#leftDrawer')?.classList.remove('drawer-collapsed');
      document.body.classList.add('aurora-panel-open');
      setNavActive('templates');
    }
  }

  function injectFab() {
    if ($('#obsidianFab')) return;

    var fabBackdrop = document.createElement('div');
    fabBackdrop.id = 'obsidianFabBackdrop';
    fabBackdrop.className = 'obsidian-fab-backdrop';
    fabBackdrop.addEventListener('click', closeFabSheet);
    document.body.appendChild(fabBackdrop);

    var sheet = document.createElement('div');
    sheet.id = 'obsidianFabSheet';
    sheet.className = 'obsidian-fab-sheet glass';
    sheet.innerHTML =
      '<p class="obs-fab-title">Quick add</p>' +
      '<div class="obs-fab-grid">' +
      '<button type="button" data-fab="text"><span class="obs-fab-ico">T</span><span>Text</span></button>' +
      '<button type="button" data-fab="rect"><span class="obs-fab-ico">▭</span><span>Rectangle</span></button>' +
      '<button type="button" data-fab="circle"><span class="obs-fab-ico">●</span><span>Circle</span></button>' +
      '<button type="button" data-fab="upload"><span class="obs-fab-ico">⇪</span><span>Upload</span></button>' +
      '<button type="button" data-fab="shapes"><span class="obs-fab-ico">◆</span><span>Shapes</span></button>' +
      '<button type="button" data-fab="templates"><span class="obs-fab-ico">▦</span><span>Templates</span></button>' +
      '</div>';

    sheet.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fab]');
      if (!b) return;
      runFabAction(b.dataset.fab);
    });
    document.body.appendChild(sheet);

    var fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'obsidianFab';
    fab.className = 'obsidian-fab';
    fab.setAttribute('aria-label', 'Quick add');
    fab.title = 'Quick add';
    fab.innerHTML = '<span class="obs-fab-plus">+</span>';
    fab.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleFabSheet();
    });
    document.body.appendChild(fab);
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
      closeFabSheet();
      setNavActive(id);
      if (id === 'templates') {
        runTab('templates');
        $('#leftDrawer')?.classList.remove('drawer-collapsed');
        document.body.classList.add('aurora-panel-open');
      }
      if (id === 'text') {
        runTab('text');
        $('#leftDrawer')?.classList.remove('drawer-collapsed');
        document.body.classList.add('aurora-panel-open');
      }
      if (id === 'fit') {
        click('#zoomFit');
        mobileFit();
        document.body.classList.remove('obsidian-panel-right', 'aurora-panel-open');
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
    injectFab();
    injectZoomPill();
    syncFocusMode();
    bindCanvasEvents();
    bindPinchZoom();
    bindDoubleTapZoom();
    bindEdgeSwipes();

    MOBILE_MQ.addEventListener('change', onViewportChange);
    window.addEventListener('resize', onViewportChange, { passive: true });
    window.addEventListener('orientationchange', function () {
      setTimeout(onViewportChange, 120);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMoreMenu();
        closeFabSheet();
      }
    });

    setTimeout(mobileFit, 600);
    setTimeout(mobileFit, 1800);
    maybeShowMobileHints();
  }

  function maybeShowMobileHints() {
    if (!isMobile() || localStorage.getItem('obsidian-m2-hint')) return;
    setTimeout(function () {
      if (typeof toast === 'function') {
        toast('Select object to edit · Pinch zoom · Bottom toolbar like Canva');
        try { localStorage.setItem('obsidian-m2-hint', '1'); } catch (e) {}
      }
    }, 2200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 50);
  }

  window.ObsidianMobile = {
    isMobile: isMobile,
    fit: mobileFit,
    refresh: syncFocusMode,
    zoomAt: zoomAtPoint,
    showZoom: showZoomPill
  };
})();
