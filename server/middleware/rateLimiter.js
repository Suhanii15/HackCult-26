/**
 * server/middleware/rateLimiter.js
 *
 * Lightweight in-memory rate limiter for public and calculation endpoints.
 * Tracks client IP requests in a rolling time window.
 */

function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 1000; // default 1 minute
  const max = options.max || 30; // default 30 requests per minute
  const message = options.message || 'Too many requests, please try again later.';

  const hits = new Map();

  // Periodic cleanup every 2 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 2 * 60 * 1000);

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-client';
    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();

    let record = hits.get(key);
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      hits.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
}

module.exports = { createRateLimiter };
