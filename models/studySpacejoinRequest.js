// models/JoinRequest.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const JoinRequest = sequelize.define("JoinRequest", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  spaceId: { type: DataTypes.STRING },
  userId: { type: DataTypes.INTEGER },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
});

export const initJoinRequestModel = (User, StudySpace) => {
  JoinRequest.belongsTo(User, {
    as: "user",
    foreignKey: "userId",
  });

  JoinRequest.belongsTo(StudySpace, {
    as: "studySpace",
    foreignKey: "spaceId",
  });
};

export default JoinRequest;
