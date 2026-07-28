import { Request, Response } from "express";
import { ServiceType } from "../models/service-type.entity";
import AppDataSource from "../configs/ormconfig";
import Controller from "./controller";

class ServiceTypeController extends Controller {
  public static async list(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(ServiceType);
      const types = await repo.find({ where: { active: true } });
      return res.send(super.response(super._200, types));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
}

export default ServiceTypeController;
