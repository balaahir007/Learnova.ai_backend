import { createRateLimiter } from "./generalRateLimiter.js";

export const resetPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5,
  message: "Too many reset attempts. Try again later.",
});

export const changePasswordLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 8,
  message: "Too many requests. Try again shortly.",
});


export const loginLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Try after 10 minutes.",
});
export const registerRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many register attempts. Try after 10 minutes.",
});
