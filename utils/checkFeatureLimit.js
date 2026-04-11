import { getPlan } from "../entities/planModels.js";
import {  getAllStudySpaces } from "../entities/studySpaceModels.js";

async function checkFeatureLimit(userId, feature, quantity = 1, next) {
  const plan = await getPlan(next, userId);
  const usage = {
    studySpaceCount: await getAllStudySpaces(userId),
  };
  let allowed;
  let usageCount;

  switch (feature) {
    case "groups:create":
      allowed = plan.max_allowed_groups;
      usageCount = usage.studySpaceCount.length;
      if (usageCount + quantity > allowed) {
        return {
          isAllowed: false,
          error: `Group limit exceeded for ${
            usageCount + quantity
          }/${allowed} Upgrade your plan to create more`,
        };
      }
      break;

    case "whiteboards:create":
      allowed = plan.max_whiteboards;
      // Here you can similarly get usage counts and compare.
      break;

    default:
      allowed = Infinity;
  }

  return {
    isAllowed: true,
  };
}

export default checkFeatureLimit;
