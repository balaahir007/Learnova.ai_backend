import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
import User from "./userSchema.js";

const StudySpaceMeet = sequelize.define(
  "StudySpaceMeet",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    spaceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,

    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("completed", "ongoing"),
      defaultValue: "ongoing",
    },
  },
  {
    tableName: "StudySpaceMeet",
    timestamps: true,
  }
);

export default StudySpaceMeet;
