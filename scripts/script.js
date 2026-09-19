/* ============================================
   RUPIAH'S HUNTERS — SCRIPT
   Vanilla JS · Premium Edition
   ============================================ */

(function () {
  'use strict';

  /* ============================================
     CORE — Konfigurasi
     ============================================ */
  const CONFIG = {
    /* Reveal */
    revealThreshold: 0.1,
    revealRootMargin: '0px 0px -12% 0px',
    staggerStep: 110,
    staggerMax: 900,

    /* Nav */
    navScrollOffset: 80,
    navScrolledAt: 8,
    navAutoHideAt: 320,

    /* Typewriter */
    typeSpeed: 62,
    deleteSpeed: 30,
    pauseAfterType: 1800,
    pauseBeforeType: 380,
    startDelay: 550,

    /* Counter */
    counterDuration: 1600,

    /* Magnetic */
    magnetStrength: 0.22,
    magnetRange: 110,

    /* Prefetch */
    prefetchIdle: true,
  };

  /* ============================================
     CORE — Environment
     ============================================ */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const isTouch = window.matchMedia('(hover: none)').matches;
  const supportsIO = 'IntersectionObserver' in window;

  /* ============================================
     CORE — Helpers
     ============================================ */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const raf = (fn) => requestAnimationFrame(fn);

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const lerp  = (a, b, t) => a + (b - a) * t;
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
  const pad = (n) => (n < 10 ? '0' + n : '' + n);

  function debounce(fn, wait = 120) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function throttleRAF(fn) {
    let ticking = false;
    return function (...args) {
      if (ticking) return;
      ticking = true;
      raf(() => {
        fn.apply(this, args);
        ticking = false;
      });
    };
  }

  /* Safe module runner — kalau satu module error,
     module lain tetap jalan. */
  function run(name, fn) {
    try { fn(); }
    catch (e) {
      if (window.console && console.warn) {
        console.warn('[RH] Module failed:', name, e);
      }
    }
  }

  /* ============================================
     MODULE — Active Nav Link
     ============================================ */
  function initActiveNav() {
    const current =
      window.location.pathname.split('/').pop() || 'index.html';

    $$('.nav-links a, .nav-mobile a').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') || href.startsWith('#')) return;

      if (href === current) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ============================================
     MODULE — Mobile Menu
     ============================================ */
  function initMobileMenu() {
    const toggle = $('#navToggle');
    const menu   = $('#navMobile');
    if (!toggle || !menu) return;

    const close = () => {
      toggle.classList.remove('active');
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      toggle.classList.add('active');
      menu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', () => {
      menu.classList.contains('open') ? close() : open();
    });

    $$('a', menu).forEach((link) =>
      link.addEventListener('click', close)
    );

    document.addEventListener('click', (e) => {
      if (!menu.classList.contains('open')) return;
      if (menu.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        close();
        toggle.focus();
      }
    });

    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth > 820) close();
    }, 150));
  }

  /* ============================================
     MODULE — Nav Scroll State + Auto-Hide
     ============================================ */
  function initNavScrollState() {
    const nav = $('nav');
    if (!nav) return;

    let lastY = 0;
    let ticking = false;

    const update = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop;

      nav.classList.toggle('scrolled', y > CONFIG.navScrolledAt);

      if (y > CONFIG.navAutoHideAt) {
        if (y > lastY + 4) {
          nav.classList.add('nav-hidden');
        } else if (y < lastY - 4) {
          nav.classList.remove('nav-hidden');
        }
      } else {
        nav.classList.remove('nav-hidden');
      }

      lastY = y;
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        raf(update);
      },
      { passive: true }
    );

    update();
  }

  /* ============================================
     MODULE — FAQ Accordion
     ============================================ */
  function initFaq() {
    const faqs = $$('.faq-list details');
    if (!faqs.length) return;

    faqs.forEach((detail) => {
      detail.addEventListener('toggle', () => {
        if (!detail.open) return;
        faqs.forEach((other) => {
          if (other !== detail && other.open) other.open = false;
        });
      });
    });
  }

  /* ============================================
     MODULE — Smooth Scroll
     ============================================ */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (!id || id === '#' || id.length < 2) return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();

        const top =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          CONFIG.navScrollOffset;

        window.scrollTo({
          top,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      });
    });
  }

  /* ============================================
     MODULE — Reveal + Auto Stagger
     ============================================ */
  const STAGGER_SELECTOR = [
    '.section-head > .section-label',
    '.section-head > h2',
    '.section-head > .lead',
    '.section-foot',
    '.stats > .stat',
    '.grid-3 > .card',
    '.principles > .principle',
    '.faq-list > details',
    '.for-who > .for-col',
    '.roadmap > .road-item',
    '.founders > .founder',
    '.beliefs > .belief',
    '.explore > a',
    '.creators-grid > .creator-card',
    '.about-grid > div:first-child > *',
    '.about-text > p',
    '.prose > p',
    '.pull-quote',
    '.principle-detail',
    '.topic',
    '.page-hero > .wrap > *',
  ].join(',');

  function setupStagger(section) {
    const items = $$(STAGGER_SELECTOR, section);
    if (!items.length) return;

    items.forEach((el, i) => {
      const delay = Math.min(i * CONFIG.staggerStep, CONFIG.staggerMax);
      el.style.setProperty('--rd', delay + 'ms');
    });
  }

  function revealAll() {
    $$('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur')
      .forEach((el) => el.classList.add('in'));
  }

  function initReveal() {
    const targets = $$(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur'
    );
    if (!targets.length) return;

    targets.forEach((el) => setupStagger(el));

    if (!supportsIO || prefersReducedMotion) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: CONFIG.revealThreshold,
        rootMargin: CONFIG.revealRootMargin,
      }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ============================================
     MODULE — Rotating Typewriter
     ============================================ */
  function initRotatingTypewriter() {
    const elements = $$('.rotate-line');
    if (!elements.length) return;

    elements.forEach((el) => {
      const raw = el.dataset.rotate || '';
      const phrases = raw
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);

      if (!phrases.length) return;

      if (prefersReducedMotion) {
        el.textContent = phrases[0];
        return;
      }

      el.innerHTML = '';
      el.setAttribute('aria-label', phrases[0]);

      const textEl = document.createElement('span');
      textEl.className = 'rotate-text';

      const cursorEl = document.createElement('span');
      cursorEl.className = 'rotate-cursor';
      cursorEl.setAttribute('aria-hidden', 'true');

      el.appendChild(textEl);
      el.appendChild(cursorEl);

      let phraseIdx = 0;
      let charIdx = 0;
      let isDeleting = false;
      let paused = false;

      function getTypeDelay(lastChar) {
        let d = CONFIG.typeSpeed;
        if (lastChar === ' ') d += 30;
        if (lastChar === ',') d += 90;
        if (lastChar === '.') d += 120;
        if (lastChar === '?') d += 120;
        return d;
      }

      function tick() {
        if (paused) {
          setTimeout(tick, 400);
          return;
        }

        const phrase = phrases[phraseIdx];

        if (isDeleting) charIdx--;
        else charIdx++;

        textEl.textContent = phrase.substring(0, charIdx);

        let delay = isDeleting ? CONFIG.deleteSpeed : CONFIG.typeSpeed;

        if (!isDeleting && charIdx > 0) {
          delay = getTypeDelay(phrase[charIdx - 1]);
        }

        if (!isDeleting && charIdx === phrase.length) {
          delay = CONFIG.pauseAfterType;
          isDeleting = true;
        }

        if (isDeleting && charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          delay = CONFIG.pauseBeforeType;
          el.setAttribute('aria-label', phrases[phraseIdx]);
        }

        setTimeout(tick, delay);
      }

      document.addEventListener('visibilitychange', () => {
        paused = document.hidden;
      });

      setTimeout(tick, CONFIG.startDelay);
    });
  }

  /* ============================================
     MODULE — Stats Counter
     ============================================ */
  function initStatsCounter() {
    const stats = $$('.stat-value');
    if (!stats.length || !supportsIO) return;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateStat(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    stats.forEach((el) => {
      const raw = el.textContent.trim();
      const num = parseFloat(raw);
      if (!isNaN(num) && num > 0) {
        el.dataset.target = String(num);
        el.dataset.original = raw;
        el.textContent = '0';
        observer.observe(el);
      }
    });
  }

  function animateStat(el) {
    const target = parseFloat(el.dataset.target);
    const original = el.dataset.original || String(target);
    const isFloat = original.indexOf('.') !== -1;
    const duration = CONFIG.counterDuration;
    const start = performance.now();

    function frame(now) {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = easeOutQuart(t);
      const value = target * eased;

      el.textContent = isFloat
        ? value.toFixed(1)
        : Math.round(value);

      if (t < 1) raf(frame);
      else el.textContent = original;
    }

    raf(frame);
  }

  /* ============================================
     MODULE — Cursor-Aware Spotlight
     Update --mx/--my (card) dan --bx/--by (button)
     biar CSS radial-gradient ngikutin kursor.
     ============================================ */
  function initCursorSpotlight() {
    if (isTouch) return;
    if (prefersReducedMotion) return;

    const cardTargets = $$(
      '.card, .road-item, .founder, .explore a, .creator-card, .stat'
    );

    const btnTargets = $$('.btn, .nav-cta, .btn-primary, .btn-ghost');

    cardTargets.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--mx', x + '%');
        el.style.setProperty('--my', y + '%');
      }, { passive: true });
    });

    btnTargets.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--bx', x + '%');
        el.style.setProperty('--by', y + '%');
      }, { passive: true });
    });
  }

  /* ============================================
     MODULE — Magnetic Primary Buttons
     ============================================ */
  function initMagneticButtons() {
    if (prefersReducedMotion) return;
    if (isTouch) return;

    const buttons = $$('.btn-primary, .nav-cta');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      let raf_id = null;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;

      const reset = () => {
        targetX = 0;
        targetY = 0;
        if (!raf_id) raf_id = raf(loop);
      };

      const onMove = (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < CONFIG.magnetRange + Math.max(rect.width, rect.height) / 2) {
          targetX = dx * CONFIG.magnetStrength;
          targetY = dy * CONFIG.magnetStrength;

          const max = 12;
          targetX = clamp(targetX, -max, max);
          targetY = clamp(targetY, -max, max);
        } else {
          targetX = 0;
          targetY = 0;
        }

        if (!raf_id) raf_id = raf(loop);
      };

      function loop() {
        currentX = lerp(currentX, targetX, 0.18);
        currentY = lerp(currentY, targetY, 0.18);

        btn.style.transform =
          `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

        const stillMoving =
          Math.abs(currentX - targetX) > 0.1 ||
          Math.abs(currentY - targetY) > 0.1;

        if (stillMoving) {
          raf_id = raf(loop);
        } else {
          raf_id = null;
        }
      }

      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', reset);
    });
  }

  /* ============================================
     MODULE — Link Prefetch
     ============================================ */
  function initPrefetch() {
    if (!('fetch' in window)) return;

    const links = $$('a[href$=".html"]');
    if (!links.length) return;

    const prefetched = new Set();

    const prefetch = (href) => {
      if (prefetched.has(href)) return;
      prefetched.add(href);

      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.as = 'document';
      document.head.appendChild(link);
    };

    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;

      const trigger = () => prefetch(href);

      link.addEventListener('mouseenter', trigger, { once: true });
      link.addEventListener('touchstart', trigger, { once: true, passive: true });
    });
  }

  /* ============================================
     MODULE — Orbs Hint
     ============================================ */
  function initOrbs() {
    if (prefersReducedMotion) return;
    const orbs = $$('.orb');
    if (!orbs.length) return;
    document.documentElement.classList.add('has-motion');
  }

  /* ============================================
     MODULE — Scroll Progress
     ============================================ */
  function initScrollProgress() {
    if (prefersReducedMotion) return;

    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let ticking = false;
    const update = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? scrollTop / docHeight : 0;
      bar.style.transform = `scaleX(${pct})`;
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        raf(update);
      },
      { passive: true }
    );

    update();
  }

  /* ============================================
     MODULE — External Link Safety
     ============================================ */
  function initExternalLinks() {
    $$('a[href^="http"]').forEach((link) => {
      if (!link.target) {
        link.target = '_blank';
        link.rel = 'noopener';
      }
    });
  }

  /* ============================================
     MODULE — Page Visibility Pause
     ============================================ */
  function initVisibilityPause() {
    document.addEventListener('visibilitychange', () => {
      document.documentElement.classList.toggle(
        'page-hidden',
        document.hidden
      );
    });
  }

  /* ============================================
     AURUM EDITION — VFX SHELL
     Cursor · Back-to-top · Curtain · dsb.
     Semua disuntik ke #rhFx (satu titik, rapi)
     ============================================ */
  function initFxShell() {
    const fx = $('#rhFx');
    if (!fx) return;

    /* ---------- Custom cursor ---------- */
    const dot = document.createElement('div');
    dot.className = 'cur-dot';
    dot.setAttribute('aria-hidden', 'true');
    const halo = document.createElement('div');
    halo.className = 'cur-halo';
    halo.setAttribute('aria-hidden', 'true');
    if (
      !isTouch &&
      !prefersReducedMotion &&
      window.matchMedia('(pointer: fine)').matches
    ) {
      document.documentElement.classList.add('has-cur');
      fx.appendChild(dot);
      fx.appendChild(halo);
    }

    /* ---------- Back to top ---------- */
    const CIRC = 157.08; //  2πr, r = 25
    const topBtn = document.createElement('button');
    topBtn.className = 'to-top';
    topBtn.setAttribute('aria-label', 'Kembali ke atas');
    topBtn.innerHTML =
      '<svg viewBox="0 0 54 54" aria-hidden="true">' +
        '<circle class="ring-prog" cx="27" cy="27" r="25" />' +
      '</svg>' +
      '<span class="arr">↑</span>';
    fx.appendChild(topBtn);

    const ring = topBtn.querySelector('.ring-prog');

    /* Init state curtain — auto-reveal via CSS animation di load */
    const curtain = document.createElement('div');
    curtain.className = 'page-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    curtain.innerHTML =
      '<div class="cur-panel"></div>' +
      '<div class="cur-panel"></div>' +
      '<div class="cur-line"></div>';
    fx.appendChild(curtain);

    /* Expose untuk modul lain */
    RH.vfx = { fx, dot, halo, topBtn, ring, curtain };
  }

  const RH = (window.RH = window.RH || {});
  const VFX = {
    fx: null,
    dot: null,
    halo: null,
    topBtn: null,
    ring: null,
    curtain: null,
    curX: 0, curY: 0,
    tX: 0, tY: 0,
    raf: null,
  };

  function initVfxRegistry() {
    VFX.fx = $('#rhFx');
    if (!VFX.fx) return;

    VFX.dot = VFX.fx.querySelector('.cur-dot');
    VFX.halo = VFX.fx.querySelector('.cur-halo');
    VFX.topBtn = VFX.fx.querySelector('.to-top');
    VFX.ring = VFX.topBtn ? VFX.topBtn.querySelector('.ring-prog') : null;
    VFX.curtain = VFX.fx.querySelector('.page-curtain');
  }

  /* ============================================
     MODULE — Custom Cursor Trailer
     ============================================ */
  function initCustomCursor() {
    if (!VFX.dot || !VFX.halo) return;

    const IDLE_MS = 1800; // stop rAF bila kursor diam / tab tersembunyi — hemat baterai
    let lastMove = 0;
    let idle = true;

    VFX.tX = VFX.curX = window.innerWidth / 2;
    VFX.tY = VFX.curY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
      VFX.tX = e.clientX;
      VFX.tY = e.clientY;
      lastMove = performance.now();
      if (idle) {
        idle = false;
        if (VFX.halo) VFX.halo.style.opacity = '1';
        loop();
      }
    }, { passive: true });

    const HOT_SEL =
      'a, button, summary, .btn, .social-link, .card, .creator-card, ' +
      '.founder, .stat, .explore a, .road-item, details';

    document.addEventListener('mouseover', (e) => {
      const inter = e.target.closest(HOT_SEL);
      document.documentElement.classList.toggle('cur-hot', !!inter);
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      document.documentElement.classList.remove('cur-hot');
    });

    const loop = () => {
      if (document.hidden || performance.now() - lastMove > IDLE_MS) {
        idle = true;
        VFX.raf = null;
        if (VFX.halo) VFX.halo.style.opacity = '0';
        return;
      }

      VFX.curX += (VFX.tX - VFX.curX) * 0.16;
      VFX.curY += (VFX.tY - VFX.curY) * 0.16;
      const dx = VFX.tX - VFX.curX;
      const dy = VFX.tY - VFX.curY;
      const speed = Math.hypot(dx, dy);

      if (VFX.dot) VFX.dot.style.transform = `translate3d(${VFX.tX}px, ${VFX.tY}px, 0)`;
      if (VFX.halo) VFX.halo.style.transform = `translate3d(${VFX.curX}px, ${VFX.curY}px, 0)`;

      /* halo membesar sedikit saat kursor melesat */
      if (VFX.halo) {
        const base = 38;
        const grow = clamp(speed * 0.045, 0, 16);
        VFX.halo.style.width = (base + grow) + 'px';
        VFX.halo.style.height = (base + grow) + 'px';
        VFX.halo.style.marginLeft = (-(base + grow) / 2) + 'px';
        VFX.halo.style.marginTop = (-(base + grow) / 2) + 'px';
      }
      VFX.raf = raf(loop);
    };
  }

  /* ============================================
     MODULE — Back to Top (ring progress)
     ============================================ */
  function initBackToTop() {
    if (!VFX.topBtn || !VFX.ring) return;
    const CIRC = 157.08;

    const update = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? y / docH : 0;

      VFX.topBtn.classList.toggle('show', y > 520);
      VFX.ring.style.strokeDashoffset = (CIRC * (1 - pct)).toFixed(2);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();

    VFX.topBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  }

  /* ============================================
     MODULE — Page Transition (curtain wipe)
     ============================================ */
  function initPageTransitions() {
    if (!VFX.curtain) return;

    /* Tirai AUTO-TERBUKA via CSS animation saat load (39.6) —
       tanpa konflik spesifisitas, tanpa perlu JS reveal.
       JS hanya menangani penutupan saat navigasi. */

    document.documentElement.classList.add('rh-ready');
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http')) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (link.classList.contains('no-curtain')) return;

      e.preventDefault();

      if (prefersReducedMotion) {
        window.location.href = href;
        return;
      }

      VFX.curtain.classList.add('leave');

      setTimeout(() => {
        window.location.href = href;
      }, 520);
    });
  }

  /* ============================================
     MODULE — Hero Split Text (word-by-word)
     ============================================ */
  function initHeroSplit() {
    const split = () => {
      $$('.hero h1, .page-hero h1').forEach((h1) => {
        if (h1.querySelector('.hs-word')) return;
        const nodes = Array.from(h1.childNodes);
        h1.classList.add('hero-split');
        h1.innerHTML = '';
        let i = 0;
        nodes.forEach((node) => {
          if (node.nodeType === 3) {
            node.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
              const w = document.createElement('span');
              w.className = 'hs-word';
              w.textContent = word;
              w.style.transitionDelay = (i * 55) + 'ms';
              h1.appendChild(w);
              /* spasi sebagai tekstur antar-span — PENTING:
                 spasi di dalam inline-block justru collapse,
                 tanpa ini kata-kata nempel & tanpa jeda */
              h1.append(' ');
              i += 1;
            });
          } else if (node.nodeName === 'BR') {
            h1.appendChild(document.createElement('br'));
          }
        });
      });
    };

    split();

    if (prefersReducedMotion || isTouch || !supportsIO) {
      $$('.hero-split .hs-word').forEach((w) => w.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const words = entry.target.querySelectorAll('.hs-word');
        words.forEach((w) => w.classList.add('in'));
        io.disconnect();
      });
    }, { threshold: 0.35 });

    const heroHeading = $('.hero h1, .page-hero h1');
    if (heroHeading) io.observe(heroHeading);
  }

  /* ============================================
     MODULE — Ambient Parallax (scroll depth)
     ============================================ */
  function initAmbientParallax() {
    if (prefersReducedMotion) return;
    const ambient = $('.ambient');
    if (!ambient) return;

    let ticking = false;
    const update = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop;
      ambient.style.transform = `translate3d(0, ${(y * -0.045).toFixed(2)}px, 0)`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      raf(update);
    }, { passive: true });
    update();
  }

  /* ============================================
     MODULE — Magnetic Nav Links (halus)
     ============================================ */
  function initMagneticNavLinks() {
    if (isTouch || prefersReducedMotion) return;
    const links = $$('.nav-links a');
    if (!links.length) return;

    links.forEach((link) => {
      const strength = 6;
      let runId = null;
      let tx = 0, ty = 0, cx = 0, cy = 0;

      link.addEventListener('mousemove', (e) => {
        const r = link.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * 0.08;
        ty = (e.clientY - (r.top + r.height / 2)) * 0.16;
        if (!runId) runId = raf(loop);
      }, { passive: true });

      link.addEventListener('mouseleave', () => {
        tx = 0; ty = 0;
        if (!runId) runId = raf(loop);
      });

      const loop = () => {
        cx += (tx - cx) * 0.2;
        cy += (ty - cy) * 0.2;
        link.style.transform = `translate(${clamp(cx, -strength, strength).toFixed(2)}px, ${clamp(cy, -strength, strength).toFixed(2)}px)`;
        if (Math.abs(cx - tx) > .01 || Math.abs(cy - ty) > .01) {
          runId = raf(loop);
        } else {
          runId = null;
        }
      };
    });
  }

  /* ============================================
     MODULE — Rounded FAQ (premium style)
     ============================================ */
  function initFaqPremium() {
    // ivy polish: tidak ada perilaku wajib, cukup hook gaya
    $$('details[open]').forEach((d) => {
      // nothing — landasan CSS sudah menangani
    });
  }

  /* ============================================
     BOOT SEQUENCE
     ============================================ */
  function init() {
    initFxShell();
    initVfxRegistry();

    run('ActiveNav', initActiveNav);
    run('MobileMenu', initMobileMenu);
    run('NavScroll', initNavScrollState);
    run('Faq', initFaq);
    run('FaqPremium', initFaqPremium);
    run('SmoothScroll', initSmoothScroll);
    run('Reveal', initReveal);
    run('Typewriter', initRotatingTypewriter);
    run('StatsCounter', initStatsCounter);
    run('CursorSpotlight', initCursorSpotlight);
    run('MagneticButtons', initMagneticButtons);
    run('MagneticNavLinks', initMagneticNavLinks);
    run('Prefetch', initPrefetch);
    run('Orbs', initOrbs);
    run('ScrollProgress', initScrollProgress);
    run('ExternalLinks', initExternalLinks);
    run('VisibilityPause', initVisibilityPause);
    run('CustomCursor', initCustomCursor);
    run('BackToTop', initBackToTop);
    run('PageTransitions', initPageTransitions);
    run('HeroSplit', initHeroSplit);
    run('AmbientParallax', initAmbientParallax);

    document.documentElement.classList.add('rh-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();