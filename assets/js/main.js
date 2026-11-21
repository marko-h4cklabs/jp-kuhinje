(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- language ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.setLang === lang));
    });
    document.querySelectorAll('[data-ph-' + lang + ']').forEach(function (el) {
      el.placeholder = el.getAttribute('data-ph-' + lang);
    });
    document.title = lang === 'en'
      ? 'JP Kuhinje | Outdoor kitchens with character'
      : 'JP Kuhinje | Vanjske kuhinje s karakterom';
    store('jp-lang', lang);
  }
  var saved = store('jp-lang');
  var initial = saved || (/^(hr|bs|sr|sh)/i.test(navigator.language || 'hr') ? 'hr' : 'en');
  setLang(initial);
  document.querySelectorAll('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.setLang); });
  });
  function t(hr, en) { return root.getAttribute('data-lang') === 'en' ? en : hr; }

  /* ---------- nav ---------- */
  var nav = document.querySelector('.nav');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var burger = document.querySelector('.burger');
  var menu = document.getElementById('mobile-menu');
  function closeMenu() { burger.setAttribute('aria-expanded', 'false'); menu.hidden = true; }
  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
    if (!open) nav.classList.add('is-scrolled');
  });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------- reveal on scroll ---------- */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el, i) {
      var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(sibs, 5) * 90 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- video ---------- */
  var video = document.getElementById('revealVideo');
  var phone = video && video.closest('.phone');
  var playBtn = phone && phone.querySelector('.phone__play');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function play() { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
  if (video) {
    video.addEventListener('play', function () { phone.classList.add('is-playing'); });
    video.addEventListener('pause', function () { phone.classList.remove('is-playing'); });
    playBtn.addEventListener('click', play);
    video.addEventListener('click', function () { video.paused ? play() : video.pause(); });
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? play() : video.pause(); });
      }, { threshold: 0.45 }).observe(video);
    }
  }

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  var lastFocus = null;
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  document.querySelectorAll('.gal__item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      lastFocus = btn;
      lbImg.src = btn.dataset.full;
      lbImg.alt = btn.querySelector('img').alt;
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lightbox__close').focus();
    });
  });
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  /* ---------- edition links prefill form ---------- */
  document.querySelectorAll('[data-edition]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = document.querySelector('input[name="edition"][value="' + a.dataset.edition + '"]');
      if (r) r.checked = true;
    });
  });

  /* ---------- enquiry form ----------
     Sends via the visitor's e-mail client (mailto). To receive submissions
     directly, point FORM_ENDPOINT at a form service (e.g. Formspree, Netlify
     Forms, Web3Forms) and the form will POST JSON there instead. */
  var FORM_ENDPOINT = '';
  var TO = 'info@jp-kuhinje.com';
  var form = document.getElementById('enquiry');
  var note = form.querySelector('.form__note');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['name', 'email'].forEach(function (n) {
      var f = form.elements[n];
      var bad = !f.value.trim() || (n === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
      f.classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = t('Molimo unesite ime i ispravnu e-mail adresu.', 'Please enter your name and a valid e-mail address.'); return; }

    var data = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      location: form.elements.location.value.trim(),
      edition: (form.querySelector('input[name="edition"]:checked') || {}).value || '',
      message: form.elements.message.value.trim()
    };

    if (FORM_ENDPOINT) {
      note.textContent = t('Šaljem…', 'Sending…');
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(); form.reset(); note.textContent = t('Hvala! Javit ćemo vam se unutar jednog radnog dana.', 'Thank you! We will be in touch within one working day.'); })
        .catch(function () { note.textContent = t('Slanje nije uspjelo. Pišite nam na ' + TO, 'Sending failed. Please e-mail us at ' + TO); });
      return;
    }

    var body = [
      'Ime / Name: ' + data.name,
      'E-mail: ' + data.email,
      'Telefon / Phone: ' + data.phone,
      'Lokacija / Location: ' + data.location,
      'Izvedba / Edition: ' + data.edition,
      '',
      data.message
    ].join('\n');
    window.location.href = 'mailto:' + TO + '?subject=' + encodeURIComponent('Upit: ' + data.edition + ', ' + data.name) + '&body=' + encodeURIComponent(body);
    note.textContent = t('Otvaramo vaš e-mail program…', 'Opening your e-mail app…');
  });

  /* ---------- year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
