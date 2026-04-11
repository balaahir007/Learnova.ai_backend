import { Op } from "sequelize";
import Application from "../models/JobApplication.js";
import Job from "../models/Jobs.js";
import User from "../models/userSchema.js";

// ✅ Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      resume,
      coverLetter,
      experience,
      yearsOfExperience,
      currentCompany,
      currentDesignation,
      linkedinProfile,
      portfolioUrl,
      education,
      availability,
      salaryExpectation,
      expectedJoiningDate,
      applicationSource,
      notes,
      location,
      jobId,
    } = req.body;
    const userId = req.user.id;

    // basic validations
    if (!fullName || !email || !phone || !jobId || !userId) {
      return res.status(400).json({ message: "Required fields missing." });
    }
    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ message: "Job not found." });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    console.log("user", user);
    const existingMobileNumber = await Application.findOne({
      where: {
        phone,
        userId: { [Op.ne]: userId }, // check for phone used by other users
      },
    });

    if (existingMobileNumber) {
      return res.status(400).json({
        message: "This phone number is already used by another user.",
      });
    }
    if (!user.mobileNumber) user.mobileNumber = phone;
    if (!user.linkedinUrl) user.linkedinUrl = linkedinProfile;
    if (!user.portfolioUrl) user.portfolioUrl = portfolioUrl || null;
    if (!user.location) user.location = location || null;

    await user.save();
    const existingApp = await Application.findOne({ where: { jobId, userId } });
    if (existingApp)
      return res
        .status(400)
        .json({ message: "You already applied for this job." });

    const newApplication = await Application.create({
      fullName,
      email,
      phone,
      resume,
      coverLetter,
      experience,
      yearsOfExperience,
      currentCompany,
      currentDesignation,
      linkedinProfile,
      portfolioUrl,
      location,
      education,
      availability,
      salaryExpectation,
      expectedJoiningDate,
      applicationSource,
      notes,
      jobId,
      userId,
    });

    return res.status(201).json({
      message: "Application submitted successfully!",
      application: newApplication,
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get all applications (Admin or Recruiter)
export const getAllApplications = async (req, res) => {
  const recruiterId = req.user.id;
  try {
    const applications = await Job.findAll({
      where: { recruiterId }, // ✅ condition
      include: [
        {
          model: Application,
          include: [
            {
              model: User,
              attributes: ["id", "username", "email"], // optional
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(applications);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching applications", error: error.message });
  }
};

// ✅ Get applications by Job ID (for recruiter)
export const getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.findAll({
      where: { jobId },
      include: [{ model: User, as: "User" }],
    });

    res.status(200).json(applications);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching applications", error: error.message });
  }
};

// ✅ Get applications by User ID (for job seeker)
export const getApplicationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const applications = await Application.findAll({
      where: { userId },
      include: [{ model: Job, as: "Job" }],
    });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user applications",
      error: error.message,
    });
  }
};

// ✅ Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findByPk(id);
    if (!application)
      return res.status(404).json({ message: "Application not found." });

    application.status = status;
    await application.save();

    res
      .status(200)
      .json({ message: "Status updated successfully", application });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating status", error: error.message });
  }
};

// ✅ Delete application
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Application.destroy({ where: { id } });
    if (!deleted)
      return res.status(404).json({ message: "Application not found." });

    res.status(200).json({ message: "Application deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting application", error: error.message });
  }
};
