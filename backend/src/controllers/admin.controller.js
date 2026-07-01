// Admin Features
const prisma = require('../config/prisma');
const {
  sendPropertyApprovedEmail,
  sendPropertyRejectedEmail,
  sendWarningEmail,
} = require('../utils/mailer');

/* Helper: resolve a role's prisma delegate + id field. */
const ROLE_MAP = {
  student: { model: () => prisma.student, idField: 'studentId' },
  landlord: { model: () => prisma.landlord, idField: 'landlordId' },
  agent: { model: () => prisma.agent, idField: 'agentId' },
};

/* Helper: notify the owner (landlord/agent) of a property. */
async function notifyPropertyProvider(property, message, type = 'property_review') {
  const providerId = property.landlordId || property.agentId;
  if (!providerId) return;
  const providerRole = property.landlordId ? 'landlord' : 'agent';
  await prisma.notification.create({
    data: {
      [providerRole + 'Id']: providerId,
      message,
      type,
      isRead: false,
    },
  });
}

/* Helper: fetch the provider's email and name for a property. */
async function getProviderContact(property) {
  if (property.landlordId) {
    return prisma.landlord.findUnique({ where: { landlordId: property.landlordId }, select: { fullName: true, email: true } });
  }
  if (property.agentId) {
    return prisma.agent.findUnique({ where: { agentId: property.agentId }, select: { fullName: true, email: true } });
  }
  return null;
}

/* ═══════════════════════════════════════════════════════
   GET /api/admin/listings  - listings by status (default pending)
   Query: status (pending|active|inactive|blocked|all), page, limit
   ═══════════════════════════════════════════════════════ */
