import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const InterviewSession = sequelize.define("InterviewSession", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("resume", "form"),
    allowNull: false,
  },
  resumeText: {
    type: DataTypes.TEXT,
  },
  formData: {
    type: DataTypes.JSON,
  },
  status: {
    type: DataTypes.ENUM("pending", "ongoing", "completed"),
    defaultValue: "pending",
  },
  startTime: { type: DataTypes.DATE },
  endTime: { type: DataTypes.DATE },
  timeSpent: { type: DataTypes.INTEGER, defaultValue: 0 },
});

export default InterviewSession;
