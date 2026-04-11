import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
import User from "./userSchema.js";
import Hackathon from "./Hackathon.js";
import HackathonTeam from "./HackathonTeam.js";

const Registration = sequelize.define('HackathonRegistrations', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  hackathonId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Hackathon,
      key: 'id'
    }
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: HackathonTeam,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'waitlist', 'cancelled'),
    defaultValue: 'pending'
  },
  answers: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  checkInStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  checkInTime: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
      tableName: "HackathonRegistrations",  // <<< FIX

  indexes: [
    { fields: ['userId', 'hackathonId'], unique: true },
    { fields: ['hackathonId'] },
    { fields: ['status'] }
  ]
});

export default Registration;
