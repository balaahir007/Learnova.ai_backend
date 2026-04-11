import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import hasPremium from "../middleware/hasPremium.js";
import { getPlanController,  createPlanController } from "../controllers/plansController.js";
const router = express.Router();

router.get("/user", protectRoute, hasPremium, getPlanController);
router.post("/", protectRoute, createPlanController);
export default router;
