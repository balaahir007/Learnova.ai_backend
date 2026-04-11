import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Middleware to protect routes that require authentication
 * Checks for JWT token in cookies or Authorization header
 */
const protectRoute = async (req, res, next) => {
  try {
    // Extract token from cookies or Authorization header
    let token = req.cookies?.jwt;
    
    // Check Authorization header if no cookie found
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }


    if (!token) {
      return res.status(401).json({
        success: false,
        errorCode: "NO_TOKEN",
        error: "No token found. Please log in first.",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Fetch user from database
    const user = await User.findByPk(decoded
      .userId, {
      attributes: { exclude: ["password"] },
    });
    console.log("user Fata  : ",user?.role)

    if (!user) {
      return res.status(404).json({
        success: false,
        errorCode: "USER_NOT_FOUND",
        error: "User not found. Please log in again.",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);

    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        errorCode: "TOKEN_EXPIRED",
        error: "Token has expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        errorCode: "INVALID_TOKEN",
        error: "Invalid token. Please log in again.",
      });
    }

    // Generic error response
    return res.status(401).json({
      success: false,
      errorCode: "AUTHENTICATION_FAILED",
      error: "Authentication failed. Please log in again.",
    });
  }
};

/**
 * Optional middleware to check if user has premium subscription
 */
export const requirePremium = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        errorCode: "UNAUTHORIZED",
        error: "Please log in first.",
      });
    }

    // Check if user has premium subscription
    // Adjust this logic based on your subscription schema
    if (!req.user.isPremium && req.user.subscription === "basic") {
      return res.status(403).json({
        success: false,
        errorCode: "PREMIUM_REQUIRED",
        error: "This feature requires a premium subscription.",
      });
    }

    next();
  } catch (error) {
    console.error("Premium check error:", error);
    return res.status(500).json({
      success: false,
      error: "Error checking premium status.",
    });
  }
};

export default protectRoute;