const prisma = require('../config/prisma');

const trafficLogger = async (req, res, next) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await prisma.trafficLog.upsert({
      where: { date: today },
      update: { visitCount: { increment: 1 } },
      create: { date: today, visitCount: 1 },
    });
  } catch (_) {
  }

  next();
};

module.exports = { trafficLogger };
