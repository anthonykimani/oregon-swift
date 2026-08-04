"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { messagingSocket } from "@/lib/messaging/socket-client";

export const UNREAD_REFRESH_EVENT = "oc:unread-refresh";

export function useUnreadCount(token?: string) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(() => {
    if (!token) return;
    api<{ unreadCount: number }>("/messages/unread-count", { token })
      .then((res) => {
        if (res.status === 200 && res.data) setUnreadCount(res.data.unreadCount);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api<{ unreadCount: number }>("/messages/unread-count", { token })
      .then((res) => {
        if (!cancelled && res.status === 200 && res.data) setUnreadCount(res.data.unreadCount);
      })
      .catch(() => {});
    messagingSocket.connect(token);
    const onUnread = () => refresh();
    const onWindow = () => refresh();
    messagingSocket.onUnread(onUnread);
    window.addEventListener(UNREAD_REFRESH_EVENT, onWindow);
    return () => {
      cancelled = true;
      messagingSocket.offUnread(onUnread);
      window.removeEventListener(UNREAD_REFRESH_EVENT, onWindow);
    };
  }, [token, refresh]);

  return { unreadCount, refresh };
}

export function notifyUnreadRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(UNREAD_REFRESH_EVENT));
  }
}