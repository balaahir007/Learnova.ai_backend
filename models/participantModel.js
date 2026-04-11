import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
import User from "./userSchema.js";

const Participant = sequelize.define("participants", {
  participantName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  participantNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [10, 15], // adjust as per country/format
    },
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
export default Participant;
