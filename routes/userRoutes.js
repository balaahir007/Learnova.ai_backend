import express from "express";

import protectRoute from "../middleware/protectRoute.js";
import { changePassword, getAuth, getUserProfileController, loginController, logOut, registerController, sendResetPasswordLink, sendVerification, verifyCode } from "../controllers/userControllers.js";
import { createRateLimiter } from "../middleware/rateLimit/generalRateLimiter.js";
import { changePasswordLimiter, registerRateLimiter, resetPasswordLimiter } from "../middleware/rateLimit/authRateLimiter.js";
const router = express.Router();
router.post("/register", registerController);
router.post("/verify/send-code",registerRateLimiter, sendVerification);
router.post("/verify/check-code", verifyCode);
router.post("/login", loginController);
router.post("/logout",logOut);
router.get("/check-auth",protectRoute,getAuth);
router.get("/get-profile/:userId",protectRoute,getUserProfileController);

router.post("/password/reset-password",resetPasswordLimiter,protectRoute,sendResetPasswordLink);
router.post("/password/change-password",changePasswordLimiter,protectRoute,changePassword);
router.delete("/delete/account",changePasswordLimiter,protectRoute,changePassword);
export default router;
