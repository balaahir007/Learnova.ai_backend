
import { createPlan, getPlan } from "../entities/planModels.js";

export const getPlanController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const planData = await getPlan(next, userId);
    res.status(200).json({ success: true, planId : planData.id }); // Specific plan
  } catch (error) {
    next(error);
  }
};
export const createPlanController = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id

    if (!planId) {
      return next({
        status: 400,
        message: "planId is required.",
        code: "MISSING_FIELDS",
      });
    }
    const planData = await createPlan(planId, next,userId);
    const { createSubscription, existingPlan } = planData;
    res.status(201).json({
      success: true,
      plan: existingPlan.id,
    });
  } catch (error) {
    next(error);
  }
};
