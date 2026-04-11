import { AppError } from "../utils/AppError.js"; // include .js extension if using ES modules

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
    roles = [roles];
  }
  return (req, res, next) => {
    // Check if user exists and has correct role
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        currentRole: req.user.role
      });
    }

    // If authorized, continue
    next();
  };
};

export default authorize;
