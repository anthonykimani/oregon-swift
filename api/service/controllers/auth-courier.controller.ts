import { Request, Response } from "express";
import { User } from "../models/user.entity";
import { CourierProfile } from "../models/courier-profile.entity";
import { UserRepository } from "../repositories/user.repo";
import AppDataSource from "../configs/ormconfig";
import Controller from "./controller";
import jwt from "jsonwebtoken";
import { z } from "zod";

const courierSignupSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  phoneNumber: z.string().optional(),
  vehicleType: z.string().min(1),
  zones: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
});

class AuthCourierController extends Controller {
  public static async signup(req: Request, res: Response) {
    try {
      const parsed = courierSignupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.send(
          super.response(super._400, null, [
            parsed.error.errors.map((e) => e.message).join(", "),
          ])
        );
      }

      const {
        email,
        password,
        firstname,
        lastname,
        username,
        phoneNumber,
        vehicleType,
        zones,
        certifications,
      } = parsed.data;

      const repo: UserRepository = new UserRepository();

      const existing = await repo.getUserByEmail(email);
      if (existing) {
        return res.send(
          super.response(super._409, null, ["Email already in use"])
        );
      }

      const user = new User();
      user.email = email;
      user.password = password;
      user.firstname = firstname;
      user.lastname = lastname;
      user.username = username;
      user.phoneNumber = phoneNumber || "";
      user.role = "courier" as any;
      user.disabled = true;
      user.disableReason = "Awaiting admin approval";

      const saved = await repo.saveUser(user);
      if (!saved) {
        return res.send(
          super.response(super._500, null, ["Failed to create user"])
        );
      }

      const profileRepo = AppDataSource.getRepository(CourierProfile);
      const profile = new CourierProfile();
      profile.userId = saved.id;
      profile.vehicleType = vehicleType;
      profile.zones = zones || [];
      profile.certifications = certifications || [];
      profile.active = false;
      await profileRepo.save(profile);

      const tokenSecret = String(process.env.TOKEN_SECRET);
      const tokenIssuer = String(process.env.TOKEN_ISSUER);
      const tokenExpiry = Number(String(process.env.TOKEN_EXPIRY)) || 86400;

      const token = jwt.sign(
        { id: saved.id, role: saved.role, email: saved.email },
        tokenSecret,
        { expiresIn: tokenExpiry, issuer: tokenIssuer }
      );

      return res.send(
        super.response(super._201, {
          token,
          user: {
            id: saved.id,
            email: saved.email,
            firstname: saved.firstname,
            lastname: saved.lastname,
            username: saved.username,
            role: saved.role,
          },
          message: "Account created. Awaiting admin approval.",
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
}

export default AuthCourierController;
