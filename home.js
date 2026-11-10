/* Vital home page: the demo form. No build step, no dependencies.
   Requests are emailed to TO through FormSubmit (formsubmit.co). Without JS
   the form posts there directly; with JS it posts in the background and
   stays on the page. If the service can't be reached, the visitor's own mail
   app opens with the request already written, so a lead is never lost. */
(function () {
  'use strict';

  var TO = 'daniel@babelbits.dev';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + TO;

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- hero orb: listen → shape → review → approved ---------- */
  (function () {
    var scene = document.getElementById('orbScene');
    if (!scene) return;
    var rings = scene.querySelectorAll('.voice__ring');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Ring 1 is innermost. Each ring hears the voice a beat later than the
    // one inside it, so the swell travels outward like sound.
    var RINGS = [
      { r: 184, amp: 13, lag: 0.00, ph: 0.0 },
      { r: 200, amp: 10, lag: 0.14, ph: 1.9 },
      { r: 218, amp: 7,  lag: 0.28, ph: 3.7 }
    ];
    var POINTS = 120;
    var CX = 260, CY = 260;

    // A rough voice: syllables (fast) inside phrases (slow), never flat.
    function voice(t) {
      var syll = Math.abs(Math.sin(t * 5.1) * Math.sin(t * 1.63 + 1.1));
      var phrase = 0.55 + 0.45 * Math.sin(t * 0.7);
      return 0.25 + 0.75 * syll * phrase;
    }

    function draw(t, energy) {
      for (var k = 0; k < rings.length; k++) {
        var cfg = RINGS[k];
        var a = cfg.amp * (0.12 + energy * voice(t - cfg.lag));
        var d = '';
        for (var i = 0; i <= POINTS; i++) {
          var th = (i / POINTS) * Math.PI * 2;
          var r = cfg.r + a * (
            0.55 * Math.sin(3 * th + t * 2.1 + cfg.ph) +
            0.30 * Math.sin(5 * th - t * 3.3 + cfg.ph * 2) +
            0.15 * Math.sin(8 * th + t * 4.7)
          );
          d += (i ? 'L' : 'M') + (CX + r * Math.cos(th)).toFixed(1) + ' ' + (CY + r * Math.sin(th)).toFixed(1);
        }
        rings[k].setAttribute('d', d + 'Z');
      }
    }

    if (reduced) { draw(0.6, 0.5); return; }

    var HOLD = [4200, 2400, 2600, 3000]; // ms on each step; listening leads
    var step = 0;
    var timer = null;
    var frame = null;
    var onScreen = true;
    var energy = 1;

    function running() { return onScreen && !document.hidden; }

    function tick(now) {
      var target = step === 0 ? 1 : 0;
      energy += (target - energy) * 0.04; // ease between speaking and calm
      draw(now / 1000, energy);
      frame = running() ? requestAnimationFrame(tick) : null;
    }

    function schedule() {
      clearTimeout(timer);
      if (!running()) return;
      if (!frame) frame = requestAnimationFrame(tick);
      timer = setTimeout(function () {
        step = (step + 1) % HOLD.length;
        scene.setAttribute('data-step', String(step));
        schedule();
      }, HOLD[step]);
    }

    draw(0, 1);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        schedule();
      }).observe(scene);
    }
    document.addEventListener('visibilitychange', schedule);
    schedule();
  })();

  /* ---------- feature clips: play only while on screen ---------- */
  (function () {
    var clips = document.querySelectorAll('.frame--phone video');
    if (!clips.length || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      clips.forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var p = e.target.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          e.target.pause();
        }
      });
    }, { threshold: 0.25 });
    clips.forEach(function (v) { io.observe(v); });
  })();

  var form = document.getElementById('demoForm');
  var status = document.getElementById('formStatus');
  if (!form || !status) return;

  var fields = {
    name: form.elements.name,
    company: form.elements.company,
    email: form.elements.email,
    phone: form.elements.phone
  };
  var button = form.querySelector('button[type="submit"]');

  function value(el) { return el.value.trim(); }

  function check() {
    var problems = [];
    if (!value(fields.name)) problems.push([fields.name, 'your name']);
    if (!value(fields.company)) problems.push([fields.company, 'your company']);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value(fields.email))) problems.push([fields.email, 'a valid email']);

    Object.keys(fields).forEach(function (k) { fields[k].removeAttribute('aria-invalid'); });
    problems.forEach(function (p) { p[0].setAttribute('aria-invalid', 'true'); });

    if (problems.length) {
      status.textContent = 'Please add ' + problems.map(function (p) { return p[1]; }).join(', ') + '.';
      problems[0][0].focus();
      return false;
    }
    return true;
  }

  function mailtoFallback(data) {
    var body = [
      'Name: ' + data.name,
      'Company: ' + data.company,
      'Email: ' + data.email,
      'Phone: ' + (data.phone || '-')
    ].join('\n');
    window.location.href = 'mailto:' + TO +
      '?subject=' + encodeURIComponent('Vital demo request') +
      '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.elements._honey && form.elements._honey.value) return;
    if (!check()) return;

    var data = {
      name: value(fields.name),
      company: value(fields.company),
      email: value(fields.email),
      phone: value(fields.phone),
      _subject: 'Vital demo request: ' + value(fields.company),
      _replyto: value(fields.email),
      _template: 'table',
      _captcha: 'false'
    };

    button.disabled = true;
    status.textContent = 'Sending…';

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, j: j }; }); })
      .then(function (r) {
        if (!r.ok || String(r.j.success) !== 'true') throw new Error(r.j.message || 'send failed');
        status.textContent = 'Thanks, ' + data.name.split(' ')[0] + '. We’ll be in touch within one business day.';
        form.reset();
      })
      .catch(function () {
        status.textContent = 'Opening your email app to send the request…';
        mailtoFallback(data);
      })
      .then(function () { button.disabled = false; });
  });
})();
