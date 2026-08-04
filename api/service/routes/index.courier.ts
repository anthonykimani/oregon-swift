import express from "express";
import CourierController from "../controllers/courier.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/courier/deliveries", authMiddleware, CourierController.deliveries);
router.get("/courier/deliveries/:id", authMiddleware, CourierController.getDelivery);
router.patch("/courier/deliveries/:id/status", authMiddleware, CourierController.updateStatus);
router.get("/courier/earnings", authMiddleware, CourierController.earnings);
router.get("/courier/stats", authMiddleware, CourierController.dashboardStats);

router.get("/courier/invoices", authMiddleware, CourierController.invoices);
router.get("/courier/invoices/:id", authMiddleware, CourierController.getInvoice);
router.post("/courier/invoices/:id/confirm", authMiddleware, CourierController.confirmInvoice);
router.post("/courier/invoices/:id/dispute", authMiddleware, CourierController.disputeInvoice);

export default router;
