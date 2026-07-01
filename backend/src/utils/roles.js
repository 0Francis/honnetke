// Centralized role-to-id helpers shared across controllers.
// Keeping the four user tables (student, landlord, agent, admin) means most
// controllers need to map the JWT role to the correct id column. This module
// removes that duplicated branching.

const ROLE_ID_FIELD = {
  student: 'studentId',
  landlord: 'landlordId',
  agent: 'agentId',
  admin: 'adminId',
};

// Returns the id field name for a role, or null if unknown.
function roleIdField(role) {
  return ROLE_ID_FIELD[role] || null;
}

// Returns a Prisma where-filter that scopes a Property to its provider owner.
function providerFilter(user) {
  if (!user) return {};
  if (user.role === 'landlord') return { landlordId: user.id };
  if (user.role === 'agent') return { agentId: user.id };
  return {};
}

// Returns a { [field]: id } object for the current user, or null for guests.
function userScope(user) {
  const field = user ? roleIdField(user.role) : null;
  return field ? { [field]: user.id } : null;
}

// True if the property is owned by the given landlord/agent user.
function ownsProperty(user, property) {
  if (!user || !property) return false;
  return (
    (user.role === 'landlord' && property.landlordId === user.id) ||
    (user.role === 'agent' && property.agentId === user.id)
  );
}

module.exports = {
  ROLE_ID_FIELD,
  roleIdField,
  providerFilter,
  userScope,
  ownsProperty,
};
