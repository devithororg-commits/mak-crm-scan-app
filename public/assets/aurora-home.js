(function () {
  'use strict';

  var TOOLS = [
    {
      id: 'obsidian',
      group: 'Creative Suite',
      label: 'Aurora Studio Pro',
      icon: '◆',
      keys: 'Pro',
      href: 'obsidian.html',
      category: 'live',
      dock: true,
      quick: true,
      desc: 'Full design workspace — Auto Layout, Boolean ops, Magic Resize, stock library, offline PWA.',
    },
    {
      id: 'ppt',
      group: 'Presentations',
      label: 'Aurora Studio PPT',
      icon: '▣',
      keys: 'New',
      href: 'aurora-ppt.html',
      category: 'live',
      dock: true,
      quick: true,
      desc: 'Canvas-native slides — 176+ templates, Konva 60fps, presenter mode, cloud sync.',
    },
    {
      id: 'canvas',
      group: 'Creative Suite',
      label: 'Aurora Canvas',
      icon: '▤',
      href: 'studio.html',
      category: 'live',
      dock: true,
      quick: true,
      desc: 'Classic poster studio — templates, typography, brand tools, 4K export.',
    },
    {
      id: 'builder',
      group: 'Builders',
      label: 'NOVA Builder',
      icon: '◇',
      href: 'builder.html',
      category: 'live',
      quick: true,
      desc: 'Drag-and-drop decks, landing pages, and multi-page presentations.',
    },
    {
      id: 'showcase',
      group: 'Templates',
      label: 'Template Gallery',
      icon: '◎',
      href: 'showcase.html',
      category: 'live',
      quick: true,
      desc: 'Browse professional templates — social, marketing, reports, and business.',
    },
    {
      id: 'ai-deck',
      group: 'Coming Soon',
      label: 'AI Text-to-Deck',
      icon: '✦',
      category: 'soon',
      desc: 'Prompt → full presentation with brand-aware layouts.',
    },
    {
      id: 'brand-kit',
      group: 'Coming Soon',
      label: 'Brand Kits',
      icon: '◈',
      category: 'soon',
      desc: 'Company-wide colors, fonts, and reusable asset libraries.',
    },
    {
      id: 'collab',
      group: 'Coming Soon',
      label: 'Live Collaboration',
      icon: '◉',
      category: 'soon',
      desc: 'Real-time cursors, comments, and team workspaces.',
    },
    {
      id: 'export-pptx',
      group: 'Coming Soon',
      label: 'PPTX Export',
      icon: '◫',
      category: 'soon',
      desc: 'Lossless PowerPoint export with embedded vector fonts.',
    },
    {
      id: 'analytics',
      group: 'Coming Soon',
      label: 'Viewer Analytics',
      icon: '◧',
      category: 'soon',
      desc: 'Slide heatmaps, completion rates, and share insights.',
    },
    {
      id: 'magic-resize',
      group: 'Coming Soon',
      label: 'Magic Resize',
      icon: '◰',
      category: 'soon',
      desc: 'One-click adapt from desktop to mobile and social formats.',
    },
  ];

  function go(href) {
    if (href) window.location.href = href;
  }

  function hubCommands() {
    return TOOLS.map(function (t) {
      return {
        id: t.id,
        group: t.group,
        label: t.label,
        icon: t.icon,
        keys: t.keys || (t.category === 'soon' ? 'Soon' : ''),
        dock: t.dock,
        quick: t.quick,
        run: t.href ? function () { go(t.href); } : function () {},
      };
    });
  }

  /* Nav scroll */
  var nav = document.getElementById('siteNav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 12);
    }, { passive: true });
  }

  /* Mobile menu */
  var menuBtn = document.getElementById('menuBtn');
  var mobileDrawer = document.getElementById('mobileDrawer');
  if (menuBtn && mobileDrawer) {
    menuBtn.addEventListener('click', function () {
      var open = mobileDrawer.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileDrawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileDrawer.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Reveal on scroll */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* Product filter */
  var filterTabs = document.querySelectorAll('.filter-tab');
  var cards = document.querySelectorAll('.product-card[data-category]');
  filterTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var f = tab.dataset.filter;
      filterTabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
      cards.forEach(function (card) {
        var show = f === 'all' || card.dataset.category === f;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  /* Hero search → command palette */
  var heroSearch = document.getElementById('heroSearch');
  if (heroSearch) {
    heroSearch.addEventListener('click', function () {
      if (window.AuroraToolHub) AuroraToolHub.openPalette();
    });
    heroSearch.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (window.AuroraToolHub) AuroraToolHub.openPalette();
      }
    });
  }

  var openPaletteBtn = document.getElementById('openPalette');
  if (openPaletteBtn) {
    openPaletteBtn.addEventListener('click', function () {
      if (window.AuroraToolHub) AuroraToolHub.openPalette();
    });
  }

  /* ToolHub */
  if (window.AuroraToolHub) {
    AuroraToolHub.init({
      app: 'home',
      headerAnchor: '#navActions',
      dock: ['obsidian', 'ppt', 'canvas'],
      commands: hubCommands(),
      shortcuts: [
        { label: 'Open command palette', keys: 'Ctrl+K' },
        { label: 'Keyboard shortcuts', keys: '?' },
        { label: 'Aurora Studio Pro', keys: 'Open from palette' },
        { label: 'Aurora Studio PPT', keys: 'Open from palette' },
      ],
    });
  }
})();
