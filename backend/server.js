const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const config = require('./config/env');
const connectDB = require('./config/db');
const requestLogger = require('./middleware/requestLogger');
const securityHeaders = require('./middleware/securityHeaders');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(securityHeaders);
app.use(cors({ origin: config.clientUrl === '*' ? true : [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// Routes
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/availability', require('./routes/availabilityRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/waitlist', require('./routes/waitlistRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 + centralised error handling (must be registered last).
app.use(notFound);
app.use(errorHandler);

// Boot: connect to the database first, then start listening.
let server;
connectDB().then(() => {
  server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Running in ${config.env} mode on port ${config.port}`);
  });
});

// Close the HTTP server and DB connection cleanly on termination signals.
const shutdown = (signal) => {
  // eslint-disable-next-line no-console
  console.log(`[server] ${signal} received, shutting down gracefully`);
  if (server) server.close();
  mongoose.connection.close(false).finally(() => process.exit(0));
};
['SIGTERM', 'SIGINT'].forEach((sig) => process.on(sig, () => shutdown(sig)));

module.exports = app;
