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

      const results = deliveries.map((d) => ({
        id: d.id,
        trackingNumber: d.trackingNumber,
        status: d.status,
        customerId: d.customerId,
        customerName: userMap.get(d.customerId)
          ? `${userMap.get(d.customerId)!.firstname} ${userMap.get(d.customerId)!.lastname}`
          : null,
        courierId: d.courierId,
        courierName: d.courierId && userMap.get(d.courierId)
          ? `${userMap.get(d.courierId)!.firstname} ${userMap.get(d.courierId)!.lastname}`
          : null,
        pickupAddress: d.pickupAddress,
        dropoffAddress: d.dropoffAddress,
        packageDesc: d.packageDesc,
        createdAt: d.createdAt,
      }));

      return res.send(super.response(super._200, results));
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
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
}

export default AdminController;
