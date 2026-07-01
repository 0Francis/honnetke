/* ===================================================
   HonnetKE Student Pages - JavaScript
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
  document.querySelectorAll('.mobile-logout, .dropdown-item.danger, #dropdown-logout, #mobile-logout').forEach(btn => {
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
      const res = await window.HonnetKE.api.get('/properties?limit=10');
      const listings = res.properties || [];

      // Recent activity - first 5 listings
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
                    ${locationText || '-'}
                  </div>
                  <span class="recent-card-price">KES ${price}/mo</span>
                </div>
              </a>`;
          }).join('');
        }
      }

      // Featured hostels - first 3 active listings
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
              <article class="listing-card" data-href="listing.html" data-property-id="${l.propertyId}" role="link" tabindex="0" aria-label="View ${l.title}">
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
                    ${locationText || '-'}
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
              const propId = card.getAttribute('data-property-id');
              if (href) {
                const url = propId ? `${href}?id=${propId}` : href;
                window.location.href = url;
              }
            });
            card.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const href = card.getAttribute('data-href');
                const propId = card.getAttribute('data-property-id');
                if (href) {
                  const url = propId ? `${href}?id=${propId}` : href;
                  window.location.href = url;
                }
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


  /* ──────────────────────────────────────────
     0c. LISTING DETAIL PAGE - Fetch + Booking + Report
     ────────────────────────────────────────── */
  const listingDetailPage = document.querySelector('.listing-detail');
  let currentListingId = null;

  async function fetchListingDetail() {
    if (!listingDetailPage) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    currentListingId = Number(id);

    try {
      const listing = await window.HonnetKE.api.get(`/properties/${id}`);

      // Update page title
      document.title = `${listing.title} - HonnetKE`;

      // Update gallery
      const galleryMainImg = document.getElementById('gallery-main-img');
      const galleryThumbs = document.querySelector('.gallery-thumbnails');
      const images = listing.images || [];

      if (images.length > 0) {
        if (galleryMainImg) {
          galleryMainImg.src = images[0].imageUrl;
          galleryMainImg.alt = listing.title;
        }
        if (galleryThumbs) {
          galleryThumbs.innerHTML = images.map((img, i) => `
            <button class="gallery-thumb ${i === 0 ? 'active' : ''}" aria-label="View image ${i + 1}" data-img="${img.imageUrl}">
              <img src="${img.imageUrl}" alt="Thumbnail ${i + 1}">
            </button>`).join('');

          galleryThumbs.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
            thumb.addEventListener('click', () => {
              galleryMainImg.src = thumb.dataset.img;
              galleryThumbs.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
              thumb.classList.add('active');
            });
          });
        }
      } else {
        if (galleryMainImg) {
          galleryMainImg.style.display = 'none';
        }
        if (galleryThumbs) {
          galleryThumbs.innerHTML = '';
        }
        const galleryMain = document.querySelector('.gallery-main');
        if (galleryMain) {
          galleryMain.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--color-border-light);color:var(--color-text-muted);font-size:1rem;min-height:300px;border-radius:var(--radius-lg);">No Image Available</div>`;
        }
      }

      // Update listing info
      const titleEl = document.querySelector('.listing-info-title');
      if (titleEl) titleEl.textContent = listing.title;

      const locationEl = document.querySelector('.listing-info-location');
      if (locationEl) {
        const locationText = [listing.area, listing.county].filter(Boolean).join(', ');
        const campusText = listing.nearestCampus ? ` - near ${listing.nearestCampus} Campus` : '';
        locationEl.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${locationText}${campusText}`;
      }

      const priceEl = document.querySelector('.listing-price');
      if (priceEl) {
        const price = Number(listing.price).toLocaleString();
        priceEl.innerHTML = `KES ${price} <span>/month</span>`;
      }

      const badgesEl = document.querySelector('.listing-badges');
      if (badgesEl) {
        const typeLabel = listing.propertyType ? listing.propertyType.charAt(0).toUpperCase() + listing.propertyType.slice(1).replace('-', ' ') : '';
        const genderLabel = listing.genderPreference ? listing.genderPreference.charAt(0).toUpperCase() + listing.genderPreference.slice(1) : '';
        const roomLabel = listing.roomType ? listing.roomType.charAt(0).toUpperCase() + listing.roomType.slice(1) + ' Room' : '';
        badgesEl.innerHTML = `
          ${typeLabel ? `<span class="badge badge-amber">${typeLabel}</span>` : ''}
          ${genderLabel ? `<span class="badge badge-charcoal">${genderLabel}</span>` : ''}
          ${roomLabel ? `<span class="badge badge-green">${roomLabel}</span>` : ''}`;
      }

      // Update description
      const descEl = document.querySelector('.listing-description p');
      if (descEl && listing.description) {
        descEl.textContent = listing.description;
      }

      // Update amenities
      const amenitiesGrid = document.querySelector('.amenities-grid');
      if (amenitiesGrid && listing.amenities) {
        const amenityIcons = {
          'WiFi': '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
          'Water': '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
          'Security': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
          'Parking': '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
          'Gym': '<path d="M6 5v14M18 5v14M2 9h4M2 15h4M18 9h4M18 15h4M6 12h12"/>',
          'Laundry': '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
        };
        amenitiesGrid.innerHTML = listing.amenities.map(a => {
          const icon = amenityIcons[a] || '<circle cx="12" cy="12" r="10"/>';
          return `
            <div class="amenity-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
              ${a}
            </div>`;
        }).join('');
      }

      // Update contact card WhatsApp/call/SMS links with provider info if available
      const whatsappLink = document.querySelector('.contact-btn.whatsapp');
      const callLink = document.querySelector('.contact-btn.call');
      const smsLink = document.querySelector('.contact-btn.sms');
      // Provider contact info not in listing response - keep defaults

      // Hide book button if listing is not active
      const bookBtn = document.getElementById('book-now-btn');
      const isBookable = listing.status === 'active' && listing.availability !== 'full';
      if (bookBtn && !isBookable) {
        bookBtn.textContent = listing.availability === 'full' ? 'Fully Occupied' : 'Not Available';
        bookBtn.disabled = true;
        bookBtn.style.opacity = '0.6';
        bookBtn.style.cursor = 'not-allowed';
      }

    } catch (err) {
      console.warn('Could not fetch listing detail:', err.message);
      if (listingDetailPage) {
        listingDetailPage.innerHTML = `
          <div class="container" style="text-align: center; padding: 4rem 1rem;">
            <h2>Listing not found</h2>
            <p style="color: var(--color-text-muted); margin-top: var(--space-sm);">This listing may have been removed or is no longer available.</p>
            <a href="hostels.html" class="btn btn-primary" style="margin-top: var(--space-lg);">Browse Hostels</a>
          </div>`;
      }
    }
  }

  fetchListingDetail();

  // Booking modal
  const bookingModal = document.getElementById('booking-modal');
  const bookingBtn = document.getElementById('book-now-btn');
  const bookingClose = document.getElementById('booking-modal-close');
  const bookingCancel = document.getElementById('booking-cancel');
  const bookingForm = document.getElementById('booking-form');
  const bookingSubmit = document.getElementById('booking-submit');

  if (bookingBtn && bookingModal) {
    bookingBtn.addEventListener('click', () => {
      bookingModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    const closeBookingModal = () => {
      bookingModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (bookingClose) bookingClose.addEventListener('click', closeBookingModal);
    if (bookingCancel) bookingCancel.addEventListener('click', closeBookingModal);

    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeBookingModal();
    });

    if (bookingForm) {
      bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentListingId) return;

        bookingSubmit.disabled = true;
        bookingSubmit.textContent = 'Sending...';

        const note = document.getElementById('booking-note').value.trim();

        try {
          await window.HonnetKE.api.post('/bookings', {
            propertyId: currentListingId,
            requestNote: note || undefined,
          }, true);

          closeBookingModal();
          showToast('Booking Request Sent! 🐝', 'The provider will respond via the platform.');
          bookingForm.reset();
        } catch (err) {
          showToast('Error', err.message || 'Could not submit booking request');
        } finally {
          bookingSubmit.disabled = false;
          bookingSubmit.textContent = 'Send Request';
        }
      });
    }
  }

  // Wire report form to API (modal open/close handled by existing section 9 code)
  const reportFormEl = document.getElementById('report-form');
  if (reportFormEl) {
    // Remove old static handler and add real API handler
    const newReportForm = reportFormEl.cloneNode(true);
    reportFormEl.parentNode.replaceChild(newReportForm, reportFormEl);
    newReportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentListingId) return;

      const raw = document.getElementById('report-reason').value.trim();
      if (!raw) return;
      const validReasons = ['spam', 'fraud', 'wrong_information', 'already_occupied', 'inappropriate', 'other'];
      const reason = validReasons.includes(raw) ? raw : 'other';
      const details = validReasons.includes(raw) ? undefined : raw;

      const submitBtn = newReportForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        await window.HonnetKE.api.post('/reports', {
          propertyId: currentListingId,
          reason,
          details,
        }, true);

        const rm = document.getElementById('report-modal');
        if (rm) rm.classList.remove('active');
        document.body.style.overflow = '';
        showToast('Report Submitted', 'An admin will review this listing.');
        newReportForm.reset();
      } catch (err) {
        showToast('Error', err.message || 'Could not submit report');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Report';
      }
    });
  }

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
     6. HOSTELS PAGE - FILTER SIDEBAR (mobile)
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

  /* ──────────────────────────────────────────
     6b. BROWSE PAGE - dynamic properties + filters
     ────────────────────────────────────────── */
  function renderPagination(el, page, pages, onGo) {
    if (!el) return;
    if (!pages || pages <= 1) { el.innerHTML = ''; return; }
    const prevSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
    const nextSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    let html = `<button class="page-btn nav-arrow" ${page <= 1 ? 'disabled' : ''} data-go="${page - 1}" aria-label="Previous page">${prevSvg}</button>`;
    for (let i = 1; i <= pages; i++) {
      html += `<button class="page-btn ${i === page ? 'active' : ''}" data-go="${i}">${i}</button>`;
    }
    html += `<button class="page-btn nav-arrow" ${page >= pages ? 'disabled' : ''} data-go="${page + 1}" aria-label="Next page">${nextSvg}</button>`;
    el.innerHTML = html;
    el.querySelectorAll('.page-btn[data-go]').forEach((b) => {
      b.addEventListener('click', () => {
        if (b.hasAttribute('disabled')) return;
        const p = Number(b.getAttribute('data-go'));
        if (p >= 1 && p <= pages) onGo(p);
      });
    });
  }

  function bindFavButtons(container, favIds) {
    container.querySelectorAll('.card-fav-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const id = Number(btn.getAttribute('data-property-id'));
        if (!id) return;
        const wasActive = btn.classList.contains('active');
        btn.classList.toggle('active');
        btn.setAttribute('aria-pressed', String(!wasActive));
        try {
          if (!wasActive) {
            await window.HonnetKE.api.post('/favourites', { propertyId: id }, true);
            if (favIds) favIds.add(id);
            showToast('Saved', 'Added to your Hive Saves');
          } else {
            await window.HonnetKE.api.del(`/favourites/${id}`, true);
            if (favIds) favIds.delete(id);
            showToast('Removed', 'Removed from your Hive Saves');
          }
        } catch (err) {
          btn.classList.toggle('active');
          btn.setAttribute('aria-pressed', String(wasActive));
          showToast('Error', err.message || 'Could not update favourites');
        }
      });
    });
  }

  async function initBrowse() {
    const resultsEl = document.getElementById('hostels-results');
    if (!resultsEl) return;
    const countEl = document.getElementById('results-count');
    const paginationEl = document.getElementById('pagination');
    const sortEl = document.getElementById('results-sort');
    const searchForm = document.getElementById('hostels-search-form');
    const sidebar = document.getElementById('filter-sidebar');
    const state = { page: 1 };

    let favIds = new Set();
    try {
      const favRes = await window.HonnetKE.api.get('/favourites', true);
      favIds = new Set((favRes.favourites || []).map((f) => f.propertyId));
    } catch (_) { /* guest or not logged in */ }

    const getChecked = (name) => sidebar?.querySelector(`input[name="${name}"]:checked`)?.value;

    function buildQuery() {
      const params = new URLSearchParams();
      params.set('limit', '9');
      params.set('page', String(state.page));

      const loc = searchForm?.querySelector('input[name="location"]')?.value.trim();
      if (loc) params.set('search', loc);

      const topType = searchForm?.querySelector('select[name="property_type"]')?.value;
      const topPrice = searchForm?.querySelector('select[name="price"]')?.value;

      const gender = getChecked('gender'); if (gender) params.set('gender', gender);
      const room = getChecked('room_type'); if (room) params.set('room', room);
      const type = getChecked('type') || topType; if (type) params.set('type', type);
      const avail = getChecked('availability'); if (avail) params.set('availability', avail);

      const priceRange = getChecked('price_range') || topPrice;
      if (priceRange) {
        if (priceRange.endsWith('+')) {
          params.set('minPrice', priceRange.replace('+', ''));
        } else {
          const [min, max] = priceRange.split('-');
          if (min) params.set('minPrice', min);
          if (max) params.set('maxPrice', max);
        }
      }
      return params.toString();
    }

    async function load() {
      resultsEl.setAttribute('aria-busy', 'true');
      resultsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-text-muted);">Loading properties...</div>';
      try {
        const res = await window.HonnetKE.api.get(`/properties?${buildQuery()}`);
        let items = res.properties || [];
        const sort = sortEl?.value;
        if (sort === 'price-low') items.sort((a, b) => a.price - b.price);
        else if (sort === 'price-high') items.sort((a, b) => b.price - a.price);

        if (items.length === 0) {
          resultsEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-text-muted);">No properties match your filters. Try widening your search.</div>';
          paginationEl.innerHTML = '';
        } else {
          resultsEl.innerHTML = items.map((p) => window.HonnetKE.property.cardHtml(p, { isFav: favIds.has(p.propertyId) })).join('');
          window.HonnetKE.property.bindCardNavigation(resultsEl);
          bindFavButtons(resultsEl, favIds);
        }

        const pg = res.pagination || { total: items.length, page: 1, pages: 1 };
        if (countEl) countEl.innerHTML = `Showing <strong>${items.length}</strong> of <strong>${pg.total}</strong> properties`;
        renderPagination(paginationEl, pg.page, pg.pages, (p) => { state.page = p; load(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
      } catch (err) {
        resultsEl.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-text-muted);">Could not load properties. ${err.message}</div>`;
      } finally {
        resultsEl.removeAttribute('aria-busy');
      }
    }

    if (searchForm) searchForm.addEventListener('submit', (e) => { e.preventDefault(); state.page = 1; load(); });
    if (sortEl) sortEl.addEventListener('change', () => load());
    sidebar?.querySelectorAll('input').forEach((inp) => inp.addEventListener('change', () => { state.page = 1; load(); }));
    const clearBtn = document.querySelector('.filter-clear');
    if (clearBtn) clearBtn.addEventListener('click', () => setTimeout(() => { state.page = 1; load(); }, 0));

    load();
  }

  initBrowse();


  /* ──────────────────────────────────────────
     6c. FAVOURITES PAGE - saved properties
     ────────────────────────────────────────── */
  async function initFavourites() {
    const grid = document.getElementById('favourites-grid');
    if (!grid) return;

    const emptyHtml = `
      <div class="empty-state" style="grid-column:1/-1;">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <h2 class="empty-state-title">No saves yet</h2>
        <p class="empty-state-text">Start exploring hostels and save the ones you love by tapping the heart icon.</p>
        <a href="hostels.html" class="btn btn-primary btn-lg">Explore Hostels</a>
      </div>`;

    try {
      const res = await window.HonnetKE.api.get('/favourites', true);
      const favourites = res.favourites || [];
      const properties = favourites.map((f) => f.property).filter(Boolean);

      if (properties.length === 0) {
        grid.innerHTML = emptyHtml;
        return;
      }

      const favIds = new Set(properties.map((p) => p.propertyId));
      grid.innerHTML = properties.map((p) => window.HonnetKE.property.cardHtml(p, { isFav: true })).join('');
      window.HonnetKE.property.bindCardNavigation(grid);

      // On this page, toggling the heart removes the card.
      grid.querySelectorAll('.card-fav-btn').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          e.preventDefault();
          const id = Number(btn.getAttribute('data-property-id'));
          if (!id) return;
          const card = btn.closest('.listing-card');
          try {
            await window.HonnetKE.api.del(`/favourites/${id}`, true);
            favIds.delete(id);
            if (card) card.remove();
            showToast('Removed', 'Removed from your Hive Saves');
            if (grid.querySelectorAll('.listing-card').length === 0) grid.innerHTML = emptyHtml;
          } catch (err) {
            showToast('Error', err.message || 'Could not update favourites');
          }
        });
      });
    } catch (err) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--color-text-muted);">Could not load your saves. ${err.message}</div>`;
    }
  }

  initFavourites();


  /* ──────────────────────────────────────────
     6d. VISIT HISTORY PAGE - recently viewed
     ────────────────────────────────────────── */
  function formatViewedAt(dateStr) {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const time = date.toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit' });
    if (sameDay) return `Today, ${time}`;
    if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
    return date.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }) + `, ${time}`;
  }

  async function initHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;

    const P = window.HonnetKE.property;
    const pinSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    const arrowSvg = '<svg class="history-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

    try {
      const res = await window.HonnetKE.api.get('/me/history', true);
      const history = res.history || [];

      if (history.length === 0) {
        list.innerHTML = `
          <div class="empty-state">
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <h2 class="empty-state-title">No visits logged yet</h2>
            <p class="empty-state-text">Start browsing hostels to build your visit history.</p>
            <a href="hostels.html" class="btn btn-primary btn-lg">Explore Hostels</a>
          </div>`;
        return;
      }

      list.innerHTML = history.map((h) => {
        const p = h.property;
        if (!p) return '';
        const img = P.primaryImage(p);
        const thumb = img
          ? `<img src="${P.escapeHtml(img)}" alt="${P.escapeHtml(p.title)}" loading="lazy">`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--color-border-light,#eee);color:var(--color-text-muted,#888);font-size:0.75rem;">No image</div>`;
        return `
          <a href="listing.html?id=${p.propertyId}" class="history-item">
            <div class="history-thumb">${thumb}</div>
            <div class="history-info">
              <h3 class="history-title">${P.escapeHtml(p.title)}</h3>
              <div class="history-location">${pinSvg}${P.escapeHtml(P.locationText(p) || 'Location not specified')}</div>
            </div>
            <span class="history-date">${formatViewedAt(h.viewedAt)}</span>
            ${arrowSvg}
          </a>`;
      }).join('');
    } catch (err) {
      list.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--color-text-muted);">Could not load your history. ${err.message}</div>`;
    }
  }

  initHistory();


  /* ──────────────────────────────────────────
     7. LISTING DETAIL - IMAGE GALLERY
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
     8. FAVOURITES - Toggle Heart
     ────────────────────────────────────────── */
  const favBtns = document.querySelectorAll('.card-fav-btn');

  favBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();

      const card = btn.closest('.listing-card, [data-property-id]');
      const propId = card?.dataset?.propertyId || card?.getAttribute('data-property-id');

      if (!propId) {
        btn.classList.toggle('active');
        showToast(btn.classList.contains('active') ? 'Saved! 💛' : 'Removed',
                   btn.classList.contains('active') ? 'Added to your Hive Saves' : 'Property removed from Hive Saves');
        return;
      }

      const wasActive = btn.classList.contains('active');
      btn.classList.toggle('active');

      try {
        if (!wasActive) {
          await window.HonnetKE.api.post('/favourites', { propertyId: Number(propId) }, true);
          showToast('Saved! 💛', 'Added to your Hive Saves');
        } else {
          await window.HonnetKE.api.del(`/favourites/${propId}`, true);
          showToast('Removed', 'Property removed from Hive Saves');
        }
      } catch (err) {
        // Revert on error
        btn.classList.toggle('active');
        showToast('Error', err.message || 'Could not update favourites');
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
      // Report form submit is handled by the API wiring in section 0c above
    }
  }


  /* ──────────────────────────────────────────
     10. LISTING CARDS - Navigate to Detail
     ────────────────────────────────────────── */
  const listingCards = document.querySelectorAll('.listing-card[data-href]');

  listingCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-fav-btn')) return;
      const href = card.getAttribute('data-href');
      const propId = card.getAttribute('data-property-id');
      if (href) {
        const url = propId ? `${href}?id=${propId}` : href;
        window.location.href = url;
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const href = card.getAttribute('data-href');
        const propId = card.getAttribute('data-property-id');
        if (href) {
          const url = propId ? `${href}?id=${propId}` : href;
          window.location.href = url;
        }
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


  /* ──────────────────────────────────────────
     13. PROFILE PAGE
     ────────────────────────────────────────── */
  const profilePage = document.body.dataset.page === 'profile';

  if (profilePage) {
    // Populate profile with auth data
    const user = window.HonnetKE?.auth?.getUser();
    if (user) {
      const profileName = document.getElementById('profile-name');
      const profileEmail = document.getElementById('profile-email');
      const profileAvatar = document.getElementById('profile-avatar-large');
      const fullnameInput = document.getElementById('profile-fullname');
      const emailInput = document.getElementById('profile-email-field');

      if (profileName && user.fullName) profileName.textContent = user.fullName;
      if (profileEmail && user.email) profileEmail.textContent = user.email;
      if (fullnameInput && user.fullName) fullnameInput.value = user.fullName;
      if (emailInput && user.email) emailInput.value = user.email;
      if (profileAvatar && user.fullName) {
        const initials = user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        profileAvatar.textContent = initials;
      }
    }

    // Fetch real stats for profile page (single lightweight call)
    const ageEl = document.getElementById('stat-age');
    async function fetchProfileStats() {
      try {
        const s = await window.HonnetKE.api.get('/me/profile-stats', true);
        const favEl = document.getElementById('stat-favourites');
        const viewedEl = document.getElementById('stat-viewed');
        if (favEl) favEl.textContent = s.favourites || 0;
        if (viewedEl) viewedEl.textContent = s.hostelsViewed || 0;
        if (ageEl && user) {
          const joined = user.createdAt ? new Date(user.createdAt) : new Date();
          const diffMs = Date.now() - joined.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays < 1) ageEl.textContent = 'Today';
          else if (diffDays < 30) ageEl.textContent = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
          else if (diffDays < 365) ageEl.textContent = `${Math.floor(diffDays / 30)} mo`;
          else ageEl.textContent = `${Math.floor(diffDays / 365)} yr`;
        }
      } catch (err) {
        console.warn('Could not fetch profile stats:', err.message);
      }
    }
    fetchProfileStats();

    // Personal info form
    const personalForm = document.getElementById('personal-info-form');
    if (personalForm) {
      personalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Profile Updated 🐝', 'Your personal information has been saved.');
      });
    }

    // Password form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPwd = document.getElementById('new-password')?.value;
        const confirmPwd = document.getElementById('confirm-password')?.value;
        if (!newPwd || !confirmPwd) {
          showToast('Missing Fields', 'Please fill in all password fields.');
          return;
        }
        if (newPwd !== confirmPwd) {
          showToast('Mismatch', 'New passwords do not match.');
          return;
        }
        showToast('Password Updated 🔒', 'Your password has been changed successfully.');
        passwordForm.reset();
      });
    }

    // Deactivation modal
    const deactivateBtn = document.getElementById('deactivate-account');
    const deactivateModal = document.getElementById('deactivate-modal');
    const deactivateCancel = document.getElementById('deactivate-cancel');
    const deactivateConfirm = document.getElementById('deactivate-confirm');

    if (deactivateBtn && deactivateModal) {
      deactivateBtn.addEventListener('click', () => {
        deactivateModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });

      const closeDeactivateModal = () => {
        deactivateModal.classList.remove('active');
        document.body.style.overflow = '';
      };

      if (deactivateCancel) deactivateCancel.addEventListener('click', closeDeactivateModal);

      deactivateModal.addEventListener('click', (e) => {
        if (e.target === deactivateModal) closeDeactivateModal();
      });

      if (deactivateConfirm) {
        deactivateConfirm.addEventListener('click', () => {
          closeDeactivateModal();
          showToast('Account Deactivated', 'You will be logged out shortly.');
          setTimeout(() => {
            if (window.HonnetKE?.auth) {
              window.HonnetKE.auth.logout();
            } else {
              window.location.href = '../loginpage/login.html';
            }
          }, 2000);
        });
      }
    }
  }

});
