import { Request, Response } from "express";
import { Delivery } from "../models/delivery.entity";
import { TrackingEvent } from "../models/tracking-event.entity";
import AppDataSource from "../configs/ormconfig";
import Controller from "./controller";
import { Not, In } from "typeorm";

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

      return res.send(super.response(super._200, deliveries));
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

      const trackingRepo = AppDataSource.getRepository(TrackingEvent);
      const events = await trackingRepo.find({
        where: { deliveryId: id },
        order: { createdAt: "ASC" },
      });

      return res.send(super.response(super._200, { ...delivery, trackingEvents: events }));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
}

export default CourierController;
