import express from "express";
import {
  createResourceController,
  getAllResourcesController,
  getResourcesByStudySpaceController,
  getResourceController,
  updateResourceController,
  deleteResourceController,
  toggleArchiveResourceController,
  downloadResourceController,
  getResourceStatsController,
  upload
} from "../../controllers/studySpaceResourceController.js";
import protectRoute from "../../middleware/protectRoute.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Create a new resource (with file upload)
router.post("/", upload.single('file'), createResourceController);

// Get all resources (admin view with filters)
router.get("/", getAllResourcesController);

// Get resource statistics
router.get("/stats", getResourceStatsController);

// Get resources by study space
router.get("/studyspace/:studySpaceId", getResourcesByStudySpaceController);

// Get a single resource
router.get("/:resourceId", getResourceController);

// Update a resource (with optional file upload)
router.put("/:resourceId", upload.single('file'), updateResourceController);

// Delete a resource (soft delete)
router.delete("/:resourceId", deleteResourceController);

// Archive/Unarchive a resource
router.patch("/:resourceId/archive", toggleArchiveResourceController);

// Download a resource
router.get("/:resourceId/download", downloadResourceController);

export default router;
