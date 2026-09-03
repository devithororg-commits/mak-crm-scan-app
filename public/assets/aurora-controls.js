(function (global) {
  'use strict';

  var AC = {};

  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function ensureToastHost() {
    var host = q('#auroraToastHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'auroraToastHost';
      host.setAttribute('aria-live', 'polite');
      host.setAttribute('aria-atomic', 'true');
      document.body.appendChild(host);
    }
    return host;
  }

  AC.toast = function (msg, ms) {
    ms = ms || 2400;
    var host = ensureToastHost();
    var el = document.createElement('div');
    el.className = 'aurora-toast';
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      el.style.transition = 'opacity .25s, transform .25s';
      setTimeout(function () { el.remove(); }, 280);
    }, ms);
    if (typeof global.toast === 'function' && global.toast !== AC.toast) {
      try { global.toast(msg); } catch (_) {}
    }
  };

  AC.debounce = function (fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  };

  AC.buttonFeedback = function (btn, doneText, ms) {
    if (!btn) return;
    ms = ms || 1400;
    var prev = btn.innerHTML;
    btn.innerHTML = doneText;
    btn.disabled = true;
    setTimeout(function () {
      btn.innerHTML = prev;
      btn.disabled = false;
    }, ms);
  };

  AC.buttonLoading = function (btn, running) {
    if (!btn) return;
    btn.disabled = !!running;
    btn.classList.toggle('aurora-btn-loading', !!running);
    if (running && !btn.dataset.auroraLabel) {
      btn.dataset.auroraLabel = btn.textContent;
      btn.textContent = btn.textContent;
    }
    if (!running && btn.dataset.auroraLabel) {
      btn.textContent = btn.dataset.auroraLabel;
    }
  };

  AC.runWithLoading = function (btn, fn) {
    if (!btn || btn.disabled) return;
    AC.buttonLoading(btn, true);
    var done = function () { AC.buttonLoading(btn, false); };
    try {
      var result = fn();
      if (result && typeof result.then === 'function') {
        return result.then(function (v) { done(); return v; }, function (e) { done(); throw e; });
      }
      done();
      return result;
    } catch (e) {
      done();
      throw e;
    }
  };

  AC.enhanceTooltips = function () {
    qa('[data-tt]').forEach(function (el) {
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.dataset.tt);
    });
  };

  AC.initTabs = function (listEl, btnSelector) {
    if (!listEl) return;
    listEl.setAttribute('role', 'tablist');
    var btns = qa(btnSelector || 'button', listEl);
    function sync(active) {
      btns.forEach(function (b) {
        b.setAttribute('role', 'tab');
        var on = b === active || b.classList.contains('active');
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { sync(b); });
      b.addEventListener('keydown', function (e) {
        var i = btns.indexOf(b);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          btns[(i + 1) % btns.length].focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          btns[(i - 1 + btns.length) % btns.length].focus();
        }
      });
    });
    sync(btns.find(function (b) { return b.classList.contains('active'); }) || btns[0]);
    return { sync: sync };
  };

  AC.initExportMenu = function (btn, menu, onSelect) {
    if (!btn || !menu) return;
    btn.setAttribute('aria-haspopup', 'menu');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('role', 'menu');
    qa('[data-exp]', menu).forEach(function (item) {
      item.setAttribute('role', 'menuitem');
      item.tabIndex = -1;
    });
    var items = function () { return qa('[role="menuitem"]', menu); };

    function open() {
      menu.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      var first = items()[0];
      if (first) first.focus();
    }
    function close() {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
    function toggle(e) {
      e.stopPropagation();
      menu.classList.contains('hidden') ? open() : close();
    }

    btn.addEventListener('click', toggle);
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && e.target !== btn) close();
    });
    menu.addEventListener('click', function (e) {
      var item = e.target.closest('[data-exp]');
      if (!item) return;
      close();
      onSelect(item.dataset.exp, item);
    });
    menu.addEventListener('keydown', function (e) {
      var list = items();
      var i = list.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); close(); btn.focus(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var item = document.activeElement;
        if (item && item.dataset.exp) { close(); onSelect(item.dataset.exp, item); }
      }
    });
    return { open: open, close: close };
  };

  AC.confirmPopover = function (anchor, opts) {
    opts = opts || {};
    var existing = q('.aurora-confirm');
    if (existing) existing.remove();

    var pop = document.createElement('div');
    pop.className = 'aurora-confirm';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'true');
    pop.innerHTML =
      '<p>' + (opts.message || 'Are you sure?') + '</p>' +
      '<div class="aurora-confirm-actions">' +
      '<button type="button" class="aurora-confirm-ok">' + (opts.ok || 'Confirm') + '</button>' +
      '<button type="button" class="aurora-confirm-cancel">' + (opts.cancel || 'Cancel') + '</button>' +
      '</div>';

    var parent = anchor.offsetParent && getComputedStyle(anchor).position !== 'static'
      ? anchor.parentElement : document.body;
    if (parent !== document.body) {
      parent.style.position = parent.style.position || 'relative';
      parent.appendChild(pop);
      var r = anchor.getBoundingClientRect();
      var p = parent.getBoundingClientRect();
      pop.style.top = (r.bottom - p.top + 6) + 'px';
      pop.style.right = Math.max(0, p.right - r.right) + 'px';
    } else {
      document.body.appendChild(pop);
      var rect = anchor.getBoundingClientRect();
      pop.style.position = 'fixed';
      pop.style.top = (rect.bottom + 8) + 'px';
      pop.style.left = Math.min(rect.left, window.innerWidth - pop.offsetWidth - 12) + 'px';
    }

    var ok = q('.aurora-confirm-ok', pop);
    var cancel = q('.aurora-confirm-cancel', pop);
    ok.focus();

    function close() { pop.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); anchor.focus(); }
    }
    document.addEventListener('keydown', onKey);
    cancel.onclick = function () { close(); anchor.focus(); };
    ok.onclick = function () { close(); if (opts.onConfirm) opts.onConfirm(); };
  };

  AC.focusTrap = function (modal, opts) {
    opts = opts || {};
    if (!modal) return function () {};
    var focusables = function () {
      return qa('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal)
        .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    };
    var prevFocus = document.activeElement;

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (opts.onClose) opts.onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      var list = focusables();
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    var list = focusables();
    (opts.focus || list[0] || modal).focus();

    return function release() {
      document.removeEventListener('keydown', onKey);
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    };
  };

  AC.syncPanelAria = function (btn, panel, open) {
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (panel.id) btn.setAttribute('aria-controls', panel.id);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  };

  AC.doubleConfirm = function (btn, onConfirm, opts) {
    opts = opts || {};
    var label = btn.textContent;
    var timer;
    btn.addEventListener('click', function () {
      if (btn.dataset.confirm === '1') {
        btn.dataset.confirm = '';
        btn.textContent = label;
        clearTimeout(timer);
        onConfirm();
        return;
      }
      btn.dataset.confirm = '1';
      btn.textContent = opts.warn || '⚠ Sure?';
      clearTimeout(timer);
      timer = setTimeout(function () {
        btn.dataset.confirm = '';
        btn.textContent = label;
      }, opts.timeout || 3000);
    });
  };

  AC.initObsidianMobileExport = function () {
    if (!document.body.classList.contains('obsidian-app')) return;
    var headerActions = q('header .ml-auto');
    var fmt = q('#expFormat');
    var scale = q('#expScale');
    if (!headerActions || !fmt || !scale) return;

    var bar = document.createElement('div');
    bar.className = 'obsidian-export-mobile';
    bar.innerHTML =
      '<span class="text-[9px] font-bold uppercase tracking-wider text-slate-500 w-full">Format</span>' +
      ['png', 'jpeg', 'svg', 'json'].map(function (f) {
        return '<button type="button" class="obsidian-export-chip" data-fmt="' + f + '">' + f.toUpperCase() + '</button>';
      }).join('') +
      '<span class="text-[9px] font-bold uppercase tracking-wider text-slate-500 w-full mt-1">Scale</span>' +
      ['1', '2', '3', '4'].map(function (s) {
        return '<button type="button" class="obsidian-export-chip" data-scale="' + s + '">' + s + '×</button>';
      }).join('');

    headerActions.insertBefore(bar, headerActions.firstChild);

    function syncChips() {
      qa('[data-fmt]', bar).forEach(function (c) {
        c.classList.toggle('on', c.dataset.fmt === fmt.value);
      });
      qa('[data-scale]', bar).forEach(function (c) {
        c.classList.toggle('on', c.dataset.scale === scale.value);
      });
    }
    bar.addEventListener('click', function (e) {
      var f = e.target.closest('[data-fmt]');
      var s = e.target.closest('[data-scale]');
      if (f) { fmt.value = f.dataset.fmt; syncChips(); }
      if (s) { scale.value = s.dataset.scale; syncChips(); }
    });
    syncChips();
  };

  AC.init = function () {
    AC.enhanceTooltips();

    var menuBtn = q('#menuBtn');
    var mobileMenu = q('#mobileMenu');
    if (menuBtn && mobileMenu) {
      menuBtn.setAttribute('aria-controls', 'mobileMenu');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.addEventListener('click', function () {
        var open = mobileMenu.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      qa('a', mobileMenu).forEach(function (a) {
        a.addEventListener('click', function () {
          mobileMenu.classList.remove('open');
          menuBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }

    AC.initObsidianMobileExport();
  };

  global.AuroraControls = AC;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AC.init);
  } else {
    AC.init();
  }
})(window);
