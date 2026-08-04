import express from "express";
import MessageController from "../controllers/message.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/messages/threads", authMiddleware, MessageController.threads);
router.get("/messages/threads/:id", authMiddleware, MessageController.thread);
router.post("/messages/threads", authMiddleware, MessageController.createThread);
router.post("/messages/:id", authMiddleware, MessageController.sendMessage);
router.get("/messages/unread-count", authMiddleware, MessageController.unreadCount);
router.get("/messages/recipients", authMiddleware, MessageController.recipients);

export default router;