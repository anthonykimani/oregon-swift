"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { messagingSocket } from "@/lib/messaging/socket-client";
import { notifyUnreadRefresh } from "@/lib/messaging/use-unread-count";
import type { ConversationSummary, NewMessagePayload } from "@/types/message";
import { ThreadList } from "./thread-list";
import { ConversationPane } from "./conversation-pane";
import { NewThreadDialog } from "./new-thread-dialog";

export function MessagesView({
  token,
  myId,
  myRole,
  basePath,
  initialConversationId,
}: {
  token?: string;
  myId: string;
  myRole: string;
  basePath: string;
  initialConversationId?: string | null;
}) {
  const router = useRouter();
  const [threads, setThreads] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(initialConversationId ?? null);
  const [newOpen, setNewOpen] = useState(false);

  const loadThreads = useCallback(() => {
    if (!token) return;
    let cancelled = false;
    api<{ items: ConversationSummary[] }>("/messages/threads", { token })
      .then((res) => {
        if (!cancelled && res.status === 200 && res.data) setThreads(res.data.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!token) return;
    messagingSocket.connect(token);
    const onNew = (payload: NewMessagePayload) => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === payload.conversationId
            ? {
                ...t,
                lastMessageAt: payload.message.createdAt,
                lastMessagePreview: payload.message.body,
              }
            : t
        )
      );
    };
    const onUnread = () => {
      loadThreads();
      notifyUnreadRefresh();
    };
    messagingSocket.onMessage(onNew);
    messagingSocket.onUnread(onUnread);
    return () => {
      messagingSocket.offMessage(onNew);
      messagingSocket.offUnread(onUnread);
    };
  }, [token, loadThreads]);

  function selectThread(id: string) {
    setActiveId(id);
    router.replace(`${basePath}?thread=${encodeURIComponent(id)}`, { scroll: false });
  }

  function closeThread() {
    setActiveId(null);
    router.replace(basePath, { scroll: false });
  }

  function handleCreated(conversationId: string) {
    setNewOpen(false);
    loadThreads();
    selectThread(conversationId);
  }

  return (
    <div data-message-role={myRole} className="flex h-full min-h-0 flex-col gap-3 bg-[#F3F5F1] p-3 sm:p-5 lg:flex-row lg:gap-4 lg:p-6">
      <div className={`${activeId ? "hidden lg:flex" : "flex"} min-h-0 flex-col lg:w-[340px] lg:shrink-0`}>
        <div className="flex-1 min-h-0">
          <ThreadList
            threads={threads}
            activeId={activeId}
            loading={loading}
            onSelect={selectThread}
            onNew={() => setNewOpen(true)}
            canStartNew
          />
        </div>
      </div>

      <div className={`${activeId ? "flex" : "hidden lg:flex"} flex-col flex-1 min-h-0`}>
        <ConversationPane
          key={activeId ?? "none"}
          conversationId={activeId}
          token={token}
          myId={myId}
          onClose={closeThread}
        />
      </div>

      <NewThreadDialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        role={myRole}
        token={token}
        onCreated={handleCreated}
      />
    </div>
  );
}
