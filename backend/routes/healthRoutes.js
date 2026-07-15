const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

// Lightweight liveness/readiness probe. Handy for uptime monitors and for
// confirming the API + database are reachable during local development.
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    database: states[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
