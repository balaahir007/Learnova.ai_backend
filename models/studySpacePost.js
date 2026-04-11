import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectDB.js";

const Post = sequelize.define("Post", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  authorId: { type: DataTypes.INTEGER, allowNull: false },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  visible: {
    type: DataTypes.ENUM("Everyone", "Onlyme"),
    defaultValue: "Everyone",
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  spaceId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  likes: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
  },
  shares: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
  },
});

export default Post;
