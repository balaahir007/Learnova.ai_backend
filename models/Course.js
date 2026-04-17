import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
import User from "./userSchema.js";

export const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true,
    tableName: "categories",
    indexes: [
      {
        unique: true,
        fields: ["name"],
      },
    ],
  }
);

export const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    level: {
      type: DataTypes.ENUM("Beginner", "Intermediate", "Advanced"),
      defaultValue: "Beginner",
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: "English",
    },
    status: {
      type: DataTypes.ENUM("Draft", "Published"),
      defaultValue: "Draft",
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    enrollCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 0,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },

    title: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    imageUrl: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },

    price: {
      type: DataTypes.FLOAT,
      validate: {
        min: 0,
      },
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    certificateThreshold: {
      type: DataTypes.FLOAT,
      defaultValue: 0.8, // 80% by default
      validate: {
        min: 0,
        max: 1,
      },
    },
  },
  {
    timestamps: true,
    tableName: "courses",
    freezeTableName: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["isPublished"],
      },
    ],
  }
);

export const Attachments = sequelize.define(
  "Attachments",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    isPreview: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    publicId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attachMentUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    timestamps: true,
    tableName: "attachments",
    indexes: [
      {
        fields: ["courseId"],
      },
    ],
  }
);

export const UserProgress = sequelize.define(
  "UserProgress",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "courses", key: "id" },
    },
    chapterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    watchedDuration: {
      type: DataTypes.INTEGER, // in seconds
      defaultValue: 0,
    },
    totalDuration: {
      type: DataTypes.INTEGER, // total video length in seconds
      allowNull: false,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "user_progress",
  }
);

export const Certificate = sequelize.define(
  "Certificate",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    certificateId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      // Format: CERT-2025-USER123-COURSE456
    },

    // References
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
    },

    // Certificate Data (Snapshot at time of issue)
    studentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    studentEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courseDescription: {
      type: DataTypes.TEXT,
    },
    instructorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Dates
    issueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expiryDate: {
      type: DataTypes.DATE,
      // Optional: some certificates expire
    },

    // Performance Metrics
    finalGrade: {
      type: DataTypes.FLOAT,
      validate: {
        min: 0,
        max: 100,
      },
    },
    totalHoursCompleted: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    completionPercentage: {
      type: DataTypes.FLOAT,
      defaultValue: 100,
      validate: {
        min: 0,
        max: 100,
      },
    },

    verificationUrl: {
      type: DataTypes.STRING,
    },
    qrCodeData: {
      type: DataTypes.TEXT,
    },

    // Status
    status: {
      type: DataTypes.ENUM("active", "revoked", "expired"),
      defaultValue: "active",
    },
    revokedAt: {
      type: DataTypes.DATE,
    },
    revokeReason: {
      type: DataTypes.TEXT,
    },

    // Analytics
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastDownloadedAt: {
      type: DataTypes.DATE,
    },
    shareCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    verificationCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "certificates",
    indexes: [
      {
        unique: true,
        fields: ["certificateId"],
      },
      {
        fields: ["userId"],
      },
      {
        fields: ["courseId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["issueDate"],
      },
    ],
  }
);

// Certificate Shares tracking
export const CertificateShare = sequelize.define(
  "CertificateShare",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    certificateId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Certificate,
        key: "id",
      },
    },
    platform: {
      type: DataTypes.ENUM("linkedin", "twitter", "facebook", "email", "other"),
      allowNull: false,
    },
    shareUrl: {
      type: DataTypes.STRING,
    },
    sharedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    tableName: "certificate_shares",
    indexes: [
      {
        fields: ["certificateId"],
      },
      {
        fields: ["platform"],
      },
    ],
  }
);

// Define associations
Certificate.belongsTo(User, { foreignKey: "userId", as: "student" });
Certificate.belongsTo(Course, { foreignKey: "courseId", as: "course" });
Certificate.hasMany(CertificateShare, {
  foreignKey: "certificateId",
  as: "shares",
  onDelete: "CASCADE",
});

CertificateShare.belongsTo(Certificate, {
  foreignKey: "certificateId",
  as: "certificate",
});

User.hasMany(Certificate, { foreignKey: "userId", as: "certificates" });
Course.hasMany(Certificate, { foreignKey: "courseId", as: "certificates" });

// Define associations
Course.belongsTo(User, { foreignKey: "userId", as: "user" });
// Removed: Category association - now using simple category STRING field
Course.hasMany(Attachments, {
  foreignKey: "courseId",
  as: "attachments",
  onDelete: "CASCADE",
});

Attachments.hasMany(UserProgress, {
  foreignKey: "chapterId",
  sourceKey: "id",
  as: "userProgress",
});

UserProgress.belongsTo(Attachments, {
  foreignKey: "chapterId",
  targetKey: "id",
  as: "attachment",
});

// Removed Category.hasMany(Course) - now using simple category STRING field
Attachments.belongsTo(Course, { foreignKey: "courseId", as: "course" });

User.hasMany(Course, { foreignKey: "userId", as: "courses" });