const getPendingProperties = async (req, res, next) => {
  try {
    const { status = 'pending_approval', page = 1, limit = 20 } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const take = Math.min(50, parseInt(limit));

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: { take: 1, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
          landlord: { select: { fullName: true, email: true, phoneNumber: true } },
          agent: { select: { fullName: true, email: true, phoneNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.property.count({ where }),
    ]);

    res.json({
      properties,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   PATCH /api/admin/listings/:id/approve  - approve a listing
   ═══════════════════════════════════════════════════════ */
const approveProperty = async (req, res, next) => {
  try {
    const property = await prisma.property.findUnique({
      where: { propertyId: Number(req.params.id) },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status === 'active') {
      return res.status(400).json({ message: 'Property is already active' });
    }

    const updated = await prisma.property.update({
      where: { propertyId: property.propertyId },
      data: {
        status: 'active',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        rejectionReason: null,
      },
    });

    await notifyPropertyProvider(
      property,
      `Your property "${property.title}" has been approved and is now live.`,
    );

    const contact = await getProviderContact(property);
    if (contact) {
      sendPropertyApprovedEmail(contact.email, contact.fullName, property.title)
        .catch(e => console.error('[MAIL] property approved:', e.message));
    }

    res.json({ message: 'Property approved', property: updated });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   PATCH /api/admin/listings/:id/decline  - decline / block a listing
   Body: reason
   ═══════════════════════════════════════════════════════ */
const rejectProperty = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'A rejection reason is required' });
    }

    const property = await prisma.property.findUnique({
      where: { propertyId: Number(req.params.id) },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const updated = await prisma.property.update({
      where: { propertyId: property.propertyId },
      data: {
        status: 'rejected',
        rejectionReason: reason,
      },
    });

    await notifyPropertyProvider(
      property,
      `Your property "${property.title}" was not approved. Reason: ${reason}`,
    );

    const contact = await getProviderContact(property);
    if (contact) {
      sendPropertyRejectedEmail(contact.email, contact.fullName, property.title, reason)
        .catch(e => console.error('[MAIL] property rejected:', e.message));
    }

    res.json({ message: 'Property rejected', property: updated });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   GET /api/admin/reports  - list reports
   Query: status (pending|resolved|all), page, limit
   ═══════════════════════════════════════════════════════ */
const getReports = async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 20 } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const take = Math.min(50, parseInt(limit));

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          student: { select: { fullName: true, email: true } },
          property: { select: { title: true, area: true, landlordId: true, agentId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   PATCH /api/admin/reports/:id/resolve  - resolve a report
   Body: resolutionNote (optional)
   ═══════════════════════════════════════════════════════ */
const resolveReport = async (req, res, next) => {
  try {
    const { resolutionNote } = req.body;

    const report = await prisma.report.findUnique({
      where: { reportId: Number(req.params.id) },
      include: { property: { select: { title: true } } },
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.status === 'resolved') {
      return res.status(400).json({ message: 'Report is already resolved' });
    }

    const updated = await prisma.report.update({
      where: { reportId: report.reportId },
      data: {
        status: 'resolved',
        resolutionNote: resolutionNote || null,
        resolvedAt: new Date(),
        resolvedBy: req.user.id,
      },
    });

    // Notify the student who filed the report
    await prisma.notification.create({
      data: {
        studentId: report.studentId,
        message: `Your report on "${report.property.title}" has been reviewed and resolved.`,
        type: 'report',
        isRead: false,
      },
    });

    res.json({ message: 'Report resolved', report: updated });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   POST /api/admin/warnings  - issue a warning to a user
   Body: role (student|landlord|agent), userId, reason
   ═══════════════════════════════════════════════════════ */
const issueWarning = async (req, res, next) => {
  try {
    const { role, userId, reason } = req.body;

    if (!role || !userId || !reason) {
      return res.status(400).json({ message: 'role, userId and reason are required' });
    }

    const config = ROLE_MAP[role];
    if (!config) {
      return res.status(400).json({ message: 'role must be one of: student, landlord, agent' });
    }

    const user = await config.model().findUnique({
      where: { [config.idField]: Number(userId) },
    });

    if (!user) {
      return res.status(404).json({ message: `${role} not found` });
    }

    const warning = await prisma.warning.create({
      data: {
        issuedBy: req.user.id,
        [config.idField]: Number(userId),
        reason,
      },
    });

    // Notify the warned user
    await prisma.notification.create({
      data: {
        [config.idField]: Number(userId),
        message: `You have received a warning from the HonnetKE team: ${reason}`,
        type: 'warning',
        isRead: false,
      },
    });

    if (user.email) {
      sendWarningEmail(user.email, user.fullName, reason)
        .catch(e => console.error('[MAIL] warning:', e.message));
    }

    res.status(201).json({ message: 'Warning issued', warning });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   PATCH /api/admin/accounts/:id/suspend  - suspend an account
   Body: role (student|landlord|agent)
   ═══════════════════════════════════════════════════════ */
const suspendAccount = async (req, res, next) => {
  try {
    const { role } = req.body;
    const config = ROLE_MAP[role];

    if (!config) {
      return res.status(400).json({ message: 'role must be one of: student, landlord, agent' });
    }

    const user = await config.model().findUnique({
      where: { [config.idField]: Number(req.params.id) },
    });

    if (!user) {
      return res.status(404).json({ message: `${role} not found` });
    }

    if (user.status === 'suspended') {
      return res.status(400).json({ message: 'Account is already suspended' });
    }

    await config.model().update({
      where: { [config.idField]: Number(req.params.id) },
      data: { status: 'suspended' },
    });

    await prisma.notification.create({
      data: {
        [config.idField]: Number(req.params.id),
        message: 'Your account has been suspended. Contact support for more information.',
        type: 'suspension',
        isRead: false,
      },
    });

    res.json({ message: 'Account suspended' });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   PATCH /api/admin/accounts/:id/reactivate  - reactivate an account
   Body: role (student|landlord|agent)
   ═══════════════════════════════════════════════════════ */
const reactivateAccount = async (req, res, next) => {
  try {
    const { role } = req.body;
    const config = ROLE_MAP[role];

    if (!config) {
      return res.status(400).json({ message: 'role must be one of: student, landlord, agent' });
    }

    const user = await config.model().findUnique({
      where: { [config.idField]: Number(req.params.id) },
    });

    if (!user) {
      return res.status(404).json({ message: `${role} not found` });
    }

    if (user.status === 'active') {
      return res.status(400).json({ message: 'Account is already active' });
    }

    await config.model().update({
      where: { [config.idField]: Number(req.params.id) },
      data: { status: 'active' },
    });

    await prisma.notification.create({
      data: {
        [config.idField]: Number(req.params.id),
        message: 'Your account has been reactivated. Welcome back!',
        type: 'system',
        isRead: false,
      },
    });

    res.json({ message: 'Account reactivated' });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   GET /api/admin/errors  - system error logs
   Query: page, limit
   ═══════════════════════════════════════════════════════ */
const getErrorLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const take = Math.min(100, parseInt(limit));

    const [logs, total] = await Promise.all([
      prisma.errorLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.errorLog.count(),
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   GET /api/admin/traffic  - daily traffic logs
   Query: days (default 30)
   ═══════════════════════════════════════════════════════ */
const getTrafficLogs = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const take = Math.min(365, parseInt(days));

    const logs = await prisma.trafficLog.findMany({
      orderBy: { date: 'desc' },
      take,
    });

    const totalVisits = logs.reduce((sum, l) => sum + l.visitCount, 0);

    res.json({ logs, totalVisits });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   GET /api/admin/stats  - dashboard overview counts
   ═══════════════════════════════════════════════════════ */
const getStats = async (req, res, next) => {
  try {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [
      students,
      landlords,
      agents,
      totalProperties,
      activeProperties,
      pendingProperties,
      pendingReports,
      errorsToday,
      trafficToday,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.landlord.count(),
      prisma.agent.count(),
      prisma.property.count(),
      prisma.property.count({ where: { status: 'active' } }),
      prisma.property.count({ where: { status: 'pending_approval' } }),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.errorLog.count({ where: { createdAt: { gte: since } } }),
      prisma.trafficLog.findUnique({ where: { date: today } }),
    ]);

    res.json({
      totalUsers: students + landlords + agents,
      students,
      landlords,
      agents,
      totalProperties,
      activeProperties,
      pendingProperties,
      pendingReports,
      errorsToday,
      visitsToday: trafficToday ? trafficToday.visitCount : 0,
    });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   GET /api/admin/users  - list all users across roles
   Query: role (student|landlord|agent|all), search
   ═══════════════════════════════════════════════════════ */
const getUsers = async (req, res, next) => {
  try {
    const { role = 'all', search } = req.query;

    const textFilter = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const select = {
      fullName: true,
      email: true,
      phoneNumber: true,
      status: true,
      createdAt: true,
    };

    const tasks = [];
    if (role === 'all' || role === 'student') {
      tasks.push(
        prisma.student
          .findMany({ where: textFilter, select: { ...select, studentId: true }, orderBy: { createdAt: 'desc' } })
          .then(rows => rows.map(r => ({ ...r, id: r.studentId, role: 'student' }))),
      );
    }
    if (role === 'all' || role === 'landlord') {
      tasks.push(
        prisma.landlord
          .findMany({ where: textFilter, select: { ...select, landlordId: true }, orderBy: { createdAt: 'desc' } })
          .then(rows => rows.map(r => ({ ...r, id: r.landlordId, role: 'landlord' }))),
      );
    }
    if (role === 'all' || role === 'agent') {
      tasks.push(
        prisma.agent
          .findMany({ where: textFilter, select: { ...select, agentId: true }, orderBy: { createdAt: 'desc' } })
          .then(rows => rows.map(r => ({ ...r, id: r.agentId, role: 'agent' }))),
      );
    }

    const grouped = await Promise.all(tasks);
    const users = grouped.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Attach warning counts per role in a single grouped query each
    const [studentW, landlordW, agentW] = await Promise.all([
      prisma.warning.groupBy({ by: ['studentId'], where: { studentId: { not: null } }, _count: { _all: true } }),
      prisma.warning.groupBy({ by: ['landlordId'], where: { landlordId: { not: null } }, _count: { _all: true } }),
      prisma.warning.groupBy({ by: ['agentId'], where: { agentId: { not: null } }, _count: { _all: true } }),
    ]);
    const warnMap = {};
    studentW.forEach(w => { warnMap[`student:${w.studentId}`] = w._count._all; });
    landlordW.forEach(w => { warnMap[`landlord:${w.landlordId}`] = w._count._all; });
    agentW.forEach(w => { warnMap[`agent:${w.agentId}`] = w._count._all; });

    users.forEach(u => { u.warningCount = warnMap[`${u.role}:${u.id}`] || 0; });

    res.json({ users, total: users.length });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats,
  getUsers,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getReports,
  resolveReport,
  issueWarning,
  suspendAccount,
  reactivateAccount,
  getErrorLogs,
  getTrafficLogs,
};
