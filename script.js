/* =========================================================
   SIKA STUDIO — Interactions
   ========================================================= */
(function () {
  'use strict';

  /* ---------- CONFIG ---------- */
  const WHATSAPP_NUMBER = '22957733365';

  const PACKS = {
    starter: {
      name: 'Starter',
      price: 25000,
      features: [
        '3 vidéos UGC IA',
        'Durée 15 à 60 secondes',
        'Avatar adapté à votre produit',
        'Objectif défini selon votre besoin',
        '1 correction incluse',
        'Livraison sous 48 h'
      ]
    },
    growth: {
      name: 'Growth',
      price: 45000,
      features: [
        '7 vidéos UGC IA',
        '3 photos produit professionnelles',
        '1 affiche publicitaire BONUS',
        'Avatar adapté à votre produit',
        'Objectif défini selon votre besoin',
        '1 correction incluse',
        'Livraison sous 48 h'
      ]
    },
    scale: {
      name: 'Scale',
      price: 80000,
      features: [
        '16 vidéos UGC IA',
        '5 photos produit professionnelles',
        '3 affiches publicitaires',
        'Avatar adapté à votre produit',
        'Objectif défini selon votre besoin',
        '3 corrections incluses',
        'Livraison sous 72 h'
      ]
    }
  };

  /* ---------- UTILITAIRES ---------- */
  function formatFCFA(amount) {
    return String(amount)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
      .concat(' FCFA');
  }

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  /* ---------- HEADER : ombre au scroll ---------- */
  function initHeaderScroll() {
    const header = $('#siteHeader');
    if (!header) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        if (window.scrollY > 12) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- HERO : rotation des douleurs ---------- */
  function initHeroPains() {
    const container = $('#heroPains');
    if (!container) return;

    const pains = $$('.pain', container);
    if (pains.length < 2) return;

    let current = 0;
    const INTERVAL = 2400;

    setInterval(function () {
      pains[current].classList.remove('is-active');
      current = (current + 1) % pains.length;
      pains[current].classList.add('is-active');
    }, INTERVAL);
  }

  /* ---------- VIDÉOS : fallback placeholder ---------- */
  function initVideoFallbacks() {
    const videos = $$('.video-slide video');
    videos.forEach(function (video) {
      const slide = video.closest('.video-slide');
      if (!slide) return;

      const sources = $$('source', video);
      if (sources.length === 0) return;

      const lastSource = sources[sources.length - 1];
      lastSource.addEventListener('error', function () {
        slide.classList.add('is-error');
      });

      video.addEventListener('loadeddata', function () {
        slide.classList.remove('is-error');
      });

      video.addEventListener('error', function () {
        slide.classList.add('is-error');
      });
    });
  }

  /* ---------- CARROUSEL HORIZONTAL ---------- */
  function initVideoCarousel() {
    const track = $('#videoTrack');
    const dots = $$('#videoDots .video-dot');
    const slides = $$('.video-slide', track);

    if (!track || slides.length === 0) return;

    function setActiveDot(index) {
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function getCurrentIndex() {
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDistance = Infinity;
      slides.forEach(function (slide, i) {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(slideCenter - trackCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      });
      return best;
    }

    let scrollTimer = null;
    track.addEventListener('scroll', function () {
      if (scrollTimer) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(function () {
        setActiveDot(getCurrentIndex());
      }, 80);
    }, { passive: true });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = parseInt(dot.getAttribute('data-index'), 10) || 0;
        const target = slides[index];
        if (!target) return;
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
        setActiveDot(index);
      });
    });

    slides.forEach(function (slide) {
      const video = $('video', slide);
      if (!video) return;
      video.addEventListener('play', function () {
        slides.forEach(function (otherSlide) {
          if (otherSlide === slide) return;
          const otherVideo = $('video', otherSlide);
          if (otherVideo && !otherVideo.paused) {
            otherVideo.pause();
          }
        });
      });
    });

    setActiveDot(0);
  }

  /* ---------- RÉCAPITULATIF ---------- */
  const recapEl = $('#recap');
  const recapPackNameEl = $('#recapPackName');
  const recapFeaturesEl = $('#recapFeatures');
  const recapTotalEl = $('#recapTotal');
  const recapDepositEl = $('#recapDeposit');
  const recapBalanceEl = $('#recapBalance');

  function renderRecap(packKey) {
    const pack = PACKS[packKey];
    if (!pack || !recapEl) return;

    const deposit = Math.round(pack.price * 0.5);
    const balance = pack.price - deposit;

    recapPackNameEl.textContent = pack.name;

    recapFeaturesEl.innerHTML = '';
    pack.features.forEach(function (feature) {
      const li = document.createElement('li');
      li.textContent = feature;
      recapFeaturesEl.appendChild(li);
    });

    recapTotalEl.textContent = formatFCFA(pack.price);
    recapDepositEl.textContent = formatFCFA(deposit);
    recapBalanceEl.textContent = formatFCFA(balance);

    if (recapEl.hidden) {
      recapEl.hidden = false;
    }
  }

  /* ---------- SÉLECTION DU PACK ---------- */
  function initPackSelection() {
    const form = $('#orderForm');
    if (!form) return;

    const radios = $$('input[name="pack"]', form);

    $$('[data-select-pack]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const packKey = btn.getAttribute('data-select-pack');
        const radio = radios.find(function (r) { return r.value === packKey; });
        if (radio) {
          radio.checked = true;
          renderRecap(packKey);
        }
        const target = document.getElementById('commande');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    radios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (radio.checked) {
          renderRecap(radio.value);
        }
      });
    });
  }

  /* ---------- FORMULAIRE : validation + WhatsApp ---------- */
  function initFormSubmit() {
    const form = $('#orderForm');
    if (!form) return;

    const statusEl = $('#formStatus');

    function clearStatus() {
      if (!statusEl) return;
      statusEl.textContent = '';
      statusEl.classList.remove('is-success');
    }

    function setStatus(message, isSuccess) {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.classList.toggle('is-success', !!isSuccess);
    }

    function markInvalid(el) {
      if (el && el.classList) el.classList.add('is-invalid');
    }

    function clearInvalid(el) {
      if (el && el.classList) el.classList.remove('is-invalid');
    }

    form.addEventListener('input', function (e) {
      if (e.target && e.target.classList) clearInvalid(e.target);
    });

    form.addEventListener('change', function (e) {
      if (e.target && e.target.classList) clearInvalid(e.target);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearStatus();

      const nom = $('#nom');
      const whatsapp = $('#whatsapp');
      const produit = $('#produit');
      const type = $('#type');
      const objectif = $('#objectif');
      const lien = $('#lien');
      const brief = $('#brief');

      const required = [nom, whatsapp, produit, type, objectif];
      let firstInvalid = null;

      required.forEach(function (field) {
        if (!field.value.trim()) {
          markInvalid(field);
          if (!firstInvalid) firstInvalid = field;
        } else {
          clearInvalid(field);
        }
      });

      const packRadio = form.querySelector('input[name="pack"]:checked');
      if (!packRadio) {
        const packFieldset = form.querySelector('.pack-fieldset');
        if (packFieldset) packFieldset.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setStatus('Merci de choisir un pack (Starter, Growth ou Scale).');
        return;
      }

      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus({ preventScroll: true });
        setStatus('Merci de compléter tous les champs obligatoires.');
        return;
      }

      const packKey = packRadio.value;
      const pack = PACKS[packKey];
      if (!pack) {
        setStatus('Pack inconnu. Merci de réessayer.');
        return;
      }

      const deposit = Math.round(pack.price * 0.5);
      const balance = pack.price - deposit;

      const lines = [
        '🛒 NOUVELLE COMMANDE — SIKA STUDIO',
        '',
        '👤 Nom : ' + nom.value.trim(),
        '📱 WhatsApp : ' + whatsapp.value.trim(),
        '📦 Produit : ' + produit.value.trim(),
        '🏷️ Type : ' + type.value,
        '🎯 Objectif : ' + objectif.value,
        '📋 Pack : ' + pack.name,
        '',
        '📝 Brief : ' + (brief.value.trim() || '—'),
        '🔗 Lien produit : ' + (lien.value.trim() || '—'),
        '',
        '💰 Total : ' + formatFCFA(pack.price),
        '✅ Acompte (50 %) : ' + formatFCFA(deposit),
        '⏳ Solde à la livraison : ' + formatFCFA(balance),
        '',
        '📌 Conditions : 50 % à la commande • 50 % à la livraison.',
        '',
        'Contenu inclus :',
        pack.features.map(function (f) { return '• ' + f; }).join('\n')
      ];

      const message = lines.join('\n');
      const encoded = encodeURIComponent(message);
      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encoded;

      try {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.position = 'fixed';
        a.style.left = '-9999px';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setStatus('WhatsApp s\'ouvre avec votre commande préremplie…', true);
      } catch (err) {
        try {
          window.location.href = url;
        } catch (err2) {
          setStatus('Impossible d\'ouvrir WhatsApp automatiquement. Copiez ce lien : ' + url);
        }
      }
    });
  }

  /* ---------- FAQ accordéon ---------- */
  function initFaq() {
    const items = $$('.faq-item');
    if (items.length === 0) return;

    items.forEach(function (item) {
      const button = $('.faq-question', item);
      const answer = $('.faq-answer', item);
      if (!button || !answer) return;

      button.addEventListener('click', function () {
        const isOpen = item.classList.contains('is-open');

        items.forEach(function (other) {
          if (other === item) return;
          other.classList.remove('is-open');
          const otherBtn = $('.faq-question', other);
          const otherAns = $('.faq-answer', other);
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAns) otherAns.hidden = true;
        });

        if (isOpen) {
          item.classList.remove('is-open');
          button.setAttribute('aria-expanded', 'false');
          answer.hidden = true;
        } else {
          item.classList.add('is-open');
          button.setAttribute('aria-expanded', 'true');
          answer.hidden = false;
        }
      });
    });
  }

  /* ---------- REVEAL AU SCROLL ---------- */
  function initReveal() {
    const elements = $$('.reveal');
    if (elements.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- INIT ---------- */
  function init() {
    initHeaderScroll();
    initHeroPains();
    initVideoFallbacks();
    initVideoCarousel();
    initPackSelection();
    initFormSubmit();
    initFaq();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
