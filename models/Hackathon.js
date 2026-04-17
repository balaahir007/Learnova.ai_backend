import { DataTypes } from 'sequelize'
import { sequelize } from '../config/connectDB.js';
import User from './userSchema.js';

const Hackathon = sequelize.define('Hackathon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  longDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bannerImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'open', 'ongoing', 'closed', 'completed'),
    defaultValue: 'draft'
  },
  type: {
    type: DataTypes.ENUM('virtual', 'in-person', 'hybrid'),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  registrationStartDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  registrationDeadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  maxRegistration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  minTeamSize: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  maxTeamSize: {
    type: DataTypes.INTEGER,
    defaultValue: 4
  },
  prizePool: {
    type: DataTypes.STRING,
    allowNull: true
  },
  prizes: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'intermediate'
  },
  themes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  eligibility: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rules: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  judgingCriteria: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  schedule: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  resources: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  sponsors: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  mentors: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  faqs: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  websiteUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  applyUrl: {
  type: DataTypes.STRING,
  allowNull: true
},

  discordUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  slackUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  trending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  registrationCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
    tableName: "Hackathons",   // ADD THIS
  freezeTableName: true,     
  indexes: [
    { fields: ['slug'] },
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['startDate'] },
    { fields: ['featured'] },
    { fields: ['trending'] }
  ]
});

export default Hackathon