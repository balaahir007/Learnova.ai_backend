import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB";

const whiteboard = sequelize.define('whiteboard', {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true,    
    primaryKey: true
    },
    spaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'study_spaces',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    createdBy: {        
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    boardData: {
        type: DataTypes.JSONB,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'whiteboard',
    tableName: 'whiteboards'
});
export default whiteboard;