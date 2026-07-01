const prisma = require('../config/prisma');

const errorHandler = async (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  try {
    await prisma.errorLog.create({
      data: {
        message: `${req.method} ${req.originalUrl} - ${message}`,
        stackTrace: err.stack || null,
      },
    });
  } catch (_) {
  }

  res.status(statusCode).json({ message });
};

module.exports = { errorHandler };
