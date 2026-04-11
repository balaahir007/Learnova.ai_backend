import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js"; // shared instance

export const WebsiteCategories = {
  JOB: "job",
  NEWS: "news",
  POST: "post",
  COMPETITION: "competition",
  OTHER: "other",
};

const Website = sequelize.define(
  "Website",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: WebsiteCategories.OTHER,
    },
    scrapingConfig: {
      type: DataTypes.JSONB, 
      allowNull: true,
    },
    lastScraped: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Website", // ✅ keeps DB table lowercase & plural-safe
    timestamps: true, // ✅ createdAt & updatedAt
    underscored: true, // ✅ snake_case column names
  }
);

export default Website;
