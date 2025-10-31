const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for authentication endpoints (login, 2FA)
 * 5 attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for user registration
 * 3 registrations per hour per IP
 */
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many accounts created from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for email verification requests
 * 5 requests per hour (more lenient than DB limit of 3/day)
 */
const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many verification requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for 2FA setup/verification
 * 10 attempts per 15 minutes
 */
const twoFactorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many 2FA attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  registrationLimiter,
  emailVerificationLimiter,
  twoFactorLimiter,
};
