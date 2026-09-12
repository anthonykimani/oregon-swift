import { Request, Response } from "express";
import Controller from "./controller";
import { estimateRouteDuration } from "../utils/routing";

function parseCoord(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const n = typeof value === "number" ? value : parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

class RouteController extends Controller {
  public static async estimate(req: Request, res: Response) {
    try {
      const fromLat = parseCoord(req.query.fromLat);
      const fromLng = parseCoord(req.query.fromLng);
      const toLat = parseCoord(req.query.toLat);
      const toLng = parseCoord(req.query.toLng);

      if (fromLat === null || fromLng === null || toLat === null || toLng === null) {
        return res.send(
          super.response(super._400, null, ["fromLat, fromLng, toLat, toLng are required"])
        );
      }

      if (
        fromLat < -90 || fromLat > 90 || toLat < -90 || toLat > 90 ||
        fromLng < -180 || fromLng > 180 || toLng < -180 || toLng > 180
      ) {
        return res.send(super.response(super._400, null, ["Coordinates out of range"]));
      }

      const estimate = await estimateRouteDuration(fromLat, fromLng, toLat, toLng);
      return res.send(super.response(super._200, estimate));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
}

export default RouteController;
