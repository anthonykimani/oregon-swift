import { Request, Response } from "express";
import { User } from "../models/user.entity";
import { UserRepository } from "../repositories/user.repo";
import Controller from "./controller";
import jwt from "jsonwebtoken";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  username: z.string().min(3),
  phoneNumber: z.string().optional(),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

class AuthController extends Controller {
  public static async signup(req: Request, res: Response) {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.send(
          super.response(super._400, null, [
            parsed.error.errors.map((e) => e.message).join(", "),
          ])
        );
      }

      const { email, password, firstname, lastname, username, phoneNumber } =
        parsed.data;

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
      user.role = "customer" as any;

      const saved = await repo.saveUser(user);
      if (!saved) {
        return res.send(
          super.response(super._500, null, ["Failed to create user"])
        );
      }

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
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async signin(req: Request, res: Response) {
    try {
      const parsed = signinSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.send(
          super.response(super._400, null, [
            parsed.error.errors.map((e) => e.message).join(", "),
          ])
        );
      }

      const { email, password } = parsed.data;

      const repo: UserRepository = new UserRepository();
      const user = await repo.getUserByEmail(email);

      if (!user) {
        return res.send(
          super.response(super._401, null, ["Invalid email or password"])
        );
      }

      if (user.disabled || user.deleted) {
        return res.send(
          super.response(super._401, null, ["Account is disabled"])
        );
      }

      const valid = await repo.comparePassword(password, user.password);
      if (!valid) {
        return res.send(
          super.response(super._401, null, ["Invalid email or password"])
        );
      }

      const tokenSecret = String(process.env.TOKEN_SECRET);
      const tokenIssuer = String(process.env.TOKEN_ISSUER);
      const tokenExpiry = Number(String(process.env.TOKEN_EXPIRY)) || 86400;

      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        tokenSecret,
        { expiresIn: tokenExpiry, issuer: tokenIssuer }
      );

      return res.send(
        super.response(super._200, {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            role: user.role,
            phoneNumber: user.phoneNumber,
          },
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async me(req: Request, res: Response) {
    try {
      const repo: UserRepository = new UserRepository();
      const user = await repo.getUserById(req.user!.id);

      if (!user) {
        return res.send(super.response(super._404, null, ["User not found"]));
      }

      return res.send(
        super.response(super._200, {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          role: user.role,
          phoneNumber: user.phoneNumber,
          emailConfirmed: user.emailConfirmed,
          created: user.created,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async updateMe(req: Request, res: Response) {
    try {
      const repo: UserRepository = new UserRepository();
      const user = await repo.getUserById(req.user!.id);

      if (!user) {
        return res.send(super.response(super._404, null, ["User not found"]));
      }

      const { firstname, lastname, phoneNumber } = req.body;

      if (firstname !== undefined) user.firstname = firstname;
      if (lastname !== undefined) user.lastname = lastname;
      if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
      user.lastUpdated = new Date();

      const saved = await repo.saveUser(user);
      if (!saved) {
        return res.send(super.response(super._500, null, ["Failed to update profile"]));
      }

      return res.send(
        super.response(super._200, {
          id: saved.id,
          email: saved.email,
          firstname: saved.firstname,
          lastname: saved.lastname,
          username: saved.username,
          role: saved.role,
          phoneNumber: saved.phoneNumber,
          emailConfirmed: saved.emailConfirmed,
          created: saved.created,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
}

export default AuthController;
