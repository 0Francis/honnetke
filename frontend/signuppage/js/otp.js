/* ===================================================
   HonnetKE OTP Verification - JavaScript
   Handles: digit auto-advance, paste support,
   backspace navigation, resend countdown, validation.
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const otpInputs    = document.querySelectorAll('.otp-digit');
  const otpForm      = document.getElementById('otp-form');
  const otpError     = document.getElementById('otp-error');
  const otpSubmit    = document.getElementById('otp-submit');
  const resendBtn    = document.getElementById('resend-btn');
  const resendTimer  = document.getElementById('resend-timer');
  const phoneDisplay = document.getElementById('otp-phone-display');


  /* ──────────────────────────────────────────
     1. DISPLAY EMAIL FROM PENDING AUTH FLOW
     ────────────────────────────────────────── */
  const pending = window.HonnetKE.auth.getPending();
  if (pending && pending.email) {
    // Mask the email for privacy: show first 2 chars + ***@domain
    const [local, domain] = pending.email.split('@');
    if (local && domain) {
      const masked = local.slice(0, 2) + '***@' + domain;
      phoneDisplay.textContent = masked;
    }
  } else {
    // No pending flow - send them back to login
    window.location.href = window.HonnetKE.auth.LOGIN_PAGE;
    return;
  }


  /* ──────────────────────────────────────────
     2. OTP INPUT - Auto-advance & Navigation
     ────────────────────────────────────────── */
  otpInputs.forEach((input, index) => {

    // Only allow numeric input
    input.addEventListener('input', (e) => {
      const value = e.target.value;

      // Filter non-numeric characters
      if (!/^\d$/.test(value)) {
        e.target.value = '';
        return;
      }

      // Mark as filled
      e.target.classList.add('filled');
      e.target.classList.remove('error');
      otpError.textContent = '';

      // Auto-advance to next input
      if (value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    // Handle backspace navigation
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        if (!input.value && index > 0) {
          otpInputs[index - 1].focus();
          otpInputs[index - 1].value = '';
          otpInputs[index - 1].classList.remove('filled');
        } else {
          input.classList.remove('filled');
        }
      }

      // Arrow key navigation
      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        otpInputs[index - 1].focus();
      }
      if (e.key === 'ArrowRight' && index < otpInputs.length - 1) {
        e.preventDefault();
        otpInputs[index + 1].focus();
      }
    });

    // Select all text on focus for easy replacement
    input.addEventListener('focus', () => {
      input.select();
    });
  });


  /* ──────────────────────────────────────────
     3. PASTE SUPPORT - Auto-fill all 6 digits
     ────────────────────────────────────────── */
  otpInputs[0].addEventListener('paste', (e) => {
    e.preventDefault();
    const pastedData = (e.clipboardData || window.clipboardData).getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    if (digits.length > 0) {
      digits.split('').forEach((digit, i) => {
        if (otpInputs[i]) {
          otpInputs[i].value = digit;
          otpInputs[i].classList.add('filled');
          otpInputs[i].classList.remove('error');
        }
      });

      // Focus the next empty input or the last one
      const nextEmpty = Array.from(otpInputs).findIndex(input => !input.value);
      if (nextEmpty !== -1) {
        otpInputs[nextEmpty].focus();
      } else {
        otpInputs[otpInputs.length - 1].focus();
      }
    }
  });


  /* ──────────────────────────────────────────
     4. FORM SUBMISSION - verify OTP via API
     ────────────────────────────────────────── */
  otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const code = Array.from(otpInputs).map(input => input.value).join('');

    if (code.length < 6) {
      otpError.textContent = 'Please enter all 6 digits';
      otpInputs.forEach(input => {
        if (!input.value) {
          input.classList.add('error');
        }
      });
      return;
    }

    otpSubmit.classList.add('btn-loading');
    otpSubmit.disabled = true;

    try {
      const res = await window.HonnetKE.api.post('/auth/verify-otp', {
        email: pending.email,
        role: pending.role,
        code,
        purpose: pending.purpose || 'verify',
      });

      // Success - store the session and redirect to dashboard
      window.HonnetKE.auth.saveSession(res.token, res.user, pending.remember);
      window.HonnetKE.auth.clearPending();
      window.HonnetKE.auth.redirectToDashboard(res.user.role);
    } catch (err) {
      otpSubmit.classList.remove('btn-loading');
      otpSubmit.disabled = false;
      otpError.textContent = err.message || 'Verification failed. Please try again.';
      otpInputs.forEach(input => input.classList.add('error'));
    }
  });


  /* ──────────────────────────────────────────
     5. RESEND COUNTDOWN TIMER
     ────────────────────────────────────────── */
  let countdown = 45;

  function startCountdown() {
    countdown = 45;
    resendBtn.disabled = true;
    updateTimerDisplay();

    const interval = setInterval(() => {
      countdown--;
      updateTimerDisplay();

      if (countdown <= 0) {
        clearInterval(interval);
        resendBtn.disabled = false;
        resendBtn.innerHTML = 'Resend Code';
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    resendTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Start countdown on page load
  startCountdown();

  // Handle resend click
  resendBtn.addEventListener('click', async () => {
    if (!resendBtn.disabled) {
      // Clear existing inputs
      otpInputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled', 'error');
      });
      otpInputs[0].focus();
      otpError.textContent = '';

      // Request a new code
      try {
        await window.HonnetKE.api.post('/auth/resend-otp', {
          email: pending.email,
          role: pending.role,
          purpose: pending.purpose || 'verify',
        });
      } catch (err) {
        otpError.textContent = 'Could not resend code. Please try again later.';
      }

      // Restart countdown
      resendBtn.innerHTML = 'Resend in <span class="resend-timer" id="resend-timer">0:45</span>';
      startCountdown();
    }
  });

});
