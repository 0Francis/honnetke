/* ===================================================
   HonnetKE Admin Pages - JavaScript (API-wired)
   Auth guard, Navbar, Toasts, Modals, Notifications,
   and live data for Dashboard, Manage Properties,
   Manage Users, and Flagged Properties.
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const api = window.HonnetKE.api;
  const auth = window.HonnetKE.auth;

  // ── Auth Guard ──
  const user = auth.requireAuth(['admin']);
  if (!user) return;

  // Populate admin initials in navbar
  const avatarEl = document.querySelector('.avatar');
  if (avatarEl && user.fullName) {
    avatarEl.textContent = user.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  const page = document.body.dataset.page;

  // ════════════════════════════════════════════════
  //  Shared UI helpers
  // ════════════════════════════════════════════════

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d)) return '-';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const STATUS_LABELS = {
    draft: 'Draft', pending_approval: 'Pending review', active: 'Active',
    fully_occupied: 'Fully occupied', suspended: 'Suspended', rejected: 'Rejected',
    archived: 'Archived', pending: 'Pending', resolved: 'Resolved',
    active: 'Active', suspended: 'Suspended',
  };
  const BADGE_CLASS = {
    draft: 'inactive', pending_approval: 'pending', active: 'active',
    fully_occupied: 'active', suspended: 'blocked', rejected: 'blocked',
    archived: 'inactive', pending: 'pending', resolved: 'resolved',
  };
  function statusBadge(status) {
    const label = STATUS_LABELS[status] || (status ? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : status);
    const cls = BADGE_CLASS[status] || status;
    return `<span class="status-badge ${esc(cls)}"><span class="status-dot"></span>${esc(label)}</span>`;
  }

  // ── Navbar scroll ──
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ── Mobile menu ──
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('admin-mobile-nav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileNav.classList.toggle('open');
      mobileNav.setAttribute('aria-hidden', !mobileNav.classList.contains('open'));
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
  }

  // ── User dropdown ──
  const userMenu = document.querySelector('.user-menu');
  const userAvatarBtn = document.querySelector('.user-avatar-btn');
  if (userMenu && userAvatarBtn) {
    userAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target)) userMenu.classList.remove('open');
    });
  }

  // ── Logout ──
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      auth.logout();
    });
  });

  // ── Scroll reveal ──
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => obs.observe(el));
  }

  // ── Toast system ──
  const toastContainer = document.getElementById('toast-container');
  function showToast(title, message, type = 'success') {
    if (!toastContainer) return;
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.success}</div>
      <div class="toast-content">
        <div class="toast-title">${esc(title)}</div>
        <div class="toast-message">${esc(message)}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    toastContainer.appendChild(toast);
    const dismiss = () => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    };
    toast.querySelector('.toast-close').addEventListener('click', dismiss);
    setTimeout(dismiss, 4000);
  }

  // ── Modal system ──
  let activeModal = null;
  let modalCallback = null;

  function openModal(modalId, callback) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    activeModal = modal;
    modalCallback = callback || null;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    const textarea = modal.querySelector('.modal-textarea');
    if (textarea) textarea.value = '';
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.classList.remove('open');
    document.body.style.overflow = '';
    activeModal = null;
    modalCallback = null;
  }

  function modalTextValue() {
    if (!activeModal) return '';
    const textarea = activeModal.querySelector('.modal-textarea');
    return textarea ? textarea.value.trim() : '';
  }

  document.querySelectorAll('.modal-btn.cancel').forEach(btn => btn.addEventListener('click', closeModal));
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Generic confirm-button wiring: any confirm/danger/warn action button runs modalCallback
  function wireModalConfirm(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.querySelectorAll('.confirm-action, .danger-action, .warn-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const cb = modalCallback;
        const text = modalTextValue();
        if (cb) await cb(text);
        closeModal();
      });
    });
  }
  ['approve-modal', 'decline-modal', 'suspend-listing-modal', 'suspend-user-modal',
    'warn-user-modal', 'resolve-modal'].forEach(wireModalConfirm);

  // ════════════════════════════════════════════════
  //  Notification bell (all pages)
  // ════════════════════════════════════════════════
  async function loadNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;
    try {
      const { unreadCount } = await api.get('/notifications?unread=true&limit=1', true);
      badge.style.display = unreadCount > 0 ? '' : 'none';
    } catch (_) {
      badge.style.display = 'none';
    }
  }
  loadNotificationBadge();

  // ════════════════════════════════════════════════
  //  Filter tabs (client-side row show/hide)
  // ════════════════════════════════════════════════
  function applyFilter(filter, container) {
    if (!container) return;
    container.querySelectorAll('tbody tr[data-status], tbody tr[data-role]').forEach(row => {
      if (row.classList.contains('report-detail-row')) return;
      const matchStatus = row.dataset.status === filter;
      const matchRole = row.dataset.role === filter;
      const show = filter === 'all' || matchStatus || matchRole;
      row.style.display = show ? '' : 'none';
      // Keep detail rows in sync (flagged page)
      const detail = row.nextElementSibling;
      if (detail && detail.classList.contains('report-detail-row')) {
        detail.style.display = show ? detail.style.display : 'none';
        if (!show) { row.classList.remove('expanded'); detail.classList.remove('open'); }
      }
    });
  }

  document.querySelectorAll('.filter-tabs').forEach(group => {
    const tabs = group.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        applyFilter(tab.dataset.filter, group.closest('.dashboard-section, .admin-main'));
      });
    });
  });

  function tableLoading(tbody, cols, text = 'Loading…') {
    tbody.innerHTML = `<tr><td colspan="${cols}" class="table-muted" style="text-align:center;padding:2rem;">${esc(text)}</td></tr>`;
  }
  function tableEmpty(tbody, cols, text) {
    tbody.innerHTML = `<tr><td colspan="${cols}" class="table-muted" style="text-align:center;padding:2rem;">${esc(text)}</td></tr>`;
  }

  // ════════════════════════════════════════════════
  //  PAGE: DASHBOARD
  // ════════════════════════════════════════════════
  if (page === 'dashboard') {
    if (!sessionStorage.getItem('admin_welcomed')) {
      sessionStorage.setItem('admin_welcomed', 'true');
      setTimeout(() => showToast('Welcome back!', `Logged in as ${user.fullName || 'Admin'}`, 'success'), 500);
    }
    loadDashboardStats();
    loadDashboardReports();
  }

  async function loadDashboardStats() {
    try {
      const s = await api.get('/admin/stats', true);
      const setStat = (id, val) => {
        const el = document.querySelector(`#${id} .stat-value`);
        if (el) el.textContent = Number(val).toLocaleString();
      };
      setStat('stat-users', s.totalUsers);
      setStat('stat-total-listings', s.totalProperties);
      setStat('stat-active-listings', s.activeProperties);
      setStat('stat-pending', s.pendingProperties);
      setStat('stat-flagged', s.pendingReports);
      setStat('stat-errors', s.errorsToday);

      const visits = document.querySelector('#health-traffic .health-value');
      if (visits) visits.textContent = Number(s.visitsToday).toLocaleString();
      const errs = document.querySelector('#health-errors .health-value');
      if (errs) errs.textContent = Number(s.errorsToday).toLocaleString();

      const reviewDesc = document.querySelector('#action-review .action-desc');
      if (reviewDesc) reviewDesc.textContent = `${s.pendingProperties} properties awaiting approval`;
      const flaggedDesc = document.querySelector('#action-flagged .action-desc');
      if (flaggedDesc) flaggedDesc.textContent = `${s.pendingReports} pending student reports`;
    } catch (err) {
      showToast('Error', err.message || 'Could not load stats', 'error');
    }
  }

  async function loadDashboardReports() {
    const tbody = document.querySelector('#dashboard-reports-table tbody');
    if (!tbody) return;
    tableLoading(tbody, 6);
    try {
      const { reports } = await api.get('/admin/reports?limit=5', true);
      if (!reports.length) { tableEmpty(tbody, 6, 'No reports filed yet.'); return; }
      tbody.innerHTML = reports.map(r => `
        <tr data-report-id="${r.reportId}" data-status="${esc(r.status)}">
          <td class="table-name">${esc(r.student?.fullName || 'Student')}</td>
          <td class="table-name">${esc(r.property?.title || 'Property')}</td>
          <td class="table-muted">${esc(r.reason)}</td>
          <td class="table-date">${formatDate(r.createdAt)}</td>
          <td>${statusBadge(r.status)}</td>
          <td><div class="table-actions">${r.status === 'pending'
            ? '<button class="btn-sm btn-resolve" data-action="resolve-dash">Resolve</button>'
            : '<span class="no-action-text">Resolved</span>'}</div></td>
        </tr>`).join('');
      bindDashboardResolve();
    } catch (err) {
      tableEmpty(tbody, 6, err.message || 'Could not load reports.');
    }
  }

  function bindDashboardResolve() {
    document.querySelectorAll('[data-action="resolve-dash"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('tr');
        const id = row.dataset.reportId;
        const title = row.querySelector('.table-name')?.textContent || 'property';
        try {
          await api.patch(`/admin/reports/${id}/resolve`, {}, true);
          row.querySelector('td:nth-child(5)').innerHTML = statusBadge('resolved');
          row.querySelector('.table-actions').innerHTML = '<span class="no-action-text">Resolved</span>';
          row.dataset.status = 'resolved';
          showToast('Report Resolved', `Report for "${title}" resolved.`, 'success');
        } catch (err) {
          showToast('Error', err.message, 'error');
        }
      });
    });
  }

  // ════════════════════════════════════════════════
  //  PAGE: MANAGE LISTINGS
  // ════════════════════════════════════════════════
  if (page === 'manage-listings') loadListings();

  async function loadListings() {
    const tbody = document.querySelector('#listings-table tbody');
    if (!tbody) return;
    tableLoading(tbody, 8);
    try {
      const { properties } = await api.get('/admin/properties?status=all&limit=50', true);
      if (!properties.length) { tableEmpty(tbody, 8, 'No properties found.'); return; }
      tbody.innerHTML = properties.map(l => {
        const provider = l.landlord?.fullName || l.agent?.fullName || 'Unknown';
        const price = Number(l.price).toLocaleString();
        let actions;
        if (l.status === 'pending_approval') {
          actions = `<button class="btn-sm btn-approve" data-action="approve">Approve</button>
                     <button class="btn-sm btn-decline-action" data-action="reject">Reject</button>`;
        } else if (l.status === 'active' || l.status === 'fully_occupied') {
          actions = `<button class="btn-sm btn-suspend" data-action="suspend-listing">Suspend</button>`;
        } else if (l.status === 'archived') {
          actions = '<span class="no-action-text">Archived by owner</span>';
        } else {
          actions = '<span class="no-action-text">Blocked by admin</span>';
        }
        return `
          <tr data-status="${esc(l.status)}" data-property-id="${l.propertyId}">
            <td class="table-muted">#${l.propertyId}</td>
            <td class="table-name">${esc(l.title)}</td>
            <td class="table-muted">${esc(provider)}</td>
            <td class="table-muted">${esc(l.area)}, ${esc(l.county)}</td>
            <td class="table-muted">${price}</td>
            <td>${statusBadge(l.status)}</td>
            <td class="table-date">${formatDate(l.createdAt)}</td>
            <td><div class="table-actions">${actions}</div></td>
          </tr>`;
      }).join('');
      bindListingActions();
    } catch (err) {
      tableEmpty(tbody, 8, err.message || 'Could not load properties.');
    }
  }

  function setRowBlocked(row, label) {
    row.querySelector('td:nth-child(6)').innerHTML = statusBadge('suspended');
    row.querySelector('.table-actions').innerHTML = `<span class="no-action-text">${esc(label)}</span>`;
    row.dataset.status = 'suspended';
  }

  function bindListingActions() {
    document.querySelectorAll('[data-action="approve"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const id = row.dataset.propertyId;
        const title = row.querySelector('.table-name')?.textContent || 'property';
        const modalTitle = document.querySelector('#approve-modal h3');
        if (modalTitle) modalTitle.textContent = `Approve "${title}"?`;
        openModal('approve-modal', async () => {
          try {
            await api.patch(`/admin/properties/${id}/approve`, {}, true);
            row.querySelector('td:nth-child(6)').innerHTML = statusBadge('active');
            row.querySelector('.table-actions').innerHTML = '<button class="btn-sm btn-suspend" data-action="suspend-listing">Suspend</button>';
            row.dataset.status = 'active';
            bindListingActions();
            showToast('Property Approved', `"${title}" is now live.`, 'success');
          } catch (err) { showToast('Error', err.message, 'error'); }
        });
      });
    });

    document.querySelectorAll('[data-action="reject"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const id = row.dataset.propertyId;
        const title = row.querySelector('.table-name')?.textContent || 'property';
        const modalTitle = document.querySelector('#decline-modal h3');
        if (modalTitle) modalTitle.textContent = `Reject "${title}"?`;
        openModal('decline-modal', async (reason) => {
          if (!reason) { showToast('Reason required', 'Please provide a rejection reason.', 'warning'); return; }
          try {
            await api.patch(`/admin/properties/${id}/reject`, { reason }, true);
            setRowBlocked(row, 'Rejected');
            showToast('Property Rejected', `"${title}" has been rejected.`, 'warning');
          } catch (err) { showToast('Error', err.message, 'error'); }
        });
      });
    });

    document.querySelectorAll('[data-action="suspend-listing"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const id = row.dataset.propertyId;
        const title = row.querySelector('.table-name')?.textContent || 'property';
        openModal('suspend-listing-modal', async () => {
          try {
            await api.patch(`/admin/properties/${id}/reject`, { reason: 'Suspended by admin' }, true);
            setRowBlocked(row, 'Suspended');
            showToast('Property Suspended', `"${title}" has been suspended.`, 'warning');
          } catch (err) { showToast('Error', err.message, 'error'); }
        });
      });
    });
  }

  // ════════════════════════════════════════════════
  //  PAGE: MANAGE USERS
  // ════════════════════════════════════════════════
  if (page === 'manage-users') loadUsers();

  let allUsers = [];

  async function loadUsers() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;
    tableLoading(tbody, 9);
    try {
      const { users } = await api.get('/admin/users', true);
      allUsers = users;
      renderUsers(users);
      wireUserSearch();
    } catch (err) {
      tableEmpty(tbody, 9, err.message || 'Could not load users.');
    }
  }

  function renderUsers(users) {
    const tbody = document.querySelector('#users-table tbody');
    if (!users.length) { tableEmpty(tbody, 9, 'No users found.'); return; }
    const roleLabel = { student: 'Student', landlord: 'Landlord', agent: 'Agent' };
    tbody.innerHTML = users.map(u => {
      const suspended = u.status === 'suspended';
      const toggleBtn = suspended
        ? `<button class="btn-sm btn-reactivate" data-action="reactivate-user">Reactivate</button>`
        : `<button class="btn-sm btn-suspend" data-action="suspend-user">Suspend</button>
           <button class="btn-sm btn-warn" data-action="warn-user">Warn</button>`;
      return `
        <tr data-role="${esc(u.role)}" data-status="${esc(u.status)}" data-user-id="${u.id}">
          <td class="table-muted">#${u.id}</td>
          <td class="table-name">${esc(u.fullName)}</td>
          <td class="table-email table-muted">${esc(u.email)}</td>
          <td class="table-muted">${esc(u.phoneNumber || '-')}</td>
          <td><span class="role-badge ${esc(u.role)}">${esc(roleLabel[u.role] || u.role)}</span></td>
          <td>${statusBadge(u.status)}</td>
          <td class="table-date">${formatDate(u.createdAt)}</td>
          <td><span class="warning-count">${u.warningCount || 0}</span></td>
          <td><div class="table-actions">${toggleBtn}</div></td>
        </tr>`;
    }).join('');
    bindUserActions();
  }

  function wireUserSearch() {
    const input = document.getElementById('user-search');
    if (!input) return;
    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = allUsers.filter(u =>
        u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      renderUsers(filtered);
      // Re-apply the active role tab
      const activeTab = document.querySelector('.filter-tab.active');
      if (activeTab && activeTab.dataset.filter !== 'all') {
        applyFilter(activeTab.dataset.filter, document.querySelector('.admin-main'));
      }
    });
  }

  function refreshUserRow(row, status) {
    const id = row.dataset.userId;
    const u = allUsers.find(x => String(x.id) === String(id) && x.role === row.dataset.role);
    if (u) u.status = status;
    row.querySelector('td:nth-child(6)').innerHTML = statusBadge(status);
    row.dataset.status = status;
    row.querySelector('.table-actions').innerHTML = status === 'suspended'
      ? `<button class="btn-sm btn-reactivate" data-action="reactivate-user">Reactivate</button>`
      : `<button class="btn-sm btn-suspend" data-action="suspend-user">Suspend</button>
         <button class="btn-sm btn-warn" data-action="warn-user">Warn</button>`;
    bindUserActions();
  }

  function bindUserActions() {
    document.querySelectorAll('[data-action="suspend-user"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const name = row.querySelector('.table-name')?.textContent || 'user';
        const modalTitle = document.querySelector('#suspend-user-modal h3');
        if (modalTitle) modalTitle.textContent = `Suspend ${name}?`;
        openModal('suspend-user-modal', async () => {
          try {
            await api.patch(`/admin/accounts/${row.dataset.userId}/suspend`, { role: row.dataset.role }, true);
            refreshUserRow(row, 'suspended');
            showToast('Account Suspended', `${name}'s account suspended.`, 'warning');
          } catch (err) { showToast('Error', err.message, 'error'); }
        });
      });
    });

    document.querySelectorAll('[data-action="reactivate-user"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('tr');
        const name = row.querySelector('.table-name')?.textContent || 'user';
        try {
          await api.patch(`/admin/accounts/${row.dataset.userId}/reactivate`, { role: row.dataset.role }, true);
          refreshUserRow(row, 'active');
          showToast('Account Reactivated', `${name}'s account is active.`, 'success');
        } catch (err) { showToast('Error', err.message, 'error'); }
      });
    });

    document.querySelectorAll('[data-action="warn-user"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const name = row.querySelector('.table-name')?.textContent || 'user';
        const modalTitle = document.querySelector('#warn-user-modal h3');
        if (modalTitle) modalTitle.textContent = `Warn ${name}?`;
        openModal('warn-user-modal', async (reason) => {
          if (!reason) { showToast('Reason required', 'Please provide a warning reason.', 'warning'); return; }
          try {
            await api.post('/admin/warnings', { role: row.dataset.role, userId: row.dataset.userId, reason }, true);
            const wc = row.querySelector('.warning-count');
            if (wc) wc.textContent = (parseInt(wc.textContent) || 0) + 1;
            showToast('Warning Issued', `A warning was sent to ${name}.`, 'warning');
          } catch (err) { showToast('Error', err.message, 'error'); }
        });
      });
    });
  }

  // ════════════════════════════════════════════════
  //  PAGE: FLAGGED LISTINGS (group reports by listing)
  // ════════════════════════════════════════════════
  if (page === 'flagged-listings') loadFlagged();

  async function loadFlagged() {
    const tbody = document.querySelector('#flagged-table tbody');
    if (!tbody) return;
    tableLoading(tbody, 8);
    try {
      const { reports } = await api.get('/admin/reports?limit=50', true);
      // Group by property
      const groups = {};
      reports.forEach(r => {
        const key = r.propertyId;
        if (!groups[key]) {
          groups[key] = {
            propertyId: key,
            title: r.property?.title || 'Property',
            provider: '-',
            entries: [],
            pending: 0,
            latest: r.createdAt,
          };
        }
        groups[key].entries.push(r);
        if (r.status === 'pending') groups[key].pending++;
        if (new Date(r.createdAt) > new Date(groups[key].latest)) groups[key].latest = r.createdAt;
      });
      const list = Object.values(groups).sort((a, b) => b.entries.length - a.entries.length);
      if (!list.length) { tableEmpty(tbody, 8, 'No reported properties. The hive is clean!'); return; }

      tbody.innerHTML = list.map(g => {
        const status = g.pending > 0 ? 'pending' : 'resolved';
        const topReason = g.entries[0]?.reason || '-';
        const countClass = g.entries.length >= 4 ? 'count-badge high' : 'count-badge';
        const pendingIds = g.entries.filter(e => e.status === 'pending').map(e => e.reportId).join(',');
        const actions = status === 'pending'
          ? `<button class="btn-sm btn-resolve" data-action="resolve-report">Resolve</button>
             <button class="btn-sm btn-danger" data-action="block-listing">Block</button>`
          : '<span class="no-action-text">Resolved</span>';
        const entriesHtml = g.entries.map(e => `
          <div class="report-entry">
            <div class="report-entry-header">
              <span class="report-entry-student">${esc(e.student?.fullName || 'Student')}</span>
              <span class="report-entry-date">${formatDate(e.createdAt)}</span>
            </div>
            <p class="report-entry-reason">${esc(e.reason)}</p>
          </div>`).join('');
        return `
          <tr class="expandable-row" data-status="${status}" data-property-id="${g.propertyId}" data-report-ids="${pendingIds}">
            <td><svg class="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></td>
            <td class="table-name">${esc(g.title)}</td>
            <td class="table-muted">${esc(g.provider)}</td>
            <td><span class="${countClass}">${g.entries.length}</span></td>
            <td class="table-muted">${esc(topReason)}</td>
            <td class="table-date">${formatDate(g.latest)}</td>
            <td>${statusBadge(status)}</td>
            <td><div class="table-actions">${actions}</div></td>
          </tr>
          <tr class="report-detail-row">
            <td colspan="8"><div class="report-detail-content"><div class="report-entries">${entriesHtml}</div></div></td>
          </tr>`;
      }).join('');
      bindFlaggedActions();
    } catch (err) {
      tableEmpty(tbody, 8, err.message || 'Could not load flagged properties.');
    }
  }

  function bindFlaggedActions() {
    document.querySelectorAll('.expandable-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-sm')) return;
        const detail = row.nextElementSibling;
        if (detail && detail.classList.contains('report-detail-row')) {
          row.classList.toggle('expanded');
          detail.classList.toggle('open');
        }
      });
    });

    document.querySelectorAll('[data-action="resolve-report"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = btn.closest('tr');
        const title = row.querySelector('.table-name')?.textContent || 'property';
        const ids = (row.dataset.reportIds || '').split(',').filter(Boolean);
        openModal('resolve-modal', async (note) => {
          try {
            await Promise.all(ids.map(id => api.patch(`/admin/reports/${id}/resolve`, { resolutionNote: note }, true)));
            row.querySelector('td:nth-child(7)').innerHTML = statusBadge('resolved');
            row.querySelector('.table-actions').innerHTML = '<span class="no-action-text">Resolved</span>';
            row.dataset.status = 'resolved';
            showToast('Report Resolved', `Reports for "${title}" resolved.`, 'success');
          } catch (err) { showToast('Error', err.message, 'error'); }
        });
      });
    });

    document.querySelectorAll('[data-action="block-listing"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const row = btn.closest('tr');
        const id = row.dataset.propertyId;
        const title = row.querySelector('.table-name')?.textContent || 'property';
        const ids = (row.dataset.reportIds || '').split(',').filter(Boolean);
        try {
          await api.patch(`/admin/properties/${id}/reject`, { reason: 'Blocked following student reports' }, true);
          await Promise.all(ids.map(rid => api.patch(`/admin/reports/${rid}/resolve`, { resolutionNote: 'Property blocked' }, true)));
          row.querySelector('td:nth-child(7)').innerHTML = statusBadge('resolved');
          row.querySelector('.table-actions').innerHTML = '<span class="no-action-text">Blocked</span>';
          row.dataset.status = 'resolved';
          showToast('Property Blocked', `"${title}" blocked and reports resolved.`, 'warning');
        } catch (err) { showToast('Error', err.message, 'error'); }
      });
    });
  }

  // ════════════════════════════════════════════════
  //  PAGE: DUPLICATE QUEUE (no backend yet - local UI)
  // ════════════════════════════════════════════════
  if (page === 'duplicate-queue') {
    const dedupe = (action, msg, type) => {
      document.querySelectorAll(`[data-action="${action}"]`).forEach(btn => {
        btn.addEventListener('click', () => {
          const group = btn.closest('.duplicate-group');
          if (!group) return;
          group.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          group.style.opacity = '0';
          group.style.transform = 'translateY(-10px)';
          setTimeout(() => { group.remove(); checkEmptyQueue(); }, 400);
          showToast(msg.title, msg.body, type);
        });
      });
    };
    dedupe('keep-both', { title: 'Kept Both', body: 'Both properties marked as unique.' }, 'success');
    dedupe('remove-duplicate', { title: 'Duplicate Removed', body: 'The flagged duplicate was removed.' }, 'warning');
    dedupe('merge-listings', { title: 'Properties Merged', body: 'Properties merged - best data retained.' }, 'success');

    function checkEmptyQueue() {
      const remaining = document.querySelectorAll('.duplicate-group');
      if (remaining.length === 0) {
        const queue = document.querySelector('.duplicate-queue');
        if (queue) {
          queue.innerHTML = `
            <div class="empty-state">
              <div class="empty-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3>All Clear!</h3>
              <p>No duplicate properties detected - the hive is clean!</p>
            </div>`;
        }
      }
    }
  }



  // ════════════════════════════════════════════════
  //  PAGE: DASHBOARD - Resolve Report from Dashboard
  // ════════════════════════════════════════════════

  if (page === 'dashboard') {
    document.querySelectorAll('[data-action="resolve-dash"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const title = row.querySelector('.table-name')?.textContent || 'property';
        const badge = row.querySelector('.status-badge');
        if (badge) {
          badge.className = 'status-badge resolved';
          badge.innerHTML = '<span class="status-dot"></span>Resolved';
        }
        const actions = row.querySelector('.table-actions');
        if (actions) actions.innerHTML = '<span class="no-action-text">Resolved</span>';
        showToast('Report Resolved', `Report for "${title}" has been resolved.`, 'success');
      });
    });
  }


  // ════════════════════════════════════════════════
  //  PAGE: PROFILE - Admin Profile Handlers
  // ════════════════════════════════════════════════

  if (page === 'profile') {
    // Populate profile with auth data
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

    // Fetch real stats for admin profile (single lightweight call)
    async function fetchProfileStats() {
      try {
        const s = await api.get('/me/profile-stats', true);
        const usersEl = document.getElementById('stat-users-managed');
        const reviewedEl = document.getElementById('stat-listings-reviewed');
        const reportsEl = document.getElementById('stat-reports-resolved');

        if (usersEl) usersEl.textContent = Number(s.usersManaged || 0).toLocaleString();
        if (reviewedEl) reviewedEl.textContent = Number(s.propertiesReviewed || 0).toLocaleString();
        if (reportsEl) reportsEl.textContent = Number(s.reportsResolved || 0).toLocaleString();
      } catch (err) {
        console.warn('Could not fetch admin profile stats:', err.message);
      }
    }
    fetchProfileStats();

    // Personal info form
    const personalForm = document.getElementById('personal-info-form');
    if (personalForm) {
      personalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Profile Updated', 'Your personal information has been saved.', 'success');
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
          showToast('Missing Fields', 'Please fill in all password fields.', 'warning');
          return;
        }
        if (newPwd !== confirmPwd) {
          showToast('Mismatch', 'New passwords do not match.', 'error');
          return;
        }
        showToast('Password Updated', 'Your password has been changed successfully.', 'success');
        passwordForm.reset();
      });
    }

    // 2FA toggle feedback
    const twoFaToggle = document.getElementById('toggle-2fa');
    if (twoFaToggle) {
      twoFaToggle.addEventListener('change', () => {
        if (twoFaToggle.checked) {
          showToast('2FA Enabled', 'Two-factor authentication is now active.', 'success');
        } else {
          showToast('2FA Disabled', 'Two-factor authentication has been turned off.', 'warning');
        }
      });
    }
  }

});
