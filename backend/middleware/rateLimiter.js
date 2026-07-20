// A tiny in-memory fixed-window rate limiter. Good enough to throttle abusive
// clients on sensitive routes (e.g. login) without pulling in a dependency.
// For a multi-instance production deployment prefer a shared store (Redis).
const createRateLimiter = ({ windowMs = 15 * 60 * 1000, max = 100, message } = {}) => {
  const hits = new Map(); // key -> { count, resetAt }

  // Periodically drop expired buckets so the map does not grow unbounded.
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  if (sweeper.unref) sweeper.unref();

  return (req, res, next) => {
    const key = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res
        .status(429)
        .json({ message: message || 'Too many requests, please try again later' });
    }
    next();
  };
};

module.exports = createRateLimiter;
