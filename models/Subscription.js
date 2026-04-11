// models/Subscription.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const Subscription = sequelize.define("subscription", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  planId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startsAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endsAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

export default Subscription;
    