/* ===================================================
   HonnetKE Login Page - JavaScript
   Handles: form validation, password toggle,
   forgot password modal, mobile menu.
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── DOM References ── */
  const menuToggle    = document.getElementById('menu-toggle');
  const mobileNav     = document.getElementById('mobile-nav-overlay');
  const loginForm     = document.getElementById('login-form');
  const forgotBtn     = document.getElementById('forgot-password-btn');
  const forgotModal   = document.getElementById('forgot-modal');
  const modalClose    = document.getElementById('modal-close');
  const forgotForm    = document.getElementById('forgot-form');
  const forgotSuccess = document.getElementById('forgot-success');
  const backToLogin   = document.getElementById('back-to-login');


  /* ──────────────────────────────────────────
     1. MOBILE MENU TOGGLE
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

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (mobileNav.classList.contains('open')) {
          toggleMobileMenu();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  }


  /* ──────────────────────────────────────────
     2. PASSWORD SHOW/HIDE TOGGLE
     ────────────────────────────────────────── */
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrap = btn.closest('.input-wrap');
      const input = wrap.querySelector('input');
      const eyeOpen = btn.querySelector('.eye-open');
      const eyeClosed = btn.querySelector('.eye-closed');

      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
        btn.setAttribute('aria-label', 'Hide password');
      } else {
        input.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
        btn.setAttribute('aria-label', 'Show password');
      }
    });
  });


  /* ──────────────────────────────────────────
     3. VALIDATION HELPERS
     ────────────────────────────────────────── */
  function showFieldError(groupEl, errorEl, message) {
    groupEl.classList.add('has-error');
    errorEl.textContent = message;
    errorEl.classList.add('visible');
    groupEl.classList.remove('shake');
    groupEl.offsetHeight; // Force reflow
    groupEl.classList.add('shake');
  }

  function clearFieldError(groupEl) {
    if (!groupEl) return;
    groupEl.classList.remove('has-error', 'shake');
    const errorEl = groupEl.querySelector('.form-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  // Clear error on input
  document.querySelectorAll('.auth-form .input').forEach(input => {
    input.addEventListener('input', () => {
      clearFieldError(input.closest('.form-group'));
    });
  });


  /* ──────────────────────────────────────────
     4. LOGIN FORM VALIDATION & SUBMIT
     ────────────────────────────────────────── */
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let isValid = true;

      // Email
      const email = document.getElementById('login-email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) {
        showFieldError(
          document.getElementById('group-email'),
          document.getElementById('error-email'),
          'Please enter your email address'
        );
        isValid = false;
      } else if (!emailRegex.test(email.value)) {
        showFieldError(
          document.getElementById('group-email'),
          document.getElementById('error-email'),
          'Please enter a valid email address'
        );
        isValid = false;
      }

      // Password
      const password = document.getElementById('login-password');
      if (!password.value) {
        showFieldError(
          document.getElementById('group-password'),
          document.getElementById('error-password'),
          'Please enter your password'
        );
        isValid = false;
      }

      if (!isValid) {
        const firstError = loginForm.querySelector('.has-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // ── All valid - call login API (step 1 of 2FA) ──
      const submitBtn = document.getElementById('login-submit');
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;

      try {
        const res = await window.HonnetKE.api.post('/auth/login', {
          email: email.value.trim(),
          password: password.value,
        });

        // Backend validated the password and emailed a one-time code.
        // Carry the flow to the verification page.
        const rememberMe = document.getElementById('remember-me').checked;
        window.HonnetKE.auth.setPending({
          email: res.email,
          role: res.role,
          purpose: res.purpose,
          remember: rememberMe,
        });
        window.location.href = window.HonnetKE.auth.OTP_PAGE;
      } catch (err) {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
        showFieldError(
          document.getElementById('group-password'),
          document.getElementById('error-password'),
          err.message || 'Login failed. Please try again.'
        );
      }
    });
  }


  /* ──────────────────────────────────────────
     5. FORGOT PASSWORD MODAL
     ────────────────────────────────────────── */

  function openModal() {
    forgotModal.classList.add('open');
    forgotModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Reset to form state (hide success)
    forgotForm.style.display = '';
    forgotSuccess.style.display = 'none';

    // Focus the email input
    setTimeout(() => {
      const emailInput = document.getElementById('forgot-email');
      if (emailInput) emailInput.focus();
    }, 100);
  }

  function closeModal() {
    forgotModal.classList.remove('open');
    forgotModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Clear form state
    forgotForm.reset();
    clearFieldError(document.getElementById('group-forgot-email'));
  }

  // Open modal
  if (forgotBtn) {
    forgotBtn.addEventListener('click', openModal);
  }

  // Close modal - X button
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Close modal - click backdrop
  if (forgotModal) {
    forgotModal.addEventListener('click', (e) => {
      if (e.target === forgotModal) {
        closeModal();
      }
    });
  }

  // Close modal - Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && forgotModal && forgotModal.classList.contains('open')) {
      closeModal();
    }
  });

  // Back to login button in success state
  if (backToLogin) {
    backToLogin.addEventListener('click', closeModal);
  }


  /* ──────────────────────────────────────────
     6. FORGOT PASSWORD FORM SUBMIT
     ────────────────────────────────────────── */
  if (forgotForm) {
    // Clear errors on input
    const forgotEmailInput = document.getElementById('forgot-email');
    if (forgotEmailInput) {
      forgotEmailInput.addEventListener('input', () => {
        clearFieldError(document.getElementById('group-forgot-email'));
      });
    }

    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('forgot-email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email.value.trim()) {
        showFieldError(
          document.getElementById('group-forgot-email'),
          document.getElementById('error-forgot-email'),
          'Please enter your email address'
        );
        return;
      }

      if (!emailRegex.test(email.value)) {
        showFieldError(
          document.getElementById('group-forgot-email'),
          document.getElementById('error-forgot-email'),
          'Please enter a valid email address'
        );
        return;
      }

      // ── Request a reset code ──
      const submitBtn = document.getElementById('forgot-submit');
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;

      try {
        await window.HonnetKE.api.post('/auth/forgot-password', { email: email.value.trim() });
      } catch (err) {
        // Always show the same neutral message (no account enumeration).
      } finally {
        forgotForm.style.display = 'none';
        forgotSuccess.style.display = '';
        document.getElementById('success-email').textContent = email.value;
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
      }
    });
  }

});
