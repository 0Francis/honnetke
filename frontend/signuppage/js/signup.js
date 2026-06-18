/* ===================================================
   HonnetKE Sign Up Page — JavaScript
   Handles: role-specific fields, password toggle,
   password strength, form validation, mobile menu,
   and OTP page logic.
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── DOM References ── */
  const menuToggle   = document.getElementById('menu-toggle');
  const mobileNav    = document.getElementById('mobile-nav-overlay');
  const signupForm   = document.getElementById('signup-form');


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
     4. PASSWORD STRENGTH INDICATOR
     ────────────────────────────────────────── */
  const passwordInput   = document.getElementById('signup-password');
  const strengthWrap    = document.getElementById('password-strength');
  const strengthFill    = document.getElementById('strength-fill');
  const strengthLabel   = document.getElementById('strength-label');

  if (passwordInput && strengthWrap) {
    passwordInput.addEventListener('input', () => {
      const value = passwordInput.value;

      if (value.length === 0) {
        strengthWrap.classList.remove('visible');
        return;
      }

      strengthWrap.classList.add('visible');
      const result = getPasswordStrength(value);

      // Update fill bar
      strengthFill.className = 'strength-fill ' + result.level;

      // Update label
      strengthLabel.textContent = result.label;
      strengthLabel.className = 'strength-label ' + result.level;
    });
  }

  function getPasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 'weak', label: 'Weak' };
    if (score === 2) return { level: 'fair', label: 'Fair' };
    if (score === 3) return { level: 'good', label: 'Good' };
    return { level: 'strong', label: 'Strong' };
  }


  /* ──────────────────────────────────────────
     5. FORM VALIDATION
     ────────────────────────────────────────── */

  // Validation helpers
  function showFieldError(groupEl, errorEl, message) {
    groupEl.classList.add('has-error');
    errorEl.textContent = message;
    errorEl.classList.add('visible');
    // Add shake effect
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

  // Form submit validation
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      // Full Name
      const fullname = document.getElementById('signup-fullname');
      if (!fullname.value.trim()) {
        showFieldError(
          document.getElementById('group-fullname'),
          document.getElementById('error-fullname'),
          'Please enter your full name'
        );
        isValid = false;
      }

      // Email
      const email = document.getElementById('signup-email');
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

      // Phone
      const phone = document.getElementById('signup-phone');
      const phoneClean = phone.value.replace(/[\s\-()]/g, '');
      if (!phoneClean) {
        showFieldError(
          document.getElementById('group-phone'),
          document.getElementById('error-phone'),
          'Please enter your phone number'
        );
        isValid = false;
      } else if (!/^(\+?254|0)\d{9}$/.test(phoneClean)) {
        showFieldError(
          document.getElementById('group-phone'),
          document.getElementById('error-phone'),
          'Enter a valid Kenyan phone number (e.g. 0712 345 678)'
        );
        isValid = false;
      }

      // Password
      const password = document.getElementById('signup-password');
      if (!password.value) {
        showFieldError(
          document.getElementById('group-password'),
          document.getElementById('error-password'),
          'Please create a password'
        );
        isValid = false;
      } else if (password.value.length < 8) {
        showFieldError(
          document.getElementById('group-password'),
          document.getElementById('error-password'),
          'Password must be at least 8 characters'
        );
        isValid = false;
      }

      // Confirm Password
      const confirm = document.getElementById('signup-confirm');
      if (!confirm.value) {
        showFieldError(
          document.getElementById('group-confirm'),
          document.getElementById('error-confirm'),
          'Please confirm your password'
        );
        isValid = false;
      } else if (confirm.value !== password.value) {
        showFieldError(
          document.getElementById('group-confirm'),
          document.getElementById('error-confirm'),
          'Passwords do not match'
        );
        isValid = false;
      }

      // Terms
      const terms = document.getElementById('signup-terms');
      if (!terms.checked) {
        showFieldError(
          document.getElementById('group-terms'),
          document.getElementById('error-terms'),
          'You must agree to the terms to continue'
        );
        isValid = false;
      }

      if (!isValid) {
        // Scroll to first error
        const firstError = signupForm.querySelector('.has-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // ── All valid — simulate submission ──
      const submitBtn = document.getElementById('signup-submit');
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;

      // Simulate API call delay, then redirect to OTP
      setTimeout(() => {
        // Store phone for OTP page display
        const phoneValue = phone.value.trim();
        try {
          sessionStorage.setItem('honnetke_signup_phone', phoneValue);
        } catch (err) {
          // sessionStorage not available — ignore
        }
        window.location.href = 'otp.html';
      }, 1200);
    });
  }


  /* ──────────────────────────────────────────
     6. TERMS CHECKBOX — clear error on change
     ────────────────────────────────────────── */
  const termsCheckbox = document.getElementById('signup-terms');
  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', () => {
      clearFieldError(document.getElementById('group-terms'));
    });
  }

});
