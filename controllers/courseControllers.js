import { AppError } from "../utils/AppError.js";
import isAdmin from "../helper/isAdmin.js";
import {
  attachMentsById,
  chapterById,
  courseById,
  createCourse,
  fetchAllCourses,
  fetchAllPublishedCourses,
  generateCertificate,
  reOrder,
  updateCourseById,
  uploadChapter,
  calculateCourseProgress,
} from "../entities/courseModel.js";
import {
  Category,
  Certificate,
  CertificateShare,
  Course,
  UserProgress,
} from "../models/Course.js";
import { getProfile } from "../entities/userModels.js";
import path from "path";
import fs from "fs";
import { generateQRCode } from "../utils/qrCodeGenerator.js";
import { generateCertificatePDF } from "../utils/certificateGenerator.js";
export const courseCreate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    const { title } = req.body;

    console.log("username", title, "userId", userId);
    if (!title) {
      throw new AppError({
        status: 400,
        errorCode: "COURSE_TITLE_IS_NOT_FOUND",
        message: "course title is not found,please try again",
      });
    }

    const newCourse = await createCourse(title, userId);
    return res.status(201).json({
      success: true,
      data: newCourse,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message:
              error.message || "An error occurred while creating a course.",
          })
    );
  }
};
export const getAllCourses = async (req, res, next) => {
  try {
    const allCourses = await fetchAllCourses();
    return res.status(201).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message:
              error.message || "An error occurred while creating a course.",
          })
    );
  }
};
export const getAllPublishedCourses = async (req, res, next) => {
  try {
    const allCourses = await fetchAllPublishedCourses();
    return res.status(201).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message:
              error.message || "An error occurred while creating a course.",
          })
    );
  }
};
export const fetchCourseById = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      throw new AppError({
        status: 403,
        errorCode: "USER_IS_NOT_ADMIN",
        message: "User is not an admin",
      });
    }

    if (!id) {
      throw new AppError({
        status: 400,
        errorCode: "COURSE_ID_IS_NOT_FOUND",
        message: "course ID is not found,please try again",
      });
    }

    const course = await courseById(id);
    return res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message:
              error.message || "An error occurred while creating a course.",
          })
    );
  }
};
export const updateCourse = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    let { id } = req.params;
    const updates = req.body;

    console.log("updates", updates);

    id = id;

    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      throw new AppError({
        status: 403,
        errorCode: "USER_IS_NOT_ADMIN",
        message: "User is not an admin",
      });
    }

    if (!id) {
      throw new AppError({
        status: 400,
        errorCode: "COURSE_ID_IS_NOT_FOUND",
        message: "Course ID is missing",
      });
    }

    console.log("id", id, updates);

    const updated = await updateCourseById(id, updates);
    if (updated === 0) {
      throw new AppError({
        status: 404,
        errorCode: "COURSE_NOT_FOUND",
        message: "Course not found or no changes applied",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message:
              error.message || "An error occurred while updating the course.",
          })
    );
  }
};

export const addChapter = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    await courseById(courseId);
    const { title, description, duration } = req.body;
    const videoUrl = req.file?.path;
    const publicId = req.file?.filename;

    if (!videoUrl || !publicId) {
      throw new AppError({
        status: 400,
        errorCode: "VIDEO_UPLOAD_FAILED",
        message: "Video upload failed, please try again.",
      });
    }

    const chapter = {
      title,
      duration,
      description,
      videoUrl,
      publicId,
    };

    const uploadedChapter = await uploadChapter(courseId, chapter);

    return res.status(201).json({
      success: true,
      data: uploadedChapter,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message:
              error.message || "An error occurred while adding  a chapter.",
          })
    );
  }
};
export const reorderChapter = async (req, res, next) => {
  try {
    const { courseId, chapterId } = req.params;
    const { order } = req.body;
    await courseById(courseId);
    console.log("courseId,chapterId,order", courseId, chapterId, order);
    await reOrder(courseId, chapterId, order);
    return res.status(201).json({
      success: true,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message:
              error.message || "An error occurred while re ordering a chapter.",
          })
    );
  }
};

export const getChapterDetails = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const chapter = await chapterById(chapterId);
    return res.status(201).json({
      data: chapter,
      success: true,
    });
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message:
              error.message || "An error occurred while re ordering a chapter.",
          })
    );
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    console.log("Fetched categories:", categories);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(
      new AppError({
        status: 500,
        message: error.message || "Failed to fetch categories",
      })
    );
  }
};
export const getAllAttachMents = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    if (!courseId) {
      return next(
        new AppError({
          status: 400,
          message: "Course ID is required",
        })
      );
    }

    const allAttachMents = await attachMentsById(courseId, userId);
    res.status(200).json({
      success: true,
      data: allAttachMents,
    });
  } catch (error) {
    next(
      new AppError({
        status: 500,
        message: error.message || "Failed to fetch attachments",
      })
    );
  }
};

