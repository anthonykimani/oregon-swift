import express from "express";
import RouteController from "../controllers/route.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/route/estimate", authMiddleware, RouteController.estimate);

export default router;
