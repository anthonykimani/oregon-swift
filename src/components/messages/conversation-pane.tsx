"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PaperPlaneTilt, Package, ChatsCircle, ArrowLeft } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { messagingSocket } from "@/lib/messaging/socket-client";
import { notifyUnreadRefresh } from "@/lib/messaging/use-unread-count";
import type { Message, NewMessagePayload, ThreadDetail } from "@/types/message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

function formatTime(ts: string) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDateKey(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ConversationPane({
  conversationId,
  token,
  myId,
  onClose,
}: {
  conversationId: string | null;
  token?: string;
  myId: string;
  onClose?: () => void;
}) {
  const [detail, setDetail] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    if (!conversationId || !token) return undefined;
    let cancelled = false;
    api<ThreadDetail>(`/messages/threads/${conversationId}`, { token })
      .then((res) => {
        if (cancelled) return;
        if (res.status === 200 && res.data) {
          setDetail(res.data);
          setError("");
          notifyUnreadRefresh();
        } else {
          setError(res.errors?.[0] || "Failed to load thread");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load thread");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [conversationId, token]);

  useEffect(() => {
    if (!conversationId || !token) return;

    messagingSocket.connect(token);
    messagingSocket.joinThread(conversationId);
    const cleanup = load();

    const onNew = (payload: NewMessagePayload) => {
      if (payload.conversationId !== conversationId) return;
      setDetail((prev) => {
        if (!prev) return prev;
        if (prev.messages.some((m) => m.id === payload.message.id)) return prev;
        return { ...prev, messages: [...prev.messages, payload.message] };
      });
      notifyUnreadRefresh();
    };
    messagingSocket.onMessage(onNew);

    return () => {
      cleanup?.();
      messagingSocket.offMessage(onNew);
      messagingSocket.leaveThread(conversationId);
    };
  }, [conversationId, token, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [detail?.messages.length, conversationId]);

  async function send() {
    const body = draft.trim();
    if (!body || !conversationId || !token || sending) return;
    setSending(true);
    setError("");
    const res = await api<{ message: Message }>(`/messages/${conversationId}`, {
      method: "POST",
      token,
      body: JSON.stringify({ body }),
    });
    setSending(false);
    if (res.status === 201 && res.data?.message) {
      const sent = res.data.message;
      setDetail((prev) => {
        if (!prev) return prev;
        if (prev.messages.some((m) => m.id === sent.id)) return prev;
        return { ...prev, messages: [...prev.messages, sent] };
      });
      setDraft("");
      notifyUnreadRefresh();
    } else {
      setError(res.errors?.[0] || "Failed to send message");
    }
  }

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F3F5F1]">
        <div className="text-center">
          <ChatsCircle size={40} className="mx-auto text-[#E3E6ED] mb-3" />
          <p className="text-sm font-manrope text-[#8094A7]">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  const participants = detail?.participants;
  const otherKey =
    participants?.customer?.id !== myId && participants?.customer
      ? "customer"
      : participants?.courier?.id !== myId && participants?.courier
        ? "courier"
        : participants?.admin && participants.admin.id !== myId
          ? "admin"
          : null;
  const otherName =
    (otherKey && participants?.[otherKey as keyof typeof participants]?.name) || detail?.conversation?.subject || "Conversation";

  const messages = detail?.messages ?? [];
  const roleLabels: Record<string, string> = {
    customer: "Customer",
    courier: "Courier",
    admin: "Support",
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-white border border-[#DCE2D9] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E3E6ED] bg-[#f9f9fb]">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#333333] hover:bg-[#F0F0F0] transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-[#EFFEFA] flex items-center justify-center text-[#12806B] text-xs font-semibold font-manrope shrink-0">
          {initials(otherName)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-manrope font-semibold text-[#161618] truncate">{otherName}</p>
          <p className="text-xs font-manrope text-[#8094A7] flex items-center gap-1">
            {detail?.conversation?.deliveryId ? (
              <>
                <Package size={11} /> Delivery thread
              </>
            ) : (
              <>
                <ChatsCircle size={11} /> Support
              </>
            )}
            {otherKey ? ` · ${roleLabels[otherKey]}` : ""}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 px-4 py-4 bg-[#F3F5F1]">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}>
                <div className="h-10 w-40 bg-[#E3E6ED] rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-sm font-manrope text-[#8094A7]">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((m, i) => {
              const mine = m.senderId === myId;
              const showDate = i === 0 || formatDateKey(m.createdAt) !== formatDateKey(messages[i - 1].createdAt);
              return (
                <div key={m.id}>
                  {showDate && (
                    <div className="flex justify-center my-3">
                      <span className="text-xs font-manrope text-[#8094A7] bg-white border border-[#E3E6ED] rounded-full px-2.5 py-0.5">
                        {formatDateKey(m.createdAt)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${mine ? "justify-end" : "justify-start"} mb-1.5`}>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${mine ? "bg-[#173420] text-white" : "bg-white border border-[#E3E6ED] text-[#333333]"}`}>
                      <p className="text-sm font-manrope whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={`text-xs font-manrope mt-1 ${mine ? "text-[#A8CDB4]" : "text-[#8094A7]"}`}>
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Composer */}
      <div className="border-t border-[#E3E6ED] p-3 bg-white">
        {error && (
          <div className="mb-2 bg-[#FCDEE0] text-[#C0392B] text-xs rounded-lg px-3 py-2">{error}</div>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message…"
            rows={1}
            className="min-h-[40px] max-h-[120px] resize-none bg-[#F3F5F1] border-[#DCE2D9] rounded-2xl text-sm text-[#333333] placeholder:text-[#8094A7]"
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !draft.trim()}
            className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[#173420] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1F4228] transition-colors"
            aria-label="Send message"
          >
            <PaperPlaneTilt size={18} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}