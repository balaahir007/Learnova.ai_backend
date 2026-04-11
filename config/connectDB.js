import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const isRender = !!process.env.RENDER_DATABASE_URL;

const sequelize = new Sequelize(
  isRender ? process.env.RENDER_DATABASE_URL : process.env.LOCAL_DATABASE_URL,
  {
    dialect: "postgres",
    logging: false,
    dialectOptions: isRender
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {}, // EMPTY for localhost, not false
  }
);

 const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL Connected Successfully");
  } catch (error) {
    console.error("❌ PostgreSQL Connection failed:", error);
  }
};

export { sequelize };
export default connectDB;