export const updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, chapterId, watchedDuration, totalDuration } = req.body;

    // Check if user progress already exists
    const existingProgress = await UserProgress.findOne({
      where: { userId, courseId, chapterId },
    });

    console.log("current watched:", watchedDuration);
    console.log("previous watched:", existingProgress?.watchedDuration);

    // ✅ If previous watched is greater, don’t downgrade progress
    if (existingProgress && existingProgress.watchedDuration > watchedDuration) {
      return res.status(200).json({ message: "Progress is already ahead" });
    }

    if (existingProgress) {
      await existingProgress.update({
        watchedDuration,
        totalDuration,
        isCompleted: watchedDuration >= totalDuration,
      });
    } else {
      await UserProgress.create({
        userId,
        courseId,
        chapterId,
        watchedDuration,
        totalDuration,
        isCompleted: watchedDuration >= totalDuration,
      });
    }

    return res.json({ message: "Progress updated successfully" });
  } catch (err) {
    console.error("Update progress error:", err);
    res.status(500).json({ error: "Failed to update progress" });
  }
};

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id; // Get from authenticated user

    const progressRecords = await UserProgress.findAll({
      where: { userId, courseId },
    });

    const totalChapters = progressRecords.length;
    const completedChapters = progressRecords.filter(
      (p) => p.isCompleted
    ).length;

    const percentage =
      totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

    res.json({
      success: true,
      percentage: percentage.toFixed(2),
      completedChapters,
      totalChapters,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Error fetching progress",
    });
  }
};

export const getChapterProgress = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const userId = req.user.id; // Get from authenticated user

    const progress = await UserProgress.findOne({
      where: { userId, courseId, chapterId },
    });

    if (!progress) {
      return res.json({
        success: true,
        watchedDuration: 0,
        totalDuration: 0,
        percentage: 0,
        isCompleted: false,
      });
    }

    const percentage =
      progress.totalDuration > 0
        ? (progress.watchedDuration / progress.totalDuration) * 100
        : 0;

    res.json({
      success: true,
      watchedDuration: progress.watchedDuration,
      totalDuration: progress.totalDuration,
      percentage: percentage.toFixed(2),
      isCompleted: progress.isCompleted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Error fetching chapter progress",
    });
  }
};

export const createCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const course = await courseById(courseId);
    if (!course) {
      return next(
        new AppError({
          status: 404,
          message: "Course not found",
        })
      );
    }

    const user = await getProfile(userId);
    if (!user) {
      return next(
        new AppError({
          status: 404,
          message: "User not found",
        })
      );
    }

    const filePath = await generateCertificate(course, user);

    // Read file and convert to base64
    const pdfBuffer = fs.readFileSync(filePath);
    const base64PDF = pdfBuffer.toString("base64");

    res.status(200).json({
      success: true,
      message: "Certificate generated successfully",
      data: {
        certificate: base64PDF,
        fileName: `certificate_${user.name}_${course.title}.pdf`,
      },
    });

    // Optional: Delete the file after reading
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });
  } catch (err) {
    return next(
      new AppError({
        status: 400,
        message: err.message || "Failed to create certificate",
      })
    );
  }
};

const generateCertificateId = (userId, courseId) => {
  const year = new Date().getFullYear();
  const userPart = String(userId).padStart(6, "0");
  const coursePart = String(courseId)
    .substring(0, 8)
    .replace(/-/g, "")
    .toUpperCase();
  return `CERT-${year}-${userPart}-${coursePart}`;
};

