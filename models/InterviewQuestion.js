import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
const InterviewQuestion = sequelize.define("InterviewQuestion", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});
export default InterviewQuestion;