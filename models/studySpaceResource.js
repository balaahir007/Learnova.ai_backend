import { sequelize } from "../config/connectDB.js";
import { DataTypes } from "sequelize";
import User from "./userSchema.js";

const StudySpaceResource = sequelize.define(
  "studySpaceResources",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    studySpaceId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'studySpaces',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resourceType: {
      type: DataTypes.ENUM("document", "video", "link", "image", "audio", "other"),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true, // For uploaded files
    },
    externalUrl: {
      type: DataTypes.STRING,
      allowNull: true, // For external links
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: true, // File size in bytes
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Whether resource is visible to all members
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("active", "archived", "deleted"),
      defaultValue: "active",
    }
  },
  { 
    timestamps: true,
    indexes: [
      {
        fields: ['studySpaceId']
      },
      {
        fields: ['resourceType']
      },
      {
        fields: ['uploadedBy']
      }
    ]
  }
);

export default StudySpaceResource;
