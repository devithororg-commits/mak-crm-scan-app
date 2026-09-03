(function () {
  'use strict';

  function q(sel, root) { return (root || document).querySelector(sel); }

  function setPanelOpen(body, open) {
    body.classList.toggle('aurora-panel-open', open);
  }

  function closeAll(body) {
    body.classList.remove(
      'panel-left-open', 'panel-right-open',
      'studio-panel-left', 'studio-panel-right',
      'obsidian-panel-right', 'aurora-panel-open'
    );
    var ld = q('#leftDrawer');
    if (ld && window.matchMedia('(max-width: 1023px)').matches) {
      ld.classList.add('drawer-collapsed');
    }
  }

  function bindOverlay() {
    var overlay = q('.aurora-panel-overlay');
    if (!overlay) return;
    overlay.addEventListener('click', function () { closeAll(document.body); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll(document.body);
    });
  }

  function bindNova() {
    var body = document.body;
    if (!body.classList.contains('nova-app')) return;
    var btnL = q('#btnPanelLeft');
    var btnR = q('#btnPanelRight');
    if (!btnL || !btnR) return;

    function sync() {
      setPanelOpen(body, body.classList.contains('panel-left-open') || body.classList.contains('panel-right-open'));
      if (typeof window.AuroraControls !== 'undefined') {
        window.AuroraControls.syncPanelAria(btnL, q('#libPanel'), body.classList.contains('panel-left-open'));
        window.AuroraControls.syncPanelAria(btnR, q('#inspPanel'), body.classList.contains('panel-right-open'));
      }
    }
    btnL.addEventListener('click', function () {
      var open = body.classList.toggle('panel-left-open');
      if (open) body.classList.remove('panel-right-open');
      sync();
    });
    btnR.addEventListener('click', function () {
      var open = body.classList.toggle('panel-right-open');
      if (open) body.classList.remove('panel-left-open');
      sync();
    });
    window.addEventListener('resize', function () {
      if (!window.matchMedia('(max-width: 768px)').matches) closeAll(body);
    }, { passive: true });
  }

  function bindStudio() {
    var body = document.body;
    if (!body.classList.contains('studio-app')) return;
    var tglL = q('#tglLeft');
    var tglR = q('#tglRight');
    if (!tglL || !tglR) return;
    if (tglL.onclick || tglR.onclick) return;

    function mobile() { return window.matchMedia('(max-width: 1023px)').matches; }
    function sync() {
      setPanelOpen(body, body.classList.contains('studio-panel-left') || body.classList.contains('studio-panel-right'));
    }

    tglL.addEventListener('click', function () {
      if (mobile()) {
        var open = body.classList.toggle('studio-panel-left');
        if (open) body.classList.remove('studio-panel-right');
        sync();
      } else {
        q('#leftPanel').classList.toggle('collapsed');
      }
    });
    tglR.addEventListener('click', function () {
      if (mobile()) {
        var open = body.classList.toggle('studio-panel-right');
        if (open) body.classList.remove('studio-panel-left');
        sync();
      } else {
        q('#rightPanel').classList.toggle('collapsed');
      }
    });
    window.addEventListener('resize', function () {
      if (!mobile()) {
        body.classList.remove('studio-panel-left', 'studio-panel-right', 'aurora-panel-open');
      }
    }, { passive: true });
  }

  function bindObsidian() {
    var body = document.body;
    if (!body.classList.contains('obsidian-app')) return;
    var tglL = q('#toggleLeft');
    var tglR = q('#toggleRight');
    if (!tglL) return;

    function mobile() { return window.matchMedia('(max-width: 1023px)').matches; }
    function sync() {
      var leftOpen = q('#leftDrawer') && !q('#leftDrawer').classList.contains('drawer-collapsed');
      var rightOpen = body.classList.contains('obsidian-panel-right');
      setPanelOpen(body, mobile() && (leftOpen || rightOpen));
    }

    if (mobile()) q('#leftDrawer')?.classList.add('drawer-collapsed');

    var origLeft = tglL.onclick;
    tglL.onclick = function () {
      if (origLeft) origLeft.call(this);
      if (mobile()) body.classList.remove('obsidian-panel-right');
      sync();
    };

    if (tglR) {
      tglR.addEventListener('click', function () {
        if (!mobile()) return;
        body.classList.toggle('obsidian-panel-right');
        q('#leftDrawer').classList.add('drawer-collapsed');
        document.querySelectorAll('.railBtn').forEach(function (b) { b.classList.remove('on'); });
        sync();
      });
    }

    document.querySelectorAll('.railBtn').forEach(function (btn) {
      btn.addEventListener('click', function () { setTimeout(sync, 0); });
    });

    window.addEventListener('resize', function () {
      if (!mobile()) {
        body.classList.remove('obsidian-panel-right', 'aurora-panel-open');
      }
    }, { passive: true });
  }

  function bindShowcaseMenu() {
    var btn = q('#showcaseMenuBtn');
    var menu = q('#showcaseMobileMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    btn.setAttribute('aria-controls', 'showcaseMobileMenu');
    btn.setAttribute('aria-expanded', 'false');
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); });
    });
  }

  function init() {
    bindOverlay();
    bindNova();
    bindStudio();
    bindObsidian();
    bindShowcaseMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
