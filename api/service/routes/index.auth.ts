import express from "express";
import AuthController from "../controllers/auth.controller";
import AuthGoogleController from "../controllers/auth-google.controller";
import AuthCourierController from "../controllers/auth-courier.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/signup", AuthController.signup);
router.post("/signup/courier", AuthCourierController.signup);
router.post("/signin", AuthController.signin);
router.post("/google", AuthGoogleController.googleAuth);
router.get("/me", authMiddleware, AuthController.me);
router.patch("/me", authMiddleware, AuthController.updateMe);

export default router;
