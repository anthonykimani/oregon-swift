import { Request, Response } from "express";
import { Conversation } from "../models/conversation.entity";
import { Message } from "../models/message.entity";
import { Delivery } from "../models/delivery.entity";
import { User } from "../models/user.entity";
import AppDataSource from "../configs/ormconfig";
import Controller from "./controller";
import SocketService from "../utils/socket/app.socket.manager";
import { UserRole } from "../enums/UserRole";
import { In } from "typeorm";

const SENDER_ROLE_COLUMN: Record<string, "customerReadAt" | "courierReadAt" | "adminReadAt"> = {
  customer: "customerReadAt",
  courier: "courierReadAt",
  admin: "adminReadAt",
};

function truncatePreview(body: string, max = 140): string {
  return body.length > max ? body.slice(0, max) + "…" : body;
}

class MessageController extends Controller {
  private static async loadUserNames(userIds: string[]): Promise<Map<string, { name: string | null; role: string | null }>> {
    const map = new Map<string, { name: string | null; role: string | null }>();
    if (userIds.length === 0) return map;
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.findByIds(userIds);
    users.forEach((u) => {
      map.set(u.id, {
        name: `${u.firstname} ${u.lastname}`.trim(),
        role: u.role,
      });
    });
    return map;
  }

  private static isParticipant(conversation: Conversation, userId: string): boolean {
    return (
      conversation.customerId === userId ||
      conversation.courierId === userId ||
      conversation.adminId === userId
    );
  }

  private static participantIds(conversation: Conversation): string[] {
    return [conversation.customerId, conversation.courierId, conversation.adminId].filter(
      (id): id is string => !!id
    );
  }

  private static myReadAt(conversation: Conversation, role: string): Date | null {
    return conversation[SENDER_ROLE_COLUMN[role] ?? "customerReadAt"] || null;
  }

  private static displayNameFor(conversation: Conversation, meId: string, names: Map<string, { name: string | null; role: string | null }>): {
    name: string | null;
    role: string | null;
  } {
    const order: string[] = [conversation.customerId, conversation.courierId, conversation.adminId].filter(
      (id): id is string => !!id
    );
    const other = order.find((id) => id !== meId);
    if (!other) return { name: null, role: null };
    return names.get(other) || { name: null, role: null };
  }

