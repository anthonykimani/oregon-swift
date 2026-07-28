import express from "express";
import CourierController from "../controllers/courier.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/courier/deliveries", authMiddleware, CourierController.deliveries);
router.get("/courier/deliveries/:id", authMiddleware, CourierController.getDelivery);
router.patch("/courier/deliveries/:id/status", authMiddleware, CourierController.updateStatus);
router.get("/courier/earnings", authMiddleware, CourierController.earnings);

export default router;
