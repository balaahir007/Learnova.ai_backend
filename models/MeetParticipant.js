import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
import StudySpaceMeet from "./StudySpaceMeet.js";
import User from "./userSchema.js";

const MeetParticipant = sequelize.define("MeetParticipant", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  meetId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: StudySpaceMeet,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references : {
      model : User,
      key : 'id'
    }
  },
    joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "MeetParticipant",
  timestamps: true,
});

MeetParticipant.belongsTo(User, { foreignKey: "userId", as: "user" });
StudySpaceMeet.hasMany(MeetParticipant, { foreignKey: "meetId", as: "participants" });
MeetParticipant.belongsTo(StudySpaceMeet, { foreignKey: "meetId" });

export default MeetParticipant;
