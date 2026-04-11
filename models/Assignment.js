import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";
import User from "./userSchema.js";
import { Course } from "./Course.js";

// Question model
const Question = sequelize.define(
  "Question",
  {
    questionText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    questionType: {
      type: DataTypes.ENUM(
        "multiple-choice",
        "true-false",
        "short-answer",
        "essay"
      ),
      allowNull: false,
    },
    options: {
      type: DataTypes.JSONB, // Array of objects { text: string, isCorrect: boolean }
      allowNull: true,
    },
    correctAnswer: {
      type: DataTypes.STRING, // For true-false or short-answer
      allowNull: true,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    order: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: true,
  }
);

// Assignment model
const Assignment = sequelize.define(
  "Assignment",
  {
    id: {
      type: DataTypes.UUID,
      autoIncrement: true,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "courses",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    passingScore: {
      type: DataTypes.INTEGER,
      defaultValue: 70,
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 60,
    },
    dueDate: {
      type: DataTypes.DATE,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
  },
  {
    timestamps: true,
    freezeTableName: true,
    tableName: "Assignments",
  }
);

// Submission model
const Submission = sequelize.define(
  "Submission",
  {
    assignmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Assignment, key: "id" },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Course, key: "id" },
    },
    answers: {
      type: DataTypes.JSONB, // Array of { questionId, answer, isCorrect, pointsEarned }
      allowNull: true,
    },
    totalScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    percentage: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    isPassed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("in-progress", "submitted", "graded"),
      defaultValue: "in-progress",
    },
    startedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    submittedAt: {
      type: DataTypes.DATE,
    },
    timeSpent: {
      type: DataTypes.INTEGER, // in seconds
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    timestamps: true,
  }
);

Assignment.hasMany(Question, { foreignKey: "assignmentId", as: "questions" });
Question.belongsTo(Assignment, { foreignKey: "assignmentId" });

Assignment.belongsTo(Course, { foreignKey: "courseId" });
Course.hasMany(Assignment, { foreignKey: "courseId" });

Assignment.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(Assignment, { foreignKey: "createdBy", as: "assignmentsCreated" });

Submission.belongsTo(Assignment, { foreignKey: "assignmentId" });
Assignment.hasMany(Submission, { foreignKey: "assignmentId" });

Submission.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Submission, { foreignKey: "userId" });

Submission.belongsTo(Course, { foreignKey: "courseId" });
Course.hasMany(Submission, { foreignKey: "courseId" });

export { Assignment, Question, Submission };
