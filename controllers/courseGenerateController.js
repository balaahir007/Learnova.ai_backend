import GenCourse from "../models/generatedCourse.js";
import  {generateCourseService}   from "./../service/generateCourse.js";

// controller
export const createCourse = async (req, res) => {
  try {
    const course = await generateCourseService({
      prompt: req.body.prompt,
      maxModules: req.body.maxModules || 3,
      maxLessons: req.body.maxLessons || 4,
      useYouTubeAPI: true,
    });

    const newCourse = await GenCourse.create(course);

    res.status(201).json({ courseId: newCourse.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCourseByIdController = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    // Find course by ID
    const course = await GenCourse.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    console.log(`✅ Course fetched: ${courseId}`);

    // Return the course object
    res.status(200).json(course);
  } catch (err) {
    console.error("❌ Course fetch error:", err.message);
    res.status(500).json({
      error: "Failed to fetch course. Please try again.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
