import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import corsOptions from "../../configs/corsconfig";
import AppDataSource from "../../configs/ormconfig";
import { Conversation } from "../../models/conversation.entity";
import { isConversationParticipant } from "../conversation-participant";

const TOKEN_SECRET = process.env.TOKEN_SECRET;

export interface SocketUser {
  id: string;
  role: string;
  email: string;
}

function emitError(socket: Socket, message: string) {
  socket.emit("error", { message });
}

export class SocketService {
  private static instance: SocketService;
  private io: Server | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public initialize(server: any): Server {
    this.io = new Server(server, {
      cors: {
        origin: corsOptions.origin,
        methods: ["GET", "POST"],
      },
    });

    // Strict handshake auth: every socket must present a valid JWT.
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token || !TOKEN_SECRET) {
        next(new Error("Authentication required"));
        return;
      }
      try {
        const payload = jwt.verify(token, TOKEN_SECRET) as SocketUser;
        socket.data.user = payload;
        next();
      } catch {
        next(new Error("Invalid or expired token"));
      }
    });

    this.setupSocketHandlers();
    return this.io;
  }

  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on("connection", (socket: Socket) => {
      // Join the user's personal room so unread badges can be pushed.
      const user = socket.data.user as SocketUser | undefined;
      if (user?.id) {
        socket.join(`u:${user.id}`);
      }
      // Join a role room so role-scoped broadcasts (e.g. availability to admins) reach the right clients.
      if (user?.role) {
        socket.join(`role:${user.role}`);
      }

      socket.on("thread:join", async (data: { conversationId: string }) => {
        const userId = socket.data.user?.id as string | undefined;
        if (!userId || !data?.conversationId) {
          emitError(socket, "Invalid thread");
          return;
        }
        try {
          const conversation = await AppDataSource.getRepository(Conversation).findOne({
            where: { id: data.conversationId },
          });
          if (!conversation || !isConversationParticipant(conversation, userId)) {
            emitError(socket, "Not a participant");
            return;
          }
          socket.join(`conversation:${data.conversationId}`);
        } catch {
          emitError(socket, "Unable to join thread");
        }
      });

      socket.on("thread:leave", (data: { conversationId: string }) => {
        if (data?.conversationId) {
          socket.leave(`conversation:${data.conversationId}`);
        }
      });

      socket.on("disconnect", () => {});
    });
  }

  public emitToUser(userId: string, event: string, payload: unknown) {
    this.io?.to(`u:${userId}`).emit(event, payload);
  }

  public emitToRole(role: string, event: string, payload: unknown) {
    this.io?.to(`role:${role}`).emit(event, payload);
  }

  public broadcastNewMessage(
    conversation: { id: string; customerId: string | null; courierId: string | null; adminId: string | null },
    message: { id: string; conversationId: string; senderId: string; senderRole: string; body: string; createdAt: Date },
    participantIds: string[]
  ) {
    const conversationId = conversation.id;

    // Deliver to every participant except the sender (they already rendered their own message).
    participantIds.forEach((userId) => {
      if (userId !== message.senderId) {
        this.emitToUser(userId, "message:new", { conversationId, message });
        this.emitToUser(userId, "unread:change", { conversationId });
      }
    });
  }

  public getIO(): Server | null {
    return this.io;
  }
}

export default SocketService;