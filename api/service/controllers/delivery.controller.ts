import { Request, Response } from "express";
import { Delivery } from "../models/delivery.entity";
import { ServiceType } from "../models/service-type.entity";
import { Zone } from "../models/zone.entity";
import { RateMatrix } from "../models/rate-matrix.entity";
import { TrackingEvent } from "../models/tracking-event.entity";
import AppDataSource from "../configs/ormconfig";
import Controller from "./controller";
import crypto from "crypto";

function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  if (phone.length < 4) return "***";
  return phone.slice(0, -4).replace(/\d/g, "*") + phone.slice(-4);
}

function maskName(name: string | null | undefined): string | null {
  if (!name) return null;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return parts.map((p, i) => (i === 0 ? p : p[0] + ".")).join(" ");
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function detectZone(lat: number, lng: number, zones: Zone[]): Zone | null {
  for (const zone of zones) {
    if (zone.centerLat != null && zone.centerLng != null && zone.radiusMiles) {
      const dist = haversineMiles(lat, lng, zone.centerLat, zone.centerLng);
      if (dist <= zone.radiusMiles) return zone;
    }
  }
  return null;
}

class DeliveryController extends Controller {
  public static async create(req: Request, res: Response) {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const {
        pickupZoneId, pickupAddress, pickupLat, pickupLng, pickupContactName, pickupContactPhone,
        pickupWindowStart, pickupWindowEnd,
        dropoffZoneId, dropoffAddress, dropoffLat, dropoffLng, dropoffContactName, dropoffContactPhone,
        dropoffWindowStart, dropoffWindowEnd,
        serviceTypeId, packageDesc, packagePieces, packageWeight, packageFragile,
      } = req.body;

      if (!serviceTypeId || !packageDesc) {
        return res.send(super.response(super._400, null, ["Missing required fields"]));
      }

      const sTypeRepo = AppDataSource.getRepository(ServiceType);
      const serviceType = await sTypeRepo.findOne({ where: { id: serviceTypeId } });
      let priceCents = 0;
      let resolvedPickupZoneId = pickupZoneId || null;
      let resolvedDropoffZoneId = dropoffZoneId || null;

      if (pickupLat != null && pickupLng != null && dropoffLat != null && dropoffLng != null) {
        const zoneRepo = AppDataSource.getRepository(Zone);
        const radialZones = await zoneRepo.find({ where: { active: true, zoneType: "radial" } });
        const sortedZones = radialZones.sort((a, b) => (a.radiusMiles || 0) - (b.radiusMiles || 0));

        const pZone = detectZone(Number(pickupLat), Number(pickupLng), sortedZones);
        const dZone = detectZone(Number(dropoffLat), Number(dropoffLng), sortedZones);

        if (pZone) resolvedPickupZoneId = pZone.id;
        if (dZone) resolvedDropoffZoneId = dZone.id;

        if (pZone && dZone) {
          const rateRepo = AppDataSource.getRepository(RateMatrix);
          const rate = await rateRepo.findOne({
            where: { fromZoneId: pZone.id, toZoneId: dZone.id, serviceTypeId },
          });
          if (rate) {
            const pieces = parseInt(packagePieces) || 1;
            const weightMultiplier = packageWeight ? Math.max(1, Math.ceil(parseFloat(packageWeight) / 10)) : 1;
            priceCents = rate.priceCents * pieces * weightMultiplier;
          }
        }
      }

      if (priceCents === 0 && serviceType?.basePriceCents) {
        const pieces = parseInt(packagePieces) || 1;
        const weightMultiplier = packageWeight ? Math.max(1, Math.ceil(parseFloat(packageWeight) / 10)) : 1;
        priceCents = serviceType.basePriceCents * pieces * weightMultiplier;
      }

      const repo = AppDataSource.getRepository(Delivery);
      const trackingNumber = `OC-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

      const delivery = new Delivery();
      delivery.trackingNumber = trackingNumber;
      delivery.customerId = customerId;
      delivery.serviceTypeId = serviceTypeId;
      delivery.status = "pending";
      delivery.pickupZoneId = resolvedPickupZoneId;
      delivery.pickupAddress = pickupAddress || "";
      delivery.pickupContactName = pickupContactName || "";
      delivery.pickupContactPhone = pickupContactPhone || "";
      delivery.pickupWindowStart = pickupWindowStart || null;
      delivery.pickupWindowEnd = pickupWindowEnd || null;
      delivery.dropoffZoneId = resolvedDropoffZoneId;
      delivery.dropoffAddress = dropoffAddress || "";
      delivery.dropoffContactName = dropoffContactName || "";
      delivery.dropoffContactPhone = dropoffContactPhone || "";
      delivery.dropoffWindowStart = dropoffWindowStart || null;
      delivery.dropoffWindowEnd = dropoffWindowEnd || null;
      delivery.packageDesc = packageDesc;
      delivery.packagePieces = packagePieces || 1;
      delivery.packageWeight = packageWeight || null;
      delivery.packageFragile = packageFragile || false;
      delivery.priceCents = priceCents;
      delivery.createdAt = new Date();
      delivery.updatedAt = new Date();

      const saved = await repo.save(delivery);

      const trackingRepo = AppDataSource.getRepository(TrackingEvent);
      const event = new TrackingEvent();
      event.deliveryId = saved.id;
      event.status = "pending";
      event.actorId = customerId;
      event.note = "Delivery created";
      event.createdAt = new Date();
      await trackingRepo.save(event);

      return res.send(super.response(super._201, {
        ...saved,
        trackingEvents: [event],
      }));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async estimate(req: Request, res: Response) {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const {
        pickupLat, pickupLng,
        dropoffLat, dropoffLng,
        serviceTypeId, packagePieces, packageWeight,
      } = req.body;

      if (pickupLat == null || pickupLng == null || dropoffLat == null || dropoffLng == null) {
        return res.send(super.response(super._400, null, ["Pickup and dropoff coordinates required"]));
      }

      const zoneRepo = AppDataSource.getRepository(Zone);
      const sTypeRepo = AppDataSource.getRepository(ServiceType);
      const radialZones = await zoneRepo.find({ where: { active: true, zoneType: "radial" } });
      const sortedZones = radialZones.sort((a, b) => (a.radiusMiles || 0) - (b.radiusMiles || 0));

      const pZone = detectZone(Number(pickupLat), Number(pickupLng), sortedZones);
      const dZone = detectZone(Number(dropoffLat), Number(dropoffLng), sortedZones);
      const serviceType = serviceTypeId ? await sTypeRepo.findOne({ where: { id: serviceTypeId } }) : null;

      let priceCents = 0;
      let pickupZoneName = pZone?.name || null;
      let dropoffZoneName = dZone?.name || null;

      if (pZone && dZone && serviceTypeId) {
        const rateRepo = AppDataSource.getRepository(RateMatrix);
        const rate = await rateRepo.findOne({
          where: { fromZoneId: pZone.id, toZoneId: dZone.id, serviceTypeId },
        });
        if (rate) {
          const pieces = parseInt(packagePieces) || 1;
          const weightMultiplier = packageWeight ? Math.max(1, Math.ceil(parseFloat(packageWeight) / 10)) : 1;
          priceCents = rate.priceCents * pieces * weightMultiplier;
        }
      }

      if (priceCents === 0 && serviceType?.basePriceCents) {
        const pieces = parseInt(packagePieces) || 1;
        const weightMultiplier = packageWeight ? Math.max(1, Math.ceil(parseFloat(packageWeight) / 10)) : 1;
        priceCents = serviceType.basePriceCents * pieces * weightMultiplier;
      }

      return res.send(super.response(super._200, {
        priceCents,
        pickupZoneName,
        dropoffZoneName,
      }));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async list(req: Request, res: Response) {
    try {
      const customerId = req.user?.id;
      if (!customerId) {
        return res.send(super.response(super._401, null, ["Unauthorized"]));
      }

      const repo = AppDataSource.getRepository(Delivery);
      const deliveries = await repo.find({
        where: { customerId },
        order: { createdAt: "DESC" },
      });

      return res.send(super.response(super._200, deliveries));
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
      const repo = AppDataSource.getRepository(Delivery);
      const delivery = await repo.findOne({ where: { id, customerId } });

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

  public static async trackByNumber(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;
      if (!trackingNumber) {
        return res.send(super.response(super._400, null, ["Tracking number is required"]));
      }

      const repo = AppDataSource.getRepository(Delivery);
      const delivery = await repo.findOne({ where: { trackingNumber: trackingNumber.toUpperCase() } });

      if (!delivery) {
        return res.send(super.response(super._404, null, ["Delivery not found"]));
      }

      const trackingRepo = AppDataSource.getRepository(TrackingEvent);
      const events = await trackingRepo.find({
        where: { deliveryId: delivery.id },
        order: { createdAt: "ASC" },
      });

      return res.send(
        super.response(super._200, {
          trackingNumber: delivery.trackingNumber,
          status: delivery.status,
          pickupAddress: delivery.pickupAddress,
          dropoffAddress: delivery.dropoffAddress,
          pickupContactName: maskName(delivery.pickupContactName),
          pickupContactPhone: maskPhone(delivery.pickupContactPhone),
          dropoffContactName: maskName(delivery.dropoffContactName),
          dropoffContactPhone: maskPhone(delivery.dropoffContactPhone),
          packageDesc: delivery.packageDesc,
          packagePieces: delivery.packagePieces,
          packageWeight: delivery.packageWeight,
          createdAt: delivery.createdAt,
          trackingEvents: events.map((e) => ({
            id: e.id,
            status: e.status,
            note: e.note,
            createdAt: e.createdAt,
          })),
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
}

export default DeliveryController;
