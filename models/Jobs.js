import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
import User from "./userSchema.js";
import Company from "./company.js";

const Job = sequelize.define(
  "Job",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue : DataTypes.UUIDV4,
      primaryKey: true,
    },
    recruiterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    title: { type: DataTypes.STRING, allowNull: false },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    location: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM(
        "full-time",
        "part-time",
        "internship",
        "contract",
        "remote"
      ),
      defaultValue: "full-time",
    },
    salary: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    requirements: { type: DataTypes.TEXT },
    responsibilities: { type: DataTypes.TEXT },
    benefits: { type: DataTypes.TEXT },
    tags: { type: DataTypes.JSON, defaultValue: [] },
    experience: { type: DataTypes.STRING },
    positions: { type: DataTypes.INTEGER, defaultValue: 1 },
    status: {
      type: DataTypes.ENUM("open", "closed", "paused"),
      defaultValue: "open",
    },
    deadline: { type: DataTypes.DATE },
    applicationsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    category: { type: DataTypes.STRING },
    remote: { type: DataTypes.BOOLEAN, defaultValue: false },
    educationLevel: { type: DataTypes.STRING },
    skillsRequired: { type: DataTypes.JSON, defaultValue: [] },
        // ⭐ New Field: External Apply Link
        applyUrl: DataTypes.STRING, // must match column name in pgAdmin


  },
  {
    tableName: "jobs",
    freezeTableName: true,
    timestamps: true,
  }
);

export default Job;
