import { io, Socket } from "socket.io-client";
import type { NewMessagePayload } from "@/types/message";

export interface LocationUpdatePayload {
  courierId: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  speed: number | null;
  recordedAt: string;
}

export interface CourierAvailabilityPayload {
  courierId: string;
  courierName: string | null;
  vehicleType: string | null;
  availabilityStatus: string;
  lastSeenAt: string | null;
  updatedAt: string;
}

function resolveSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      /* fall through to default */
    }
  }
  return "http://localhost:4000";
}

class MessagingSocket {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token?: string): Socket | null {
    if (token) this.token = token;

    if (!this.socket) {
      this.socket = io(resolveSocketUrl(), {
        transports: ["websocket", "polling"],
        auth: (cb) => cb({ token: this.token || undefined }),
        autoConnect: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on("connect", () => {
        console.log("[messaging] connected", this.socket?.id);
      });
      this.socket.on("disconnect", (reason) => {
        console.log("[messaging] disconnected", reason);
      });
      this.socket.on("connect_error", (error) => {
        console.error("[messaging] connection error", error.message);
      });
    }

    if (this.token && !this.socket.connected && !this.socket.active) {
      this.socket.connect();
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  joinThread(conversationId: string) {
    this.socket?.emit("thread:join", { conversationId });
  }

  leaveThread(conversationId: string) {
    this.socket?.emit("thread:leave", { conversationId });
  }

  onMessage(callback: (payload: NewMessagePayload) => void) {
    this.socket?.on("message:new", callback);
  }

  offMessage(callback: (payload: NewMessagePayload) => void) {
    this.socket?.off("message:new", callback);
  }

  onUnread(callback: (payload: { conversationId: string }) => void) {
    this.socket?.on("unread:change", callback);
  }

  offUnread(callback: (payload: { conversationId: string }) => void) {
    this.socket?.off("unread:change", callback);
  }

  onLocationUpdate(callback: (payload: LocationUpdatePayload) => void) {
    this.socket?.on("location:update", callback);
  }

  offLocationUpdate(callback: (payload: LocationUpdatePayload) => void) {
    this.socket?.off("location:update", callback);
  }

  onAvailability(callback: (payload: CourierAvailabilityPayload) => void) {
    this.socket?.on("courier:availability", callback);
  }

  offAvailability(callback: (payload: CourierAvailabilityPayload) => void) {
    this.socket?.off("courier:availability", callback);
  }
}

export const messagingSocket = new MessagingSocket();