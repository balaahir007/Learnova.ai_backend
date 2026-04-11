import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const StudySpaceAdmin = sequelize.define('studySpaceAdmins', {
    adminId : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    spaceId  : {
        type : DataTypes.STRING,
        allowNull : false
    }
})
export default StudySpaceAdmin;