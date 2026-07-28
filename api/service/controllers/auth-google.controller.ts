import { Request, Response } from "express";
import { User } from "../models/user.entity";
import { UserRepository } from "../repositories/user.repo";
import Controller from "./controller";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

class AuthGoogleController extends Controller {
  public static async googleAuth(req: Request, res: Response) {
    try {
      const { email, firstname, lastname, username, avatar } = req.body;

      if (!email || !firstname || !lastname || !username) {
        return res.send(
          super.response(super._400, null, ["Missing required fields: email, firstname, lastname, username"])
        );
      }

      const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const isAdmin = adminEmails.includes(email.toLowerCase());

      const repo: UserRepository = new UserRepository();
      let user = await repo.getUserByEmail(email);

      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const randomPassword = crypto.randomBytes(24).toString("hex");

        user = new User();
        user.email = email;
        user.password = await bcrypt.hash(randomPassword, salt);
        user.firstname = firstname;
        user.lastname = lastname;
        user.username = username;
        user.role = isAdmin ? ("admin" as any) : ("customer" as any);
        user.registered = true;
        user.emailConfirmed = true;

        const saved = await repo.saveUser(user);
        if (!saved) {
          return res.send(
            super.response(super._500, null, ["Failed to create user"])
          );
        }
      } else if (isAdmin && user.role !== ("admin" as any)) {
        user.role = "admin" as any;
        user.lastUpdated = new Date();
        await repo.saveUser(user);
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
            avatar: avatar || null,
          },
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
}

export default AuthGoogleController;
