import checkFeatureLimit from "../utils/checkFeatureLimit.js";

export const enforceFeature = (feature, quantity = 1) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    console.log(userId);
        
    const result = await checkFeatureLimit(userId, feature, quantity,next);
    if (!result.isAllowed) {
      return next({
        status: 400,
        code: "LIMIT_EXCEEDED",
        message: result.error,
      });
    }
    next();
  };
};
