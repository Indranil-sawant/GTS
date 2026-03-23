/**
 * GTS – Global Travel & Visa Consultancy
 * Main JavaScript
 * Vanilla JS only — no dependencies
 */

'use strict';

/* ==========================================================================
   1. DARK MODE TOGGLE
   ========================================================================== */
(function initDarkMode() {
  const root    = document.documentElement; // <html data-theme="...">
  const btn     = document.getElementById('dark-mode-toggle');
  const PREF_KEY = 'gts-theme';

  // Respect OS preference as default, then stored preference
  const getPreferred = () => {
    const stored = localStorage.getItem(PREF_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(PREF_KEY, theme);
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };

  // Initialise on load
  applyTheme(getPreferred());

  // Toggle on click
  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
})();


/* ==========================================================================
   2. MOBILE MENU TOGGLE
   ========================================================================== */
const hamburgerBtn = document.getElementById('mobile-menu-toggle');
const mobileMenu   = document.getElementById('mobile-menu');

function openMobileMenu() {
  mobileMenu.classList.add('open');
  hamburgerBtn.classList.add('open');
  hamburgerBtn.setAttribute('aria-expanded', 'true');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Prevent scroll when menu open
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  hamburgerBtn.classList.remove('open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

hamburgerBtn.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.contains('open');
  if (isOpen) { closeMobileMenu(); } else { openMobileMenu(); }
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
    closeMobileMenu();
  }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMobileMenu();
    closeAllModals();
  }
});


/* ==========================================================================
   3. SMOOTH SCROLLING (enhanced — accounts for fixed nav height)
   ========================================================================== */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const navHeight = document.getElementById('site-header').offsetHeight;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    // Update URL without jump
    history.pushState(null, '', targetId);
  });
});


/* ==========================================================================
   4. HEADER SCROLL EFFECT + ACTIVE NAV LINK
   ========================================================================== */
const header      = document.getElementById('site-header');
const navLinks    = document.querySelectorAll('.nav-links .nav-link:not(.nav-cta)');
const sections    = document.querySelectorAll('main section[id]');

function onScroll() {
  // Sticky header shadow
  if (window.scrollY > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Active nav link based on current section
  let currentSection = '';
  const navHeight = header.offsetHeight + 10;

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
onScroll(); // Run once on load


/* ==========================================================================
   5. SCROLL-TO-TOP BUTTON
   ========================================================================== */
const scrollTopBtn = document.getElementById('scroll-top-btn');

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


/* ==========================================================================
   6. SCROLL REVEAL (Intersection Observer)
   ========================================================================== */
(function initReveal() {
  // Add .reveal to elements we want to animate in
  const targets = [
    '.feature-card',
    '.service-card',
    '.promise-card',
    '.process-step',
    '.faq-item',
    '.info-card',
    '.about-visual-card',
    '.credential-item',
    '.ethical-pledge',
    '.section-header',
    '.contact-form',
  ];

  targets.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger siblings
      if (i < 6) el.classList.add(`reveal-delay-${i + 1}`);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Animate once
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
    const expanded  = this.getAttribute('aria-expanded') === 'true';
    const answerId  = this.getAttribute('aria-controls');
    const answerEl  = document.getElementById(answerId);

    // Close all others first
    document.querySelectorAll('.faq-question').forEach((otherBtn) => {
      const otherAnswerId = otherBtn.getAttribute('aria-controls');
      const otherAnswer   = document.getElementById(otherAnswerId);
      otherBtn.setAttribute('aria-expanded', 'false');
      if (otherAnswer) otherAnswer.hidden = true;
    });

    // Toggle current
    if (!expanded) {
      this.setAttribute('aria-expanded', 'true');
      answerEl.hidden = false;
      answerEl.focus({ preventScroll: true });
    }
  });
});


/* ==========================================================================
   8. MODALS
   ========================================================================== */
