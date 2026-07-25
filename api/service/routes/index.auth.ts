import express from "express";
import AuthController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/signup", AuthController.signup);
router.post("/signin", AuthController.signin);
router.get("/me", authMiddleware, AuthController.me);

export default router;
