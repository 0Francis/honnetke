/* ===================================================
   HonnetKE Landlord Pages — JavaScript
   Handles: navbar, mobile menu, toasts, form stepper,
   image upload, modals, filter tabs, charts, tables.
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── DOM References ── */
  const navbar        = document.querySelector('.landlord-navbar');
  const menuToggle    = document.getElementById('menu-toggle');
  const mobileNav     = document.getElementById('landlord-mobile-nav');
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

  // Welcome toast on dashboard
  const currentPage = window.location.pathname.split('/').pop();
  if (currentPage === 'dashboard.html') {
    const hasShownWelcome = sessionStorage.getItem('honnetke_landlord_welcome');
    if (!hasShownWelcome) {
      setTimeout(() => {
        showToast('Welcome back, Peter! 🏠', 'Manage your listings and check booking requests.');
        sessionStorage.setItem('honnetke_landlord_welcome', 'true');
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
     6. MULTI-STEP FORM (Create Listing)
     ────────────────────────────────────────── */
  const formSteps    = document.querySelectorAll('.form-step');
  const stepperSteps = document.querySelectorAll('.stepper-step');
  const stepperLines = document.querySelectorAll('.stepper-line');
  const btnPrevAll   = document.querySelectorAll('.btn-prev');
  const btnNextAll   = document.querySelectorAll('.btn-next');
  const btnSubmit    = document.querySelector('.btn-submit');
  let currentStep    = 0;

  function updateStepper() {
    formSteps.forEach((step, i) => {
      step.classList.toggle('active', i === currentStep);
    });

    stepperSteps.forEach((step, i) => {
      step.classList.remove('active', 'completed');
      if (i === currentStep) step.classList.add('active');
      if (i < currentStep) step.classList.add('completed');
    });

    stepperLines.forEach((line, i) => {
      line.classList.toggle('completed', i < currentStep);
    });

    // Update review summary when reaching the last step
    if (currentStep === formSteps.length - 1) {
      populateReview();
    }
  }

  btnNextAll.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep < formSteps.length - 1) {
        currentStep++;
        updateStepper();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  btnPrevAll.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        updateStepper();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  if (btnSubmit) {
    btnSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Listing Submitted! 🎉', 'Your listing is pending admin review.');
      setTimeout(() => {
        window.location.href = 'manage-listings.html';
      }, 2000);
    });
  }

  // Review edit buttons — go back to specific step
  document.querySelectorAll('.review-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStep = parseInt(btn.dataset.step);
      if (!isNaN(targetStep)) {
        currentStep = targetStep;
        updateStepper();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  function populateReview() {
    // Basic Info
    const titleEl = document.getElementById('review-title');
    const descEl  = document.getElementById('review-description');
    const typeEl  = document.getElementById('review-property-type');
    const priceEl = document.getElementById('review-price');
    const genderEl= document.getElementById('review-gender');
    const roomEl  = document.getElementById('review-room-type');

    if (titleEl) titleEl.textContent = document.getElementById('listing-title')?.value || '—';
    if (descEl)  descEl.textContent  = document.getElementById('listing-description')?.value || '—';
    if (typeEl)  typeEl.textContent   = document.getElementById('property-type')?.selectedOptions[0]?.text || '—';
    if (priceEl) priceEl.textContent  = 'KES ' + (document.getElementById('listing-price')?.value || '—');
    if (genderEl) genderEl.textContent = document.getElementById('gender-preference')?.selectedOptions[0]?.text || '—';
    if (roomEl)  roomEl.textContent   = document.getElementById('room-type')?.selectedOptions[0]?.text || '—';

    // Location
    const countyEl  = document.getElementById('review-county');
    const areaEl    = document.getElementById('review-area');
    const campusEl  = document.getElementById('review-campus');
    const addressEl = document.getElementById('review-address');

    if (countyEl)  countyEl.textContent  = document.getElementById('listing-county')?.value || '—';
    if (areaEl)    areaEl.textContent    = document.getElementById('listing-area')?.value || '—';
    if (campusEl)  campusEl.textContent  = document.getElementById('listing-campus')?.value || '—';
    if (addressEl) addressEl.textContent = document.getElementById('listing-address')?.value || '—';

    // Amenities
    const amenitiesEl = document.getElementById('review-amenities');
    if (amenitiesEl) {
      const checked = document.querySelectorAll('.amenity-checkbox input:checked');
      const names = Array.from(checked).map(c => c.parentElement.querySelector('span').textContent);
      amenitiesEl.textContent = names.length > 0 ? names.join(', ') : 'None selected';
    }
  }


  /* ──────────────────────────────────────────
     7. AMENITY CHECKBOX TOGGLE
     ────────────────────────────────────────── */
  document.querySelectorAll('.amenity-checkbox').forEach(item => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (checkbox) {
      item.addEventListener('click', (e) => {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        item.classList.toggle('checked', checkbox.checked);
      });
    }
  });


  /* ──────────────────────────────────────────
     8. IMAGE UPLOAD (Drag & Drop + Preview)
     ────────────────────────────────────────── */
  const uploadArea     = document.getElementById('upload-area');
  const fileInput      = document.getElementById('listing-images');
  const previewGrid    = document.getElementById('image-preview-grid');
  let uploadedFiles    = [];

  if (uploadArea && fileInput) {
    // Click to browse
    uploadArea.addEventListener('click', () => fileInput.click());

    // Drag events
    ['dragenter', 'dragover'].forEach(evt => {
      uploadArea.addEventListener(evt, (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(evt => {
      uploadArea.addEventListener(evt, (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
      });
    });

    uploadArea.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      handleFiles(files);
    });

    fileInput.addEventListener('change', () => {
      handleFiles(fileInput.files);
    });
  }

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      if (uploadedFiles.length >= 10) return;

      uploadedFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        addPreviewImage(e.target.result, uploadedFiles.length - 1);
      };
      reader.readAsDataURL(file);
    });
  }

  function addPreviewImage(src, index) {
    if (!previewGrid) return;

    const item = document.createElement('div');
    item.className = 'image-preview-item' + (index === 0 ? ' primary' : '');
    item.innerHTML = `
      <img src="${src}" alt="Upload preview ${index + 1}">
      <button class="remove-img" aria-label="Remove image" data-index="${index}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      ${index === 0 ? '<span class="primary-badge">Primary</span>' : ''}
    `;

    item.querySelector('.remove-img').addEventListener('click', (e) => {
      e.stopPropagation();
      item.remove();
      uploadedFiles.splice(index, 1);
    });

    previewGrid.appendChild(item);
  }


  /* ──────────────────────────────────────────
     9. FILTER TABS (Manage Listings / Bookings)
     ────────────────────────────────────────── */
  const filterTabs = document.querySelectorAll('.filter-tab');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tab.closest('.filter-tabs').querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      // Filter listing cards (manage-listings page)
      const manageCards = document.querySelectorAll('.manage-card[data-status]');
      manageCards.forEach(card => {
        if (filter === 'all' || card.dataset.status === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });

      // Filter booking rows (bookings page)
      const bookingRows = document.querySelectorAll('.data-table tbody tr[data-status]');
      bookingRows.forEach(row => {
        if (filter === 'all' || row.dataset.status === filter) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });


  /* ──────────────────────────────────────────
     10. CONFIRMATION MODALS
     ────────────────────────────────────────── */

  // Delete modal
  const deleteModal   = document.getElementById('delete-modal');
  const deleteTriggers = document.querySelectorAll('[data-action="delete"]');
  const deleteCancel  = document.getElementById('delete-cancel');
  const deleteConfirm = document.getElementById('delete-confirm');

  deleteTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (deleteModal) deleteModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (deleteCancel) {
    deleteCancel.addEventListener('click', () => closeModal(deleteModal));
  }

  if (deleteConfirm) {
    deleteConfirm.addEventListener('click', () => {
      closeModal(deleteModal);
      showToast('Listing Deleted', 'The listing has been permanently removed.');
    });
  }

  // Deactivate modal
  const deactivateModal    = document.getElementById('deactivate-modal');
  const deactivateTriggers = document.querySelectorAll('[data-action="deactivate"]');
  const deactivateCancel   = document.getElementById('deactivate-cancel');
  const deactivateConfirm  = document.getElementById('deactivate-confirm');

  deactivateTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (deactivateModal) deactivateModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (deactivateCancel) {
    deactivateCancel.addEventListener('click', () => closeModal(deactivateModal));
  }

  if (deactivateConfirm) {
    deactivateConfirm.addEventListener('click', () => {
      closeModal(deactivateModal);
      showToast('Listing Deactivated', 'The listing is now inactive and hidden from students.');
    });
  }

  // Response modal (bookings page)
  const responseModal   = document.getElementById('response-modal');
  const responseCancel  = document.getElementById('response-cancel');
  const responseConfirm = document.getElementById('response-confirm');
  let currentBookingAction = '';

  document.querySelectorAll('[data-action="confirm-booking"]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentBookingAction = 'confirm';
      const modalTitle = responseModal?.querySelector('h3');
      if (modalTitle) modalTitle.textContent = 'Confirm Booking';
      if (responseModal) responseModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  document.querySelectorAll('[data-action="decline-booking"]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentBookingAction = 'decline';
      const modalTitle = responseModal?.querySelector('h3');
      if (modalTitle) modalTitle.textContent = 'Decline Booking';
      if (responseModal) responseModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (responseCancel) {
    responseCancel.addEventListener('click', () => closeModal(responseModal));
  }

  if (responseConfirm) {
    responseConfirm.addEventListener('click', () => {
      closeModal(responseModal);
      if (currentBookingAction === 'confirm') {
        showToast('Booking Confirmed ✅', 'The student has been notified.');
      } else {
        showToast('Booking Declined', 'The student has been notified of your decision.');
      }
    });
  }

  // Reactivate handlers
  document.querySelectorAll('[data-action="reactivate"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('Listing Reactivated ✅', 'Your listing is now visible to students again.');
    });
  });

  // Generic modal close
  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Close modals on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Close modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m));
    }
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

});
