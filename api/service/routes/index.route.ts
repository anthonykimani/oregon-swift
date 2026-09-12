import express from "express";
import RouteController from "../controllers/route.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";

const router = express.Router();

const estimateLimiter = rateLimit({ windowMs: 60_000, max: 120, scope: "route-estimate" });

router.get("/route/estimate", authMiddleware, estimateLimiter, RouteController.estimate);

export default router;
