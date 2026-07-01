/* ===================================================
   HonnetKE - Shared API client
   One front door for every page to talk to the backend.
   =================================================== */
(function () {
  const API_BASE = 'http://localhost:5000/api';

  async function request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = {};

    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (auth) {
      const token = window.HonnetKE && window.HonnetKE.auth
        ? window.HonnetKE.auth.getToken()
        : localStorage.getItem('honnetke_token') || sessionStorage.getItem('honnetke_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
      });
    } catch (err) {
      throw new Error('Cannot reach the server. Check your connection and try again.');
    }

    let data = {};
    try {
      data = await res.json();
    } catch (_) {
      /* empty / non-JSON body */
    }

    if (!res.ok) {
      const error = new Error(data.message || `Request failed (${res.status})`);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  window.HonnetKE = window.HonnetKE || {};
  window.HonnetKE.api = {
    BASE: API_BASE,
    request,
    post: (path, body, auth) => request(path, { method: 'POST', body, auth }),
    get: (path, auth) => request(path, { method: 'GET', auth }),
    patch: (path, body, auth) => request(path, { method: 'PATCH', body, auth }),
    del: (path, auth) => request(path, { method: 'DELETE', auth }),
  };
})();
