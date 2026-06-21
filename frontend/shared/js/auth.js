/* ===================================================
   HonnetKE — Shared auth/session helpers
   Token lives in localStorage (persists across sessions →
   "remember this device"). A short-lived 'pending' record in
   sessionStorage carries the in-progress OTP flow.
   =================================================== */
(function () {
  const TOKEN_KEY = 'honnetke_token';
  const USER_KEY = 'honnetke_user';
  const PENDING_KEY = 'honnetke_pending_auth';
  const REMEMBER_KEY = 'honnetke_remember';

  // Paths are relative to any page that sits one level under /frontend
  // (loginpage/, signuppage/, students/, landlord/, admin/).
  const ROLE_DASHBOARD = {
    student: '../students/dashboard.html',
    landlord: '../landlord/dashboard.html',
    agent: '../landlord/dashboard.html',
    admin: '../admin/coming-soon.html',
  };

  const LOGIN_PAGE = '../loginpage/login.html';
  const OTP_PAGE = '../signuppage/otp.html';

  // Use localStorage when "remember me" is checked, sessionStorage otherwise.
  function _store() {
    return localStorage.getItem(REMEMBER_KEY) === 'true' ? localStorage : sessionStorage;
  }

  function saveSession(token, user, remember) {
    // remember can be passed explicitly, or fall back to the stored preference
    const persist = remember !== undefined ? remember : localStorage.getItem(REMEMBER_KEY) === 'true';
    if (persist) {
      localStorage.setItem(REMEMBER_KEY, 'true');
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
      // Clean sessionStorage copies
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } else {
      localStorage.setItem(REMEMBER_KEY, 'false');
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user || {}));
      // Clean localStorage copies
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    try {
      return JSON.parse(raw) || null;
    } catch (_) {
      return null;
    }
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    window.location.href = LOGIN_PAGE;
  }

  // In-progress OTP flow (email + role + purpose) between login/signup and the OTP page.
  function setPending(pending) {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  }
  function getPending() {
    try {
      return JSON.parse(sessionStorage.getItem(PENDING_KEY)) || null;
    } catch (_) {
      return null;
    }
  }
  function clearPending() {
    sessionStorage.removeItem(PENDING_KEY);
  }

  function dashboardFor(role) {
    return ROLE_DASHBOARD[role] || LOGIN_PAGE;
  }

  function redirectToDashboard(role) {
    window.location.href = dashboardFor(role);
  }

  // Guard for protected pages: bounce to login if no token.
  function requireAuth(allowedRoles) {
    if (!isLoggedIn()) {
      window.location.href = LOGIN_PAGE;
      return null;
    }
    const user = getUser();
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      redirectToDashboard(user.role);
      return null;
    }
    return user;
  }

  window.HonnetKE = window.HonnetKE || {};
  window.HonnetKE.auth = {
    saveSession,
    getToken,
    getUser,
    isLoggedIn,
    logout,
    setPending,
    getPending,
    clearPending,
    dashboardFor,
    redirectToDashboard,
    requireAuth,
    OTP_PAGE,
    LOGIN_PAGE,
  };
})();
