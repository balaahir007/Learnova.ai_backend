import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getAllRecruiterJobs,
} from "../controllers/jobController.js";
import protectRoute from "../middleware/protectRoute.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// ✅ Create a job (Admin or Recruiter only)
router.post("/", protectRoute, authorize(["admin", "recruiter"]), createJob);

// ✅ Get all jobs (Public)
router.get("/", getAllJobs);

// ✅ Get all jobs posted by a recruiter (Admin or Recruiter only)
router.get("/recruiter", protectRoute, authorize(["admin", "recruiter"]), getAllRecruiterJobs);

// ✅ Get job by ID (Public)
router.get("/:jobId", getJobById);

// ✅ Update job (Admin or Recruiter only)
router.put("/:jobId", protectRoute, authorize(["admin", "recruiter"]), updateJob);

// ✅ Delete job (Admin or Recruiter only)
router.delete("/:jobId", protectRoute, authorize(["admin", "recruiter"]), deleteJob);

export default router;
