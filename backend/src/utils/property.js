// Shared property domain helpers: availability and capacity logic.
// Used by controllers so availability is computed in exactly one place.

// Thresholds for the "few slots left" label.
const FEW_SLOTS_THRESHOLD = 2;

// Computes an availability label from capacity and occupied counts.
// Returns one of: 'full' | 'few' | 'available'.
function computeAvailability(capacity, occupied) {
  const cap = Number(capacity) || 0;
  const occ = Number(occupied) || 0;
  const slotsLeft = Math.max(0, cap - occ);
  if (cap <= 0 || slotsLeft <= 0) return 'full';
  if (slotsLeft <= FEW_SLOTS_THRESHOLD) return 'few';
  return 'available';
}

// Number of free slots remaining.
function slotsLeft(capacity, occupied) {
  return Math.max(0, (Number(capacity) || 0) - (Number(occupied) || 0));
}

// Decorates a property object with derived availability fields for the API.
function withAvailability(property) {
  if (!property) return property;
  return {
    ...property,
    availability: computeAvailability(property.capacity, property.occupied),
    slotsLeft: slotsLeft(property.capacity, property.occupied),
  };
}

module.exports = {
  FEW_SLOTS_THRESHOLD,
  computeAvailability,
  slotsLeft,
  withAvailability,
};
