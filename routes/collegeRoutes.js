import express from "express";
import {
  createCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
} from "../controllers/collegeController.js";
import protectRoute from "../middleware/protectRoute.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// CRUD routes
router.post("/", protectRoute, authorize(["teacher", "admin"]), createCollege);
router.get("/", protectRoute, authorize(["teacher", "admin"]), getColleges);
router.get("/:id", getCollegeById);
router.put("/:id", updateCollege);
router.delete("/:id", deleteCollege);

export default router;
