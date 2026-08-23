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

  /* ---------- play feature videos only while on screen ---------- */
  var videos = document.querySelectorAll('.media__video');
  if (videos.length && 'IntersectionObserver' in window) {
    var player = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting && !reduced) {
          var play = video.play();
          if (play && play.catch) play.catch(function () { /* autoplay blocked — poster stands in */ });
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.35 });

    videos.forEach(function (video) { player.observe(video); });
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
