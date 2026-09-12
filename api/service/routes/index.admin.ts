import express from "express";
import AdminController from "../controllers/admin.controller";
import { authMiddleware, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));

router.get("/users", AdminController.getCourierApplications);
router.patch("/users/:id/approve", AdminController.approveCourier);
router.patch("/users/:id/reject", AdminController.rejectCourier);

router.get("/deliveries", AdminController.getDeliveries);
router.get("/deliveries/:id", AdminController.getDelivery);
router.patch("/deliveries/:id/assign", AdminController.assignCourier);

router.get("/couriers", AdminController.getCouriers);

router.get("/invoices", AdminController.invoices);
router.post("/invoices/generate", AdminController.generateAllInvoices);
router.get("/invoices/:id", AdminController.getInvoice);
router.post("/invoices/:id/approve", AdminController.approveInvoice);
router.post("/invoices/:id/release", AdminController.releaseInvoice);

router.get("/dashboard/stats", AdminController.dashboardStats);

export default router;
