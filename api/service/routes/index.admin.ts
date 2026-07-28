import express from "express";
import AdminController from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/users", authMiddleware, AdminController.getCourierApplications);
router.patch("/users/:id/approve", authMiddleware, AdminController.approveCourier);
router.patch("/users/:id/reject", authMiddleware, AdminController.rejectCourier);

router.get("/deliveries", authMiddleware, AdminController.getDeliveries);
router.get("/deliveries/:id", authMiddleware, AdminController.getDelivery);
router.patch("/deliveries/:id/assign", authMiddleware, AdminController.assignCourier);

router.get("/couriers", authMiddleware, AdminController.getCouriers);

router.get("/dashboard/stats", authMiddleware, AdminController.dashboardStats);

export default router;
