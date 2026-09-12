import express from "express";
import CourierController from "../controllers/courier.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authMiddleware, requireRole("courier"));

router.get("/courier/deliveries", CourierController.deliveries);
router.get("/courier/deliveries/:id", CourierController.getDelivery);
router.patch("/courier/deliveries/:id/status", CourierController.updateStatus);
router.get("/courier/earnings", CourierController.earnings);
router.get("/courier/stats", CourierController.dashboardStats);
router.get("/courier/availability", CourierController.availability);
router.patch("/courier/availability", CourierController.updateAvailability);
router.post("/courier/location", CourierController.reportLocation);

router.get("/courier/invoices", CourierController.invoices);
router.get("/courier/invoices/:id", CourierController.getInvoice);
router.post("/courier/invoices/:id/confirm", CourierController.confirmInvoice);
router.post("/courier/invoices/:id/dispute", CourierController.disputeInvoice);

export default router;
