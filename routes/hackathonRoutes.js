import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import authorize from "../middleware/authorize.js";
import {
  getAllHackathons,
  deleteHackathon,
  createHackathon,
  updateHackathon,
  getHackathon,
  registerForHackathon,
  getMyRegistrations,
  getHackathonTeamRules,
  getHackathonRegistrationRules
} from "../controllers/hackathonController.js";

const router = express.Router();

// Public static routes FIRST
router.get("/", getAllHackathons);
router.get("/teamRules/:id", getHackathonTeamRules);
router.get("/registrationRules/:id", getHackathonRegistrationRules);

// Protected static routes BEFORE dynamic ones
router.get("/my-registrations", protectRoute, getMyRegistrations);

// Protected POST routes
router.post("/", protectRoute, authorize(["teacher", "admin"]), createHackathon);
router.post("/:id/register", protectRoute, registerForHackathon);

// Dynamic route LAST
router.get("/:id", getHackathon);

// Update and delete routes
router.put("/:id", protectRoute, authorize(["organizer", "admin"]), updateHackathon);
router.delete("/:id", protectRoute, authorize(["organizer", "admin"]), deleteHackathon);

export default router;