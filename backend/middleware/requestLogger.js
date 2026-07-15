// Minimal dependency-free request logger. Logs method, path, status and the
// time taken once the response finishes.
const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const stamp = new Date().toISOString();
    // eslint-disable-next-line no-console
    console.log(
      `[${stamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms.toFixed(1)}ms`
    );
  });

  next();
};

module.exports = requestLogger;
