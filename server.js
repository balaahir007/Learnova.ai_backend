  import dotenv from "dotenv";
  dotenv.config();
  import express from "express";
  import cors from "cors";
  import cookieParser from "cookie-parser";
  import { ExpressPeerServer } from "peer";
  import path from "path";
  import { fileURLToPath } from "url";
  import fs from "fs";
  import mainRoutes from "./routes/index.js";
  import setupAssociations from "./models/associations.js";
  import { errorHandler } from "./middleware/errorHandler.js";
  import { initSocket } from "./socket-io.js";
  import User from "./models/userSchema.js";
  import StudySpace from "./models/studySpaceModel.js";
  import { initJoinRequestModel } from "./models/studySpacejoinRequest.js";
  import connectDB, { sequelize } from "./config/connectDB.js";
  import Verification from "./models/Verification.js"; // ✅ IMPORTANT

  console.log(
    "🔍 DATABASE_URL loaded:",
    process.env.LOCAL_DATABASE_URL ? "✅ Yes" : "❌ No"
  );

  const app = express();

  // Create HTTP + Socket.io server
  const server = initSocket(app);

  // CORS setup

  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: ["http://localhost:5173", "https://morrowgen.onrender.com","https://learnova-ai-i9hw.onrender.com", "https://learnova-ai-backend.onrender.com"],
      credentials: true,
    })
  );

  initJoinRequestModel(User, StudySpace);
  setupAssociations();

  // PeerJS server
  const peerServer = ExpressPeerServer(server, {
    path: "/peerjs",
    allow_discovery: true,
  });
  app.use("/peerjs", peerServer);

  // API routes MUST come before static files
  app.use("/api", mainRoutes);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientDistPath = path.join(__dirname, "../frontend/dist");

  if (fs.existsSync(clientDistPath)) {
    // Serve all static files from React build
    app.use(express.static(clientDistPath));

    // Fallback for SPA routing (React Router)
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  } else {
    console.warn("⚠️ Frontend build not found at:", clientDistPath);
  }
  // Error handler (MUST be last)
  app.use(errorHandler);

  console.log("Connected to DB:", sequelize.getDatabaseName());
  console.log("Host:", sequelize.options.host);
  console.log("Port:", sequelize.options.port);
  console.log("Dialect:", sequelize.getDialect());
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, async () => {
    try {
      await connectDB();
      // Commenting out sequelize.sync for now - it can cause timeouts on Render
      // await sequelize.sync({ alter : true });

      console.log(`✅ Server running on port ${PORT}`);
    } catch (error) {
      console.error("❌ Error starting server:", error.message);
      process.exit(1);
    }
  });
