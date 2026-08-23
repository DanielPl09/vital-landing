/* Vital landing — no build step, no dependencies. */
(function () {
  'use strict';

  /* ---------- mobile nav ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');

  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- header hairline once scrolled ---------- */
  var header = document.getElementById('siteHeader');
  var onScroll = function () {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------- feature accordion ---------- */
  initFeatureAccordion();

  function idleCallback(cb) {
    if ('requestIdleCallback' in window) requestIdleCallback(cb, { timeout: 2000 });
    else setTimeout(cb, 1200);
  }

  function hydrateVideo(video) {
    if (!video || !video.dataset.src || video.src) return;
    video.src = video.dataset.src;
    video.load();
  }

  function tryPlay(video) {
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked — poster stands in */ });
  }

  function initFeatureAccordion() {
    var root = document.getElementById('featureAccordion');
    if (!root) return;

    var items = Array.prototype.slice.call(root.querySelectorAll('.accordion__item'));

    // Feature 1 ships with a real video src and loads eagerly. Every other
    // feature (currently just feature 2) only carries a data-src, so the
    // browser never fetches it on page load — hydrate those in the
    // background once idle, so the clip is ready the moment its section
    // is opened, without competing with first paint.
    root.querySelectorAll('.media__video[data-src]').forEach(function (video) {
      idleCallback(function () { hydrateVideo(video); });
    });

    root.classList.add('is-js');

    // Animates by measuring real content height (scrollHeight) rather than
    // transitioning grid-template-rows — a nested grid inside an animating
    // 0fr/1fr row froze mid-transition in testing, so this uses the
    // classic, reliable height-transition accordion recipe instead.
    function setOpen(item, open, animate) {
      var trigger = item.querySelector('.accordion__trigger');
      var body = item.querySelector('.accordion__body');
      trigger.setAttribute('aria-expanded', String(open));
      body.setAttribute('aria-hidden', String(!open));

      if (open) {
        item.classList.add('is-open');
        if (!animate) {
          body.style.height = 'auto';
          return;
        }
        body.style.height = body.scrollHeight + 'px';
        body.addEventListener('transitionend', function onEnd(e) {
          if (e.propertyName !== 'height') return;
          body.removeEventListener('transitionend', onEnd);
          if (item.classList.contains('is-open')) body.style.height = 'auto';
        });
      } else {
        var video = body.querySelector('.media__video');
        if (video) video.pause();
        if (!animate) {
          item.classList.remove('is-open');
          body.style.height = '0px';
          return;
        }
        // Freeze the current (possibly 'auto') height as a concrete pixel
        // value first — a transition can't animate away from 'auto'.
        body.style.height = body.scrollHeight + 'px';
        void body.offsetHeight; // force layout so that height is committed
        item.classList.remove('is-open');
        requestAnimationFrame(function () { body.style.height = '0px'; });
      }
    }

    // Clicking a header toggles just that section. Sections are not
    // mutually exclusive: see the scroll-driven opening below for why.
    items.forEach(function (item) {
      item.querySelector('.accordion__trigger').addEventListener('click', function () {
        setOpen(item, !item.classList.contains('is-open'), true);
      });
    });

    // Feature 1 starts open, the rest closed — set instantly, no animation,
    // so the page doesn't visibly "open" on every load.
    items.forEach(function (item, i) { setOpen(item, i === 0, false); });

    // Each section then opens on its own as the reader scrolls to it, so
    // nobody has to click to reach the next feature.
    //
    // Opening is deliberately one-way. Auto-closing the previous section
    // would pull ~360px of content out from *above* the reading position,
    // jumping the page mid-scroll — and since that jump drags the next
    // header back across the trigger line, it can oscillate. Expanding only
    // ever adds height below where the reader is looking, so nothing they
    // can see moves.
    //
    // Only ever opens ONE section per frame. Collapsed headers sit ~85px
    // apart, so a batch check would trip every remaining section at once
    // and dump the whole list open in a single step. Opening one and
    // stopping lets its expansion push the next header back down the page,
    // so the reader has to actually scroll to earn each one.
    if (!reduced) {
      var ticking = false;
      var lastOpenAt = null;
      var MIN_SCROLL_BETWEEN = 220;

      var openNextInView = function () {
        ticking = false;
        var y = window.scrollY;

        // Hold off until the reader has actually travelled since the last
        // section opened. Without this the pacing depends on how far the
        // previous expansion happened to push the next header down, which
        // varies with each section's height and with where the height
        // animation is at the instant we measure.
        if (lastOpenAt !== null && Math.abs(y - lastOpenAt) < MIN_SCROLL_BETWEEN) return;

        var line = window.innerHeight * 0.72;
        for (var i = 0; i < items.length; i++) {
          if (items[i].classList.contains('is-open')) continue;
          if (items[i].getBoundingClientRect().top < line) {
            setOpen(items[i], true, true);
            lastOpenAt = y;
            return;
          }
        }
      };

      var queueCheck = function () {
        if (!ticking) { ticking = true; requestAnimationFrame(openNextInView); }
      };

      window.addEventListener('scroll', queueCheck, { passive: true });
      window.addEventListener('resize', queueCheck);
      queueCheck();
    }

    // A video only plays once its own accordion section is open AND the
    // majority of the clip is actually on screen — not merely present in
    // a collapsed (zero-height) panel.
    if ('IntersectionObserver' in window) {
      var player = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          var item = video.closest('.accordion__item');
          var isOpen = item && item.classList.contains('is-open');
          if (entry.isIntersecting && isOpen && !reduced) {
            hydrateVideo(video);
            tryPlay(video);
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.5 });

      root.querySelectorAll('.media__video').forEach(function (v) { player.observe(v); });
    }
  }

  /* ---------- demo form (front-end only for now) ---------- */
  var form = document.getElementById('demoForm');
  var status = document.getElementById('formStatus');

  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.elements.email.value.trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        status.textContent = 'Please enter a valid work email.';
        form.elements.email.focus();
        return;
      }

      // TODO: POST to the real booking endpoint.
      status.textContent = 'Thanks — we will be in touch within one business day.';
      form.reset();
    });
  }

  /* ---------- footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
