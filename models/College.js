import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js"; // Make sure you have your Sequelize connection setup

const College = sequelize.define("College", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("Private", "Government", "Autonomous"),
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  departments: {
    type: DataTypes.STRING, // store as comma-separated string or JSON array
    allowNull: false,
  },
}, {
  tableName: "colleges",
  timestamps: true,
});

export default College;
