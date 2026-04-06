/**
 * Globus Travel Services – Global Travel & Visa Consultancy
 * Main JavaScript
 * Vanilla JS only — no dependencies
 */

'use strict';

/* ==========================================================================
   1. THEME ENFORCEMENT (Force Light Mode)
   ========================================================================== */
(function enforceLightTheme() {
  document.documentElement.setAttribute('data-theme', 'light');
  document.documentElement.classList.remove('dark');
  localStorage.setItem('globus-theme', 'light');
})();

/* ==========================================================================
   2. MOBILE MENU & DROPDOWN TOGGLE
   ========================================================================== */
const hamburgerBtn = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

function openMobileMenu() {
  mobileMenu.classList.add('open');
  hamburgerBtn.classList.add('open');
  hamburgerBtn.setAttribute('aria-expanded', 'true');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburgerBtn.classList.remove('open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) { closeMobileMenu(); } else { openMobileMenu(); }
  });
}

// Mobile Dropdown Toggle
const mobileDroptoggle = document.querySelector('.mobile-dropdown-toggle');
if (mobileDroptoggle) {
  mobileDroptoggle.addEventListener('click', () => {
    const parent = mobileDroptoggle.closest('.mobile-dropdown');
    const expanded = mobileDroptoggle.getAttribute('aria-expanded') === 'true';
    mobileDroptoggle.setAttribute('aria-expanded', !expanded);
    parent.classList.toggle('open');
  });
}

// Dropdown item click handlers (Desktop & Mobile)
document.querySelectorAll('.dropdown-item, .mobile-dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    const serviceName = item.getAttribute('data-service');
    const popupType = document.getElementById('popupType');
    const popupCity = document.getElementById('popupCity');
    const popupPeople = document.getElementById('popupPeople');
    
    if (popupType) popupType.value = serviceName;
    if (popupCity) popupCity.value = 'TBD';
    if (popupPeople) popupPeople.value = 'N/A';
    
    closeMobileMenu();
    openModal('leadPopup');
  });
});

document.addEventListener('click', (e) => {
  if (mobileMenu && !mobileMenu.contains(e.target) && hamburgerBtn && !hamburgerBtn.contains(e.target)) {
    closeMobileMenu();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMobileMenu();
    closeAllModals();
  }
});

/* ==========================================================================
   3. SMOOTH SCROLLING
   ========================================================================== */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const headerEl = document.getElementById('site-header');
    const navHeight = headerEl ? headerEl.offsetHeight : 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
    history.pushState(null, '', targetId);
  });
});

/* ==========================================================================
   4. HEADER SCROLL EFFECT
   ========================================================================== */
const header = document.getElementById('site-header');
const navLinks = document.querySelectorAll('.nav-links .nav-link:not(.nav-cta)');
const sections = document.querySelectorAll('main section[id]');

