import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const StudySpaceChat = sequelize.define("StudySpaceChat", {
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  spaceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default StudySpaceChat;
