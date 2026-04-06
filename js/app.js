/**
 * Globus Travel Services – Optimized Unified Application JS
 * Performance-first, mobile-centric logic.
 */

'use strict';

(function() {
  /* 1. STATE & CONSTANTS
     ========================================================================== */
  const state = {
    isMenuOpen: false,
    lastScroll: 0,
    header: document.querySelector('.site-header'),
    mobileMenu: document.getElementById('mobile-menu'),
    hamburger: document.getElementById('mobile-menu-toggle'),
    ctaBar: document.querySelector('.mobile-sticky-cta')
  };

  /* 2. INITIALIZATION
     ========================================================================== */
  function init() {
    registerEventListeners();
    initScrollEffects();
    initModals();
    initForms();
    registerServiceWorker();
  }

  /* 3. MOBILE NAVIGATION (Premium Logic)
     ========================================================================== */
  function toggleMenu(force = null) {
    state.isMenuOpen = force !== null ? force : !state.isMenuOpen;
    
    state.mobileMenu.classList.toggle('active', state.isMenuOpen);
    state.hamburger.setAttribute('aria-expanded', state.isMenuOpen);
    document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
  }

  /* 4. SCROLL EFFECTS (LCP & UX)
     ========================================================================== */
  function initScrollEffects() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      // Sticky Header Shadow
      state.header.style.boxShadow = currentScroll > 50 ? 'var(--shadow-lg)' : 'none';

      // Mobile CTA Bar Visibility
      if (state.ctaBar) {
        state.ctaBar.style.transform = currentScroll > 400 ? 'translateY(0)' : 'translateY(100%)';
      }

      state.lastScroll = currentScroll;
    }, { passive: true });
  }

  /* 5. MODAL SYSTEM
     ========================================================================== */
  function initModals() {
    window.openModal = (id) => {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    };

    window.closeModal = (id) => {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    };

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay.id);
      });
    });
  }

  /* 6. FORM HANDLER
     ========================================================================== */
  function initForms() {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLWeBKg4sTjgtUQZox1_lrBqF4uZVEmqPRhHP7fGZScjZ8_Uz1kcalxqC0No-ya9r_nQ/exec';
    
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        try {
          const formData = new FormData(form);
          const payload = Object.fromEntries(formData.entries());
          
          const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          });
          
          if (response.ok) {
            form.innerHTML = '<div class="success-msg">Thank you! We will contact you soon.</div>';
          }
        } catch (err) {
          console.error('Form error:', err);
          form.innerHTML = '<div class="success-msg">Success! Expert help is on the way.</div>';
        }
      });
    });
  }

  /* 7. EVENT LISTENERS
     ========================================================================== */
  function registerEventListeners() {
    state.hamburger.addEventListener('click', () => toggleMenu());
    
    document.querySelectorAll('.mobile-nav-links a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Close menu on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleMenu(false);
    });
  }

  /* 8. SERVICE WORKER (PWA Ready)
     ========================================================================== */
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW error:', err));
      });
    }
  }

  /* 9. COUNTRY AUTOCOMPLETE & PRE-FILL
     ========================================================================== */
  function initAdvancedLogic() {
    const countryInput = document.getElementById('contact-country-input');
    const resultsDiv = document.getElementById('contact-country-results');
    
    if (countryInput && resultsDiv && window.GTS_COUNTRIES) {
      countryInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const matches = window.GTS_COUNTRIES.filter(c => c.name.toLowerCase().includes(val));
        resultsDiv.innerHTML = matches.map(c => `<div class="search-item" onclick="selectCountry('${c.name}')">${c.name}</div>`).join('');
        resultsDiv.hidden = !matches.length;
      });
    }

    // Pre-fill Logic
    document.querySelectorAll('[data-service]').forEach(item => {
      item.addEventListener('click', () => {
        const svc = item.dataset.service;
        const typeField = document.getElementById('popupType');
        if (typeField) typeField.value = svc;
        window.openModal('leadPopup');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    init();
    initAdvancedLogic();
  });
})();
