/* ===================================================
   HonnetKE Landing Page — JavaScript
   Handles: sticky navbar, mobile menu, scroll reveal,
   smooth scrolling, and search interactions.
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── DOM References ── */
  const navbar       = document.getElementById('navbar');
  const menuToggle   = document.getElementById('menu-toggle');
  const mobileNav    = document.getElementById('mobile-nav-overlay');
  const searchBar    = document.getElementById('search-bar');
  const revealEls    = document.querySelectorAll('.reveal');


  /* ──────────────────────────────────────────
     1. STICKY NAVBAR ON SCROLL
     ────────────────────────────────────────── */
  const SCROLL_THRESHOLD = 60;

  function handleNavbarScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  // Run once on load in case user refreshes mid-scroll
  handleNavbarScroll();


  /* ──────────────────────────────────────────
     2. MOBILE MENU TOGGLE
     ────────────────────────────────────────── */
  function toggleMobileMenu() {
    const isOpen = mobileNav.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);
    mobileNav.setAttribute('aria-hidden', !isOpen);

    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  menuToggle.addEventListener('click', toggleMobileMenu);

  // Close mobile menu when a link is clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  });

  // Close mobile menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      toggleMobileMenu();
    }
  });


  /* ──────────────────────────────────────────
     3. SCROLL REVEAL (Intersection Observer)
     ────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ──────────────────────────────────────────
     4. SEARCH BAR — Guest Redirect
     ────────────────────────────────────────── */
  searchBar.addEventListener('submit', (e) => {
    e.preventDefault();
    // For guests: redirect to login page
    // (In production, this would check auth state first)
    alert('Please sign up or log in to search hostels.');
    // window.location.href = 'login.html';
  });


  /* ──────────────────────────────────────────
     5. LISTING CARDS — Guest Redirect
     ────────────────────────────────────────── */
  const listingCards = document.querySelectorAll('.listing-card');

  listingCards.forEach(card => {
    // Keyboard accessibility for cards with role="link"
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Guest redirect to login
        alert('Please sign up or log in to view listing details.');
        // window.location.href = 'login.html';
      }
    });

    // Override the onclick for guest users
    card.onclick = (e) => {
      e.preventDefault();
      alert('Please sign up or log in to view listing details.');
      // window.location.href = 'login.html';
    };
  });


  /* ──────────────────────────────────────────
     6. SMOOTH SCROLL for Anchor Links
     ────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });


  /* ──────────────────────────────────────────
     7. CONTACT FORM — Basic Validation Feedback
     ────────────────────────────────────────── */
  const contactForm = document.getElementById('contact-form');

  contactForm.addEventListener('submit', (e) => {
    // Let the mailto action proceed if validation passes,
    // but we can add a subtle visual cue
    const submitBtn = document.getElementById('contact-submit');
    submitBtn.textContent = 'Sending...';
    
    setTimeout(() => {
      submitBtn.innerHTML = `
        Send Message
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      `;
    }, 2000);
  });


  /* ──────────────────────────────────────────
     8. DYNAMIC STATS COUNTER ANIMATION
     ────────────────────────────────────────── */
  const statNumbers = document.querySelectorAll('.hero-stat-number');

  function animateCounter(element) {
    const text = element.textContent;
    // Extract the numeric part and suffix
    const match = text.match(/^([\d,]+)(.*)/);
    if (!match) return;

    const targetStr = match[1].replace(/,/g, '');
    const target = parseInt(targetStr, 10);
    const suffix = match[2]; // e.g., "+", "K+"
    const duration = 1500;
    const startTime = performance.now();

    // Store original HTML for the amber span
    const hasAmber = element.querySelector('.amber');
    const amberContent = hasAmber ? hasAmber.textContent : '';

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      // Format with commas
      const formatted = current.toLocaleString();

      if (hasAmber) {
        element.innerHTML = `${formatted}<span class="amber">${amberContent}</span>`;
      } else {
        element.textContent = formatted + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // Observe the stats section
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNumbers.forEach(stat => animateCounter(stat));
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    statsObserver.observe(heroStats);
  }

});
