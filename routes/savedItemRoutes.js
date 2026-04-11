import express from "express";
import {
  saveItem,
  removeSavedItem,
  getMySavedItems,
} from "../controllers/savedItemController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// Save an item (job or hackathon)
router.post("/save", protectRoute, saveItem);

// Remove saved item
router.delete("/save/:id", protectRoute, removeSavedItem);

// Get all saved items of user
router.get("/save", protectRoute, getMySavedItems);

export default router;
