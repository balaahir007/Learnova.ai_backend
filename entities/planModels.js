import Plan from "../models/Plan.js";
import Subscription from "../models/Subscription.js";

export const createPlan = async (planId,next,userId) => {
  try {
    const existingPlan = await Plan.findByPk(planId, { raw: true });
    if (!existingPlan) {
      return next({
        status: 404,
        message: "Plan not found.",
        code: "PLAN_NOT_FOUND",
      });
    }

    const startDate = new Date();
    const endDate = new Date();

    if (existingPlan.duration_days === 36500) {
      endDate.setFullYear(endDate.getFullYear() + 100);
    } else {
      endDate.setDate(endDate.getDate() + existingPlan.duration_days);
    }

    const createSubscription = await Subscription.create({
      userId: userId,
      planId: existingPlan.id,
      status: "active",
      startsAt: startDate,
      endsAt: endDate,
    });

    if (!createSubscription) {
      return next({
        status: 500,
        message: "Failed to create subscription.",
        code: "SUBSCRIPTION_CREATION_FAILED",
      });
    }

    // Return success response
    return {existingPlan, createSubscription};
  } catch (error) {
    console.error('Error creating subscription:', error);
    return next({
      status: 500,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
export const getPlan = async (next,userId) => {
  try {
    const existingSubscription = await Subscription.findOne({
      where: { userId: userId, },
      raw: true,
    });
    if (!existingSubscription || !existingSubscription.planId) {
      return next({
        status: 400,
        message: "No subscription or plan ID found.",
        code: "NO_SUBSCRIPTION",
      });
    }
    const planId = existingSubscription.planId;
    const plan = await Plan.findByPk(planId, { raw: true });
    if (!plan) {
      return next({
        status: 404,
        message: "Plan not found.",
        code: "PLAN_NOT_FOUND",
      });
    }
    return plan;
  } catch (error) {
    console.error('Error fetching plan:', error);
    return next({
      status: 500,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};