/**
 * Opens the modal with the given ID.
 * @param {string} modalId
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Focus first focusable element
  const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length) focusable[0].focus();

  // Store caller to restore focus later
  modal._callerEl = document.activeElement;
}

/**
 * Closes the modal with the given ID.
 * @param {string} modalId
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Restore focus to caller
  if (modal._callerEl) modal._callerEl.focus();
}

/** Close all modals */
function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach((m) => {
    closeModal(m.id);
  });
}

// Close on backdrop click
document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// Expose globally (used in inline onclick)
window.openModal  = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;


/* ==========================================================================
   9. CONTACT FORM VALIDATION
   ========================================================================== */
(function initContactForm() {
  const form        = document.getElementById('contact-form');
  const successMsg  = document.getElementById('form-success');
  const submitBtn   = document.getElementById('form-submit');
  const btnText     = form.querySelector('.btn-text');
  const btnLoader   = form.querySelector('.btn-loader');

  /** Show an error message on a field */
  function showError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (field)  field.classList.add('error');
    if (error) { error.textContent = message; }
  }

  /** Clear error on a field */
  function clearError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (field)  field.classList.remove('error');
    if (error) { error.textContent = ''; }
  }

  /** Simple email regex */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /** Validate a single field and return true if valid */
  function validateField(fieldId, errorId, validatorFn) {
    const field = document.getElementById(fieldId);
    if (!field) return true;
    const result = validatorFn(field.value.trim());
    if (result !== true) {
      showError(fieldId, errorId, result);
      return false;
    }
    clearError(fieldId, errorId);
    return true;
  }

  // Live validation — clear errors as user types/changes
  [
    ['form-name',  'name-error'],
    ['form-email', 'email-error'],
    ['form-visa',  'visa-error'],
  ].forEach(([fId, eId]) => {
    const el = document.getElementById(fId);
    if (el) el.addEventListener('input', () => clearError(fId, eId));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // --- Name ---
    valid = validateField('form-name', 'name-error', (v) => {
      if (!v) return 'Please enter your full name.';
      if (v.length < 2) return 'Name must be at least 2 characters.';
      return true;
    }) && valid;

    // --- Email ---
    valid = validateField('form-email', 'email-error', (v) => {
      if (!v) return 'Please enter your email address.';
      if (!emailRegex.test(v)) return 'Please enter a valid email address.';
      return true;
    }) && valid;

    // --- Visa type ---
    valid = validateField('form-visa', 'visa-error', (v) => {
      if (!v) return 'Please select a destination or visa type.';
      return true;
    }) && valid;

    if (!valid) return;

    // --- Real submission to Google Sheets ---
    submitBtn.disabled = true;
    btnText.hidden     = true;
    btnLoader.hidden   = false;

    const data = {
      name: document.getElementById('form-name').value,
      email: document.getElementById('form-email').value,
      phone: document.getElementById('form-phone').value,
      service: document.getElementById('form-visa').value, // Mapping visa_type to service
      message: document.getElementById('form-message').value,
      page: window.location.href
    };

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzcPwNsL8XW0qWpWVsipIIN75pVp1ZzVnxh_xepIR2osT9HjJbThC2ztNzocw7kaJw/exec';

    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).catch(err => console.error("Background error:", err));

    // Show success after 600ms (Optimistic UI)
    setTimeout(() => {
      submitBtn.disabled = false;
      btnText.hidden     = false;
      btnLoader.hidden   = true;
      form.reset();
      successMsg.hidden = false;
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => { successMsg.hidden = true; }, 8000);
    }, 600);
  });
})();


/* ==========================================================================
   10. FOOTER – DYNAMIC YEAR
   ========================================================================== */
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ==========================================================================
   11. TRAP FOCUS IN MODALS (Accessibility)
   ========================================================================== */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;

  const openModal = document.querySelector('.modal-overlay.open');
  if (!openModal) return;

  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusable = Array.from(openModal.querySelectorAll(focusableSelectors)).filter(
    (el) => !el.disabled && el.offsetParent !== null
  );

  if (!focusable.length) return;

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
