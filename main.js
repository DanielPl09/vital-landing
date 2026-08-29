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

  /* ---------- feature tabs ---------- */
  initFeatureTabs();

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

  function initFeatureTabs() {
    var root = document.getElementById('featureTabs');
    if (!root) return;

    var rail = root.querySelector('.ftabs__rail');
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.ftab'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.fpanel'));
    if (!rail || !tabs.length || tabs.length !== panels.length) return;

    // The rail and the collapsed stack are painted already — styles.css
    // hooks those on the .js class set inline in <head> — so there is no
    // class to add here, and no first-frame flash of all three panels.
    var current = 0;
    tabs.forEach(function (tab, i) {
      if (tab.getAttribute('aria-selected') === 'true') current = i;
    });

    // A clip plays only when it is BOTH the open panel and actually on
    // screen. The observer below owns the second half of that condition;
    // this is the single place the two are combined, so switching tabs
    // and scrolling can't leave a hidden video decoding.
    function syncPlayback() {
      panels.forEach(function (panel, i) {
        var video = panel.querySelector('.media__video');
        if (!video) return;
        if (i === current && video.isOnScreen && !reduced) {
          hydrateVideo(video);
          tryPlay(video);
        } else {
          video.pause();
        }
      });
    }

    function select(index, focusTab) {
      current = index;
      rail.style.setProperty('--ftab-i', String(index));

      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', String(on));
        // Roving tabindex: only the selected tab sits in the tab order, so
        // Tab steps over the rail and the arrow keys move within it.
        tab.tabIndex = on ? 0 : -1;
        if (on && focusTab) tab.focus();
      });

      panels.forEach(function (panel, i) {
        panel.classList.toggle('is-active', i === index);
      });

      syncPlayback();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i, false); });

      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        select(next, true);
      });
    });

    select(current, false);

    if ('IntersectionObserver' in window) {
      var player = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { entry.target.isOnScreen = entry.isIntersecting; });
        syncPlayback();
      }, { threshold: 0.5 });

      root.querySelectorAll('.media__video').forEach(function (v) { player.observe(v); });
    } else {
      // No observer to ask — treat every clip as visible and let the
      // open-panel half of the rule do the work on its own.
      panels.forEach(function (panel) {
        var video = panel.querySelector('.media__video');
        if (video) video.isOnScreen = true;
      });
      syncPlayback();
    }

    // The first tab is what a visitor lands on, so fetch its clip once the
    // page has settled rather than waiting for the section to scroll in.
    var first = panels[current] && panels[current].querySelector('.media__video');
    if (first) idleCallback(function () { hydrateVideo(first); });
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
