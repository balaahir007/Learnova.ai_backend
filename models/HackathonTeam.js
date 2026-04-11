import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
import Hackathon from "./Hackathon.js";
import User from "./userSchema.js";

const HackathonTeam = sequelize.define(
  "HackathonTeam",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // you forgot this
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hackathonId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Hackathon,
        key: "id",
      },
    },

    leaderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    institution: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    judgesFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    members: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    projectName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    projectDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    githubRepo: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    demoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    presentationUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    technologies: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },

    status: {
      type: DataTypes.ENUM("forming", "active", "submitted", "disqualified"),
      defaultValue: "forming",
    },

    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [{ fields: ["hackathonId"] }, { fields: ["leaderId"] }],
  }
);

export default HackathonTeam;
