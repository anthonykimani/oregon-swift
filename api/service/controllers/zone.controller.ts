import { Request, Response } from "express";
import { Zone } from "../models/zone.entity";
import AppDataSource from "../configs/ormconfig";
import Controller from "./controller";

class ZoneController extends Controller {
  public static async list(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Zone);
      const zones = await repo.find({ where: { active: true } });
      return res.send(super.response(super._200, zones));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
}

export default ZoneController;
