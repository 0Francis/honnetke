/* ===================================================
   HonnetKE - Shared property helpers
   Formatting, labels, availability and card markup so
   every page renders properties consistently.
   =================================================== */
(function () {
  const PROPERTY_TYPE_LABELS = {
    hostel_room: 'Hostel Room',
    shared_room: 'Shared Room',
    studio: 'Studio',
    bedsitter: 'Bedsitter',
    sq: 'Servant Quarter',
    one_bedroom: '1 Bedroom',
    two_bedroom: '2 Bedroom',
    three_bedroom: '3 Bedroom',
    suite: 'Suite',
    apartment: 'Apartment',
    maisonette: 'Maisonette',
    other: 'Other',
  };

  const STATUS_LABELS = {
    draft: 'Draft',
    pending_approval: 'Pending review',
    active: 'Active',
    rejected: 'Rejected',
    archived: 'Archived',
    fully_occupied: 'Fully occupied',
    suspended: 'Suspended',
  };

  const AVAILABILITY = {
    available: { label: 'Available', className: 'badge-green' },
    few: { label: 'Few slots left', className: 'badge-amber' },
    full: { label: 'Fully occupied', className: 'badge-charcoal' },
  };

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatPrice(value) {
    const n = Number(value) || 0;
    return `KES ${n.toLocaleString()}`;
  }

  function titleCase(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function propertyTypeLabel(type) {
    return PROPERTY_TYPE_LABELS[type] || titleCase((type || '').replace(/_/g, ' '));
  }

  function statusLabel(status) {
    return STATUS_LABELS[status] || titleCase((status || '').replace(/_/g, ' '));
  }

  function roomTypeLabel(room) {
    return room ? `${titleCase(room)} Room` : '';
  }

  function genderLabel(gender) {
    if (!gender) return '';
    if (gender === 'any') return 'Any gender';
    return titleCase(gender);
  }

  // Returns { key, label, className } for a property's availability.
  function availability(property) {
    const key = property.availability
      || (property.capacity != null
        ? deriveAvailability(property.capacity, property.occupied)
        : 'available');
    return { key, ...(AVAILABILITY[key] || AVAILABILITY.available) };
  }

  function deriveAvailability(capacity, occupied) {
    const slots = Math.max(0, (Number(capacity) || 0) - (Number(occupied) || 0));
    if ((Number(capacity) || 0) <= 0 || slots <= 0) return 'full';
    if (slots <= 2) return 'few';
    return 'available';
  }

  function locationText(property) {
    const parts = [property.estate, property.area, property.county].filter(Boolean);
    let text = parts.join(', ');
    if (property.nearestCampus) {
      text += `${text ? ', near ' : 'Near '}${property.nearestCampus}`;
    }
    return text;
  }

  function primaryImage(property) {
    if (property.images && property.images.length > 0) {
      return property.images[0].imageUrl;
    }
    return '';
  }

  const heartSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  const pinSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  const arrowSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

  // Builds a property card. options: { href, showFav, isFav, detailPath }
  function cardHtml(property, options = {}) {
    const {
      detailPath = 'listing.html',
      showFav = true,
      isFav = false,
    } = options;

    const id = property.propertyId;
    const img = primaryImage(property);
    const avail = availability(property);
    const type = propertyTypeLabel(property.propertyType);
    const gender = genderLabel(property.genderPreference);
    const room = roomTypeLabel(property.roomType);
    const loc = locationText(property) || 'Location not specified';
    const title = escapeHtml(property.title);

    const imageBlock = img
      ? `<img src="${escapeHtml(img)}" alt="${title}" loading="lazy">`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--color-border-light,#eee);color:var(--color-text-muted,#888);font-size:0.85rem;min-height:160px;">No image</div>`;

    const favBtn = showFav
      ? `<button class="card-fav-btn ${isFav ? 'active' : ''}" data-property-id="${id}" aria-label="${isFav ? 'Remove from favourites' : 'Save to favourites'}" aria-pressed="${isFav}">${heartSvg}</button>`
      : '';

    return `
      <article class="listing-card" data-href="${detailPath}" data-property-id="${id}" role="link" tabindex="0" aria-label="View ${title}">
        <div class="card-image">
          ${imageBlock}
          <div class="card-price-tag">${formatPrice(property.price)}/mo</div>
          <span class="badge ${avail.className}" style="position:absolute;top:10px;left:10px;z-index:2;">${avail.label}</span>
          ${favBtn}
        </div>
        <div class="card-body">
          <h3 class="card-title">${title}</h3>
          <div class="card-location">${pinSvg}${escapeHtml(loc)}</div>
          <div class="card-badges">
            ${type ? `<span class="badge badge-amber">${escapeHtml(type)}</span>` : ''}
            ${gender ? `<span class="badge badge-charcoal">${escapeHtml(gender)}</span>` : ''}
          </div>
          <div class="card-footer">
            <span class="card-room-type">${escapeHtml(room)}</span>
            <a href="${detailPath}?id=${id}" class="card-detail-link">View details ${arrowSvg}</a>
          </div>
        </div>
      </article>`;
  }

  // Wires click + keyboard navigation for cards within a container.
  function bindCardNavigation(container, detailPath = 'listing.html') {
    if (!container) return;
    container.querySelectorAll('.listing-card[data-property-id]').forEach((card) => {
      const go = () => {
        const id = card.getAttribute('data-property-id');
        window.location.href = id ? `${detailPath}?id=${id}` : detailPath;
      };
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-fav-btn')) return;
        go();
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      });
    });
  }

  window.HonnetKE = window.HonnetKE || {};
  window.HonnetKE.property = {
    escapeHtml,
    formatPrice,
    propertyTypeLabel,
    statusLabel,
    roomTypeLabel,
    genderLabel,
    availability,
    deriveAvailability,
    locationText,
    primaryImage,
    cardHtml,
    bindCardNavigation,
    PROPERTY_TYPE_LABELS,
    STATUS_LABELS,
  };
})();
