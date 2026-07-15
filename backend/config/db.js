const mongoose = require('mongoose');
const config = require('./env');

// Connect to MongoDB. The legacy useNewUrlParser / useUnifiedTopology flags were
// removed in the Mongoose 8 driver, so they are intentionally omitted here.
const connectDB = async () => {
  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(config.mongoUri);
    // eslint-disable-next-line no-console
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[db] MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

// Surface late connection drops instead of failing silently.
mongoose.connection.on('disconnected', () => {
  // eslint-disable-next-line no-console
  console.warn('[db] MongoDB disconnected');
});

module.exports = connectDB;
