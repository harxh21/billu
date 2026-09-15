const rateLimit = require('express-rate-limit');

// Applies to login + register only. Blocks an IP after too many attempts
// in a 15-minute window — stops brute-force login guessing and signup spam.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts from this device. Please try again in a few minutes.',
  },
});

module.exports = { authLimiter };
