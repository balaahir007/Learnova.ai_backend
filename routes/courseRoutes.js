import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  courseCreate,
  fetchCourseById,
  getAllCourses,
  updateCourse,
  addChapter,
  reorderChapter,
  getCategories,
  getAllPublishedCourses,
  getAllAttachMents,
  getChapterDetails,
  updateProgress,
  getCourseProgress,
  getChapterProgress, // Add this new function
  createCertificate,
  issueCertificate,
  getCertificate,
  downloadCertificate,
  shareCertificate,
  getUserCertificates,
  verifyCertificate,
} from "../controllers/courseControllers.js";
import uploadVideo from "../middleware/uploadVideo.js";
import authorize from "../middleware/authorize.js";
import {
  getAssignmentById,
  getCourseAssignments,
  startAssignment,
  submitAssignment,
} from "../controllers/assignmentController.js";

const router = express.Router();

// create course
router.post("/", protectRoute, authorize(["admin"]), courseCreate);
router.get("/", protectRoute, authorize(["admin"]), getAllCourses);

router.get("/published", getAllPublishedCourses);

// get categories (static route MUST be before dynamic id route)
router.get("/categories", protectRoute, authorize(["admin"]), getCategories);

// chapter routes (static routes before dynamic ones)
router.get("/chapter/:chapterId", protectRoute, getChapterDetails);

// course progress routes (MUST be before /:id to avoid conflict)
router.patch("/progress", protectRoute, updateProgress);
router.get("/:courseId/progress", protectRoute, getCourseProgress); // Overall course progress
router.get(
  "/:courseId/progress/chapter/:chapterId",
  protectRoute,
  getChapterProgress
); // Specific chapter progress

// get/update course by id
router.get("/:id", protectRoute, authorize(["admin"]), fetchCourseById);
router.patch("/:id", protectRoute, authorize(["admin"]), updateCourse);

// chapters
router.post(
  "/:courseId/chapter",
  protectRoute,
  authorize(["admin"]),
  uploadVideo.single("video"),
  addChapter
);
router.get("/:courseId/attachments", protectRoute, getAllAttachMents);
router.patch(
  "/:courseId/chapter/:chapterId/reorder",
  protectRoute,
  authorize(["admin"]),
  reorderChapter
);

// assignments routes
router.get(
  "/assignments/course/:courseId",
  protectRoute,
  getCourseAssignments
);

// Get assignment details
router.get("/assignments/item/:assignmentId", protectRoute, getAssignmentById);

// certificate route
router.post("/:courseId/certificate", protectRoute, createCertificate);

// Start an assignment
router.post("/assignments/:assignmentId/start", protectRoute, startAssignment);

// Submit assignment answers
router.post(
  "/assignments/:assignmentId/submit",
  protectRoute,
  submitAssignment
);

// Protected routes
router.post("/:courseId/certificate/issue", protectRoute, issueCertificate);
router.get("/:courseId/certificate", protectRoute, getCertificate);
router.get(
  "/certificate/:certificateId/download",
  protectRoute,
  downloadCertificate
);
router.post(
  "/certificate/:certificateId/share",
  protectRoute,
  shareCertificate
);
router.get("/certificates", protectRoute, getUserCertificates);

// Public route (no auth)
router.get("/verify/:certificateId", verifyCertificate);

export default router;