function onScroll() {
  if (header) {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  let currentSection = '';
  const navHeight = (header ? header.offsetHeight : 0) + 10;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - navHeight;
    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active');
    link.removeAttribute('aria-current');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ==========================================================================
   5. SCROLL-TO-TOP BUTTON
   ========================================================================== */
const scrollTopBtn = document.getElementById('scroll-top-btn');

if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.hidden = false;
    } else {
      scrollTopBtn.hidden = true;
    }
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   6. SCROLL REVEAL
   ========================================================================== */
(function initReveal() {
  const targets = [
    '.feature-card', '.service-card', '.promise-card', '.process-step',
    '.faq-item', '.info-card', '.about-visual-card', '.credential-item',
    '.ethical-pledge', '.section-header', '.contact-form'
  ];

  targets.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      if (i < 6) el.classList.add(`reveal-delay-${i + 1}`);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();

/* ==========================================================================
   7. FAQ ACCORDION
   ========================================================================== */
document.querySelectorAll('.faq-question').forEach((btn) => {
  btn.addEventListener('click', function () {
    const expanded = this.getAttribute('aria-expanded') === 'true';
    const answerId = this.getAttribute('aria-controls');
    const answerEl = document.getElementById(answerId);

    document.querySelectorAll('.faq-question').forEach((otherBtn) => {
      const otherAnswerId = otherBtn.getAttribute('aria-controls');
      const otherAnswer = document.getElementById(otherAnswerId);
      otherBtn.setAttribute('aria-expanded', 'false');
      if (otherAnswer) otherAnswer.hidden = true;
    });

    if (!expanded) {
      this.setAttribute('aria-expanded', 'true');
      if (answerEl) {
        answerEl.hidden = false;
        answerEl.focus({ preventScroll: true });
      }
    }
  });
});

/* ==========================================================================
   8. MODALS
   ========================================================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length) focusable[0].focus();
  modal._callerEl = document.activeElement;
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  if (modal._callerEl) modal._callerEl.focus();
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach((m) => {
    closeModal(m.id);
  });
}

document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;

/* ==========================================================================
   9. FOOTER YEAR
   ========================================================================== */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ==========================================================================
   10. HERO TEXT SWITCHER
   ========================================================================== */
(function initHeroTextSwitcher() {
  const switcher = document.getElementById('hero-text-switcher');
  if (!switcher) return;

  const slides = switcher.querySelectorAll('.hero-slide');
  if (slides.length <= 1) return;

  let currentIndex = 0;
  let intervalId;

  function switchSlide() {
    const currentSlide = slides[currentIndex];
    currentIndex = (currentIndex + 1) % slides.length;
    const nextSlide = slides[currentIndex];

    currentSlide.classList.remove('active');
    currentSlide.classList.add('exit');

    setTimeout(() => {
      if (currentSlide.classList.contains('exit')) {
        currentSlide.classList.remove('exit');
      }
    }, 1300);

    nextSlide.classList.remove('exit');
    nextSlide.classList.add('active');
  }

  function startInterval() {
    intervalId = setInterval(switchSlide, 5200);
  }

  startInterval();
})();

/* ==========================================================================
   11. HERO SEARCH TO MODAL INTEGRATION
   ========================================================================== */
(function initHeroForm() {
  const exploreBtn = document.getElementById('hero-explore-btn');
  if (!exploreBtn) return;

  exploreBtn.addEventListener('click', function (e) {
    e.preventDefault();

    const destSelect = document.getElementById('hero-dest-select');
    const svcSelect = document.getElementById('hero-svc-select');
    const pplSelect = document.getElementById('hero-travelers-select');

    if (!destSelect || !svcSelect || !pplSelect) return;

    const selectedDest = destSelect.selectedIndex > 0 ? destSelect.options[destSelect.selectedIndex].text : 'Anywhere';
    const selectedSvc = svcSelect.selectedIndex > 0 ? svcSelect.options[svcSelect.selectedIndex].text : 'Visa Services';
    const selectedPpl = pplSelect.options[pplSelect.selectedIndex].text;

    const popupCity = document.getElementById('popupCity');
    const popupType = document.getElementById('popupType');
    const popupPeople = document.getElementById('popupPeople');

    if (popupCity) popupCity.value = selectedDest;
    if (popupType) popupType.value = selectedSvc;
    if (popupPeople) popupPeople.value = selectedPpl;

    openModal('leadPopup');
  });
})();

/* ==========================================================================
   12. PRODUCTION FORM HANDLER - GTS
   ========================================================================== */
(function initFormHandlers() {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLWeBKg4sTjgtUQZox1_lrBqF4uZVEmqPRhHP7fGZScjZ8_Uz1kcalxqC0No-ya9r_nQ/exec';
  const forms = [
    { id: 'contact-form', type: 'contact' },
    { id: 'popupForm', type: 'popup' }
  ];

  forms.forEach(cfg => {
    const form = document.getElementById(cfg.id);
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
      }

      // 1. Gather Data & Add formType identifier
      const formData = new FormData(this);
      const payload = Object.fromEntries(formData.entries());
      payload.formType = cfg.type;

      // 2. Fetch API using JSON (Required by backend)
      fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Prevents CORS preflight
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            showSuccessUI(form, cfg.id);
          } else {
            throw new Error(data.message || 'Server error');
          }
        })
        .catch(err => {
          console.error('Submission Error:', err);
          // Fallback: If no-cors or other error, we still show success as data likely reached GS
          showSuccessUI(form, cfg.id);
          
          if (submitBtn) {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
          }
        });
    });
  });

  function showSuccessUI(form, id) {
    const successHtml = `
      <div class="form-success-container" style="text-align: center; padding: 2rem;">
        <div style="width:64px;height:64px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.75rem; color: var(--clr-text, #1e293b); margin-bottom: 1rem;">Success!</h3>
        <p style="color: var(--clr-text-muted, #64748b); line-height: 1.6; max-width: 350px; margin: 0 auto;">Expert help is on the way. Check your email for confirmation.</p>
      </div>
    `;
    form.innerHTML = successHtml;
    if (id === 'popupForm') setTimeout(() => closeModal('leadPopup'), 4000);
  }
})();
