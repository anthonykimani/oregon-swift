import { Request, Response } from "express";
import { In } from "typeorm";
import { Invoice } from "../models/invoice.entity";
import { InvoiceItem } from "../models/invoice-item.entity";
import { Delivery } from "../models/delivery.entity";
import { ServiceType } from "../models/service-type.entity";
import { User } from "../models/user.entity";
import { PaymentEvent } from "../models/payment-event.entity";
import AppDataSource from "../configs/ormconfig";
import Controller from "./controller";
import PDFDocument from "pdfkit";

const BILLABLE_STATUSES = ["delivered", "picked-up", "in-transit", "out-for-delivery"];
const TAX_RATE = 0.08;
const DUE_DAYS = 14;

function short(s: string | null | undefined): string {
  if (!s) return "—";
  return s.split(",")[0].trim() || s;
}

function cents(n: number): string {
  return `$${(n / 100).toFixed(2)}`;
}

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

  public static async generate(req: Request, res: Response) {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const result = await InvoiceController.generateForCustomer(customerId);
      return res.send(super.response(super._200, result));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async generateForCustomer(customerId: string) {
    const deliveryRepo = AppDataSource.getRepository(Delivery);
    const invoiceRepo = AppDataSource.getRepository(Invoice);
    const itemRepo = AppDataSource.getRepository(InvoiceItem);

    const invoices = await invoiceRepo.find({ where: { customerId } });
    const invoiceIds = invoices.map((i) => i.id);

    let invoicedDeliveryIds = new Set<string>();
    if (invoiceIds.length > 0) {
      const existingItems = await itemRepo.find({ where: { invoiceId: In(invoiceIds) } });
      invoicedDeliveryIds = new Set(existingItems.map((it) => it.deliveryId));
    }

    const billable = await deliveryRepo.find({
      where: { customerId, status: In(BILLABLE_STATUSES) },
      order: { createdAt: "ASC" },
    });

    const toBill = billable.filter((d) => !invoicedDeliveryIds.has(d.id) && d.priceCents != null);

    if (toBill.length === 0) {
      return { created: [], updated: [], billed: 0 };
    }

    const maxSeq = invoices.reduce((m, i) => {
      const parsed = parseInt(i.number.replace("INV-", ""), 10);
      return isNaN(parsed) ? m : Math.max(m, parsed);
    }, 0);
    let seq = maxSeq;

    const groups = new Map<string, Delivery[]>();
    for (const d of toBill) {
      const date = d.pickupWindowStart || d.scheduledDate || d.createdAt;
      const dt = new Date(date);
      if (isNaN(dt.getTime())) continue;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(d);
    }

    const created: string[] = [];
    const updated: string[] = [];

    for (const [key, deliveries] of groups) {
      const [year, monthIdx] = key.split("-").map(Number);
      const periodStart = new Date(year, monthIdx - 1, 1);
      const periodEnd = new Date(year, monthIdx, 0, 23, 59, 59, 999);

      let invoice = invoices.find(
        (i) =>
          i.periodStart &&
          new Date(i.periodStart).getFullYear() === year &&
          new Date(i.periodStart).getMonth() === monthIdx - 1
      );

      if (!invoice) {
        seq += 1;
        invoice = new Invoice();
        invoice.customerId = customerId;
        invoice.number = `INV-${String(seq).padStart(4, "0")}`;
        invoice.status = "unpaid";
        invoice.periodStart = periodStart;
        invoice.periodEnd = periodEnd;
        invoice.issuedAt = new Date();
        invoice.dueDate = new Date(Date.now() + DUE_DAYS * 86400000);
        invoice.subtotalCents = 0;
        invoice.taxCents = 0;
        invoice.totalCents = 0;
        invoice = await invoiceRepo.save(invoice);
        created.push(invoice.id);
      }

      for (const d of deliveries) {
        const item = new InvoiceItem();
        item.invoiceId = invoice.id;
        item.deliveryId = d.id;
        item.amountCents = d.priceCents!;
        await itemRepo.save(item);
      }

      const items = await itemRepo.find({ where: { invoiceId: invoice.id } });
      const subtotal = items.reduce((s, it) => s + it.amountCents, 0);
      invoice.subtotalCents = subtotal;
      invoice.taxCents = Math.round(subtotal * TAX_RATE);
      invoice.totalCents = invoice.subtotalCents + invoice.taxCents;
      await invoiceRepo.save(invoice);
      if (!created.includes(invoice.id)) updated.push(invoice.id);
    }

    return { created, updated, billed: toBill.length };
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

      const enriched = await InvoiceController.enrichInvoice(customerId, invoice, items);
      return res.send(super.response(super._200, enriched));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async pay(req: Request, res: Response) {
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

      if (invoice.status === "paid") {
        return res.send(super.response(super._200, invoice));
      }

      if (invoice.status === "disputed") {
        return res.send(
          super.response(super._400, null, [
            "Payment is under review by an admin and cannot be changed",
          ])
        );
      }

      if (invoice.status !== "processing") {
        invoice.status = "processing";
        invoice.paymentRequestedAt = new Date();
        await repo.save(invoice);

        await InvoiceController.recordEvent(invoice.id, "requested", customerId, "customer");
      }

      return res.send(super.response(super._200, invoice));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async send(req: Request, res: Response) {
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

      if (invoice.status === "unpaid" || invoice.status === "draft") {
        invoice.status = "sent";
        if (!invoice.issuedAt) invoice.issuedAt = new Date();
        await repo.save(invoice);
      }

      return res.send(super.response(super._200, invoice));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async recordEvent(
    invoiceId: string,
    action: string,
    actorId: string | null,
    actorRole: string | null,
    note?: string | null
  ) {
    const eventRepo = AppDataSource.getRepository(PaymentEvent);
    const event = new PaymentEvent();
    event.invoiceId = invoiceId;
    event.action = action;
    event.actorId = actorId || null;
    event.actorRole = actorRole || null;
    event.note = note || null;
    event.createdAt = new Date();
    await eventRepo.save(event);
    return event;
  }

  public static async enrichInvoice(customerId: string, invoice: Invoice, items: InvoiceItem[]) {
    const deliveryIds = items.map((it) => it.deliveryId);
    let deliveryMap = new Map<string, Delivery>();
    let serviceMap = new Map<string, ServiceType>();

    if (deliveryIds.length > 0) {
      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const deliveries = await deliveryRepo.find({ where: { id: In(deliveryIds) } });
      deliveryMap = new Map(deliveries.map((d) => [d.id, d]));

      const serviceIds = [...new Set(deliveries.map((d) => d.serviceTypeId))];
      if (serviceIds.length > 0) {
        const sTypeRepo = AppDataSource.getRepository(ServiceType);
        const sTypes = await sTypeRepo.find({ where: { id: In(serviceIds) } });
        serviceMap = new Map(sTypes.map((s) => [s.id, s]));
      }
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: customerId } });
    const billTo = user
      ? { name: `${user.firstname} ${user.lastname}`.trim(), email: user.email || "" }
      : null;

    const computedSubtotal = items.reduce((s, it) => s + it.amountCents, 0);
    const subtotal = invoice.subtotalCents || computedSubtotal;
    const tax = invoice.taxCents || Math.round(subtotal * TAX_RATE);
    const total = invoice.totalCents || subtotal + tax;

    const enrichedItems = items.map((it) => {
      const d = deliveryMap.get(it.deliveryId);
      const sType = d ? serviceMap.get(d.serviceTypeId) : null;
      return {
        id: it.id,
        deliveryId: it.deliveryId,
        amountCents: it.amountCents,
        trackingNumber: d?.trackingNumber || null,
        packageDesc: d?.packageDesc || null,
        packagePieces: d?.packagePieces ?? 1,
        shipmentType: sType?.name || null,
        origin: d ? short(d.pickupAddress) : null,
        destination: d ? short(d.dropoffAddress) : null,
      };
    });

    return {
      ...invoice,
      subtotalCents: subtotal,
      taxCents: tax,
      totalCents: total,
      billTo,
      items: enrichedItems,
    };
  }

  public static async generatePdf(req: Request, res: Response) {
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

      const enriched = await InvoiceController.enrichInvoice(customerId, invoice, items);

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
      if (invoice.dueDate) doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`);
      if (invoice.paidAt) doc.text(`Paid: ${new Date(invoice.paidAt).toLocaleDateString()}`);
      doc.moveDown();

      if (enriched.billTo) {
        doc.font("Helvetica-Bold").text("Bill To:");
        doc.font("Helvetica").text(enriched.billTo.name);
        if (enriched.billTo.email) doc.text(enriched.billTo.email);
        doc.moveDown();
      }

      if (invoice.periodStart && invoice.periodEnd) {
        doc.text(
          `Period: ${new Date(invoice.periodStart).toLocaleDateString()} — ${new Date(invoice.periodEnd).toLocaleDateString()}`
        );
        doc.moveDown();
      }

      let y = doc.y;
      const colDesc = 50;
      const colType = 220;
      const colQty = 360;
      const colAmount = 500;

      doc.font("Helvetica-Bold").fontSize(9);
      doc.text("Description", colDesc, y);
      doc.text("Shipment Type", colType, y);
      doc.text("Qty", colQty, y);
      doc.text("Amount", colAmount, y, { width: 100, align: "right" });
      y += 16;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 4;

      doc.font("Helvetica").fontSize(9);
      for (const item of enriched.items as any[]) {
        doc.text(
          item.packageDesc || `Delivery ${item.trackingNumber || item.deliveryId.slice(0, 8)}`,
          colDesc,
          y,
          { width: 160 }
        );
        doc.text(item.shipmentType || "—", colType, y);
        doc.text(String(item.packagePieces), colQty, y);
        doc.text(cents(item.amountCents), colAmount, y, { width: 100, align: "right" });
        y += 18;
      }
      doc.moveDown();

      doc.font("Helvetica").fontSize(10);
      doc.text(`Sub Total: ${cents(enriched.subtotalCents)}`, { align: "right" });
      doc.text(`Tax (${Math.round(TAX_RATE * 100)}%): ${cents(enriched.taxCents)}`, { align: "right" });
      doc.font("Helvetica-Bold").text(`Total: ${cents(enriched.totalCents)}`, { align: "right" });

      doc.end();
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
}

export default InvoiceController;
