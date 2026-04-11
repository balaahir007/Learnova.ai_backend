import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
import HackathonTeam from "./HackathonTeam.js";
import Hackathon from "./Hackathon.js";

const HackathonSubmission = sequelize.define('HackathonSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  teamId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: HackathonTeam,
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
  projectTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tagline: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  problemStatement: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  technologies: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  githubRepo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  demoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  presentationUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  screenshots: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected'),
    defaultValue: 'draft'
  },
  scores: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  totalScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  prize: {
    type: DataTypes.STRING,
    allowNull: true
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['hackathonId'] },
    { fields: ['teamId'] },
    { fields: ['status'] }
  ]
});

export default HackathonSubmission;
