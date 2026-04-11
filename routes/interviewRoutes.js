import express from "express";
import multer from "multer";
import protectRoute from "../middleware/protectRoute.js";
import authorize from "../middleware/authorize.js";
import {
  formGenerateQuestionsController,
  getInterviewSessionCOntroller,
  completeInterview,
  updateTimer,
  getRecommededMocksController,
  getYourMocksController,
  resumeGenerateQuestionsController,
} from "../controllers/interviewControllers.js";

const upload = multer();
const router = express.Router();

// STATIC ROUTES FIRST
router.post(
  "/formGenerate-questions",
  protectRoute,
  authorize(["user", "admin"]),
  formGenerateQuestionsController
);

router.post(
  "/resumeGenerate-questions",
  protectRoute,
  authorize(["user", "admin"]),
  upload.single("file"),
  resumeGenerateQuestionsController
);

router.get(
  "/session/:sessionId",
  protectRoute,
  authorize(["user", "admin"]),
  getInterviewSessionCOntroller
);

router.get(
  "/recommended-mocks",
  protectRoute,
  authorize(["user", "admin"]),
  getRecommededMocksController
);

router.get(
  "/your-mocks",
  protectRoute,
  authorize(["user", "admin"]),
  getYourMocksController
);

// DYNAMIC ROUTES LAST (IMPORTANT)
router.patch(
  "/:sessionId/update-timer",
  protectRoute,
  authorize(["user", "admin"]),
  updateTimer
);

router.patch(
  "/:sessionId/complete",
  protectRoute,
  authorize(["user", "admin"]),
  completeInterview
);

export default router;
