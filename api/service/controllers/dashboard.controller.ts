import { Request, Response } from "express";
import { Delivery } from "../models/delivery.entity";
import { Invoice } from "../models/invoice.entity";
import { TrackingEvent } from "../models/tracking-event.entity";
import AppDataSource from "../configs/ormconfig";
import Controller from "./controller";
import { Not, In } from "typeorm";

class DashboardController extends Controller {
  public static async stats(req: Request, res: Response) {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const deliveryRepo = AppDataSource.getRepository(Delivery);
      const invoiceRepo = AppDataSource.getRepository(Invoice);
      const trackingRepo = AppDataSource.getRepository(TrackingEvent);

      const activeDeliveries = await deliveryRepo.count({
        where: {
          customerId,
          status: Not(In(["delivered", "cancelled"])),
        },
      });

      const pendingPickups = await deliveryRepo.count({
        where: { customerId, status: "pending" },
      });

      const totalSpentResult = await invoiceRepo
        .createQueryBuilder("invoice")
        .select("COALESCE(SUM(invoice.totalCents), 0)", "total")
        .where("invoice.customerId = :customerId", { customerId })
        .andWhere("invoice.status = :status", { status: "paid" })
        .getRawOne();

      const totalSpentCents = parseInt(totalSpentResult?.total || "0", 10);

      const recentDeliveries = await deliveryRepo.find({
        where: { customerId },
        order: { createdAt: "DESC" },
        take: 5,
      });

      const recentActivityQuery = await deliveryRepo.find({
        where: { customerId },
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
          activeDeliveries,
          pendingPickups,
          totalSpentCents,
          recentDeliveries,
          recentActivity,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
}

export default DashboardController;