  public static async threads(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.send(super.response(super._401, null, ["Unauthorized"]));

      const repo = AppDataSource.getRepository(Conversation);
      const conversations = await repo.find({
        where: [
          { customerId: userId },
          { courierId: userId },
          { adminId: userId },
        ],
        order: { lastMessageAt: "DESC" },
      });

      const ids = conversations.flatMap((c) => MessageController.participantIds(c));
      const names = await MessageController.loadUserNames([...new Set(ids)]);

      const messageRepo = AppDataSource.getRepository(Message);
      const result = [];
      for (const conversation of conversations) {
        const role = req.user?.role || "customer";
        const readAt = MessageController.myReadAt(conversation, role);
        const messages = await messageRepo.find({ where: { conversationId: conversation.id } });
        const unreadCount = messages.filter(
          (m) => m.senderId !== userId && (!readAt || new Date(m.createdAt).getTime() > new Date(readAt).getTime())
        ).length;
        const other = MessageController.displayNameFor(conversation, userId, names);
        result.push({
          id: conversation.id,
          threadKey: conversation.threadKey,
          deliveryId: conversation.deliveryId,
          subject: conversation.subject,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          lastMessageAt: conversation.lastMessageAt,
          lastMessagePreview: conversation.lastMessagePreview,
          otherName: other.name,
          otherRole: other.role,
          unreadCount,
        });
      }

      return res.send(super.response(super._200, { items: result, meta: { total: result.length } }));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async thread(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.send(super.response(super._401, null, ["Unauthorized"]));

      const { id } = req.params;
      const repo = AppDataSource.getRepository(Conversation);
      const conversation = await repo.findOne({ where: { id } });
      if (!conversation) {
        return res.send(super.response(super._404, null, ["Conversation not found"]));
      }
      if (!MessageController.isParticipant(conversation, userId)) {
        return res.send(super.response(super._403, null, ["Not a participant"]));
      }

      const ids = MessageController.participantIds(conversation);
      const names = await MessageController.loadUserNames(ids);

      const messageRepo = AppDataSource.getRepository(Message);
      const messages = await messageRepo.find({
        where: { conversationId: id },
        order: { createdAt: "ASC" },
      });

      // Mark read for this participant's role.
      const role = req.user?.role || "customer";
      const column = SENDER_ROLE_COLUMN[role];
      if (column) {
        conversation[column] = new Date();
        await repo.save(conversation);
      }

      const participants = {
        customer: conversation.customerId ? { id: conversation.customerId, name: names.get(conversation.customerId)?.name ?? null } : null,
        courier: conversation.courierId ? { id: conversation.courierId, name: names.get(conversation.courierId)?.name ?? null } : null,
        admin: conversation.adminId ? { id: conversation.adminId, name: names.get(conversation.adminId)?.name ?? null } : null,
      };

      return res.send(
        super.response(super._200, {
          conversation,
          messages,
          participants,
        })
      );
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async createThread(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.send(super.response(super._401, null, ["Unauthorized"]));
      const role = req.user?.role || "customer";

      const { deliveryId, customerUserId, courierUserId, subject } = req.body || {};

      // Only admins need an explicit recipient; customers/couriers are derived
      // from their authenticated user below.
      if (role === "admin" && !deliveryId && !customerUserId && !courierUserId) {
        return res.send(super.response(super._400, null, ["Choose a customer or courier"]));
      }

      const repo = AppDataSource.getRepository(Conversation);
      const userRepo = AppDataSource.getRepository(User);

      let threadKey: string;
      let customerId: string | undefined;
      let courierId: string | undefined;
      let adminId: string | undefined;

      if (deliveryId) {
        const deliveryRepo = AppDataSource.getRepository(Delivery);
        const delivery = await deliveryRepo.findOne({ where: { id: deliveryId } });
        if (!delivery) {
          return res.send(super.response(super._404, null, ["Delivery not found"]));
        }
        // Only the delivery's customer, its courier, or an admin may open its thread.
        const isAdmin = role === "admin";
        if (!isAdmin && userId !== delivery.customerId && userId !== delivery.courierId) {
          return res.send(super.response(super._403, null, ["Not a participant of this delivery"]));
        }
        threadKey = `d:${delivery.id}`;
        customerId = delivery.customerId;
        courierId = delivery.courierId || undefined;
        if (isAdmin) {
          adminId = userId;
        } else {
          const admin = await userRepo.findOne({ where: { role: UserRole.ADMIN } });
          adminId = admin?.id || undefined;
        }
      } else {
        // General support thread (deliveryId = null).
        if (role === "admin") {
          if (!customerUserId && !courierUserId) {
            return res.send(super.response(super._400, null, ["Choose a customer or courier"]));
          }
          if (customerUserId && courierUserId) {
            return res.send(super.response(super._400, null, ["Choose either a customer or a courier, not both"]));
          }
          adminId = userId;
          customerId = customerUserId || undefined;
          courierId = courierUserId || undefined;
        } else {
          // Customers and couriers can only start support threads with an admin.
          if (customerUserId || courierUserId) {
            return res.send(
              super.response(super._403, null, ["Customers and couriers can only message support"])
            );
          }
          adminId = (await userRepo.findOne({ where: { role: UserRole.ADMIN } }))?.id || undefined;
          if (role === "customer") customerId = userId;
          if (role === "courier") courierId = userId;
        }
        const keyParts = [
          "s",
          customerId || "-",
          courierId || "-",
          adminId || "-",
        ];
        threadKey = keyParts.join(":");
      }

      // Idempotent: return the existing thread if present.
      const existing = await repo.findOne({ where: { threadKey } });
      if (existing) {
        return res.send(super.response(super._200, { conversation: existing, created: false }));
      }

      const conversation = new Conversation();
      conversation.threadKey = threadKey;
      conversation.deliveryId = deliveryId || null;
      conversation.customerId = customerId || null;
      conversation.courierId = courierId || null;
      conversation.adminId = adminId || null;
      conversation.subject = subject ? String(subject).slice(0, 300) : null;
      conversation.createdById = userId;
      conversation.createdByIdRole = role;
      const now = new Date();
      conversation.createdAt = now;
      conversation.updatedAt = now;
      conversation.lastMessageAt = null;
      conversation.lastMessagePreview = null;
      conversation.customerReadAt = role === "customer" ? now : null;
      conversation.courierReadAt = role === "courier" ? now : null;
      conversation.adminReadAt = role === "admin" ? now : null;

      await repo.save(conversation);
      return res.send(super.response(super._201, { conversation, created: true }));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async sendMessage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.send(super.response(super._401, null, ["Unauthorized"]));
      const role = req.user?.role || "customer";

      const { id } = req.params;
      const { body } = req.body || {};
      if (!body || !String(body).trim()) {
        return res.send(super.response(super._400, null, ["Message body is required"]));
      }

      const repo = AppDataSource.getRepository(Conversation);
      const conversation = await repo.findOne({ where: { id } });
      if (!conversation) {
        return res.send(super.response(super._404, null, ["Conversation not found"]));
      }
      if (!MessageController.isParticipant(conversation, userId)) {
        return res.send(super.response(super._403, null, ["Not a participant"]));
      }

      const messageRepo = AppDataSource.getRepository(Message);
      const message = new Message();
      message.conversationId = conversation.id;
      message.senderId = userId;
      message.senderRole = role;
      message.body = String(body).trim();
      message.createdAt = new Date();
      await messageRepo.save(message);

      const now = new Date();
      conversation.lastMessageAt = now;
      conversation.lastMessagePreview = truncatePreview(message.body);
      conversation.updatedAt = now;
      const readColumn = SENDER_ROLE_COLUMN[role];
      if (readColumn) conversation[readColumn] = now;
      await repo.save(conversation);

      const participantIds = MessageController.participantIds(conversation);
      SocketService.getInstance().broadcastNewMessage(conversation, message, participantIds);

      return res.send(super.response(super._201, { message, conversation }));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }

  public static async unreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.send(super.response(super._401, null, ["Unauthorized"]));
      const role = req.user?.role || "customer";

      const repo = AppDataSource.getRepository(Conversation);
      const messageRepo = AppDataSource.getRepository(Message);
      const conversations = await repo.find({
        where: [
          { customerId: userId },
          { courierId: userId },
          { adminId: userId },
        ],
      });

      let total = 0;
      for (const conversation of conversations) {
        const readAt = MessageController.myReadAt(conversation, role);
        const messages = await messageRepo.find({ where: { conversationId: conversation.id } });
        total += messages.filter(
          (m) => m.senderId !== userId && (!readAt || new Date(m.createdAt).getTime() > new Date(readAt).getTime())
        ).length;
      }

      return res.send(super.response(super._200, { unreadCount: total }));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
public static async recipients(req: Request, res: Response) {
    try {
      const role = req.user?.role;
      if (role !== "admin") {
        return res.send(super.response(super._403, null, ["Admins only"]));
      }
      const userRepo = AppDataSource.getRepository(User);
      const users = await userRepo.find({
        where: { role: In([UserRole.CUSTOMER, UserRole.COURIER]) },
        order: { firstname: "ASC" },
      });
      const result = users.map((u) => ({
        id: u.id,
        name: `${u.firstname} ${u.lastname}`.trim(),
        role: u.role,
      }));
      return res.send(super.response(super._200, { items: result }));
    } catch (error) {
      return res.send(super.response(super._500, null, super.ex(error)));
    }
  }
}

export default MessageController;