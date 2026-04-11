import rateLimit from "express-rate-limit";

export const createRateLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      errorCode: "TOO_MANY_REQUESTS",
      message,
    },
  });
};
