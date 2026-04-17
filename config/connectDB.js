import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const isProduction = !!process.env.PRODUCTION_DATABASE_URL;

const databaseUrl = isProduction 
  ? process.env.PRODUCTION_DATABASE_URL 
  : process.env.LOCAL_DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ FATAL: No database URL found!");
  console.error("   PRODUCTION_DATABASE_URL:", process.env.PRODUCTION_DATABASE_URL ? "✓" : "✗");
  console.error("   LOCAL_DATABASE_URL:", process.env.LOCAL_DATABASE_URL ? "✓" : "✗");
  process.exit(1);
}

console.log(
  "Connecting to PostgreSQL...",
  isProduction ? "Using PRODUCTION_DATABASE_URL" : "Using LOCAL_DATABASE_URL"
);

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: false,
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

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