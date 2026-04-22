/* ═══════════════════════════════════════════════════════════════
   What Patients Actually Say — interactive landing
   ═══════════════════════════════════════════════════════════════ */

(() => {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Scroll progress bar + nav scrolled state ─── */
  const progress = $('#scrollProgress');
  const nav = $('#nav');
  const onScroll = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const pct = height > 0 ? (scrolled / height) * 100 : 0;
    if (progress) progress.style.width = pct + '%';
    if (nav) nav.classList.toggle('is-scrolled', scrolled > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─── Mobile menu ─── */
  const menuBtn = $('#navMenu');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('is-menu-open');
    });
    $$('.nav__links a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('is-menu-open'));
    });
  }

  /* ─── Section spy for nav link active state ─── */
  const navLinks = $$('[data-nav]');
  const spySections = navLinks
    .map(link => ({ link, section: $(link.getAttribute('href')) }))
    .filter(s => s.section);

  if (spySections.length && 'IntersectionObserver' in window) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const match = spySections.find(s => s.section === entry.target);
          if (match) {
            navLinks.forEach(l => l.classList.remove('is-active'));
            match.link.classList.add('is-active');
          }
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    spySections.forEach(s => spyObserver.observe(s.section));
  }

  /* ─── Reveal-on-scroll ─── */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => revealObserver.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ─── Counter animations ─── */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const formatValue = (value, format, decimals) => {
    if (format === 'k' && value >= 1000) {
      return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    if (format === 'comma') {
      return Math.round(value).toLocaleString('en-US');
    }
    if (decimals > 0) {
      return value.toFixed(decimals);
    }
    return Math.round(value).toString();
  };

  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const format = el.dataset.format || '';
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    if (isNaN(target)) return;
    if (prefersReducedMotion) {
      el.textContent = formatValue(target, format, decimals);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      el.textContent = formatValue(target * eased, format, decimals);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = formatValue(target, format, decimals);
    };
    requestAnimationFrame(tick);
  };

  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => counterObserver.observe(el));
  } else {
    counters.forEach(animateCounter);
  }
})();

/* ═══════════════════════════════════════════════════════════════
   Interactive widgets
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Finding 1: Gap toggle (Doctor / Mentor / Compare) ─── */
  const gapToggle = $('.gap-toggle');
  const gapTable = $('.gap-table');
  if (gapToggle && gapTable) {
    gapToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-gap-mode]');
      if (!btn) return;
      $$('.gap-toggle__btn', gapToggle).forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      gapTable.dataset.mode = btn.dataset.gapMode;
    });
  }

  /* ─── Finding 2a: Fear bar animation on scroll ─── */
  const fearsList = $('#fearsList');
  if (fearsList && 'IntersectionObserver' in window && !prefersReducedMotion) {
    const fearObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$('.fear', entry.target).forEach((fear, i) => {
            setTimeout(() => fear.classList.add('is-animated'), i * 80);
          });
          fearObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    fearObserver.observe(fearsList);
  } else if (fearsList) {
    $$('.fear', fearsList).forEach(f => f.classList.add('is-animated'));
  }

  /* ─── Finding 2b: Therapy area tabs ─── */
  const taTabs = $$('.ta-tab');
  const taPanels = $$('.ta-panel');
  if (taTabs.length && taPanels.length) {
    taTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.ta;
        taTabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        taPanels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === target));
      });
    });
  }

  /* ─── Finding 4: Sentiment shift bars ─── */
  const shift = $('#shift');
  if (shift && 'IntersectionObserver' in window && !prefersReducedMotion) {
    const shiftObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$('.shift__row', entry.target).forEach((row, rowIdx) => {
            $$('.shift__bar-fill', row).forEach((fill) => {
              const w = fill.dataset.w;
              if (w) fill.style.setProperty('--w', w);
            });
            setTimeout(() => row.classList.add('is-animated'), rowIdx * 120);
          });
          shiftObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    shiftObserver.observe(shift);
  } else if (shift) {
    $$('.shift__bar-fill', shift).forEach(fill => {
      const w = fill.dataset.w;
      if (w) fill.style.setProperty('--w', w);
    });
    $$('.shift__row', shift).forEach(row => row.classList.add('is-animated'));
  }

  /* ─── Finding 5: Questions table — filter + sort ─── */
  const qTable = $('#qTable');
  if (qTable) {
    const filterBtns = $$('.q-filter__btn');
    const rows = $$('.q-row:not(.q-row--head)', qTable);

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.qFilter;
        rows.forEach(row => {
          const match = filter === 'all' || row.dataset.signal === filter;
          row.classList.toggle('is-hidden', !match);
        });
      });
    });

    /* Sort by Freq or Conversion */
    const sortCols = $$('[data-sort]', qTable);
    let sortState = { key: null, dir: 'desc' };
    sortCols.forEach(col => {
      col.addEventListener('click', () => {
        const key = col.dataset.sort;
        if (sortState.key === key) {
          sortState.dir = sortState.dir === 'desc' ? 'asc' : 'desc';
        } else {
          sortState.key = key;
          sortState.dir = 'desc';
        }
        sortCols.forEach(c => c.classList.remove('is-sort-asc', 'is-sort-desc'));
        col.classList.add(sortState.dir === 'asc' ? 'is-sort-asc' : 'is-sort-desc');

        const sorted = [...rows].sort((a, b) => {
          const av = parseFloat(a.dataset[key]);
          const bv = parseFloat(b.dataset[key]);
          return sortState.dir === 'asc' ? av - bv : bv - av;
        });
        sorted.forEach(row => qTable.appendChild(row));
      });
    });
  }

  /* ─── Timeline: active step highlighting on scroll ─── */
  const tlSteps = $$('.tl-step');
  if (tlSteps.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    const tlObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          tlObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    tlSteps.forEach(s => tlObserver.observe(s));
  }

  /* ─── Smooth-scroll fallback for older browsers + offset compensation ─── */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    // Browsers with scroll-padding-top handle this; this is a gentle nudge for older ones.
    if (!CSS.supports('scroll-padding-top', '1px')) {
      e.preventDefault();
      const navH = document.getElementById('nav')?.offsetHeight || 72;
      const y = target.getBoundingClientRect().top + window.pageYOffset - navH;
      window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  });
})();
