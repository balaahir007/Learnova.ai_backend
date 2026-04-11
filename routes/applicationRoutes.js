import express from "express";
import {
  applyForJob,
  getAllApplications,
  getApplicationsByJob,
  getApplicationsByUser,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/applicationController.js";
import protectRoute from "../middleware/protectRoute.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.post(
  "/apply",
  protectRoute,
  authorize(["user", "recruiter"]),
  applyForJob
);
router.get(
  "/",
  protectRoute,
  authorize(["admin", "recruiter"]),
  getAllApplications
);
router.get("/job/:jobId", getApplicationsByJob);
router.get("/user/:userId", getApplicationsByUser);
router.patch("/:id/status", updateApplicationStatus);
router.delete("/:id", deleteApplication);

export default router;
