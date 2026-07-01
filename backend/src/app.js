const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/error.middleware');
const { trafficLogger } = require('./middleware/traffic.middleware');

const authRoutes = require('./routes/auth.routes');
const propertiesRoutes = require('./routes/properties.routes');
const favouritesRoutes = require('./routes/favourites.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const reportsRoutes = require('./routes/reports.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const adminRoutes = require('./routes/admin.routes');
const meRoutes = require('./routes/me.routes');

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5500')
  .split(',')
  .map((u) => u.trim())
  .flatMap((u) => {
    const alt = u.replace('localhost', '127.0.0.1');
    return alt === u ? [u] : [u, alt];
  });

app.use(helmet({
  // Images are served from Cloudinary; allow cross-origin resource loading.
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
}));

app.use(express.json());
app.use(trafficLogger);

// General API rate limiter (per IP).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

// Stricter limiter for authentication (OTP, login, password reset).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'HonnetKE API is running' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/favourites', favouritesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', meRoutes);

app.use(errorHandler);

module.exports = app;
