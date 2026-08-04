import "reflect-metadata";
import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import corsOptions from "./configs/corsconfig";
import AppDataSource from "./configs/ormconfig";

import authRoutes from "./routes/index.auth";
import adminRoutes from "./routes/index.admin";
import customerRoutes from "./routes/index.customer";
import courierRoutes from "./routes/index.courier";
import messageRoutes from "./routes/index.message";

import SocketService from "./utils/socket/app.socket.manager";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export const app = express();
export const server = http.createServer(app);
export const io = SocketService.getInstance().initialize(server);

app.disable("x-powered-by");
app.enable("trust proxy");
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1", customerRoutes);
app.use("/api/v1", courierRoutes);
app.use("/api/v1", messageRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: process.env.SERVICE_NAME,
    timestamp: new Date().toISOString(),
  });
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database initialized successfully");
    if (require.main === module) {
      startServer();
    } else {
      module.exports = startServer;
    }
  })
  .catch((error) => {
    console.error("Error initializing database:", error);
    process.exit(1);
  });

async function startServer() {
  const PORT = process.env.PORT;

  server.listen(PORT, () => {
    console.log("=".repeat(50));
    console.log(`Service: ${process.env.SERVICE_NAME}`);
    console.log(`Port: ${PORT}`);
    console.log(`Environment: ${app.get("env")}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log("=".repeat(50));
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    server.close(() => {
      console.log("Server closed");
      AppDataSource.destroy();
      process.exit(0);
    });
  });
}
