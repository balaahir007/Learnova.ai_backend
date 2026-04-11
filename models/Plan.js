import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const Plan = sequelize.define("plans", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  max_allowed_groups: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  max_allowed_members_per_group: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  max_whiteboards: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  allow_screen_sharing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false,
  },
  duration_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'plans', 
  underscored: true,  
  timestamps: false,   
});

export default Plan;