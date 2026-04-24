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

/* ═══════════════════════════════════════════════════════════════
   ROI Calculator
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const $ = (s) => document.querySelector(s);
  const roi = $('#roi');
  if (!roi) return;

  /* Therapy area modifiers (multiplicative on base funnel rates)
     Derived from report findings. Deliberately modest. */
  const TA = {
    autoimmune: { click: 1.00, match: 0.95, engage: 1.00, action: 1.05, hint: 'Autoimmune patients delay biologics an avg. of 4.2 months after Rx.' },
    surgical:   { click: 1.05, match: 1.00, engage: 1.10, action: 1.15, hint: '"When did you really feel normal?" asked in 71% of pre-surgical conversations.' },
    womens:     { click: 1.00, match: 1.05, engage: 1.10, action: 1.00, hint: '43% of women\'s health conversations start with "I feel alone in this."' },
    diabetes:   { click: 0.95, match: 0.90, engage: 0.95, action: 0.90, hint: 'Highest resistance to initiation. Mentor storytelling has 2.1× engagement.' },
    oncology:   { click: 1.00, match: 1.00, engage: 1.15, action: 1.10, hint: '91% of oncology conversations include explicit expressions of fear.' },
    devices:    { click: 1.05, match: 1.00, engage: 1.05, action: 1.10, hint: 'Most questions per conversation: 4.7 avg. Decision complexity drives deliberation.' },
    other:      { click: 1.00, match: 1.00, engage: 1.00, action: 1.00, hint: 'Based on the cross-therapy-area average from 7,823 conversations.' },
  };

  /* Base conversion rates derived from PatientPartner benchmark:
     50,000 visitors → 375 click-through → 150 matches → 75 engaged → 53 initiated */
  const BASE = {
    clickRate:   0.0075,   // 0.75% of visitors
    matchRate:   0.40,     // 40% of click-throughs
    engageRate:  0.50,     // 50% of matches
    actionRate:  0.707,    // ~71% of engaged (53/75)
  };

  const el = {
    ta:       $('#roi-ta'),
    taHint:   $('#roi-ta-hint'),
    visitors: $('#roi-visitors'),
    vVal:     $('#roi-visitors-val'),
    revenue:  $('#roi-revenue'),
    rVal:     $('#roi-revenue-val'),
    cost:     $('#roi-cost'),
    cVal:     $('#roi-cost-val'),
    clicks:    $('#roi-clicks'),
    matches:   $('#roi-matches'),
    engaged:   $('#roi-engaged'),
    initiated: $('#roi-initiated'),
    revOut:   $('#roi-revenue-out'),
    net:      $('#roi-net'),
    mult:     $('#roi-multiple'),
  };

  const fmt = {
    num:   (n) => Math.round(n).toLocaleString('en-US'),
    money: (n) => '$' + Math.round(n).toLocaleString('en-US'),
    moneyShort: (n) => {
      const v = Math.round(n);
      if (Math.abs(v) >= 1_000_000) return '$' + (v/1_000_000).toFixed(2).replace(/\.?0+$/,'') + 'M';
      if (Math.abs(v) >= 1_000)     return '$' + (v/1_000).toFixed(0) + 'K';
      return '$' + v.toLocaleString('en-US');
    },
  };

  const compute = () => {
    const ta = TA[el.ta.value] || TA.other;
    const visitors = +el.visitors.value;
    const rev = +el.revenue.value;
    const cost = +el.cost.value;

    const clicks    = visitors * BASE.clickRate  * ta.click;
    const matches   = clicks   * BASE.matchRate  * ta.match;
    const engaged   = matches  * BASE.engageRate * ta.engage;
    const initiated = engaged  * BASE.actionRate * ta.action;

    const annualRev = initiated * 12 * rev;
    const net = annualRev - cost;
    const multiple = cost > 0 ? annualRev / cost : 0;

    // Update sliders display
    el.vVal.textContent = fmt.num(visitors);
    el.rVal.textContent = fmt.money(rev);
    el.cVal.textContent = fmt.money(cost);

    // Update funnel
    el.clicks.textContent    = fmt.num(clicks);
    el.matches.textContent   = fmt.num(matches);
    el.engaged.textContent   = fmt.num(engaged);
    el.initiated.textContent = fmt.num(initiated);

    // Update totals
    el.revOut.textContent = fmt.moneyShort(annualRev);
    el.net.textContent    = (net < 0 ? '−' : '') + fmt.moneyShort(Math.abs(net));
    el.mult.textContent   = multiple.toFixed(1) + '× return';

    // Bar widths — relative to clicks
    const setBar = (id, ratio) => {
      const bar = document.querySelector(`#${id}`).closest('.roi__stage').querySelector('.roi__stage-fill');
      if (bar) bar.style.width = (ratio * 100).toFixed(1) + '%';
    };
    const maxClicks = Math.max(clicks, 1);
    setBar('roi-clicks',    1);
    setBar('roi-matches',   matches / maxClicks);
    setBar('roi-engaged',   engaged / maxClicks);
    setBar('roi-initiated', initiated / maxClicks);

    // Update hint
    if (el.taHint) el.taHint.textContent = ta.hint;
  };

  ['input', 'change'].forEach(evt => {
    el.ta.addEventListener(evt, compute);
    el.visitors.addEventListener(evt, compute);
    el.revenue.addEventListener(evt, compute);
    el.cost.addEventListener(evt, compute);
  });

  compute();
})();

/* ═══════════════════════════════════════════════════════════════
   Sticky side section navigator
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const sidenav = document.getElementById('sidenav');
  if (!sidenav) return;
  const items = Array.from(sidenav.querySelectorAll('.sidenav__item'));
  const mapping = items.map(a => ({ link: a, target: document.querySelector(a.getAttribute('href')) })).filter(m => m.target);

  /* Show sidenav only after hero */
  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => sidenav.classList.toggle('is-visible', !e.isIntersecting));
    }, { threshold: 0, rootMargin: '-80% 0px 0px 0px' });
    obs.observe(hero);
  } else {
    sidenav.classList.add('is-visible');
  }

  /* Active-dot spy */
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const match = mapping.find(m => m.target === entry.target);
          if (match) {
            items.forEach(i => i.classList.remove('is-active'));
            match.link.classList.add('is-active');
          }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    mapping.forEach(m => spy.observe(m.target));
  }
})();
