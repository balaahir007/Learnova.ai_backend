import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
import User from "./userSchema.js";
// GenCourse means : Ai generated course
const GenCourse = sequelize.define("GenCourse", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  modules: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  sourcePrompt: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  generatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  videoSource: {
    type: DataTypes.ENUM('youtube_api', 'youtube_search', 'manual', 'other'),
    allowNull: false,
    defaultValue: 'youtube_search'
  },
  stats: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      totalModules: 0,
      totalLessons: 0,
      estimatedHours: 0,
      difficulty: "Beginner to Intermediate"
    }
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  generatedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    allowNull: false,
    defaultValue: 'draft'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  enrollmentCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 5
    }
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'en'
  },
  prerequisites: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  learningObjectives: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "GenCourse",
  timestamps: true,
  hooks: {
    beforeUpdate: (course) => {
      course.lastUpdated = new Date();
    }
  },
  indexes: [
    {
      fields: ['generatedBy']
    },
    {
      fields: ['status']
    },
    {
      fields: ['category']
    },
    {
      fields: ['isPublic']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Define associations
GenCourse.belongsTo(User, { 
  foreignKey: "generatedBy", 
  as: "creator" 
});

User.hasMany(GenCourse, { 
  foreignKey: "generatedBy", 
  as: "genCourse" 
});


export default GenCourse;