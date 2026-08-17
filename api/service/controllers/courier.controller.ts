import { Request, Response } from "express";
import { Delivery } from "../models/delivery.entity";
import { TrackingEvent } from "../models/tracking-event.entity";
import { Invoice } from "../models/invoice.entity";
import { InvoiceItem } from "../models/invoice-item.entity";
import { CourierProfile } from "../models/courier-profile.entity";
import { CourierLocation } from "../models/courier-location.entity";
import { User } from "../models/user.entity";
import AppDataSource from "../configs/ormconfig";
import Controller from "./controller";
import InvoiceController from "./invoice.controller";
import SocketService from "../utils/socket/app.socket.manager";
import { Not, In, MoreThan } from "typeorm";

class CourierController extends Controller {
  public static async deliveries(req: Request, res: Response) {
    try {
      const courierId = req.user?.id;
      if (!courierId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const repo = AppDataSource.getRepository(Delivery);
      const deliveries = await repo.find({
        where: { courierId },
        order: { createdAt: "DESC" },
      });

      const customerIds = [...new Set(deliveries.map((d) => d.customerId).filter(Boolean))];
      const userRepo = AppDataSource.getRepository(User);
      const customers = customerIds.length > 0 ? await userRepo.findByIds(customerIds) : [];
      const customerMap = new Map(customers.map((u) => [u.id, u]));

      const result = deliveries.map((d) => ({
        ...d,
        customerName: customerMap.get(d.customerId)
          ? `${customerMap.get(d.customerId)!.firstname} ${customerMap.get(d.customerId)!.lastname}`
          : null,
      }));

      return res.send(super.response(super._200, result));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async dashboardStats(req: Request, res: Response) {
    try {
      const courierId = req.user?.id;
      if (!courierId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const trackingRepo = AppDataSource.getRepository(TrackingEvent);

      const activeJobs = await deliveryRepo.count({
        where: {
          courierId,
          status: Not(In(["delivered", "cancelled"])),
        },
      });

      const upcomingJobs = await deliveryRepo.count({
        where: { courierId, status: "pending" },
      });

      const deliveredCount = await deliveryRepo.count({
        where: { courierId, status: "delivered" },
      });

      const totalEarnedResult = await deliveryRepo
        .createQueryBuilder("delivery")
        .select("COALESCE(SUM(delivery.priceCents), 0)", "total")
        .where("delivery.courierId = :courierId", { courierId })
        .andWhere("delivery.status = :status", { status: "delivered" })
        .getRawOne();
      const totalEarnedCents = parseInt(totalEarnedResult?.total || "0", 10);

      const recentDeliveries = await deliveryRepo.find({
        where: { courierId },
        order: { createdAt: "DESC" },
        take: 5,
      });

      const customerIds = [...new Set(recentDeliveries.map((d) => d.customerId).filter(Boolean))];
      const userRepo = AppDataSource.getRepository(User);
      const customers = customerIds.length > 0 ? await userRepo.findByIds(customerIds) : [];
      const customerMap = new Map(customers.map((u) => [u.id, u]));
      const enriched = recentDeliveries.map((d) => ({
        ...d,
        customerName: customerMap.get(d.customerId)
          ? `${customerMap.get(d.customerId)!.firstname} ${customerMap.get(d.customerId)!.lastname}`
          : null,
      }));

      const recentActivityQuery = await deliveryRepo.find({
        where: { courierId },
        select: ["id", "trackingNumber"],
        order: { createdAt: "DESC" } as any,
        take: 6,
      });

      let recentActivity: any[] = [];
      if (recentActivityQuery.length > 0) {
        const deliveryMap = new Map(
          recentActivityQuery.map((d) => [d.id, d.trackingNumber])
        );
        const events = await trackingRepo.find({
          where: { deliveryId: In(recentActivityQuery.map((d) => d.id)) },
          order: { createdAt: "DESC" } as any,
          take: 6,
        });
        recentActivity = events.map((e) => ({
          id: e.id,
          status: e.status,
          note: e.note,
          createdAt: e.createdAt,
          trackingNumber: deliveryMap.get(e.deliveryId) || "Unknown",
          deliveryId: e.deliveryId,
        }));
      }

      return res.send(
        super.response(super._200, {
          activeJobs,
          upcomingJobs,
          deliveredCount,
          totalEarnedCents,
          recentDeliveries: enriched,
          recentActivity,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async updateStatus(req: Request, res: Response) {
    try {
      const courierId = req.user?.id;
      if (!courierId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const { id } = req.params;
      const { status, note } = req.body;

      if (!status) {
        return res.send(super.response(super._400, null, ["Status is required"]));
      }

      const validStatuses = [
        "pending", "picked-up", "in-transit", "out-for-delivery",
        "delivered", "failed-attempt", "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return res.send(super.response(super._400, null, ["Invalid status"]));
      }

      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const delivery = await deliveryRepo.findOne({ where: { id, courierId } });

      if (!delivery) {
        return res.send(super.response(super._404, null, ["Delivery not found"]));
      }

      delivery.status = status;
      delivery.updatedAt = new Date();
      await deliveryRepo.save(delivery);

      const trackingRepo = AppDataSource.getRepository(TrackingEvent);
      const event = new TrackingEvent();
      event.deliveryId = delivery.id;
      event.status = status;
      event.actorId = courierId;
      event.note = note || `Status updated to ${status}`;
      event.createdAt = new Date();
      await trackingRepo.save(event);

      return res.send(super.response(super._200, { delivery, trackingEvent: event }));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async earnings(req: Request, res: Response) {
    try {
      const courierId = req.user?.id;
      if (!courierId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const deliveryRepo = AppDataSource.getRepository(Delivery);

      const totalDelivered = await deliveryRepo.count({
        where: { courierId, status: "delivered" },
      });

      const activeDeliveries = await deliveryRepo.count({
        where: {
          courierId,
          status: Not(In(["delivered", "cancelled"])),
        },
      });

      const totalPriceResult = await deliveryRepo
        .createQueryBuilder("delivery")
        .select("COALESCE(SUM(delivery.priceCents), 0)", "total")
        .where("delivery.courierId = :courierId", { courierId })
        .andWhere("delivery.status = :status", { status: "delivered" })
        .getRawOne();

      const totalEarnedCents = parseInt(totalPriceResult?.total || "0", 10);

      return res.send(
        super.response(super._200, {
          totalDelivered,
          activeDeliveries,
          totalEarnedCents,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async getDelivery(req: Request, res: Response) {
    try {
      const courierId = req.user?.id;
      if (!courierId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const { id } = req.params;
      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const delivery = await deliveryRepo.findOne({ where: { id, courierId } });

      if (!delivery) {
        return res.send(super.response(super._404, null, ["Delivery not found"]));
      }

      const userRepo = AppDataSource.getRepository(User);
      const customer = await userRepo.findOne({ where: { id: delivery.customerId } });

      const trackingRepo = AppDataSource.getRepository(TrackingEvent);
      const events = await trackingRepo.find({
        where: { deliveryId: id },
        order: { createdAt: "ASC" },
      });

      return res.send(
        super.response(super._200, {
          ...delivery,
          customerName: customer
            ? `${customer.firstname} ${customer.lastname}`
            : null,
          trackingEvents: events,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async invoices(req: Request, res: Response) {
    try {
      const courierId = req.user?.id;
      if (!courierId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const myDeliveries = await deliveryRepo.find({
        where: { courierId },
        select: ["id"],
      });
      const myDeliveryIds = myDeliveries.map((d) => d.id);

      const itemRepo = AppDataSource.getRepository(InvoiceItem);
      const items =
        myDeliveryIds.length > 0
          ? await itemRepo.find({ where: { deliveryId: In(myDeliveryIds) } })
          : [];
      if (items.length === 0) {
        return res.send(super.response(super._200, { items: [], meta: { total: 0 } }));
      }

      const invoiceIds = [...new Set(items.map((it) => it.invoiceId))];
      const invoiceRepo = AppDataSource.getRepository(Invoice);
      const invoices = await invoiceRepo.find({
        where: { id: In(invoiceIds) },
        order: { issuedAt: "DESC" },
      });

      const myDeliveriesByInvoice = new Map<string, number>();
      const myDeliveryIdSet = new Set(myDeliveryIds);
      items.forEach((it) => {
        if (myDeliveryIdSet.has(it.deliveryId)) {
          myDeliveriesByInvoice.set(it.invoiceId, (myDeliveriesByInvoice.get(it.invoiceId) || 0) + 1);
        }
      });

      const customerIds = [...new Set(invoices.map((i) => i.customerId))];
      const userRepo = AppDataSource.getRepository(User);
      const customers = customerIds.length > 0 ? await userRepo.findByIds(customerIds) : [];
      const customerMap = new Map(customers.map((u) => [u.id, u]));

      const result = invoices.map((invoice) => ({
        ...invoice,
        customerName: customerMap.get(invoice.customerId)
          ? `${customerMap.get(invoice.customerId)!.firstname} ${customerMap.get(invoice.customerId)!.lastname}`
          : null,
        itemCount: items.filter((it) => it.invoiceId === invoice.id).length,
        myDeliveries: myDeliveriesByInvoice.get(invoice.id) || 0,
      }));

      return res.send(super.response(super._200, { items: result, meta: { total: result.length } }));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async getInvoice(req: Request, res: Response) {
    try {
      const courierId = req.user?.id;
      if (!courierId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const { id } = req.params;
      const invoice = await CourierController.findInvoiceForCourier(id, courierId);
      if (!invoice) {
        return res.send(super.response(super._404, null, ["Invoice not found"]));
      }

      const itemRepo = AppDataSource.getRepository(InvoiceItem);
      const items = await itemRepo.find({ where: { invoiceId: id } });
      const enriched = await InvoiceController.enrichInvoice(invoice.customerId, invoice, items);
      return res.send(super.response(super._200, enriched));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async confirmInvoice(req: Request, res: Response) {
    try {
      const courierId = req.user?.id;
      if (!courierId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const { id } = req.params;
      const invoice = await CourierController.findInvoiceForCourier(id, courierId);
      if (!invoice) {
        return res.send(super.response(super._404, null, ["Invoice not found"]));
      }

      if (invoice.status === "paid") {
        return res.send(super.response(super._200, invoice));
      }

      if (invoice.status !== "processing") {
        return res.send(
          super.response(super._400, null, [
            "Invoice is not awaiting payment confirmation",
          ])
        );
      }

      const invoiceRepo = AppDataSource.getRepository(Invoice);
      invoice.status = "paid";
      invoice.paidAt = new Date();
      invoice.confirmedBy = courierId;
      await invoiceRepo.save(invoice);

      await InvoiceController.recordEvent(invoice.id, "confirmed", courierId, "courier");
      return res.send(super.response(super._200, invoice));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async disputeInvoice(req: Request, res: Response) {
    try {
      const courierId = req.user?.id;
      if (!courierId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const { id } = req.params;
      const { reason } = req.body || {};

      if (!reason || !String(reason).trim()) {
        return res.send(super.response(super._400, null, ["Dispute reason is required"]));
      }

      const invoice = await CourierController.findInvoiceForCourier(id, courierId);
      if (!invoice) {
        return res.send(super.response(super._404, null, ["Invoice not found"]));
      }

      if (invoice.status === "disputed") {
        return res.send(super.response(super._200, invoice));
      }

      if (invoice.status !== "processing") {
        return res.send(
          super.response(super._400, null, [
            "Invoice is not awaiting payment confirmation",
          ])
        );
      }

      const invoiceRepo = AppDataSource.getRepository(Invoice);
      invoice.status = "disputed";
      invoice.disputedBy = courierId;
      invoice.disputeReason = String(reason).trim();
      await invoiceRepo.save(invoice);

      await InvoiceController.recordEvent(
        invoice.id,
        "disputed",
        courierId,
        "courier",
        String(reason).trim()
      );
      return res.send(super.response(super._200, invoice));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async availability(req: Request, res: Response) {
    try {
      const courierId = req.user?.id;
      if (!courierId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const profileRepo = AppDataSource.getRepository(CourierProfile);
      const profile = await profileRepo.findOne({ where: { userId: courierId } });
      if (!profile) {
        return res.send(super.response(super._404, null, ["Courier profile not found"]));
      }

      return res.send(
        super.response(super._200, {
          availabilityStatus: profile.availabilityStatus,
          lastSeenAt: profile.lastSeenAt,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async updateAvailability(req: Request, res: Response) {
    try {
      const courierId = req.user?.id;
      if (!courierId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const { availabilityStatus } = req.body;
      if (!["online", "offline"].includes(availabilityStatus)) {
        return res.send(super.response(super._400, null, ["availabilityStatus must be 'online' or 'offline'"]));
      }

      const profileRepo = AppDataSource.getRepository(CourierProfile);
      const profile = await profileRepo.findOne({ where: { userId: courierId } });
      if (!profile) {
        return res.send(super.response(super._404, null, ["Courier profile not found"]));
      }

      profile.availabilityStatus = availabilityStatus;
      profile.lastSeenAt = new Date();
      await profileRepo.save(profile);

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: courierId } });

      SocketService.getInstance().emitToRole("admin", "courier:availability", {
        courierId,
        courierName: user ? `${user.firstname} ${user.lastname}`.trim() : null,
        vehicleType: profile.vehicleType,
        availabilityStatus: profile.availabilityStatus,
        lastSeenAt: profile.lastSeenAt,
        updatedAt: new Date(),
      });

      return res.send(
        super.response(super._200, {
          availabilityStatus: profile.availabilityStatus,
          lastSeenAt: profile.lastSeenAt,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async reportLocation(req: Request, res: Response) {
    try {
      const courierId = req.user?.id;
      if (!courierId || req.user?.role !== "courier") {
        return res.send(super.response(super._403, null, ["Courier access required"]));
      }

      const { lat, lng, accuracy, speed } = req.body;

      if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) {
        return res.send(super.response(super._400, null, ["lat and lng are required numbers"]));
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.send(super.response(super._400, null, ["lat/lng out of range"]));
      }
      if (accuracy != null && (typeof accuracy !== "number" || accuracy < 0)) {
        return res.send(super.response(super._400, null, ["accuracy must be a non-negative number"]));
      }
      if (speed != null && (typeof speed !== "number" || speed < 0)) {
        return res.send(super.response(super._400, null, ["speed must be a non-negative number"]));
      }

      const now = new Date();

      // Throttle DB writes: skip redundant rows within 10s to keep the table bounded.
      // lastSeenAt is still bumped so presence stays accurate regardless of insert throttle.
      const locationRepo = AppDataSource.getRepository(CourierLocation);
      const recent = await locationRepo.findOne({
        where: { courierId, recordedAt: MoreThan(new Date(now.getTime() - 10_000)) },
        order: { recordedAt: "DESC" },
      });

      if (!recent) {
        const location = new CourierLocation();
        location.courierId = courierId;
        location.lat = lat;
        location.lng = lng;
        location.accuracy = accuracy ?? null;
        location.speed = speed ?? null;
        location.recordedAt = now;
        await locationRepo.save(location);
      }

      const profileRepo = AppDataSource.getRepository(CourierProfile);
      const profile = await profileRepo.findOne({ where: { userId: courierId } });
      if (profile) {
        profile.lastSeenAt = now;
        await profileRepo.save(profile);
      }

      SocketService.getInstance().emitToRole("admin", "location:update", {
        courierId,
        lat,
        lng,
        accuracy: accuracy ?? null,
        speed: speed ?? null,
        recordedAt: now,
      });

      return res.send(
        super.response(super._200, {
          lat,
          lng,
          accuracy: accuracy ?? null,
          speed: speed ?? null,
          recordedAt: now,
          lastSeenAt: now,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  private static async findInvoiceForCourier(invoiceId: string, courierId: string): Promise<Invoice | null> {
    const deliveryRepo = AppDataSource.getRepository(Delivery);
    const myDeliveries = await deliveryRepo.find({
      where: { courierId },
      select: ["id"],
    });
    const myDeliveryIds = myDeliveries.map((d) => d.id);

    const itemRepo = AppDataSource.getRepository(InvoiceItem);
    const items =
      myDeliveryIds.length > 0
        ? await itemRepo.find({ where: { deliveryId: In(myDeliveryIds), invoiceId } })
        : [];
    if (items.length === 0) return null;

    const invoiceRepo = AppDataSource.getRepository(Invoice);
    return invoiceRepo.findOne({ where: { id: invoiceId } });
  }
}

export default CourierController;
