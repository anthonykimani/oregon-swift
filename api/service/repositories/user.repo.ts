import { Repository } from "typeorm";
import { User } from "../models/user.entity";
import AppDataSource from "../configs/ormconfig";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { UserRole } from "../enums/UserRole";

export class UserRepository {
  private repo: Repository<User>;

  protected config = {
    secret: String(process.env.TOKEN_SECRET),
    issuer: String(process.env.TOKEN_ISSUER),
    expiry: Number(String(process.env.TOKEN_EXPIRY)),
    saltRounds: Number(String(process.env.SALT_ROUNDS)),
  };

  constructor() {
    this.repo = AppDataSource.getRepository(User);
    dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
  }

  async saveUser(user: User): Promise<User | undefined> {
    try {
      if (!user.id) {
        user.created = new Date();
        user.lastUpdated = new Date();
        user.phoneNumberConfirmed = false;
        user.emailConfirmed = false;
        user.registered = true;
        user.accessFailedCount = 0;
        user.lockoutEnabled = false;
        user.disabled = false;
        user.updateType = "NEW_ACCOUNT";
        user.deleted = false;
      }

      if (user.password && !this.isBcryptHash(user.password)) {
        user.password = await this.hashPassword(
          user.password,
          this.config.saltRounds
        );
      }

      if (user.email) {
        user.email = user.email.toLowerCase();
      }

      const userData = await this.repo.save(user);
      return userData;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw error;
    }
  }

  async getAll(user?: Partial<User>, skip?: number, take?: number) {
    try {
      const where: Record<string, any> = { deleted: false };
      if (user) {
        if (user.id) where.id = user.id;
        if (user.email) where.email = user.email;
        if (user.firstname) where.firstname = user.firstname;
        if (user.lastname) where.lastname = user.lastname;
        if (user.role) where.role = user.role;
      }

      const userData = await this.repo.find({
        where,
        order: { created: "DESC" },
        skip,
        take,
      });

      return userData;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      if (!id) return null;

      const userData = await this.repo.find({
        where: { id },
        take: 1,
      });
      return userData && userData.length > 0 ? userData[0] : null;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      if (!email) return null;

      const userData = await this.repo.find({
        where: { email: email.toLowerCase() },
        take: 1,
      });
      return userData && userData.length > 0 ? userData[0] : null;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw error;
    }
  }

  async hashPassword(
    password: string,
    saltRounds?: number
  ): Promise<string> {
    try {
      saltRounds = saltRounds || this.config.saltRounds;
      const salt = await bcrypt.genSalt(saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw error;
    }
  }

  async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    if (!password || !hash || !this.isBcryptHash(hash)) return false;
    return bcrypt.compare(password, hash);
  }

  private isBcryptHash(value: string): boolean {
    return /^\$2[aby]\$\d{2}\$/.test(value);
  }
}
