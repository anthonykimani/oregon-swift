import express from "express";
import ZoneController from "../controllers/zone.controller";
import ServiceTypeController from "../controllers/service-type.controller";
import DeliveryController from "../controllers/delivery.controller";
import InvoiceController from "../controllers/invoice.controller";
import DashboardController from "../controllers/dashboard.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/tracking/:trackingNumber", DeliveryController.trackByNumber);

router.get("/dashboard/stats", authMiddleware, DashboardController.stats);
router.get("/zones", authMiddleware, ZoneController.list);
router.get("/service-types", authMiddleware, ServiceTypeController.list);
router.post("/deliveries", authMiddleware, DeliveryController.create);
router.post("/deliveries/estimate", authMiddleware, DeliveryController.estimate);
router.get("/deliveries", authMiddleware, DeliveryController.list);
router.get("/deliveries/:id", authMiddleware, DeliveryController.getById);
router.get("/invoices", authMiddleware, InvoiceController.list);
router.post("/invoices/generate", authMiddleware, InvoiceController.generate);
router.post("/invoices/:id/pay", authMiddleware, InvoiceController.pay);
router.post("/invoices/:id/send", authMiddleware, InvoiceController.send);
router.get("/invoices/:id", authMiddleware, InvoiceController.getById);
router.get("/invoices/:id/pdf", authMiddleware, InvoiceController.generatePdf);

export default router;
