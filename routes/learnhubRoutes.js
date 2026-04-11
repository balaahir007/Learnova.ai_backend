import express from "express";
import {
  createCourse,
  getCourseByIdController,
} from "../controllers/courseGenerateController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();
router.post("/course/generate", protectRoute, createCourse);
router.get("/course/:courseId", protectRoute, getCourseByIdController);

export default router;