// 1. Issue Certificate (called when user completes course)
export const issueCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    console.log("Issuing certificate for user:", userId, "course:", courseId);

    // 🧩 1️⃣ Check if certificate already exists

    // 🧩 2️⃣ Get course and user data
    const course = await courseById(courseId);
    if (!course) {
      return next(new AppError({ status: 404, message: "Course not found" }));
    }

    const user = await getProfile(userId);
    if (!user) {
      return next(new AppError({ status: 404, message: "User not found" }));
    }
    const existingCert = await Certificate.findOne({
      where: { userId, courseId, status: "active" },
    });

    if (existingCert) {
      return res.status(200).json({
        success: true,
        message: "Certificate already issued",
        data: {
          certificateId: existingCert.certificateId,
          verificationUrl: existingCert.verificationUrl,
        },
      });
    }

    // 🧩 3️⃣ Calculate progress & threshold
    const { completionPercentage, totalHours } = await calculateCourseProgress(
      userId,
      courseId
    );

    const thresholdPercent = (course.certificateThreshold || 0.8) * 100;

    if (completionPercentage < thresholdPercent) {
      return next(
        new AppError({
          status: 400,
          message: `You must complete at least ${thresholdPercent}% of the course to receive a certificate.`,
        })
      );
    }

    const certificateId = generateCertificateId(userId, courseId);
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/certificate/verify/${certificateId}`;
    const qrCodeData = await generateQRCode(verificationUrl);

    const certificate = await Certificate.create({
      certificateId,
      userId,
      courseId,
      studentName: user.username,
      studentEmail: user.email,
      courseName: course.title,
      courseDescription: course.description,
      instructorName: course.user?.name || "Instructor",
      issueDate: new Date(),
      completionDate: new Date(),
      completionPercentage,
      totalHoursCompleted: totalHours,
      verificationUrl,
      qrCodeData,
      status: "active",
    });

    // 🧩 6️⃣ Send success response
    res.status(201).json({
      success: true,
      message: "Certificate issued successfully",
      data: {
        certificateId: certificate.certificateId,
        verificationUrl: certificate.verificationUrl,
        issueDate: certificate.issueDate,
      },
    });
  } catch (err) {
    return next(
      new AppError({
        status: 400,
        message: err.message || "Failed to issue certificate",
      })
    );
  }
};

// 2. Download Certificate (generates PDF on-demand)
// Backend - keep as is (sending base64 JSON)
export const downloadCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.id;

    const certificate = await Certificate.findOne({
      where: {
        certificateId,
        userId,
        status: "active",
      },
    });

    if (!certificate) {
      return next(
        new AppError({
          status: 404,
          message: "Certificate not found or revoked",
        })
      );
    }

    const pdfBuffer = await generateCertificatePDF({
      certificateId: certificate.certificateId,
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      instructorName: certificate.instructorName,
      completionDate: certificate.completionDate,
      issueDate: certificate.issueDate,
      completionPercentage: certificate.completionPercentage,
      totalHoursCompleted: certificate.totalHoursCompleted,
      verificationUrl: certificate.verificationUrl,
      qrCodeData: certificate.qrCodeData, // base64 string
    });

    await certificate.update({
      downloadCount: certificate.downloadCount + 1,
      lastDownloadedAt: new Date(),
    });

    const base64PDF = pdfBuffer.toString("base64");

    res.status(200).json({
      success: true,
      message: "Certificate generated successfully",
      data: {
        certificate: base64PDF,
        fileName: `certificate_${certificate.studentName.replace(
          /\s+/g,
          "_"
        )}_${certificate.courseName.replace(/\s+/g, "_")}.pdf`,
        certificateId: certificate.certificateId,
        verificationUrl: certificate.verificationUrl,
      },
    });
  } catch (err) {
    return next(
      new AppError({
        status: 500,
        message: err.message || "Failed to download certificate",
      })
    );
  }
};
// 3. Get User's Certificate for a Course
export const getCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const certificate = await Certificate.findOne({
      where: {
        userId,
        courseId,
        status: "active",
      },
      include: [
        {
          model: CertificateShare,
          as: "shares",
        },
      ],
    });

    if (!certificate) {
      return res.status(200).json({
        success: true,
        message: "Certificate not issued yet",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (err) {
    return next(
      new AppError({
        status: 400,
        message: err.message || "Failed to fetch certificate",
      })
    );
  }
};

// 4. Verify Certificate (Public endpoint - no auth required)
export const verifyCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({
      where: { certificateId },
      attributes: [
        "certificateId",
        "studentName",
        "courseName",
        "issueDate",
        "completionDate",
        "status",
        "instructorName",
        "completionPercentage",
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
        valid: false,
      });
    }

    if (certificate.status !== "active") {
      return res.status(200).json({
        success: false,
        message: `Certificate ${certificate.status}`,
        valid: false,
      });
    }

    // Update verification count
    await Certificate.increment("verificationCount", {
      where: { certificateId },
    });

    res.status(200).json({
      success: true,
      valid: true,
      message: "Certificate is valid",
      data: certificate,
    });
  } catch (err) {
    return next(
      new AppError({
        status: 400,
        message: err.message || "Failed to verify certificate",
      })
    );
  }
};

// 5. Track Certificate Share
export const shareCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const { platform, shareUrl } = req.body;
    const userId = req.user.id;

    const certificate = await Certificate.findOne({
      where: { certificateId, userId, status: "active" },
    });

    if (!certificate) {
      return next(
        new AppError({
          status: 404,
          message: "Certificate not found",
        })
      );
    }

    // Track share
    await CertificateShare.create({
      certificateId: certificate.id,
      platform,
      shareUrl,
    });

    // Update share count
    await certificate.update({
      shareCount: certificate.shareCount + 1,
    });

    res.status(200).json({
      success: true,
      message: "Certificate share tracked",
    });
  } catch (err) {
    return next(
      new AppError({
        status: 400,
        message: err.message || "Failed to track share",
      })
    );
  }
};

export const getUserCertificates = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const certificates = await Certificate.findAll({
      where: { userId, status: "active" },
      order: [["issueDate", "DESC"]],
      include: [
        {
          model: CertificateShare,
          as: "shares",
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (err) {
    return next(
      new AppError({
        status: 400,
        message: err.message || "Failed to fetch certificates",
      })
    );
  }
};
