/* ===================================================
   HonnetKE Shared Notifications Module
   Fetches notifications, renders dropdown, handles
   mark-as-read, mark-all-read, and delete actions.
   Works for student, landlord, and admin portals.
   =================================================== */

(function () {
  if (!window.HonnetKE) window.HonnetKE = {};

  const NOTIF_DROPDOWN_ID = 'notif-dropdown';

  function ensureDropdown(btn) {
    let dropdown = document.getElementById(NOTIF_DROPDOWN_ID);
    if (dropdown) return dropdown;

    dropdown = document.createElement('div');
    dropdown.id = NOTIF_DROPDOWN_ID;
    dropdown.className = 'notif-dropdown';
    dropdown.setAttribute('role', 'menu');
    dropdown.setAttribute('aria-label', 'Notifications');
    dropdown.innerHTML = `
      <div class="notif-dropdown-header">
        <span class="notif-dropdown-title">Notifications</span>
        <button class="notif-mark-all" id="notif-mark-all" type="button">Mark all read</button>
      </div>
      <div class="notif-dropdown-body" id="notif-dropdown-body">
        <div class="notif-empty">Loading...</div>
      </div>
    `;
    document.body.appendChild(dropdown);

    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dropdown.classList.remove('open');
    });

    const markAllBtn = dropdown.querySelector('#notif-mark-all');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', markAllRead);
    }

    return dropdown;
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  function renderNotifications(data) {
    const body = document.getElementById('notif-dropdown-body');
    if (!body) return;

    const notifications = data.notifications || [];
    const unreadCount = data.unreadCount || 0;

    const badge = document.querySelector('.notification-badge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.classList.add('visible');
      } else {
        badge.textContent = '';
        badge.classList.remove('visible');
      }
    }

    if (notifications.length === 0) {
      body.innerHTML = '<div class="notif-empty">No notifications yet.</div>';
      return;
    }

    body.innerHTML = notifications.map(n => `
      <div class="notif-item${n.isRead ? '' : ' unread'}" data-id="${n.notificationId}">
        <div class="notif-item-content">
          <p class="notif-item-message">${escapeHtml(n.message)}</p>
          <span class="notif-item-time">${timeAgo(n.createdAt)}</span>
        </div>
        <div class="notif-item-actions">
          ${n.isRead ? '' : '<button class="notif-action read" data-id="' + n.notificationId + '" title="Mark as read"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>'}
          <button class="notif-action delete" data-id="${n.notificationId}" title="Delete"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
      </div>
    `).join('');

    body.querySelectorAll('.notif-action.read').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        markRead(btn.dataset.id);
      });
    });

    body.querySelectorAll('.notif-action.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNotif(btn.dataset.id);
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  async function fetchNotifications() {
    try {
      const data = await window.HonnetKE.api.get('/notifications?limit=20', true);
      renderNotifications(data);
    } catch (err) {
      const body = document.getElementById('notif-dropdown-body');
      if (body) body.innerHTML = '<div class="notif-empty">Could not load notifications.</div>';
    }
  }

  async function markRead(id) {
    try {
      await window.HonnetKE.api.patch('/notifications/' + id + '/read', {}, true);
      fetchNotifications();
    } catch (err) {
      console.warn('Could not mark notification as read:', err.message);
    }
  }

  async function markAllRead() {
    try {
      await window.HonnetKE.api.patch('/notifications/read-all', {}, true);
      fetchNotifications();
    } catch (err) {
      console.warn('Could not mark all as read:', err.message);
    }
  }

  async function deleteNotif(id) {
    try {
      await window.HonnetKE.api.del('/notifications/' + id, true);
      fetchNotifications();
    } catch (err) {
      console.warn('Could not delete notification:', err.message);
    }
  }

  function init() {
    const btn = document.getElementById('notification-btn') || document.querySelector('.notification-btn');
    if (!btn) return;

    const dropdown = ensureDropdown(btn);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('open');
      if (isOpen) {
        positionDropdown(dropdown, btn);
        fetchNotifications();
      }
    });

    // Fetch unread count on page load to show badge
    fetchUnreadCount();
  }

  async function fetchUnreadCount() {
    try {
      const data = await window.HonnetKE.api.get('/notifications?unread=true&limit=1', true);
      const badge = document.querySelector('.notification-badge');
      if (badge) {
        const count = data.unreadCount || 0;
        if (count > 0) {
          badge.textContent = count > 99 ? '99+' : count;
          badge.classList.add('visible');
        } else {
          badge.textContent = '';
          badge.classList.remove('visible');
        }
      }
    } catch (err) {
      // Silent fail - badge just won't show
    }
  }

  function positionDropdown(dropdown, btn) {
    const rect = btn.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + 8) + 'px';
    dropdown.style.right = (window.innerWidth - rect.right) + 'px';
  }

  window.HonnetKE.notifications = { init, fetchNotifications };

  document.addEventListener('DOMContentLoaded', init);
})();
