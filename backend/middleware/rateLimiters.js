const rateLimit = require("express-rate-limit");

const message = { message: "Too many requests, please try again later" };

// Credential stuffing guard — counts only failed attempts so a legitimate
// user working normally is never locked out.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message,
});

module.exports = { authLimiter, uploadLimiter, apiLimiter };
