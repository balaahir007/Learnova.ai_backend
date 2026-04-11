// models/Application.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
import User from "./userSchema.js";
import Job from "./Jobs.js";

const Application = sequelize.define(
  "Application",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
      onDelete: "CASCADE",
    },

    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Job, key: "id" },
      onDelete: "CASCADE",
    },

    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    resume: { type: DataTypes.STRING, allowNull: true },
    coverLetter: { type: DataTypes.TEXT, allowNull: true },
    experience: { type: DataTypes.TEXT, allowNull: true },
    yearsOfExperience: { type: DataTypes.INTEGER, allowNull: true },
    currentCompany: { type: DataTypes.STRING, allowNull: true },
    currentDesignation: { type: DataTypes.STRING, allowNull: true },
    linkedinProfile: { type: DataTypes.STRING, allowNull: true },
    portfolioUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    location: { type: DataTypes.STRING, allowNull: true },
    education: { type: DataTypes.STRING, allowNull: true },
    availability: { type: DataTypes.STRING, defaultValue: "immediate" },
    salaryExpectation: { type: DataTypes.STRING, allowNull: true },
    expectedJoiningDate: { type: DataTypes.DATE, allowNull: true },
    applicationSource: { type: DataTypes.STRING, allowNull: true },

    status: {
      type: DataTypes.ENUM(
        "applied",
        "reviewed",
        "shortlisted",
        "rejected",
        "hired"
      ),
      defaultValue: "applied",
    },

    notes: { type: DataTypes.TEXT, allowNull: true },
    appliedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    timestamps: true,
  }
);

export default Application;
