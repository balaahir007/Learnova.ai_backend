import { sequelize } from "../config/connectDB.js";
import { DataTypes } from "sequelize";

const StudySpace = sequelize.define(
  "studySpaces",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    goal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    techSkills: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    members: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
    visibility: {
      type: DataTypes.ENUM("public", "private"),
      defaultValue: "private",
    },
    inviteCode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    rules: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    meetMaxParticipants: {
      type: DataTypes.INTEGER,
      defaultValue: 50, // limit of 50 participants
    },
    maxMeet : {
      type : DataTypes.INTEGER,
      defaultValue : 1
    }
  },
  { timestamps: true }
);

export default StudySpace;
