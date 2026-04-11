import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import { sequelize } from "../config/connectDB.js";


const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement : true,
    primaryKey: true
  },

  username: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true, len: [2, 50] }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [6, 100] }
  },

  // From your original model
  uniqueId: {
    type: DataTypes.STRING,
    unique: true
  },
  mobileNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    validate: {
      is: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
    }
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  planId: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Optional info
  college: {
    type: DataTypes.STRING,
    allowNull: true
  },
  graduationYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 2020, max: 2035 }
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: { len: [0, 500] }
  },
  portfolioUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  githubUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isUrl: true }
  },
  linkedinUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isUrl: true }
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // Roles and permissions
  role: {
    type: DataTypes.ENUM('user', 'organizer', 'teacher', 'mentor', 'sponsor', 'admin','recruiter'),
    defaultValue: 'user',
    allowNull: false
  },

  // Organization or expertise
  organizationName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  organizationWebsite: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isUrl: true }
  },
  expertise: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },

  // Account status
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // Reset
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // Preferences
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      emailNotifications: true,
      smsNotifications: false,
      newsletter: true
    }
  },

  // Stats
  hackathonsParticipated: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hackathonsWon: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalWinnings: {
    type: DataTypes.STRING,
    defaultValue: '₹0'
  }
}, {
  timestamps: true,
  paranoid: true,
  hooks: {
    beforeCreate: async (user) => {
      // Generate uniqueId
      const randomString = Math.random().toString(36).substring(2, 7);
      user.uniqueId = `Morrow_Gen_${randomString}`;

      // Hash password
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  },
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['isVerified'] },
    { fields: ['isActive'] }
  ]
});


export default User;
