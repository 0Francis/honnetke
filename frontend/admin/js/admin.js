/* ===================================================
   HonnetKE Admin Pages — JavaScript
   Covers: Auth guard, Navbar, Toasts, Filter Tabs,
   Modals, Data Tables, Dashboard, Manage Listings,
   Manage Users, Flagged Listings, Duplicate Queue
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ── Auth Guard ──
  const user = window.HonnetKE.auth.requireAuth(['admin']);
  if (!user) return;

  // Populate admin name in navbar
  const avatarEl = document.querySelector('.avatar');
  if (avatarEl && user.fullName) {
    const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    avatarEl.textContent = initials;
  }

  // ── Detect Current Page ──
  const page = document.body.dataset.page;

  // ── Navbar Scroll Behavior ──
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ── Mobile Menu Toggle ──
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

  // ── User Dropdown ──
  const userMenu = document.querySelector('.user-menu');
  const userAvatarBtn = document.querySelector('.user-avatar-btn');
  if (userMenu && userAvatarBtn) {
    userAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target)) {
        userMenu.classList.remove('open');
      }
    });
  }

  // ── Logout Buttons ──
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.HonnetKE.auth.logout();
    });
  });

  // ── Scroll Reveal ──
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => revealObserver.observe(el));
  }

  // ── Toast System ──
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
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    toastContainer.appendChild(toast);
    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    };
    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, 4000);
  }

  // ── Welcome Toast (dashboard only, once per session) ──
  if (page === 'dashboard' && !sessionStorage.getItem('admin_welcomed')) {
    sessionStorage.setItem('admin_welcomed', 'true');
    setTimeout(() => {
      showToast('Welcome back!', `Logged in as ${user.fullName || 'Admin'}`, 'success');
    }, 500);
  }

  // ── Filter Tabs ──
  document.querySelectorAll('.filter-tabs').forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        filterTable(filter, tabGroup.closest('.dashboard-section, .admin-main'));
      });
    });
  });

  function filterTable(filter, container) {
    if (!container) return;
    const rows = container.querySelectorAll('tbody tr[data-status]');
    rows.forEach(row => {
      if (filter === 'all' || row.dataset.status === filter) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
    // Filter role tabs for manage-users
    const roleRows = container.querySelectorAll('tbody tr[data-role]');
    if (roleRows.length > 0 && ['student', 'landlord', 'agent'].includes(filter)) {
      roleRows.forEach(row => {
        if (filter === 'all' || row.dataset.role === filter) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
  }

  // ── Search (Manage Users) ──
  const searchInput = document.getElementById('user-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#users-table tbody tr');
      rows.forEach(row => {
        const name = (row.querySelector('.table-name')?.textContent || '').toLowerCase();
        const email = (row.querySelector('.table-email')?.textContent || '').toLowerCase();
        row.style.display = (name.includes(q) || email.includes(q)) ? '' : 'none';
      });
    });
  }

  // ── Modal System ──
  let activeModal = null;
  let modalCallback = null;

  function openModal(modalId, callback) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    activeModal = modal;
    modalCallback = callback || null;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Clear textarea
    const textarea = modal.querySelector('.modal-textarea');
    if (textarea) textarea.value = '';
  }

  function closeModal() {
    if (activeModal) {
      activeModal.classList.remove('open');
      document.body.style.overflow = '';
      activeModal = null;
      modalCallback = null;
    }
  }

  // Close modal on cancel buttons
  document.querySelectorAll('.modal-btn.cancel').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });


  // ════════════════════════════════════════════════
  //  PAGE: MANAGE LISTINGS — Action Handlers
  // ════════════════════════════════════════════════

  if (page === 'manage-listings') {
    // Approve button
    document.querySelectorAll('[data-action="approve"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const title = row.querySelector('.table-name')?.textContent || 'listing';
        openModal('approve-modal', () => {
          // Update the status badge in the row
          const badge = row.querySelector('.status-badge');
          if (badge) {
            badge.className = 'status-badge active';
            badge.innerHTML = '<span class="status-dot"></span>Active';
          }
          // Hide action buttons
          const actions = row.querySelector('.table-actions');
          if (actions) actions.innerHTML = '<span class="no-action-text">Approved</span>';
          row.dataset.status = 'active';
          showToast('Listing Approved', `"${title}" is now live on the platform.`, 'success');
        });
        // Update modal title
        const modalTitle = document.querySelector('#approve-modal h3');
        if (modalTitle) modalTitle.textContent = `Approve "${title}"?`;
      });
    });

    // Decline button
    document.querySelectorAll('[data-action="decline"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const title = row.querySelector('.table-name')?.textContent || 'listing';
        openModal('decline-modal', () => {
          const badge = row.querySelector('.status-badge');
          if (badge) {
            badge.className = 'status-badge blocked';
            badge.innerHTML = '<span class="status-dot"></span>Blocked';
          }
          const actions = row.querySelector('.table-actions');
          if (actions) actions.innerHTML = '<span class="no-action-text">Declined</span>';
          row.dataset.status = 'blocked';
          showToast('Listing Declined', `"${title}" has been blocked.`, 'warning');
        });
        const modalTitle = document.querySelector('#decline-modal h3');
        if (modalTitle) modalTitle.textContent = `Decline "${title}"?`;
      });
    });

    // Suspend listing button
    document.querySelectorAll('[data-action="suspend-listing"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const title = row.querySelector('.table-name')?.textContent || 'listing';
        openModal('suspend-listing-modal', () => {
          const badge = row.querySelector('.status-badge');
          if (badge) {
            badge.className = 'status-badge blocked';
            badge.innerHTML = '<span class="status-dot"></span>Blocked';
          }
          const actions = row.querySelector('.table-actions');
          if (actions) actions.innerHTML = '<span class="no-action-text">Suspended</span>';
          row.dataset.status = 'blocked';
          showToast('Listing Suspended', `"${title}" has been suspended.`, 'warning');
        });
      });
    });

    // Modal confirm buttons
    document.querySelectorAll('#approve-modal .confirm-action, #approve-modal .modal-btn.confirm-action').forEach(btn => {
      btn.addEventListener('click', () => {
        if (modalCallback) modalCallback();
        closeModal();
      });
    });

    document.querySelectorAll('#decline-modal .danger-action, #decline-modal .modal-btn.danger-action').forEach(btn => {
      btn.addEventListener('click', () => {
        if (modalCallback) modalCallback();
        closeModal();
      });
    });

    document.querySelectorAll('#suspend-listing-modal .danger-action, #suspend-listing-modal .modal-btn.danger-action').forEach(btn => {
      btn.addEventListener('click', () => {
        if (modalCallback) modalCallback();
        closeModal();
      });
    });
  }


  // ════════════════════════════════════════════════
  //  PAGE: MANAGE USERS — Action Handlers
  // ════════════════════════════════════════════════

  if (page === 'manage-users') {
    // Suspend user
    document.querySelectorAll('[data-action="suspend-user"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const name = row.querySelector('.table-name')?.textContent || 'user';
        openModal('suspend-user-modal', () => {
          const badge = row.querySelector('.status-badge');
          if (badge) {
            badge.className = 'status-badge suspended';
            badge.innerHTML = '<span class="status-dot"></span>Suspended';
          }
          // Swap buttons
          btn.textContent = 'Reactivate';
          btn.className = 'btn-sm btn-reactivate';
          btn.dataset.action = 'reactivate-user';
          bindReactivate(btn);
          row.dataset.status = 'suspended';
          showToast('Account Suspended', `${name}'s account has been suspended.`, 'warning');
        });
        const modalTitle = document.querySelector('#suspend-user-modal h3');
        if (modalTitle) modalTitle.textContent = `Suspend ${name}?`;
      });
    });

    function bindReactivate(btn) {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const name = row.querySelector('.table-name')?.textContent || 'user';
        const badge = row.querySelector('.status-badge');
        if (badge) {
          badge.className = 'status-badge active';
          badge.innerHTML = '<span class="status-dot"></span>Active';
        }
        btn.textContent = 'Suspend';
        btn.className = 'btn-sm btn-suspend';
        btn.dataset.action = 'suspend-user';
        row.dataset.status = 'active';
        showToast('Account Reactivated', `${name}'s account is now active.`, 'success');
      });
    }

    // Reactivate user (already suspended rows)
    document.querySelectorAll('[data-action="reactivate-user"]').forEach(btn => {
      bindReactivate(btn);
    });

    // Warn user
    document.querySelectorAll('[data-action="warn-user"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const name = row.querySelector('.table-name')?.textContent || 'user';
        openModal('warn-user-modal', () => {
          // Increment warning count
          const warnCount = row.querySelector('.warning-count');
          if (warnCount) {
            const current = parseInt(warnCount.textContent) || 0;
            warnCount.textContent = current + 1;
          }
          showToast('Warning Issued', `A warning has been sent to ${name}.`, 'warning');
        });
        const modalTitle = document.querySelector('#warn-user-modal h3');
        if (modalTitle) modalTitle.textContent = `Warn ${name}?`;
      });
    });

    // Delete user
    document.querySelectorAll('[data-action="delete-user"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const name = row.querySelector('.table-name')?.textContent || 'user';
        openModal('delete-user-modal', () => {
          row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          row.style.opacity = '0';
          row.style.transform = 'translateX(20px)';
          setTimeout(() => row.remove(), 300);
          showToast('Account Deleted', `${name}'s account has been permanently removed.`, 'error');
        });
        const modalTitle = document.querySelector('#delete-user-modal h3');
        if (modalTitle) modalTitle.textContent = `Delete ${name}?`;
      });
    });

    // Modal confirm handlers for manage-users
    ['suspend-user-modal', 'warn-user-modal', 'delete-user-modal'].forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      const confirmBtn = modal.querySelector('.modal-btn.danger-action, .modal-btn.warn-action, .modal-btn.confirm-action');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          if (modalCallback) modalCallback();
          closeModal();
        });
      }
    });
  }


  // ════════════════════════════════════════════════
  //  PAGE: FLAGGED LISTINGS — Expandable Rows
  // ════════════════════════════════════════════════

  if (page === 'flagged-listings') {
    document.querySelectorAll('.expandable-row').forEach(row => {
      row.addEventListener('click', (e) => {
        // Don't toggle if clicking an action button
        if (e.target.closest('.btn-sm')) return;
        const detailRow = row.nextElementSibling;
        if (detailRow && detailRow.classList.contains('report-detail-row')) {
          row.classList.toggle('expanded');
          detailRow.classList.toggle('open');
        }
      });
    });

    // Resolve report
    document.querySelectorAll('[data-action="resolve-report"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = btn.closest('tr');
        const title = row.querySelector('.table-name')?.textContent || 'listing';
        openModal('resolve-modal', () => {
          const badge = row.querySelector('.status-badge');
          if (badge) {
            badge.className = 'status-badge resolved';
            badge.innerHTML = '<span class="status-dot"></span>Resolved';
          }
          const actions = row.querySelector('.table-actions');
          if (actions) actions.innerHTML = '<span class="no-action-text">Resolved</span>';
          showToast('Report Resolved', `Reports for "${title}" have been resolved.`, 'success');
        });
      });
    });

    // Block listing from flagged page
    document.querySelectorAll('[data-action="block-listing"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = btn.closest('tr');
        const title = row.querySelector('.table-name')?.textContent || 'listing';
        const badge = row.querySelector('.status-badge');
        if (badge) {
          badge.className = 'status-badge blocked';
          badge.innerHTML = '<span class="status-dot"></span>Blocked';
        }
        const actions = row.querySelector('.table-actions');
        if (actions) actions.innerHTML = '<span class="no-action-text">Blocked</span>';
        showToast('Listing Blocked', `"${title}" has been blocked and removed from search.`, 'warning');
      });
    });

    // Modal confirm for flagged
    const resolveModal = document.getElementById('resolve-modal');
    if (resolveModal) {
      const confirmBtn = resolveModal.querySelector('.modal-btn.confirm-action');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          if (modalCallback) modalCallback();
          closeModal();
        });
      }
    }
  }


  // ════════════════════════════════════════════════
  //  PAGE: DUPLICATE QUEUE — Action Handlers
  // ════════════════════════════════════════════════

  if (page === 'duplicate-queue') {
    document.querySelectorAll('[data-action="keep-both"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.closest('.duplicate-group');
        if (group) {
          group.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          group.style.opacity = '0';
          group.style.transform = 'translateY(-10px)';
          setTimeout(() => group.remove(), 400);
          showToast('Kept Both', 'Both listings have been marked as unique.', 'success');
          checkEmptyQueue();
        }
      });
    });

    document.querySelectorAll('[data-action="remove-duplicate"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.closest('.duplicate-group');
        if (group) {
          group.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          group.style.opacity = '0';
          group.style.transform = 'translateY(-10px)';
          setTimeout(() => group.remove(), 400);
          showToast('Duplicate Removed', 'The flagged duplicate has been removed.', 'warning');
          checkEmptyQueue();
        }
      });
    });

    document.querySelectorAll('[data-action="merge-listings"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.closest('.duplicate-group');
        if (group) {
          group.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          group.style.opacity = '0';
          group.style.transform = 'translateY(-10px)';
          setTimeout(() => group.remove(), 400);
          showToast('Listings Merged', 'Listings have been merged — best data retained.', 'success');
          checkEmptyQueue();
        }
      });
    });

    function checkEmptyQueue() {
      setTimeout(() => {
        const remaining = document.querySelectorAll('.duplicate-group');
        if (remaining.length === 0) {
          const queue = document.querySelector('.duplicate-queue');
          if (queue) {
            queue.innerHTML = `
              <div class="empty-state">
                <div class="empty-state-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h3>All Clear! 🐝</h3>
                <p>No duplicate listings detected — the hive is clean!</p>
              </div>
            `;
          }
        }
      }, 500);
    }
  }


  // ════════════════════════════════════════════════
  //  PAGE: DASHBOARD — Resolve Report from Dashboard
  // ════════════════════════════════════════════════

  if (page === 'dashboard') {
    document.querySelectorAll('[data-action="resolve-dash"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const listing = row.querySelector('.table-name')?.textContent || 'listing';
        const badge = row.querySelector('.status-badge');
        if (badge) {
          badge.className = 'status-badge resolved';
          badge.innerHTML = '<span class="status-dot"></span>Resolved';
        }
        const actions = row.querySelector('.table-actions');
        if (actions) actions.innerHTML = '<span class="no-action-text">Resolved</span>';
        showToast('Report Resolved', `Report for "${listing}" has been resolved.`, 'success');
      });
    });
  }


  // ════════════════════════════════════════════════
  //  PAGE: PROFILE — Admin Profile Handlers
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
