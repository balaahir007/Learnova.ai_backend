// models/Group.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/connectDB.js';

const Group = sequelize.define('groups', {
  groupName: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

export default Group;