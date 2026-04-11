import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const SavedItem = sequelize.define(
  "SavedItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Either a job or a hackathon will be saved
    itemType: {
      type: DataTypes.ENUM("job", "hackathon"),
      allowNull: false,
    },

    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "SavedItems",
    timestamps: true,
  }
);

export default SavedItem;
