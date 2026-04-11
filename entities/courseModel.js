import { Attachments, Course, UserProgress } from "../models/Course.js";
import User from "../models/userSchema.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const createCourse = async (title, userId) => {
  try {
    const course = await Course.create({
      title,
      userId, // Must be provided to avoid NULL constraint error
    });
    return course;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const fetchAllCourses = async () => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });
    return courses;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const fetchAllPublishedCourses = async () => {
  try {
    const courses = await Course.findAll({
      where: { isPublished: true },
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });
    return courses;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const courseById = async (id) => {
  try {
    const course = await Course.findOne({
      where: { id },
      include: [{ model: Attachments, as: "attachments" }],
    });
    return course;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateCourseById = async (id, updates) => {
  try {
    const [affectedRows] = await Course.update(updates, { where: { id } });
    console.log("Affected Rows:", affectedRows);
    return affectedRows; // ✅ MUST RETURN
  } catch (error) {
    throw new Error(error.message);
  }
};

export const uploadChapter = async (courseId, chapter) => {
  try {
    const course = await courseById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }
    const newAttachMent = await Attachments.create({
      ...chapter,
      courseId: course.id,
      attachMentUrl: chapter.videoUrl,
    });
    console.log("attachMents : ", newAttachMent);
    return newAttachMent;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const attachMentsById = async (courseId, userId) => {
  try {
    const attachMents = await Attachments.findAll({
      where: {
        courseId: courseId,
      },
      attributes: ["title", "order", "id"],
      order: [["order", "ASC"]],
      include: {
        model: UserProgress,
        as: "userProgress",
        attributes: ["watchedDuration", "totalDuration", "isCompleted"],
        where: { userId: userId },
        required: false,
      },
    });
    console.log("attachMents : ", attachMents);
    if (!attachMents) {
      throw new Error("AttachMents not found");
    }
    return attachMents;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const chapterById = async (chapterId) => {
  try {
    const attachMents = await Attachments.findOne({
      where: {
        id: chapterId,
      },
      include: {
        model: UserProgress,
        as: "userProgress",
        attributes: ["watchedDuration", "totalDuration", "isCompleted"],
      },
    });
    if (!attachMents) {
      throw new Error("AttachMent not found");
    }
    return attachMents;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const reOrder = async (courseId, chapterId, order) => {
  try {
    const chapter = await Attachments.findOne({
      where: {
        id: chapterId,
        courseId: courseId,
      },
    });

    if (!chapter) {
      throw new Error("Chapter not found");
    }

    chapter.order = order;
    await chapter.save();

    console.log(`✅ Chapter ${chapterId} order updated to ${order}`);
    return chapter;
  } catch (error) {
    console.error("Error updating chapter order:", error);
    throw error;
  }
};
export const calculateCourseProgress = async (userId, courseId) => {
  // 1️⃣ Fetch all progress records for this user + course
  const progress = await UserProgress.findAll({
    where: { userId, courseId },
    attributes: ["watchedDuration", "totalDuration"],
  });

  // 2️⃣ If no progress, return 0
  if (progress.length === 0) {
    return { 
      completionPercentage: 0, 
      totalHours: 0, 
      threshold: 0.8 * 100, 
      eligibleForCertificate: false 
    };
  }

  // 3️⃣ Calculate total watch progress percentage across chapters
  const totalWatched = progress.reduce((sum, p) => sum + (p.watchedDuration || 0), 0);
  const totalDuration = progress.reduce((sum, p) => sum + (p.totalDuration || 0), 0);

  // Avoid divide-by-zero
  const completionPercentage = totalDuration > 0 
    ? (totalWatched / totalDuration) * 100 
    : 0;

  // 4️⃣ Convert total watched time into hours
  const totalHours = (totalWatched / 3600).toFixed(2); // since watchedDuration is in seconds

  // 5️⃣ Fetch course threshold (default 80%)
  const course = await Course.findByPk(courseId, {
    attributes: ["certificateThreshold"],
  });
  const threshold = (course?.certificateThreshold || 0.8) * 100;

  // 6️⃣ Check if eligible for certificate
  const eligibleForCertificate = completionPercentage >= threshold;

  // 7️⃣ Return structured result
  return { 
    completionPercentage: parseFloat(completionPercentage.toFixed(2)), 
    totalHours, 
    threshold, 
    eligibleForCertificate 
  };
};

export const generateCertificate = async (course, user) => {
  try {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const dirPath = path.join("certificates");
    const filePath = path.join(
      dirPath,
      `certificate_${user.id}_${course.id}.pdf`
    );

    // ✅ Ensure 'certificates' folder exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const centerX = pageWidth / 2;

    // 🎨 Background gradient effect (simulated with rectangles)
    doc.rect(0, 0, pageWidth, pageHeight).fill("#FFFFFF");

    // 🖼️ Double border
    const borderMargin = 40;
    const borderMargin2 = 50;

    // Outer border
    doc
      .rect(
        borderMargin,
        borderMargin,
        pageWidth - borderMargin * 2,
        pageHeight - borderMargin * 2
      )
      .lineWidth(3)
      .stroke("#0097B2");

    // Inner border
    doc
      .rect(
        borderMargin2,
        borderMargin2,
        pageWidth - borderMargin2 * 2,
        pageHeight - borderMargin2 * 2
      )
      .lineWidth(3)
      .stroke("#0097B2");

    // 🔲 Corner decorations
    const cornerSize = 30;
    const cornerOffset = 60;

    // Top-left corner
    doc
      .moveTo(cornerOffset, cornerOffset + cornerSize)
      .lineTo(cornerOffset, cornerOffset)
      .lineTo(cornerOffset + cornerSize, cornerOffset)
      .lineWidth(4)
      .stroke("#00B2A9");

    // Top-right corner
    doc
      .moveTo(pageWidth - cornerOffset - cornerSize, cornerOffset)
      .lineTo(pageWidth - cornerOffset, cornerOffset)
      .lineTo(pageWidth - cornerOffset, cornerOffset + cornerSize)
      .lineWidth(4)
      .stroke("#00B2A9");

    // Bottom-left corner
    doc
      .moveTo(cornerOffset, pageHeight - cornerOffset - cornerSize)
      .lineTo(cornerOffset, pageHeight - cornerOffset)
      .lineTo(cornerOffset + cornerSize, pageHeight - cornerOffset)
      .lineWidth(4)
      .stroke("#00B2A9");

    // Bottom-right corner
    doc
      .moveTo(pageWidth - cornerOffset - cornerSize, pageHeight - cornerOffset)
      .lineTo(pageWidth - cornerOffset, pageHeight - cornerOffset)
      .lineTo(pageWidth - cornerOffset, pageHeight - cornerOffset - cornerSize)
      .lineWidth(4)
      .stroke("#00B2A9");

    // 🏆 Award icon (circle with star/ribbon shape)
    const iconY = 120;
    doc.circle(centerX, iconY, 35).fillAndStroke("#0097B2", "#00B2A9");
    doc.circle(centerX, iconY, 30).fill("#FFFFFF");

    // Star shape in the center
    doc
      .polygon(
        [centerX, iconY - 15],
        [centerX + 5, iconY - 5],
        [centerX + 15, iconY - 5],
        [centerX + 7, iconY + 3],
        [centerX + 10, iconY + 13],
        [centerX, iconY + 8],
        [centerX - 10, iconY + 13],
        [centerX - 7, iconY + 3],
        [centerX - 15, iconY - 5],
        [centerX - 5, iconY - 5]
      )
      .fill("#0097B2");

    // 📜 Certificate text content
    let currentY = 200;

    // "Certificate of Completion"
    doc
      .fontSize(36)
      .font("Helvetica-Bold")
      .fillColor("#333333")
      .text("Certificate of Completion", 0, currentY, {
        align: "center",
        width: pageWidth,
      });

    currentY += 60;

    // "This is to certify that"
    doc
      .fontSize(16)
      .font("Helvetica")
      .fillColor("#666666")
      .text("This is to certify that", 0, currentY, {
        align: "center",
        width: pageWidth,
      });

    currentY += 35;

    // User name
    doc
      .fontSize(32)
      .font("Helvetica-Bold")
      .fillColor("#0097B2")
      .text(user.username || "John Doe", 0, currentY, {
        align: "center",
        width: pageWidth,
      });

    currentY += 50;

    // "has successfully completed"
    doc
      .fontSize(16)
      .font("Helvetica")
      .fillColor("#666666")
      .text("has successfully completed", 0, currentY, {
        align: "center",
        width: pageWidth,
      });

    currentY += 35;

    // Course name
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#333333")
      .text(course.title || "Complete Web Development Bootcamp", 0, currentY, {
        align: "center",
        width: pageWidth,
      });

    // 📝 Signature lines
    const signatureY = pageHeight - 140;
    const signatureWidth = 150;
    const leftSignatureX = centerX - 200;
    const rightSignatureX = centerX + 50;

    // Left signature line (Instructor)
    doc
      .moveTo(leftSignatureX, signatureY)
      .lineTo(leftSignatureX + signatureWidth, signatureY)
      .lineWidth(1.5)
      .stroke("#999999");

    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#666666")
      .text("Instructor Signature", leftSignatureX, signatureY + 10, {
        width: signatureWidth,
        align: "center",
      });

    doc
      .fontSize(9)
      .fillColor("#999999")
      .text("Dr. Sarah Johnson", leftSignatureX, signatureY + 28, {
        width: signatureWidth,
        align: "center",
      });

    // Right signature line (Date)
    doc
      .moveTo(rightSignatureX, signatureY)
      .lineTo(rightSignatureX + signatureWidth, signatureY)
      .lineWidth(1.5)
      .stroke("#999999");

    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#666666")
      .text("Date of Completion", rightSignatureX, signatureY + 10, {
        width: signatureWidth,
        align: "center",
      });

    const completionDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc
      .fontSize(9)
      .fillColor("#999999")
      .text(completionDate, rightSignatureX, signatureY + 28, {
        width: signatureWidth,
        align: "center",
      });

    // 🔖 Certificate ID at bottom
    const certId = `CERT-${new Date().getFullYear()}-${String(user.id).padStart(
      6,
      "0"
    )}${String(course.id).padStart(4, "0")}`;
    doc
      .fontSize(8)
      .fillColor("#999999")
      .text(`Certificate ID: ${certId}`, 0, pageHeight - 70, {
        align: "center",
        width: pageWidth,
      });

    doc.end();

    // ✅ Wait for file writing to finish
    await new Promise((resolve) => stream.on("finish", resolve));

    // 📂 Return file path
    return filePath;
  } catch (error) {
    throw new Error(error.message);
  }
};
