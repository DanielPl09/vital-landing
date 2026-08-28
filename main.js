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

  // Matches `.js .ftabs__rail { top: calc(var(--header-h) + 10px) }` — the
  // offset the feature rail pins itself at once the page scrolls.
  var STICK_OFFSET = 82;

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

  /* ---------- hero flow ---------- */
  initHeroFlow();

  /* Runs the product narrative across the hero collage: the patient record
     lights up, a pulse travels the wire into the chat, the conversation
     settles the appointment, and a return pulse marks the record Booked.

     The wire has to be measured rather than hand-drawn — .panel--db and
     .panel--chat are positioned in a mix of % and px, so the channel
     between them moves with the container width. */
  function initHeroFlow() {
    var art = document.querySelector('.hero__art');
    if (!art) return;

    var svg    = art.querySelector('.wire');
    var track  = art.querySelector('.wire__track');
    var pulse  = art.querySelector('.wire__pulse');
    var chat   = art.querySelector('.panel--chat');
    var row    = art.querySelector('[data-flow-row]');
    var chip   = art.querySelector('[data-flow-chip]');
    var thread = art.querySelector('.thread');
    var steps  = Array.prototype.slice.call(art.querySelectorAll('[data-flow-step]'));
    if (!svg || !track || !pulse || !chat || !row || !chip || !thread || !steps.length) return;

    function layout() {
      var a = art.getBoundingClientRect();
      if (!a.width || !a.height) return;
      svg.setAttribute('viewBox', '0 0 ' + a.width + ' ' + a.height);

      var r = row.getBoundingClientRect();
      var c = chat.getBoundingClientRect();
      var x1 = r.right - a.left;
      var y1 = r.top + r.height / 2 - a.top;
      var x2 = c.left + c.width * 0.55 - a.left;
      var y2 = c.bottom - a.top;

      // The two panels very nearly touch, so there is no channel straight
      // across between them. The route instead drops almost vertically out
      // of the record — a short leg hidden behind the database panel —
      // then crosses the open band underneath both panels and climbs into
      // the underside of the chat. That band is the only stretch wide
      // enough to read as a connection rather than a stray mark.
      var floor = a.height - 40;
      var d = 'M' + x1 + ' ' + y1 +
              ' C' + (x1 - 2) + ' ' + (y1 + (floor - y1) * 0.85) +
              ',' + (x1 + (x2 - x1) * 0.40) + ' ' + (floor + 34) +
              ',' + x2 + ' ' + y2;
      track.setAttribute('d', d);
      pulse.setAttribute('d', d);
    }

    layout();

    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(art);
    else window.addEventListener('resize', layout);

    // Reduced motion gets the settled end state: the conversation already
    // happened and the record already says Booked.
    if (reduced) {
      chip.textContent = 'Booked';
      chip.classList.add('chip--ok');
      return;
    }

    var timers = [];
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function stop() { timers.forEach(clearTimeout); timers = []; }

    function pulseAlong(back) {
      var from = back ? '-0.86' : '0.14';
      var to   = back ? '0.14'  : '-0.86';
      pulse.animate([
        { strokeDashoffset: from, opacity: 0 },
        { opacity: 1, offset: 0.12 },
        { opacity: 1, offset: 0.82 },
        { strokeDashoffset: to, opacity: 0 }
      ], { duration: 950, easing: 'cubic-bezier(.45,0,.25,1)' });
    }

    function play() {
      stop();
      steps.forEach(function (s) { s.classList.remove('is-shown'); });
      row.classList.remove('is-live');
      chip.textContent = 'Intake';
      chip.classList.remove('chip--ok');

      at(400,  function () { row.classList.add('is-live'); });
      at(700,  function () { pulseAlong(false); });
      at(1550, function () { steps[0].classList.add('is-shown'); });
      at(2150, function () { steps[1].classList.add('is-shown'); });
      at(2850, function () { steps[2].classList.add('is-shown'); });
      at(3550, function () { steps[3].classList.add('is-shown'); });
      at(4300, function () { pulseAlong(true); });
      at(5150, function () { chip.textContent = 'Booked'; chip.classList.add('chip--ok'); });
      at(5700, function () { row.classList.remove('is-live'); });
      at(8200, play);
    }

    // The thread starts hidden from styles.css (.js + no-preference), so
    // there is nothing to stage here — only to reveal, in play() below.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) play(); else stop(); });
      }, { threshold: 0.25 }).observe(art);
    } else {
      play();
    }
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

    // The rail now sits at the bottom of the first screen, so a click on it
    // is usually made with only a sliver of the panel showing. Bring the
    // panel up to meet the click — scrolled to exactly the offset the rail
    // sticks at, so the tabs stay put and only the content moves.
    //
    // Guarded twice: never when the panel is already fully visible, and
    // never upward, so a click made further down the section can't yank the
    // reader back up to the rail.
    function revealStage() {
      var stage = root.querySelector('.ftabs__stage');
      if (!stage) return;
      if (stage.getBoundingClientRect().bottom <= window.innerHeight) return;

      var target = root.getBoundingClientRect().top + window.scrollY - STICK_OFFSET;
      if (target <= window.scrollY + 4) return;

      window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
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
      tab.addEventListener('click', function () { select(i, false); revealStage(); });

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
