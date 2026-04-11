import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB";

const InterviewAnswer = sequelize.define("InterviewAnswer", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  answerText: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});
export default InterviewAnswer;