/* ===================================================
   HonnetKE Student Pages — JavaScript
   Handles: navbar, mobile menu, toasts, search,
   filters, gallery, favourites, history, modals.
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────
     0. AUTH GUARD + USER PROFILE
     ────────────────────────────────────────── */
  if (window.HonnetKE && window.HonnetKE.auth) {
    window.HonnetKE.auth.requireAuth('student');
    const user = window.HonnetKE.auth.getUser();
    if (user) {
      // Update avatar initials
      const avatarEl = document.querySelector('.avatar');
      if (avatarEl && user.fullName) {
        const initials = user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        avatarEl.textContent = initials;
      }
      // Update welcome message
      const pageTitle = document.querySelector('.page-title');
      if (pageTitle && user.fullName) {
        pageTitle.textContent = `Welcome back, ${user.fullName.split(' ')[0]}`;
      }
      // Update welcome toast
      const firstName = user.fullName ? user.fullName.split(' ')[0] : 'there';
      const currentPage = window.location.pathname.split('/').pop();
      if (currentPage === 'dashboard.html') {
        const hasShownWelcome = sessionStorage.getItem('honnetke_welcome_shown');
        if (!hasShownWelcome) {
          setTimeout(() => {
            showToast(`Welcome back, ${firstName}! 🐝`, 'Ready to find your perfect hostel?');
            sessionStorage.setItem('honnetke_welcome_shown', 'true');
          }, 800);
        }
      }
    }
  }

  // Wire logout
  document.querySelectorAll('.mobile-logout, .dropdown-item.danger').forEach(btn => {
    if (btn.textContent.trim() === 'Logout') {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.HonnetKE && window.HonnetKE.auth) {
          window.HonnetKE.auth.logout();
        } else {
          window.location.href = '../loginpage/login.html';
        }
      });
    }
  });


  /* ──────────────────────────────────────────
     0b. FETCH LISTINGS FROM API
     ────────────────────────────────────────── */
  const recentScroll = document.querySelector('.recent-scroll');
  const featuredGrid = document.querySelector('.featured-grid');

  async function fetchStudentListings() {
    try {
      const res = await window.HonnetKE.api.get('/listings?limit=10');
      const listings = res.listings || [];

      // Recent activity — first 5 listings
      if (recentScroll) {
        if (listings.length === 0) {
          recentScroll.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
              No listings available yet. Check back soon!
            </div>`;
        } else {
          recentScroll.innerHTML = listings.slice(0, 5).map(l => {
            const img = l.images && l.images.length > 0 ? l.images[0].imageUrl : '';
            const price = Number(l.price).toLocaleString();
            const locationText = [l.area, l.nearestCampus].filter(Boolean).join(', near ');

            return `
              <a href="listing.html" class="recent-card">
                <div class="recent-card-img">
                  ${img
                    ? `<img src="${img}" alt="${l.title}" loading="lazy">`
                    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--color-border-light);color:var(--color-text-muted);font-size:0.8rem;">No Image</div>`
                  }
                </div>
                <div class="recent-card-body">
                  <h3 class="recent-card-title">${l.title}</h3>
                  <div class="recent-card-location">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    ${locationText || '—'}
                  </div>
                  <span class="recent-card-price">KES ${price}/mo</span>
                </div>
              </a>`;
          }).join('');
        }
      }

      // Featured hostels — first 3 active listings
      if (featuredGrid) {
        const active = listings.filter(l => l.status === 'active').slice(0, 3);
        if (active.length === 0 && listings.length === 0) {
          featuredGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-text-muted);">
              No featured hostels available yet.
            </div>`;
        } else {
          const display = active.length > 0 ? active : listings.slice(0, 3);
          featuredGrid.innerHTML = display.map(l => {
            const img = l.images && l.images.length > 0 ? l.images[0].imageUrl : '';
            const price = Number(l.price).toLocaleString();
            const genderLabel = l.genderPreference
              ? l.genderPreference.charAt(0).toUpperCase() + l.genderPreference.slice(1)
              : '';
            const typeLabel = l.propertyType
              ? l.propertyType.charAt(0).toUpperCase() + l.propertyType.slice(1).replace('-', ' ')
              : '';
            const roomLabel = l.roomType
              ? l.roomType.charAt(0).toUpperCase() + l.roomType.slice(1) + ' Room'
              : '';
            const locationText = [l.area, l.nearestCampus].filter(Boolean).join(', near ');

            return `
              <article class="listing-card" data-href="listing.html" role="link" tabindex="0" aria-label="View ${l.title}">
                <div class="card-image">
                  ${img
                    ? `<img src="${img}" alt="${l.title}" loading="lazy">`
                    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--color-border-light);color:var(--color-text-muted);font-size:0.85rem;">No Image</div>`
                  }
                  <div class="card-price-tag">KES ${price}/mo</div>
                  <button class="card-fav-btn" aria-label="Save to favourites">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                </div>
                <div class="card-body">
                  <h3 class="card-title">${l.title}</h3>
                  <div class="card-location">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    ${locationText || '—'}
                  </div>
                  <div class="card-badges">
                    ${typeLabel ? `<span class="badge badge-amber">${typeLabel}</span>` : ''}
                    ${genderLabel ? `<span class="badge badge-charcoal">${genderLabel}</span>` : ''}
                  </div>
                  <div class="card-footer">
                    <span class="card-room-type">${roomLabel}</span>
                    <a href="listing.html" class="card-detail-link">
                      View Details
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </a>
                  </div>
                </div>
              </article>`;
          }).join('');

          // Re-bind fav buttons and card clicks
          featuredGrid.querySelectorAll('.card-fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              e.preventDefault();
              btn.classList.toggle('active');
              showToast(btn.classList.contains('active') ? 'Saved! 💛' : 'Removed',
                         btn.classList.contains('active') ? 'Added to your Hive Saves' : 'Listing removed from Hive Saves');
            });
          });

          featuredGrid.querySelectorAll('.listing-card[data-href]').forEach(card => {
            card.addEventListener('click', (e) => {
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
        }
      }
    } catch (err) {
      console.warn('Could not fetch listings:', err.message);
    }
  }

  fetchStudentListings();

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

  // Welcome toast handled in auth guard section above


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
