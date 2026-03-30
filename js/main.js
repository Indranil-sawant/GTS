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
  const root = document.documentElement; // <html data-theme="...">
  const btn = document.getElementById('dark-mode-toggle');
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
const mobileMenu = document.getElementById('mobile-menu');

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
const header = document.getElementById('site-header');
const navLinks = document.querySelectorAll('.nav-links .nav-link:not(.nav-cta)');
const sections = document.querySelectorAll('main section[id]');

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
    const expanded = this.getAttribute('aria-expanded') === 'true';
    const answerId = this.getAttribute('aria-controls');
    const answerEl = document.getElementById(answerId);

    // Close all others first
    document.querySelectorAll('.faq-question').forEach((otherBtn) => {
      const otherAnswerId = otherBtn.getAttribute('aria-controls');
      const otherAnswer = document.getElementById(otherAnswerId);
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
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;






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
  const last = focusable[focusable.length - 1];

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

/* ==========================================================================
   12. HERO TEXT SWITCHER
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

    // Move to next index
    currentIndex = (currentIndex + 1) % slides.length;
    const nextSlide = slides[currentIndex];

    // Out with the old
    currentSlide.classList.remove('active');
    currentSlide.classList.add('exit');

    // Clean up exit class after transition completes (1.2s transition + buffer)
    setTimeout(() => {
      if (currentSlide.classList.contains('exit')) {
        currentSlide.classList.remove('exit');
      }
    }, 1300);

    // In with the new
    nextSlide.classList.remove('exit');
    nextSlide.classList.add('active');
  }

  // Start interval using the user's requested 3.2 seconds (3200ms)
  function startInterval() {
    intervalId = setInterval(switchSlide, 3200);
  }

  // Initialise
  startInterval();
})();

/* ==========================================================================
   11. HERO SEARCH TO MODAL INTEGRATION
   ========================================================================== */
(function initHeroForm() {
  const exploreBtn = document.getElementById('hero-explore-btn');
  if (!exploreBtn) return;

  exploreBtn.addEventListener('click', function(e) {
    e.preventDefault();

    const destSelect = document.getElementById('hero-dest-select');
    const svcSelect = document.getElementById('hero-svc-select');
    const pplSelect = document.getElementById('hero-travelers-select');

    // Get display texts
    const selectedDest = destSelect.selectedIndex > 0 ? destSelect.options[destSelect.selectedIndex].text : 'Anywhere';
    const selectedSvc = svcSelect.selectedIndex > 0 ? svcSelect.options[svcSelect.selectedIndex].text : 'Visa Services';
    const selectedPpl = pplSelect.options[pplSelect.selectedIndex].text;

    // Target modal fields
    const popupCity = document.getElementById('popupCity');
    const popupType = document.getElementById('popupType');
    const popupPeople = document.getElementById('popupPeople');

    if (popupCity) popupCity.value = selectedDest;
    if (popupType) popupType.value = selectedSvc;
    if (popupPeople) popupPeople.value = selectedPpl;
    
    // Open the modal
    if (typeof openModal === 'function') {
      openModal('leadPopup');
    }
  });
})();

/* ==========================================================================
   12. FORM SUBMISSION & SUCCESS HANDLER
   ========================================================================== */
(function initFormHandlers() {
  const forms = ['contact-form', 'popupForm'];
  
  forms.forEach(formId => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
      }

      // Simulation - normally you'd use fetch() here
      setTimeout(() => {
        const successTemplate = `
          <div class="form-success-container">
            <div class="success-icon-anim" aria-hidden="true" style="width: 64px; height: 64px; background: #22c55e; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px;">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3>Thank You!</h3>
            <p>Your journey is about to begin. One of our travel experts will reach out to you within 24 hours.</p>
          </div>
        `;
        
        // Premium transition: Replaces the form content with the success UI
        form.innerHTML = successTemplate;
        
        // Auto-close modal if it's the popup
        if (formId === 'popupForm') {
          setTimeout(() => {
            if (typeof closeModal === 'function') {
              closeModal('leadPopup');
            }
          }, 3500);
        }
      }, 1500);
    });
  });
})();
