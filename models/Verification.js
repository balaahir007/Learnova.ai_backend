import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const Verification = sequelize.define(
  "Verification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    identifier: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Email or phone number",
    },
    channel: {
      type: DataTypes.ENUM("email", "sms"),
      allowNull: false,
      defaultValue: "email",
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("signup", "login", "password_reset", "2fa"),
      allowNull: false,
      defaultValue: "signup",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "verifications",
    timestamps: true,
    indexes: [{ fields: ["identifier", "type", "channel"] }],
  }
);

export default Verification;
