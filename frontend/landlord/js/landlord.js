/* ===================================================
   HonnetKE Landlord Pages — JavaScript
   Handles: navbar, mobile menu, toasts, form stepper,
   image upload, modals, filter tabs, charts, tables.
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Auth Guard ── */
  if (window.HonnetKE && window.HonnetKE.auth) {
    const user = window.HonnetKE.auth.requireAuth(['landlord', 'agent']);
    if (!user) return;

    // Update avatar initials and welcome name
    const avatar = document.querySelector('.avatar');
    if (avatar && user.fullName) {
      const initials = user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      avatar.textContent = initials;
    }
    const welcomeTitle = document.querySelector('.page-title');
    if (welcomeTitle && welcomeTitle.textContent.includes('Welcome back,')) {
      const firstName = user.fullName ? user.fullName.split(' ')[0] : '';
      welcomeTitle.innerHTML = `Welcome back, <span style="color: var(--color-primary);">${firstName}</span>`;
    }
  }

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
     6. MULTI-STEP FORM (Create / Edit Listing)
     ────────────────────────────────────────── */
  const formSteps    = document.querySelectorAll('.form-step');
  const stepperSteps = document.querySelectorAll('.stepper-step');
  const stepperLines = document.querySelectorAll('.stepper-line');
  const btnPrevAll   = document.querySelectorAll('.btn-prev');
  const btnNextAll   = document.querySelectorAll('.btn-next');
  const btnSubmit    = document.querySelector('.btn-submit');
  let currentStep    = 0;

  // Detect edit mode from URL param
  const editId = new URLSearchParams(window.location.search).get('edit');
  const isEditMode = !!editId;

  // Required fields per step
  const step1Fields = ['listing-title', 'listing-description', 'property-type', 'listing-price', 'gender-preference', 'room-type'];
  const step2Fields = ['listing-county', 'listing-area'];

  function validateStep(stepIndex) {
    let isValid = true;
    let firstInvalid = null;
    const fields = stepIndex === 0 ? step1Fields : stepIndex === 1 ? step2Fields : [];

    fields.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const val = el.value.trim();
      if (!val) {
        el.classList.add('input-error');
        if (!firstInvalid) firstInvalid = el;
        isValid = false;
      } else {
        el.classList.remove('input-error');
      }
    });

    // Price must be a positive number
    if (stepIndex === 0) {
      const priceEl = document.getElementById('listing-price');
      if (priceEl && priceEl.value && parseFloat(priceEl.value) <= 0) {
        priceEl.classList.add('input-error');
        if (!firstInvalid) firstInvalid = priceEl;
        isValid = false;
      }
    }

    if (!isValid && firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return isValid;
  }

  // Clear error state on input
  document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('input-error'));
    el.addEventListener('change', () => el.classList.remove('input-error'));
  });

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
      if (!validateStep(currentStep)) {
        showToast('Missing Fields', 'Please fill in all required fields before proceeding.');
        return;
      }
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

  // Pre-fill form if in edit mode
  function setVal(id, value) {
    const el = document.getElementById(id);
    if (el && value != null) el.value = value;
  }

  async function loadListingForEdit() {
    if (!isEditMode) return;
    try {
      const listing = await window.HonnetKE.api.get(`/listings/${editId}`, true);

      // Update page header
      const pageTitle = document.querySelector('.page-title');
      const pageSubtitle = document.querySelector('.page-subtitle');
      if (pageTitle) pageTitle.textContent = 'Edit Listing';
      if (pageSubtitle) pageSubtitle.textContent = 'Update your property details below.';

      // Update submit button text
      if (btnSubmit) {
        btnSubmit.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Update Listing`;
      }

      // Step 1 fields
      setVal('listing-title', listing.title);
      setVal('listing-description', listing.description);
      setVal('property-type', listing.propertyType);
      setVal('listing-price', listing.price);
      setVal('gender-preference', listing.genderPreference);
      setVal('room-type', listing.roomType);

      // Step 2 fields
      setVal('listing-county', listing.county);
      setVal('listing-area', listing.area);
      setVal('listing-campus', listing.nearestCampus);
      setVal('listing-address', listing.address);

      // Step 3 amenities
      if (listing.amenities && Array.isArray(listing.amenities)) {
        document.querySelectorAll('.amenity-checkbox input').forEach(cb => {
          cb.checked = listing.amenities.includes(cb.value);
          cb.closest('.amenity-checkbox')?.classList.toggle('checked', cb.checked);
        });
      }

      // Step 4 images — show existing images as previews
      if (listing.images && listing.images.length > 0 && previewGrid) {
        listing.images.forEach((img, index) => {
          const item = document.createElement('div');
          item.className = 'image-preview-item' + (index === 0 ? ' primary' : '');
          item.innerHTML = `
            <img src="${img.imageUrl}" alt="Existing image ${index + 1}">
            <button class="remove-img" aria-label="Remove image" data-url="${img.imageUrl}">
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
          });
          previewGrid.appendChild(item);
        });
      }
    } catch (err) {
      showToast('Error', 'Could not load listing for editing.');
      setTimeout(() => { window.location.href = 'manage-listings.html'; }, 2000);
    }
  }

  loadListingForEdit();

  if (btnSubmit) {
    btnSubmit.addEventListener('click', async (e) => {
      e.preventDefault();

      // Validate all steps before submit
      for (let s = 0; s < formSteps.length - 1; s++) {
        if (!validateStep(s)) {
          currentStep = s;
          updateStepper();
          showToast('Missing Fields', 'Please fill in all required fields.');
          return;
        }
      }

      const title = document.getElementById('listing-title')?.value.trim();
      const description = document.getElementById('listing-description')?.value.trim();
      const propertyType = document.getElementById('property-type')?.value;
      const price = document.getElementById('listing-price')?.value;
      const genderPreference = document.getElementById('gender-preference')?.value;
      const roomType = document.getElementById('room-type')?.value;
      const county = document.getElementById('listing-county')?.value;
      const area = document.getElementById('listing-area')?.value.trim();
      const nearestCampus = document.getElementById('listing-campus')?.value.trim();
      const address = document.getElementById('listing-address')?.value.trim();
      const amenities = Array.from(document.querySelectorAll('.amenity-checkbox input:checked'))
        .map(c => c.value);

      btnSubmit.classList.add('btn-loading');
      btnSubmit.disabled = true;

      try {
        const payload = {
          title, description, propertyType, price,
          genderPreference, roomType, amenities,
          county, area, nearestCampus, address,
        };

        let listingId;
        if (isEditMode) {
          const res = await window.HonnetKE.api.patch(`/listings/${editId}`, payload, true);
          listingId = editId;
          showToast('Listing Updated ✅', res.message || 'Your listing has been updated.');
        } else {
          const res = await window.HonnetKE.api.post('/listings', payload, true);
          listingId = res.listing.listingId;
          showToast('Listing Submitted! 🎉', res.message || 'Your listing is pending admin review.');
        }

        // Upload images if any new ones were selected
        if (uploadedFiles.length > 0) {
          const formData = new FormData();
          uploadedFiles.forEach(file => formData.append('images', file));

          const token = window.HonnetKE.auth.getToken();
          const imgRes = await fetch(
            `${window.HonnetKE.api.BASE}/listings/${listingId}/images`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            }
          );
          if (!imgRes.ok) {
            const imgErr = await imgRes.json().catch(() => ({}));
            showToast('Images Partially Failed', imgErr.message || 'Some images could not be uploaded.');
          }
        }

        setTimeout(() => {
          window.location.href = 'manage-listings.html';
        }, 2000);
      } catch (err) {
        btnSubmit.classList.remove('btn-loading');
        btnSubmit.disabled = false;
        showToast('Error', err.message || 'Failed to save listing. Please try again.');
      }
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
     12. MANAGE LISTINGS — Fetch from API
     ────────────────────────────────────────── */
  const listingsGrid = document.querySelector('.listings-grid');

  async function fetchMyListings() {
    if (!listingsGrid) return;
    try {
      const res = await window.HonnetKE.api.get('/listings?scope=mine&status=all&limit=50', true);
      renderListings(res.listings || []);
    } catch (err) {
      showToast('Error', 'Could not load your listings.');
    }
  }

  function renderListings(listings) {
    if (!listingsGrid) return;

    if (listings.length === 0) {
      listingsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <p style="font-size: 1.1rem; color: var(--color-text-muted); margin-bottom: 1rem;">You haven't created any listings yet.</p>
          <a href="create-listing.html" class="btn btn-primary">Create Your First Listing</a>
        </div>`;
      return;
    }

    listingsGrid.innerHTML = listings.map(listing => {
      const img = listing.images && listing.images.length > 0
        ? listing.images[0].imageUrl
        : '../landingpage/assets/images/hostel-placeholder.png';
      const statusClass = listing.status;
      const statusLabel = listing.status.charAt(0).toUpperCase() + listing.status.slice(1);
      const price = Number(listing.price).toLocaleString();

      return `
        <div class="manage-card" data-status="${statusClass}" data-id="${listing.listingId}">
          <div class="manage-card-img">
            <img src="${img}" alt="${listing.title}" loading="lazy">
            <span class="status-badge ${statusClass}"><span class="status-dot"></span>${statusLabel}</span>
            <div class="card-price-tag">KES ${price}/mo</div>
          </div>
          <div class="manage-card-body">
            <h3 class="manage-card-title">${listing.title}</h3>
            <div class="manage-card-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${listing.area}, ${listing.county}
            </div>
            <div class="manage-card-actions">
              <button class="action-btn" data-action="edit" data-id="${listing.listingId}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button>
              ${listing.status === 'active' || listing.status === 'pending'
                ? `<button class="action-btn" data-action="deactivate" data-id="${listing.listingId}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>Deactivate</button>`
                : `<button class="action-btn" data-action="reactivate" data-id="${listing.listingId}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>Reactivate</button>`
              }
              <button class="action-btn danger" data-action="delete" data-id="${listing.listingId}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>Delete</button>
            </div>
          </div>
        </div>`;
    }).join('');

    // Re-bind action buttons
    bindListingActions();
  }

  function bindListingActions() {
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (!confirm('Are you sure you want to permanently delete this listing?')) return;
        try {
          await window.HonnetKE.api.del(`/listings/${id}`, true);
          showToast('Listing Deleted', 'The listing has been permanently removed.');
          fetchMyListings();
        } catch (err) {
          showToast('Error', err.message || 'Failed to delete listing.');
        }
      });
    });

    document.querySelectorAll('[data-action="deactivate"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        try {
          await window.HonnetKE.api.patch(`/listings/${id}/deactivate`, {}, true);
          showToast('Listing Deactivated', 'The listing is now inactive and hidden from students.');
          fetchMyListings();
        } catch (err) {
          showToast('Error', err.message || 'Failed to deactivate listing.');
        }
      });
    });

    document.querySelectorAll('[data-action="reactivate"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        try {
          await window.HonnetKE.api.patch(`/listings/${id}/reactivate`, {}, true);
          showToast('Listing Reactivated ✅', 'Your listing has been re-submitted for review.');
          fetchMyListings();
        } catch (err) {
          showToast('Error', err.message || 'Failed to reactivate listing.');
        }
      });
    });

    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        window.location.href = `create-listing.html?edit=${id}`;
      });
    });
  }

  // Auto-fetch listings on manage-listings page
  if (listingsGrid) {
    fetchMyListings();
  }


  /* ──────────────────────────────────────────
     12b. DASHBOARD — Stats + Recent Bookings
     ────────────────────────────────────────── */
  const statsGrid = document.querySelector('.stats-grid');
  const recentBookingsBody = document.querySelector('.data-table tbody');

  async function fetchDashboardData() {
    // Only run on dashboard page
    if (!statsGrid) return;

    try {
      const [listingsRes, bookingsRes] = await Promise.all([
        window.HonnetKE.api.get('/listings?scope=mine&status=all&limit=100', true),
        window.HonnetKE.api.get('/bookings', true).catch(() => ({ bookings: [] })),
      ]);
      const listings = listingsRes.listings || [];
      const bookings = bookingsRes.bookings || [];

      const total = listings.length;
      const active = listings.filter(l => l.status === 'active').length;
      const pending = listings.filter(l => l.status === 'pending').length;

      // Update stat cards
      const statValues = statsGrid.querySelectorAll('.stat-value');
      if (statValues[0]) statValues[0].textContent = total;
      if (statValues[1]) statValues[1].textContent = active;
      if (statValues[2]) statValues[2].textContent = pending;
      if (statValues[3]) statValues[3].textContent = bookings.length;

      // Recent bookings table
      if (recentBookingsBody) {
        if (bookings.length === 0) {
          recentBookingsBody.innerHTML = `
            <tr>
              <td colspan="5" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                No booking requests yet. Once students start booking your listings, they'll appear here.
              </td>
            </tr>`;
        } else {
          const recent = bookings.slice(0, 5);
          recentBookingsBody.innerHTML = recent.map(b => {
            const date = new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            const statusClass = b.status;
            const statusLabel = b.status.charAt(0).toUpperCase() + b.status.slice(1);
            const studentName = b.student ? b.student.fullName : 'Unknown';
            const listingTitle = b.listing ? b.listing.title : 'Unknown';

            return `
              <tr>
                <td class="table-student-name">${studentName}</td>
                <td class="table-listing-name">${listingTitle}</td>
                <td class="table-date">${date}</td>
                <td><span class="status-badge ${statusClass}"><span class="status-dot"></span>${statusLabel}</span></td>
                <td><a href="bookings.html" class="table-action-link">View</a></td>
              </tr>`;
          }).join('');
        }
      }
    } catch (err) {
      console.warn('Could not fetch dashboard data:', err.message);
    }
  }

  fetchDashboardData();


  /* ──────────────────────────────────────────
     12c. BOOKINGS PAGE — Fetch from API
     ────────────────────────────────────────── */
  const bookingFilters = document.getElementById('booking-filters');
  const bookingsTableBody = document.querySelector('.data-table tbody');

  async function fetchBookings() {
    if (!bookingFilters) return;
    try {
      const res = await window.HonnetKE.api.get('/bookings', true);
      const bookings = res.bookings || res.data || [];

      if (bookings.length === 0) {
        if (bookingsTableBody) {
          bookingsTableBody.innerHTML = `
            <tr>
              <td colspan="6" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                No booking requests yet.
              </td>
            </tr>`;
        }
        // Reset filter counts
        bookingFilters.querySelectorAll('.filter-tab').forEach(tab => {
          const filter = tab.dataset.filter;
          tab.textContent = filter.charAt(0).toUpperCase() + filter.slice(1);
        });
        return;
      }

      // Render bookings table
      if (bookingsTableBody) {
        bookingsTableBody.innerHTML = bookings.map(b => {
          const date = new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const statusClass = b.status;
          const statusLabel = b.status.charAt(0).toUpperCase() + b.status.slice(1);
          const studentName = b.student ? b.student.fullName : 'Unknown Student';
          const listingTitle = b.listing ? b.listing.title : 'Unknown Listing';

          let actions = '';
          if (b.status === 'pending') {
            actions = `
              <div class="table-actions">
                <button class="btn-sm btn-confirm" data-action="confirm-booking" data-id="${b.bookingId}">Confirm</button>
                <button class="btn-sm btn-decline" data-action="decline-booking" data-id="${b.bookingId}">Decline</button>
              </div>`;
          } else {
            actions = `<span style="color: var(--color-text-muted); font-size: var(--fs-caption);">Responded</span>`;
          }

          return `
            <tr data-status="${statusClass}">
              <td class="table-student-name">${studentName}</td>
              <td class="table-listing-name">${listingTitle}</td>
              <td class="table-date">${date}</td>
              <td style="max-width: 180px; font-size: var(--fs-caption); color: var(--color-text-muted);">${b.requestNote || '—'}</td>
              <td><span class="status-badge ${statusClass}"><span class="status-dot"></span>${statusLabel}</span></td>
              <td>${actions}</td>
            </tr>`;
        }).join('');
      }

      // Update filter counts
      const counts = { all: bookings.length, pending: 0, confirmed: 0, declined: 0, cancelled: 0 };
      bookings.forEach(b => { if (counts[b.status] !== undefined) counts[b.status]++; });
      bookingFilters.querySelectorAll('.filter-tab').forEach(tab => {
        const filter = tab.dataset.filter;
        tab.textContent = `${filter.charAt(0).toUpperCase() + filter.slice(1)} (${counts[filter] || 0})`;
      });
    } catch (err) {
      // Backend bookings not implemented — show empty state
      if (bookingsTableBody) {
        bookingsTableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
              No booking requests yet. Bookings will appear here once students start requesting.
            </td>
          </tr>`;
      }
      bookingFilters.querySelectorAll('.filter-tab').forEach(tab => {
        const filter = tab.dataset.filter;
        tab.textContent = filter.charAt(0).toUpperCase() + filter.slice(1);
      });
    }
  }

  fetchBookings();

  // Wire booking action buttons (confirm/decline)
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const bookingId = btn.dataset.id;
    if (!bookingId) return;

    const statusMap = {
      'confirm-booking': { status: 'confirmed', label: 'confirmed', toast: 'Booking Confirmed ✅' },
      'decline-booking': { status: 'declined', label: 'declined', toast: 'Booking Declined' },
    };
    const config = statusMap[action];
    if (!config) return;

    btn.disabled = true;
    btn.textContent = '...';

    try {
      await window.HonnetKE.api.patch(`/bookings/${bookingId}`, { status: config.status }, true);
      showToast(config.toast, `Booking has been ${config.label}.`);
      fetchBookings();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = action === 'confirm-booking' ? 'Confirm' : 'Decline';
      showToast('Error', err.message || 'Could not update booking');
    }
  });


  /* ──────────────────────────────────────────
     12d. ANALYTICS PAGE — Fetch from API
     ────────────────────────────────────────── */
  const analyticsStatsGrid = document.querySelector('.analytics-page .stats-grid, .landlord-main .stats-grid');
  const analyticsTableBody = document.querySelector('.analytics-page .data-table tbody, .landlord-main .data-table tbody');
  const barChart = document.querySelector('.bar-chart');

  async function fetchAnalyticsData() {
    // Only run on analytics page (detect by bar chart presence)
    if (!barChart) return;

    try {
      const res = await window.HonnetKE.api.get('/analytics', true);
      const data = res;

      // Update overview stats
      const statValues = document.querySelectorAll('.stats-grid .stat-value');
      if (statValues[0]) statValues[0].textContent = data.thisWeekViews || 0;
      if (statValues[1]) statValues[1].textContent = data.totalViews || 0;
      if (statValues[2]) statValues[2].textContent = data.mostViewedListing || '—';

      // Render per-listing performance table
      const analyticsTable = document.querySelectorAll('.data-table tbody');
      const tableBody = analyticsTable[analyticsTable.length - 1];
      if (tableBody) {
        const perListing = data.perListing || [];
        if (perListing.length === 0) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="5" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                No listings to show analytics for.
              </td>
            </tr>`;
        } else {
          tableBody.innerHTML = perListing.map(l => {
            const statusClass = l.status;
            const statusLabel = l.status.charAt(0).toUpperCase() + l.status.slice(1);
            const locationText = [l.area, l.nearestCampus].filter(Boolean).join(', near ');
            const weekColor = l.thisWeekViews > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)';

            return `
              <tr>
                <td class="table-student-name">${l.title}</td>
                <td class="table-listing-name">${locationText || '—'}</td>
                <td><strong style="color: ${weekColor};">${l.thisWeekViews}</strong></td>
                <td>${l.totalViews}</td>
                <td><span class="status-badge ${statusClass}"><span class="status-dot"></span>${statusLabel}</span></td>
              </tr>`;
          }).join('');
        }
      }

      // Render bar chart from per-listing data
      if (barChart) {
        const perListing = data.perListing || [];
        if (perListing.length === 0 || data.totalViews === 0) {
          barChart.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-text-muted); font-size: var(--fs-caption);">
              No view data yet. Analytics are aggregated weekly.
            </div>`;
        } else {
          const maxViews = Math.max(...perListing.map(l => l.thisWeekViews), 1);
          barChart.innerHTML = perListing.map(l => {
            const heightPct = Math.max((l.thisWeekViews / maxViews) * 100, 5);
            const shortTitle = l.title.length > 15 ? l.title.substring(0, 12) + '…' : l.title;
            return `
              <div class="bar-chart-bar" title="${l.title}: ${l.thisWeekViews} views this week">
                <div class="bar-fill" style="height: ${heightPct}%;"></div>
                <span class="bar-label">${shortTitle}</span>
              </div>`;
          }).join('');
        }
      }
    } catch (err) {
      console.warn('Could not fetch analytics:', err.message);
    }
  }

  fetchAnalyticsData();


  /* ──────────────────────────────────────────
     13. LOGOUT WIRING
     ────────────────────────────────────────── */
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
     13b. CANCEL BUTTON (Create/Edit Listing)
     ────────────────────────────────────────── */
  const cancelBtn = document.getElementById('btn-cancel-listing');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        window.location.href = 'manage-listings.html';
      }
    });
  }


  /* ──────────────────────────────────────────
     14. SMOOTH SCROLL for Anchor Links
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
