import { Request, Response } from "express";
import { Invoice } from "../models/invoice.entity";
import { InvoiceItem } from "../models/invoice-item.entity";
import { User } from "../models/user.entity";
import AppDataSource from "../configs/ormconfig";
import Controller from "./controller";
import PDFDocument from "pdfkit";

class InvoiceController extends Controller {
  public static async list(req: Request, res: Response) {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const repo = AppDataSource.getRepository(Invoice);
      const invoices = await repo.find({
        where: { customerId },
        order: { issuedAt: "DESC" },
      });

      return res.send(super.response(super._200, invoices));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const { id } = req.params;
      const repo = AppDataSource.getRepository(Invoice);
      const invoice = await repo.findOne({ where: { id, customerId } });

      if (!invoice) {
        return res.send(super.response(super._404, null, ["Invoice not found"]));
      }

      const itemRepo = AppDataSource.getRepository(InvoiceItem);
      const items = await itemRepo.find({ where: { invoiceId: id } });

      return res.send(super.response(super._200, { ...invoice, items }));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async generatePdf(req: Request, res: Response) {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.status(401).json(super.response(super._401, null, ["Unauthorized"]));
      }

      const { id } = req.params;
      const repo = AppDataSource.getRepository(Invoice);
      const invoice = await repo.findOne({ where: { id, customerId } });

      if (!invoice) {
        return res.status(404).json(super.response(super._404, null, ["Invoice not found"]));
      }

      const itemRepo = AppDataSource.getRepository(InvoiceItem);
      const items = await itemRepo.find({ where: { invoiceId: id } });

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: customerId } });

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="invoice-${invoice.number}.pdf"`);
      doc.pipe(res);

      doc.fontSize(20).font("Helvetica-Bold").text("Oregon Courier", { align: "center" });
      doc.fontSize(10).font("Helvetica").text("Invoice", { align: "center" });
      doc.moveDown();

      doc.fontSize(10).font("Helvetica-Bold");
      doc.text(`Invoice #: ${invoice.number}`);
      doc.font("Helvetica").text(`Status: ${invoice.status}`);
      doc.text(`Issued: ${invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : "—"}`);
      if (invoice.paidAt) doc.text(`Paid: ${new Date(invoice.paidAt).toLocaleDateString()}`);
      doc.moveDown();

      if (user) {
        doc.font("Helvetica-Bold").text("Bill To:");
        doc.font("Helvetica").text(`${user.firstname} ${user.lastname}`);
        doc.text(user.email);
        doc.moveDown();
      }

      if (invoice.periodStart && invoice.periodEnd) {
        doc.text(`Period: ${new Date(invoice.periodStart).toLocaleDateString()} — ${new Date(invoice.periodEnd).toLocaleDateString()}`);
        doc.moveDown();
      }

      doc.font("Helvetica-Bold").text("Items:");
      doc.font("Helvetica");
      items.forEach((item) => {
        doc.text(`  Delivery: ${item.deliveryId.slice(0, 8)}... — $${(item.amountCents / 100).toFixed(2)}`);
      });
      doc.moveDown();

      doc.font("Helvetica-Bold").text(`Total: $${(invoice.totalCents / 100).toFixed(2)}`, { align: "right" });

      doc.end();
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
}

export default InvoiceController;
