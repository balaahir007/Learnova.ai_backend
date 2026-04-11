import { sequelize } from "../config/connectDB.js";
import { DataTypes } from "sequelize";
import User from "./userSchema.js";

const Session = sequelize.define("session", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATEONLY, // only date
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME, // only time
    allowNull: false,
  },
  gmeetLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  whatsappLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  selectedGroups: {
    type: DataTypes.ARRAY(DataTypes.STRING), // Array of strings
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "pending",
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
});

export default Session;
