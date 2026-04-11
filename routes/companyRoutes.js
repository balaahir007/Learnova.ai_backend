import express from "express";
import { createOrUpdateCompany, getCompanyDetails } from "../controllers/companyController.js";
import protectRoute from "../middleware/protectRoute.js";
import authorize from "../middleware/authorize.js";
const router = express.Router();

// ✅ Create or update company (Admin or Recruiter only)
router.post("/", protectRoute, authorize(["admin", "recruiter"]), createOrUpdateCompany);

// ✅ Get company details of logged-in user
router.get("/", protectRoute, authorize(["admin", "recruiter"]), getCompanyDetails);

export default router;
