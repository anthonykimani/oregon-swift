import { Request, Response } from "express";
import { User } from "../models/user.entity";
import { CourierProfile } from "../models/courier-profile.entity";
import { Delivery } from "../models/delivery.entity";
import { TrackingEvent } from "../models/tracking-event.entity";
import { Invoice } from "../models/invoice.entity";
import AppDataSource from "../configs/ormconfig";
import Controller from "./controller";
import { Not, In } from "typeorm";

class AdminController extends Controller {
  public static async getCourierApplications(req: Request, res: Response) {
    try {
      if (req.user?.role !== "admin") {
        return res.send(
          super.response(super._403, null, ["Admin access required"])
        );
      }

      const userRepo = AppDataSource.getRepository(User);
      const profileRepo = AppDataSource.getRepository(CourierProfile);

      const users = await userRepo.find({
        where: { role: "courier" as any, disabled: true, deleted: false },
        order: { created: "DESC" },
      });

      const profiles = await profileRepo.find();

      const results = users.map((user) => {
        const profile = profiles.find((p) => p.userId === user.id);
        return {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          phoneNumber: user.phoneNumber,
          disabled: user.disabled,
          disableReason: user.disableReason,
          created: user.created,
          profile: profile
            ? {
                vehicleType: profile.vehicleType,
                zones: profile.zones,
                certifications: profile.certifications,
                active: profile.active,
              }
            : null,
        };
      });

      return res.send(super.response(super._200, results));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async approveCourier(req: Request, res: Response) {
    try {
      if (req.user?.role !== "admin") {
        return res.send(
          super.response(super._403, null, ["Admin access required"])
        );
      }

      const { id } = req.params;
      const userRepo = AppDataSource.getRepository(User);
      const profileRepo = AppDataSource.getRepository(CourierProfile);

      const user = await userRepo.findOne({ where: { id } });
      if (!user) {
        return res.send(super.response(super._404, null, ["User not found"]));
      }

      user.disabled = false;
      user.disableReason = "";
      user.lastUpdated = new Date();
      user.updateType = "APPROVED";
      await userRepo.save(user);

      const profile = await profileRepo.findOne({ where: { userId: id } });
      if (profile) {
        profile.active = true;
        await profileRepo.save(profile);
      }

      return res.send(
        super.response(super._200, {
          id: user.id,
          email: user.email,
          disabled: false,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async rejectCourier(req: Request, res: Response) {
    try {
      if (req.user?.role !== "admin") {
        return res.send(
          super.response(super._403, null, ["Admin access required"])
        );
      }

      const { id } = req.params;
      const userRepo = AppDataSource.getRepository(User);

      const user = await userRepo.findOne({ where: { id } });
      if (!user) {
        return res.send(super.response(super._404, null, ["User not found"]));
      }

      user.deleted = true;
      user.deleteReason = "Rejected by admin";
      user.deleteDate = new Date();
      user.lastUpdated = new Date();
      user.updateType = "REJECTED";
      await userRepo.save(user);

      return res.send(
        super.response(super._200, {
          id: user.id,
          email: user.email,
          deleted: true,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async getDeliveries(req: Request, res: Response) {
    try {
      if (req.user?.role !== "admin") {
        return res.send(super.response(super._403, null, ["Admin access required"]));
      }

      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const userRepo = AppDataSource.getRepository(User);
      const trackingRepo = AppDataSource.getRepository(TrackingEvent);

      const deliveries = await deliveryRepo.find({
        order: { createdAt: "DESC" },
      });

      const customerIds = [...new Set(deliveries.map((d) => d.customerId))];
      const courierIds = [...new Set(deliveries.filter((d) => d.courierId).map((d) => d.courierId))];
      const allUserIds = [...new Set([...customerIds, ...courierIds])];

      const users = allUserIds.length > 0
        ? await userRepo.findByIds(allUserIds)
        : [];

      const userMap = new Map(users.map((u) => [u.id, u]));

      const profileRepo = AppDataSource.getRepository(CourierProfile);
      const profiles = courierIds.length > 0
        ? await profileRepo.find()
        : [];
      const profileMap = new Map(profiles.map((p) => [p.userId, p]));

      const allEvents = deliveries.length > 0
        ? await trackingRepo.find({ where: { deliveryId: In(deliveries.map((d) => d.id)) } })
        : [];
      const latestEventMap = new Map<string, TrackingEvent>();
      allEvents.forEach((e) => {
        const existing = latestEventMap.get(e.deliveryId);
        if (!existing || e.createdAt.getTime() > existing.createdAt.getTime()) latestEventMap.set(e.deliveryId, e);
      });

      const items = deliveries.map((d) => {
        const courierUser = d.courierId ? userMap.get(d.courierId) : undefined;
        const courierProfile = d.courierId ? profileMap.get(d.courierId) : undefined;
        const latest = latestEventMap.get(d.id);
        return {
        id: d.id,
        trackingNumber: d.trackingNumber,
        status: d.status,
        customerId: d.customerId,
        customerName: userMap.get(d.customerId)
          ? `${userMap.get(d.customerId)!.firstname} ${userMap.get(d.customerId)!.lastname}`
          : null,
        courierId: d.courierId,
        courierName: d.courierId && courierUser
          ? `${courierUser.firstname} ${courierUser.lastname}`
          : null,
        courierPhone: courierUser?.phoneNumber || null,
        courierVehicle: courierProfile?.vehicleType || null,
        pickupAddress: d.pickupAddress,
        dropoffAddress: d.dropoffAddress,
        packageDesc: d.packageDesc,
        packagePieces: d.packagePieces,
        packageWeight: d.packageWeight,
        packageSizeClass: d.packageSizeClass,
        priority: d.priority,
        priceCents: d.priceCents,
        pickupWindowStart: d.pickupWindowStart,
        pickupWindowEnd: d.pickupWindowEnd,
        scheduledDate: d.scheduledDate,
        dropoffWindowEnd: d.dropoffWindowEnd,
        createdAt: d.createdAt,
        latestEvent: latest
          ? {
              status: latest.status,
              note: latest.note,
              locationText: latest.locationText,
              createdAt: latest.createdAt,
            }
          : null,
      };
      });

      const statusCounts: Record<string, number> = {
        all: deliveries.length,
        pending: 0,
        processing: 0,
        "picked-up": 0,
        "in-transit": 0,
        "out-for-delivery": 0,
        delivered: 0,
        cancelled: 0,
        "failed-attempt": 0,
      };
      deliveries.forEach((d) => {
        if (statusCounts[d.status] != null) statusCounts[d.status] += 1;
        else statusCounts[d.status] = 1;
      });

      const now = new Date();
      const completedDeliveries = deliveries.filter((d) => d.status === "delivered");
      const pendingDeliveries = deliveries.filter((d) => d.status === "pending" || d.status === "processing" || d.status === "picked-up");
      const overdueDeliveries = deliveries.filter((d) => {
        if (["delivered", "cancelled", "failed-attempt"].includes(d.status)) return false;
        const windowEnd = d.dropoffWindowEnd || d.scheduledDate || d.pickupWindowEnd;
        if (!windowEnd) return false;
        return new Date(windowEnd).getTime() < now.getTime();
      });

      // Active couriers (non-disabled, non-deleted)
      const activeCouriers = await userRepo.count({
        where: { role: "courier" as any, disabled: false, deleted: false },
      });

      // Delivery time: created -> delivered event, in days
      let avgDeliveryTimeDays = 0;
      if (completedDeliveries.length > 0) {
        const deliveredIds = completedDeliveries.map((d) => d.id);
        const deliveredEvents = await trackingRepo.find({
          where: { deliveryId: In(deliveredIds), status: "delivered" },
        });
        const deliveredMap = new Map<string, Date>();
        deliveredEvents.forEach((e) => {
          const existing = deliveredMap.get(e.deliveryId);
          if (!existing || e.createdAt > existing) deliveredMap.set(e.deliveryId, e.createdAt);
        });
        const durations: number[] = [];
        completedDeliveries.forEach((d) => {
          const deliveredAt = deliveredMap.get(d.id);
          if (deliveredAt) {
            durations.push(
              Math.max(0, (deliveredAt.getTime() - new Date(d.createdAt).getTime()) / 86400000)
            );
          }
        });
        if (durations.length > 0) {
          avgDeliveryTimeDays =
            Math.round((durations.reduce((s, v) => s + v, 0) / durations.length) * 100) / 100;
        }
      }

      // Deltas: current totals vs deliveries created more than 7 days ago (best-effort)
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      const priorTotal = deliveries.filter((d) => new Date(d.createdAt).getTime() < weekAgo.getTime()).length;
      const priorPending = deliveries.filter(
        (d) => new Date(d.createdAt).getTime() < weekAgo.getTime() &&
          (d.status === "pending" || d.status === "processing" || d.status === "picked-up")
      ).length;
      const priorCompleted = deliveries.filter(
        (d) => new Date(d.createdAt).getTime() < weekAgo.getTime() && d.status === "delivered"
      ).length;
      const pct = (cur: number, prev: number) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : cur > 0 ? 100 : 0);
      const deltas = {
        total: pct(deliveries.length, priorTotal),
        pending: pct(pendingDeliveries.length, priorPending),
        completed: pct(completedDeliveries.length, priorCompleted),
        overdue: null,
      };

      // Deliveries per month (last 12) + avg delivery days per month
      const months: { key: string; label: string; count: number; avgDays: number | null }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          key: `${d.getFullYear()}-${d.getMonth()}`,
          label: d.toLocaleDateString("en-US", { month: "short" }).replace(".", ""),
          count: 0,
          avgDays: null,
        });
      }
      const monthIndex = new Map(months.map((m) => [m.key, m]));
      const monthDurations = new Map<string, number[]>();
      deliveries.forEach((d) => {
        const created = new Date(d.createdAt);
        const key = `${created.getFullYear()}-${created.getMonth()}`;
        const slot = monthIndex.get(key);
        if (slot) slot.count += 1;
        if (d.status === "delivered") {
          (monthDurations.get(key) || monthDurations.set(key, []).get(key)!).push(
            new Date(created).getTime()
          );
        }
      });
      // Compute delivered durations per month using latest delivered event
      if (completedDeliveries.length > 0) {
        const deliveredIds = completedDeliveries.map((d) => d.id);
        const deliveredEvents = await trackingRepo.find({
          where: { deliveryId: In(deliveredIds), status: "delivered" },
        });
        const deliveredMap = new Map<string, Date>();
        deliveredEvents.forEach((e) => {
          const existing = deliveredMap.get(e.deliveryId);
          if (!existing || e.createdAt > existing) deliveredMap.set(e.deliveryId, e.createdAt);
        });
        monthDurations.forEach((_, key) => monthDurations.set(key, []));
        completedDeliveries.forEach((d) => {
          const created = new Date(d.createdAt);
          const key = `${created.getFullYear()}-${created.getMonth()}`;
          const deliveredAt = deliveredMap.get(d.id);
          if (deliveredAt && monthDurations.has(key)) {
            const days = Math.max(0, (deliveredAt.getTime() - created.getTime()) / 86400000);
            monthDurations.get(key)!.push(days);
          }
        });
      }
      const deliveriesByMonth = months.map((m) => {
        const dur = monthDurations.get(m.key) ?? [];
        const avgDays = dur.length > 0
          ? Math.round((dur.reduce((s, v) => s + v, 0) / dur.length) * 100) / 100
          : null;
        return { month: m.label, count: m.count, avgDays };
      });

      // Busy periods: weekday (Sun=0..Sat=6) x hour 8..20
      const hours = 8;
      const busyRows: { label: string; values: number[] }[] = [];
      const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const grid: number[][] = Array.from({ length: 7 }, () => Array(13).fill(0));
      deliveries.forEach((d) => {
        const created = new Date(d.createdAt);
        const day = created.getDay();
        const hour = created.getHours();
        if (hour >= 8 && hour <= 20) grid[day][hour - 8] += 1;
      });
      let maxCount = 0;
      grid.forEach((row) => row.forEach((v) => { if (v > maxCount) maxCount = v; }));
      for (let i = 0; i < 7; i++) {
        busyRows.push({ label: dayLabels[i], values: grid[i] });
      }

      const meta = {
        totalDeliveries: deliveries.length,
        pendingDeliveries: pendingDeliveries.length,
        completedDeliveries: completedDeliveries.length,
        overdueDeliveries: overdueDeliveries.length,
        activeCouriers,
        avgDeliveryTimeDays,
        deltas,
        statusCounts,
        deliveriesByMonth,
        busyPeriods: {
          rows: busyRows,
          min: 0,
          max: maxCount,
          labels: Array.from({ length: 13 }, (_, i) => `${8 + i}:00`),
        },
      };

      return res.send(super.response(super._200, { items, meta }));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async getDelivery(req: Request, res: Response) {
    try {
      if (req.user?.role !== "admin") {
        return res.send(super.response(super._403, null, ["Admin access required"]));
      }

      const { id } = req.params;
      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const userRepo = AppDataSource.getRepository(User);

      const delivery = await deliveryRepo.findOne({ where: { id } });
      if (!delivery) {
        return res.send(super.response(super._404, null, ["Delivery not found"]));
      }

      const trackingRepo = AppDataSource.getRepository(TrackingEvent);
      const events = await trackingRepo.find({
        where: { deliveryId: id },
        order: { createdAt: "ASC" },
      });

      const customer = delivery.customerId
        ? await userRepo.findOne({ where: { id: delivery.customerId } })
        : null;
      const courier = delivery.courierId
        ? await userRepo.findOne({ where: { id: delivery.courierId } })
        : null;

      return res.send(
        super.response(super._200, {
          ...delivery,
          customerName: customer ? `${customer.firstname} ${customer.lastname}` : null,
          customerEmail: customer?.email || null,
          courierName: courier ? `${courier.firstname} ${courier.lastname}` : null,
          courierEmail: courier?.email || null,
          trackingEvents: events,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async assignCourier(req: Request, res: Response) {
    try {
      if (req.user?.role !== "admin") {
        return res.send(super.response(super._403, null, ["Admin access required"]));
      }

      const { id } = req.params;
      const { courierId } = req.body;

      if (!courierId) {
        return res.send(super.response(super._400, null, ["courierId is required"]));
      }

      const userRepo = AppDataSource.getRepository(User);
      const courier = await userRepo.findOne({ where: { id: courierId, role: "courier" as any, disabled: false } });
      if (!courier) {
        return res.send(super.response(super._400, null, ["Courier not found or not active"]));
      }

      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const delivery = await deliveryRepo.findOne({ where: { id } });
      if (!delivery) {
        return res.send(super.response(super._404, null, ["Delivery not found"]));
      }

      delivery.courierId = courierId;
      delivery.updatedAt = new Date();
      await deliveryRepo.save(delivery);

      const trackingRepo = AppDataSource.getRepository(TrackingEvent);
      const event = new TrackingEvent();
      event.deliveryId = delivery.id;
      event.status = delivery.status;
      event.actorId = req.user.id;
      event.note = `Courier assigned: ${courier.firstname} ${courier.lastname}`;
      event.createdAt = new Date();
      await trackingRepo.save(event);

      return res.send(super.response(super._200, { delivery, trackingEvent: event }));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async getCouriers(req: Request, res: Response) {
    try {
      if (req.user?.role !== "admin") {
        return res.send(super.response(super._403, null, ["Admin access required"]));
      }

      const userRepo = AppDataSource.getRepository(User);
      const profileRepo = AppDataSource.getRepository(CourierProfile);

      const users = await userRepo.find({
        where: { role: "courier" as any, disabled: false, deleted: false },
        order: { firstname: "ASC" },
      });

      const profiles = await profileRepo.find();

      const results = users.map((user) => {
        const profile = profiles.find((p) => p.userId === user.id);
        return {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          phoneNumber: user.phoneNumber,
          profile: profile
            ? { vehicleType: profile.vehicleType, zones: profile.zones, active: profile.active }
            : null,
        };
      });

      return res.send(super.response(super._200, results));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async dashboardStats(req: Request, res: Response) {
    try {
      if (req.user?.role !== "admin") {
        return res.send(super.response(super._403, null, ["Admin access required"]));
      }

      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const userRepo = AppDataSource.getRepository(User);
      const trackingRepo = AppDataSource.getRepository(TrackingEvent);
      const invoiceRepo = AppDataSource.getRepository(Invoice);

      const totalDeliveries = await deliveryRepo.count();
      const activeDeliveries = await deliveryRepo.count({
        where: { status: Not(In(["delivered", "cancelled"])) },
      });
      const pendingPickups = await deliveryRepo.count({
        where: { status: "pending" },
      });
      const totalCouriers = await userRepo.count({
        where: { role: "courier" as any, disabled: false, deleted: false },
      });

      const totalRevenueResult = await invoiceRepo
        .createQueryBuilder("invoice")
        .select("COALESCE(SUM(invoice.totalCents), 0)", "total")
        .where("invoice.status = :status", { status: "paid" })
        .getRawOne();
      const totalRevenueCents = parseInt(totalRevenueResult?.total || "0", 10);

      const recentDeliveries = await deliveryRepo.find({
        order: { createdAt: "DESC" },
        take: 5,
      });

      const deliveryTracking = await AdminController.buildDeliveryTracking(recentDeliveries);
      const monthlyRevenue = await AdminController.buildMonthlyRevenue(invoiceRepo);

      const statusBreakdown = recentDeliveries.reduce<Record<string, number>>(
        (acc, d) => {
          acc[d.status] = (acc[d.status] || 0) + 1;
          return acc;
        },
        {}
      );

      const recentActivityQuery = await deliveryRepo.find({
        select: ["id", "trackingNumber"],
        order: { createdAt: "DESC" },
        take: 6,
      });

      let recentActivity: any[] = [];
      if (recentActivityQuery.length > 0) {
        const deliveryMap = new Map(recentActivityQuery.map((d) => [d.id, d.trackingNumber]));
        const events = await trackingRepo.find({
          where: { deliveryId: In(recentActivityQuery.map((d) => d.id)) },
          order: { createdAt: "DESC" },
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
          totalDeliveries,
          activeDeliveries,
          pendingPickups,
          totalCouriers,
          totalRevenueCents,
          recentDeliveries,
          recentActivity,
          deliveryTracking,
          statusBreakdown,
          monthlyRevenue,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  private static async buildDeliveryTracking(deliveries: Delivery[]) {
    const tracked = deliveries.find(
      (d) => d.status !== "delivered" && d.status !== "cancelled"
    ) ?? deliveries[0];

    if (!tracked) return null;

    let courierName = "Unassigned";
    if (tracked.courierId) {
      const courierRepo = AppDataSource.getRepository(User);
      const courier = await courierRepo.findOne({
        where: { id: tracked.courierId },
      });
      if (courier) {
        const cn = `${courier.firstname || ""} ${courier.lastname || ""}`.trim();
        courierName = cn || "Unknown";
      }
    }

    const trackingRepo = AppDataSource.getRepository(TrackingEvent);
    const timeline = await trackingRepo.find({
      where: { deliveryId: tracked.id },
      order: { createdAt: "DESC" },
      take: 4,
    });

    return {
      id: tracked.id,
      trackingNumber: tracked.trackingNumber,
      status: tracked.status,
      courierName,
      pickupAddress: tracked.pickupAddress,
      dropoffAddress: tracked.dropoffAddress,
      pickupDate: tracked.pickupWindowStart || tracked.createdAt,
      dropoffDate: tracked.scheduledDate || tracked.dropoffWindowEnd,
      timeline: timeline.map((e) => ({
        status: e.status,
        note: e.note,
        locationText: e.locationText,
        createdAt: e.createdAt,
      })),
    };
  }

  private static async buildMonthlyRevenue(invoiceRepo: any) {
    const months: string[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(
        d.toLocaleDateString("en-US", { month: "short" }).replace(".", "")
      );
    }

    const start = new Date(now.getFullYear(), now.getMonth() - 7, 1);

    const invoices = await invoiceRepo
      .createQueryBuilder("invoice")
      .where("invoice.issuedAt >= :start", { start })
      .orWhere("invoice.issuedAt IS NULL")
      .getMany();

    const byMonth = new Map<
      string,
      { revenueCents: number; outstandingCents: number }
    >();
    months.forEach((m) => byMonth.set(m, { revenueCents: 0, outstandingCents: 0 }));

    invoices.forEach((inv: any) => {
      const base = (inv.issuedAt || new Date()) as Date;
      const key = base
        .toLocaleDateString("en-US", { month: "short" })
        .replace(".", "");
      const bucket = byMonth.get(key);
      if (!bucket) return;
      if (inv.status === "paid") bucket.revenueCents += inv.totalCents || 0;
      else bucket.outstandingCents += inv.totalCents || 0;
    });

    return months.map((month) => ({
      month,
      revenueCents: byMonth.get(month)?.revenueCents || 0,
      outstandingCents: byMonth.get(month)?.outstandingCents || 0,
    }));
  }
}

export default AdminController;
