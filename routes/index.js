import express from "express";

import studySpaceRoutes from "./studySpace/index.js";
import authRoutes from "./userRoutes.js";
import interviewRoutes from "./interviewRoutes.js";
import planRoutes from "./plansRoutes.js";
import sessionRoutes from "./sessionRoutes.js";
import learnhubRoutes from "./learnhubRoutes.js";
import courseRoutes from "./courseRoutes.js";
import companyRoutes from "./companyRoutes.js";
import jobRoutes from "./jobRoutes.js";
import applicationRoutes from "./applicationRoutes.js";
import collegeRoutes from "./collegeRoutes.js";
import hackathonRoutes from "./hackathonRoutes.js";
import savedItemRoutes from "./savedItemRoutes.js";

const router = express.Router();

router.use("/study-space", studySpaceRoutes);
router.use("/auth", authRoutes);
router.use("/interview", interviewRoutes);
router.use("/plans", planRoutes);
router.use("/session", sessionRoutes);
router.use("/learnhub", learnhubRoutes);
router.use("/course", courseRoutes);
router.use("/company", companyRoutes);
router.use("/jobs", jobRoutes);
router.use("/application", applicationRoutes);
router.use("/college", collegeRoutes);
router.use("/hackathons", hackathonRoutes);
router.use("/saved-items", savedItemRoutes);

export default router;
