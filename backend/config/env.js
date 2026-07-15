const dotenv = require('dotenv');

dotenv.config();

// Central, validated configuration. Fail fast with a clear message when a
// required variable is missing instead of crashing deep inside a request.
const required = ['MONGO_URI', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    `\n[config] Missing required environment variables: ${missing.join(', ')}\n` +
      `Create a backend/.env file (see .env.example) before starting the server.\n`
  );
  process.exit(1);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  email: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    enabled: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
  },
};

config.isProduction = config.env === 'production';

module.exports = config;
