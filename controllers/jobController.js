import Company from "../models/company.js";
import Job from "../models/Jobs.js";
import User from "../models/userSchema.js";
import Application from "../models/JobApplication.js";
import { AppError } from "../utils/AppError.js";
import SavedItem from "../models/savedItemModel.js";
import { sequelize } from "../config/connectDB.js";

// Create Job
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      type,
      salary,
      description,
      requirements,
      responsibilities,
      benefits,
      tags,
      experience,
      positions,
      educationLevel,
      deadline,
      remote,
    } = req.body;

    const userId = req.user?.id;
    console.log("user Id : ", userId);
    if (!userId) {
      return next(
        new AppError({
          status: 401,
          errorCode: "UNAUTHORIZED",
          message: "User not authenticated",
        })
      );
    }

    const requiredFields = [
      { value: title, name: "title" },
      { value: location, name: "location" },
      { value: type, name: "type" },
      { value: salary, name: "salary" },
      { value: description, name: "description" },
      { value: requirements, name: "requirements" },
      { value: responsibilities, name: "responsibilities" },
      { value: benefits, name: "benefits" },
      { value: experience, name: "experience" },
      { value: positions, name: "positions" },
      { value: educationLevel, name: "educationLevel" },
      { value: deadline, name: "deadline" },
      { value: tags, name: "tags", isArray: true },
    ];

    const emptyField = requiredFields.find((field) => {
      if (field.isArray) {
        return !Array.isArray(field.value) || field.value.length === 0;
      }
      if (typeof field.value === "string") {
        return !field.value.trim();
      }
      if (typeof field.value === "number") {
        return field.value <= 0;
      }
      return !field.value; // fallback for boolean or undefined
    });

    if (emptyField) {
      throw new Error(`${emptyField.name} is required`);
    }

    const user = await User.findByPk(userId, { include: Company });

    if (!user || !user.companyId) {
      return next(
        new AppError({
          status: 400,
          errorCode: "COMPANY_INFO_REQUIRED",
          message: "User must have a company to create a job",
        })
      );
    }

    console.log("job Data : ", req.body);
    const companyId = user.companyId;
    const data = {
      ...req.body,
      recruiterId: parseInt(userId, 10), // ✅ correct variable
      companyId,
    };

    const job = await Job.create(data);
    res.status(201).json(job);
  } catch (error) {
    return next(
      error instanceof AppError
        ? error
        : new AppError({
            status: 500,
            errorCode: "INTERNAL_SERVER_ERROR",
            message: error.message || "An error occurred while get a Meet.",
          })
    );
  }
};

// Get All Jobs
export const getAllJobs = async (req, res) => {
  const userId = req.user?.id;
  console.log("job is there ...");
  const includeArr = [
    {
      model: Company,
      attributes: ["id", "name", "logo", "location", "description"],
    },
    {
      model: Application,
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
    },
  ];

  if (userId) {
    includeArr.push({
      model: SavedItem,
      as: "SavedItems",
      where: { userId },
      required: false, // left join
    });
  }
  try {
    // Try both table names - check which one exists
    let jobs = await sequelize.query(
      'SELECT * FROM public."Jobs" ORDER BY id DESC LIMIT 100',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // If no results, try lowercase
    if (!jobs || jobs.length === 0) {
      console.log("No jobs found in Jobs table, trying lowercase jobs table");
      jobs = await sequelize.query(
        'SELECT * FROM public."jobs" ORDER BY id DESC LIMIT 100',
        { type: sequelize.QueryTypes.SELECT }
      );
    }
    
    console.log("Jobs count:", jobs?.length || 0);
    console.log("Sample job:", jobs?.[0] || "No jobs found");

    res.status(200).json({
      success: true,
      count: jobs?.length || 0,
      data: jobs || []
    });
  } catch (err) {
    console.error("Error fetching jobs:", err.message);
    res.status(500).json({ error: err.message });
  }
};
export const getAllRecruiterJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobs = await Job.findAll({
      where: {
        recruiterId: userId,
      },
    });
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Job
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findByPk(jobId, {
      include: [
        {
          model: Company,
          attributes: ["id", "name", "logo", "location", "description"],
        },
        {
          model: Application, // include applications for each job
          include: [
            {
              model: User, // include user details for each application
              attributes: ["id", "username", "email"],
            },
          ],
        },
      ],
    });

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    await job.update(req.body);
    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    await job.destroy();
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
