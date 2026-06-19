const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/error.middleware');
const { trafficLogger } = require('./middleware/traffic.middleware');

const authRoutes = require('./routes/auth.routes');
const listingsRoutes = require('./routes/listings.routes');
const favouritesRoutes = require('./routes/favourites.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const reportsRoutes = require('./routes/reports.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(trafficLogger);

app.get('/api/health', (req, res) => {
  res.json({ status: 'HonnetKE API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/favourites', favouritesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

module.exports = app;
