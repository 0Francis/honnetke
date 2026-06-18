/* ===================================================
   HonnetKE Student Pages — JavaScript
   Handles: navbar, mobile menu, toasts, search,
   filters, gallery, favourites, history, modals.
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── DOM References ── */
  const navbar        = document.querySelector('.student-navbar');
  const menuToggle    = document.getElementById('menu-toggle');
  const mobileNav     = document.getElementById('student-mobile-nav');
  const userMenu      = document.querySelector('.user-menu');
  const userAvatarBtn = document.querySelector('.user-avatar-btn');
  const toastContainer= document.getElementById('toast-container');


  /* ──────────────────────────────────────────
     1. STICKY NAVBAR SCROLL EFFECT
     ────────────────────────────────────────── */
  const SCROLL_THRESHOLD = 20;

  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();


  /* ──────────────────────────────────────────
     2. MOBILE MENU TOGGLE
     ────────────────────────────────────────── */
  if (menuToggle && mobileNav) {
    function toggleMobileMenu() {
      const isOpen = mobileNav.classList.toggle('open');
      menuToggle.classList.toggle('active', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
      mobileNav.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    menuToggle.addEventListener('click', toggleMobileMenu);

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (mobileNav.classList.contains('open')) {
          toggleMobileMenu();
        }
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  }


  /* ──────────────────────────────────────────
     3. USER DROPDOWN MENU
     ────────────────────────────────────────── */
  if (userAvatarBtn && userMenu) {
    userAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target)) {
        userMenu.classList.remove('open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        userMenu.classList.remove('open');
      }
    });
  }


  /* ──────────────────────────────────────────
     4. TOAST NOTIFICATIONS
     ────────────────────────────────────────── */
  window.showToast = function(title, message, duration = 4000) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Dismiss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    toastContainer.appendChild(toast);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      dismissToast(toast);
    });

    // Auto-dismiss
    setTimeout(() => dismissToast(toast), duration);
  };

  function dismissToast(toast) {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove());
  }

  // Welcome toast on dashboard (check sessionStorage flag)
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage === 'dashboard.html') {
    const hasShownWelcome = sessionStorage.getItem('honnetke_welcome_shown');
    if (!hasShownWelcome) {
      setTimeout(() => {
        showToast('Welcome back, Jane! 🐝', 'Ready to find your perfect hostel?');
        sessionStorage.setItem('honnetke_welcome_shown', 'true');
      }, 800);
    }
  }


  /* ──────────────────────────────────────────
     5. SCROLL REVEAL (Intersection Observer)
     ────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));
  }


  /* ──────────────────────────────────────────
     6. HOSTELS PAGE — FILTER SIDEBAR (mobile)
     ────────────────────────────────────────── */
  const filterToggle  = document.getElementById('filter-toggle-mobile');
  const filterSidebar = document.getElementById('filter-sidebar');
  const filterOverlay = document.getElementById('filter-overlay');

  if (filterToggle && filterSidebar) {
    filterToggle.addEventListener('click', () => {
      filterSidebar.classList.add('open');
      if (filterOverlay) filterOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    if (filterOverlay) {
      filterOverlay.addEventListener('click', closeFilterSidebar);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && filterSidebar.classList.contains('open')) {
        closeFilterSidebar();
      }
    });
  }

  function closeFilterSidebar() {
    if (filterSidebar) filterSidebar.classList.remove('open');
    if (filterOverlay) filterOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Clear filters
  const filterClear = document.querySelector('.filter-clear');
  if (filterClear) {
    filterClear.addEventListener('click', (e) => {
      e.preventDefault();
      const checks = document.querySelectorAll('.filter-sidebar input[type="checkbox"], .filter-sidebar input[type="radio"]');
      checks.forEach(c => c.checked = false);
    });
  }

  // Search form
  const hostelsSearchForm = document.getElementById('hostels-search-form');
  if (hostelsSearchForm) {
    hostelsSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Searching…', 'Finding hostels matching your criteria');
    });
  }


  /* ──────────────────────────────────────────
     7. LISTING DETAIL — IMAGE GALLERY
     ────────────────────────────────────────── */
  const galleryMain = document.getElementById('gallery-main-img');
  const galleryThumbs = document.querySelectorAll('.gallery-thumb');
  const galleryPrev = document.getElementById('gallery-prev');
  const galleryNext = document.getElementById('gallery-next');
  let currentGalleryIndex = 0;

  if (galleryMain && galleryThumbs.length > 0) {
    const galleryImages = Array.from(galleryThumbs).map(t => t.querySelector('img').src);

    function setGalleryImage(index) {
      if (index < 0) index = galleryImages.length - 1;
      if (index >= galleryImages.length) index = 0;
      currentGalleryIndex = index;

      galleryMain.src = galleryImages[index];
      galleryMain.alt = `Property image ${index + 1}`;

      galleryThumbs.forEach((t, i) => {
        t.classList.toggle('active', i === index);
      });
    }

    galleryThumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => setGalleryImage(i));
    });

    if (galleryPrev) {
      galleryPrev.addEventListener('click', () => setGalleryImage(currentGalleryIndex - 1));
    }
    if (galleryNext) {
      galleryNext.addEventListener('click', () => setGalleryImage(currentGalleryIndex + 1));
    }

    // Keyboard nav
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') setGalleryImage(currentGalleryIndex - 1);
      if (e.key === 'ArrowRight') setGalleryImage(currentGalleryIndex + 1);
    });
  }


  /* ──────────────────────────────────────────
     8. FAVOURITES — Toggle Heart
     ────────────────────────────────────────── */
  const favBtns = document.querySelectorAll('.card-fav-btn');

  favBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      btn.classList.toggle('active');

      if (btn.classList.contains('active')) {
        showToast('Saved! 💛', 'Added to your Hive Saves');
      } else {
        showToast('Removed', 'Listing removed from Hive Saves');
      }
    });
  });


  /* ──────────────────────────────────────────
     9. REPORT LISTING MODAL
     ────────────────────────────────────────── */
  const reportLink    = document.getElementById('report-listing-link');
  const reportModal   = document.getElementById('report-modal');
  const reportClose   = document.getElementById('report-modal-close');
  const reportCancel  = document.getElementById('report-cancel');
  const reportForm    = document.getElementById('report-form');

  if (reportLink && reportModal) {
    reportLink.addEventListener('click', (e) => {
      e.preventDefault();
      reportModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    function closeReportModal() {
      reportModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (reportClose) reportClose.addEventListener('click', closeReportModal);
    if (reportCancel) reportCancel.addEventListener('click', closeReportModal);

    // Close on backdrop click
    reportModal.addEventListener('click', (e) => {
      if (e.target === reportModal) closeReportModal();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && reportModal.classList.contains('active')) {
        closeReportModal();
      }
    });

    if (reportForm) {
      reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        closeReportModal();
        showToast('Report submitted', 'Our team will review this listing');
        reportForm.reset();
      });
    }
  }


  /* ──────────────────────────────────────────
     10. LISTING CARDS — Navigate to Detail
     ────────────────────────────────────────── */
  const listingCards = document.querySelectorAll('.listing-card[data-href]');

  listingCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't navigate if clicking fav button
      if (e.target.closest('.card-fav-btn')) return;
      const href = card.getAttribute('data-href');
      if (href) window.location.href = href;
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const href = card.getAttribute('data-href');
        if (href) window.location.href = href;
      }
    });
  });


  /* ──────────────────────────────────────────
     11. SMOOTH SCROLL for Anchor Links
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
     12. PAGINATION (demo)
     ────────────────────────────────────────── */
  const pageBtns = document.querySelectorAll('.page-btn:not(.nav-arrow)');

  pageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pageBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // In production: fetch new page results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

});
