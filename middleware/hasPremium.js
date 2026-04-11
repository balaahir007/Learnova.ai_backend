import Subscription from "../models/Subscription.js";
import { Op } from "sequelize";

const hasPremium = async (req, res, next) => {
  try {
    const userId = req.user.id;

    console.log("Checking premium status for user:", userId);

    if (!userId) {
      return next({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Unauthorized access. Please log in.",
      });
    }
    const subscription = await Subscription.findOne({
      where: {
        userId,
        isActive: true,
        endsAt: {
          [Op.gt]: new Date(),
        },
      },
    });    
    if (!subscription) {
      return next({
        status: 403,
        code: "NO_PREMIUM",
        message: "You need an active premium plan to access this resource.",
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    next(error);
  }
};

export default hasPremium;
