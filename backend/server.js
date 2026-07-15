const express = require('express');
const cors = require('cors');

const config = require('./config/env');
const connectDB = require('./config/db');
const requestLogger = require('./middleware/requestLogger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: config.clientUrl === '*' ? true : [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/availability', require('./routes/availabilityRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// 404 + centralised error handling (must be registered last).
app.use(notFound);
app.use(errorHandler);

// Boot: connect to the database first, then start listening.
connectDB().then(() => {
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Running in ${config.env} mode on port ${config.port}`);
  });
});

module.exports = app;
