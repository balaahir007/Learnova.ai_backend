import GenCourse from "../models/generatedCourse.js";
import { v4 as uuidv4 } from 'uuid';

export const storeCourse = async (courseData, userId) => {
  try {
    if (!courseData || !userId) {
      throw new Error('Course data and user ID are required');
    }

    const courseToStore = {
      id: uuidv4() || `course_${Date.now()}`,
      title: courseData.title || `Comprehensive Course: ${courseData.sourcePrompt}`,
      description: courseData.description || `A detailed course covering ${courseData.sourcePrompt}`,
      modules: courseData.modules || [],
      sourcePrompt: courseData.sourcePrompt,
      generatedAt: courseData.generatedAt || new Date(),
      videoSource: courseData.videoSource || 'youtube_search',
      stats: {
        totalModules: courseData.modules ? courseData.modules.length : 0,
        totalLessons: courseData.stats?.totalLessons || 0,
        estimatedHours: courseData.stats?.estimatedHours || 0,
        difficulty: courseData.stats?.difficulty || "Beginner to Intermediate"
      },
      tags: courseData.tags || extractTags(courseData.sourcePrompt),
      generatedBy: userId,
      status: courseData.status || 'draft',
      isPublic: courseData.isPublic || false,
      category: courseData.category || null,
      language: courseData.language || 'en',
      prerequisites: courseData.prerequisites || [],
      learningObjectives: courseData.learningObjectives || [],
      thumbnail: courseData.thumbnail || null
    };

    const newCourse = await GenCourse.create(courseToStore);

    console.log(`Course "${newCourse.title}" created successfully with ID: ${newCourse.id}`);
    return newCourse.id;

  } catch (error) {
    console.error('Error storing course:', error);
    throw new Error(`Failed to store course: ${error.message}`);
  }
};

// Function to get courses by user
export const getCourseById = async (courseId) => {
  try {
    return await GenCourse.findByPk(courseId);
  } catch (error) {
    console.error('Error fetching user courses:', error);
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }
};

