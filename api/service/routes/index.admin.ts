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

router.get("/invoices", authMiddleware, AdminController.invoices);
router.post("/invoices/generate", authMiddleware, AdminController.generateAllInvoices);
router.get("/invoices/:id", authMiddleware, AdminController.getInvoice);
router.post("/invoices/:id/approve", authMiddleware, AdminController.approveInvoice);
router.post("/invoices/:id/release", authMiddleware, AdminController.releaseInvoice);

router.get("/dashboard/stats", authMiddleware, AdminController.dashboardStats);

export default router;
