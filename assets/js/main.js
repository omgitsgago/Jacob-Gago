'use strict';

// ============================================================
//   JACOB GAGO — main.js
// ============================================================

// ---- DOM References ----
const header     = document.getElementById('site-header');
const hamburger  = document.getElementById('nav-hamburger');
const navLinks   = document.getElementById('nav-links');
const statsBar   = document.getElementById('stats-bar');
const footerYear = document.getElementById('footer-year');
const form       = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const submitBtn  = document.getElementById('submit-btn');

// ---- Footer Year ----
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

// ============================================================
//   NAV: Scroll → Frosted Glass
// ============================================================
function updateNav() {
  if (!header) return;
  if (window.scrollY > 70) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ============================================================
//   HAMBURGER MENU
// ============================================================
function openMenu() {
  hamburger.classList.add('open');
  navLinks.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });
}

if (navLinks) {
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// ============================================================
//   HERO TEXT — Staggered Word Animation
// ============================================================
function animateHero() {
  const label = document.querySelector('.hero-label');
  const name  = document.querySelector('.hero-name');

  if (label) label.classList.add('revealed');
  if (name)  name.classList.add('revealed');
}

// ============================================================
//   PLACEMENTS CAROUSEL
// ============================================================
function initCarousel() {
  const track   = document.getElementById('placements-track');
  const prevBtn = document.getElementById('prev-placement');
  const nextBtn = document.getElementById('next-placement');
  if (!track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;

  function getCards() {
    return Array.from(track.querySelectorAll('.placement-card'));
  }

  function syncIndexFromScroll() {
    const cards = getCards();
    if (!cards.length) return;
    const trackLeft = track.getBoundingClientRect().left;
    let closestIndex = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.getBoundingClientRect().left - trackLeft);
      if (dist < closestDist) { closestDist = dist; closestIndex = i; }
    });
    currentIndex = closestIndex;
  }

  let scrollTimer;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(syncIndexFromScroll, 120);
  }, { passive: true });

  function scrollToIndex(index) {
    const cards = getCards();
    if (!cards.length) return;
    const total = cards.length;
    currentIndex = ((index % total) + total) % total;
    const card = cards[currentIndex];
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }

  nextBtn.addEventListener('click', () => scrollToIndex(currentIndex + 1));
  prevBtn.addEventListener('click', () => scrollToIndex(currentIndex - 1));
}

// ============================================================
//   SCROLL OBSERVER — Fade-Up Animations
// ============================================================
const observerConfig = {
  threshold: 0.12,
  rootMargin: '0px 0px -48px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      scrollObserver.unobserve(entry.target);
    }
  });
}, observerConfig);

function observeFadeElements() {
  document.querySelectorAll('.fade-up, .fade-in').forEach(el => {
    scrollObserver.observe(el);
  });
}

// Export for youtube.js to register dynamically created cards
window.scrollObserver = scrollObserver;

// ============================================================
//   STATS COUNT-UP
// ============================================================
let statsAnimated = false;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function countUp(el, target, suffix) {
  const duration = 1600;
  const start    = performance.now();

  function tick(now) {
    const elapsed  = Math.min(now - start, duration);
    const progress = easeOutCubic(elapsed / duration);
    el.textContent = Math.round(progress * target) + suffix;

    if (elapsed < duration) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target + suffix;
    }
  }

  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !statsAnimated) {
      statsAnimated = true;

      document.querySelectorAll('.stat-number[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix ?? '';
        countUp(el, target, suffix);
      });

      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

if (statsBar) {
  statsObserver.observe(statsBar);
}

// ============================================================
//   SMOOTH SCROLL — Fixed Nav Offset
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();

    const navHeight = header?.offsetHeight ?? 80;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ============================================================
//   CONTACT FORM — Web3Forms AJAX
// ============================================================
if (form) {
  const select = form.querySelector('select');

  // Add .has-value class to style selected option differently
  if (select) {
    select.addEventListener('change', () => {
      select.classList.toggle('has-value', select.value !== '');
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!submitBtn || !formStatus) return;

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending\u2026';
    submitBtn.disabled = true;
    formStatus.className = 'form-status';

    try {
      const res  = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      const json = await res.json().catch(() => ({}));

      if (json.success) {
        formStatus.className = 'form-status success';
        formStatus.textContent = "Message sent \u2014 I'll be in touch shortly.";
        form.reset();
        if (select) select.classList.remove('has-value');
      } else {
        throw new Error(json.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      formStatus.className = 'form-status error';
      formStatus.textContent = err.message || 'Something went wrong. Email contact@jacobgago.com directly.';
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ============================================================
//   INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  animateHero();
  observeFadeElements();
  initCarousel();
});
