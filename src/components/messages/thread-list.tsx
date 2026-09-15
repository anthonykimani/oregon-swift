"use client";

import { ChatsCircle, Package, Plus } from "@phosphor-icons/react";
import type { ConversationSummary } from "@/types/message";

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

function relativeTime(ts: string | null) {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ThreadList({
  threads,
  activeId,
  loading,
  onSelect,
  onNew,
  canStartNew,
}: {
  threads: ConversationSummary[];
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  canStartNew: boolean;
}) {
  return (
    <div className="h-full flex flex-col bg-white border border-[#DCE2D9] rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3E6ED]">
        <h2 className="text-sm font-manrope font-bold text-[#161618]">Messages</h2>
        {canStartNew && (
          <button
            type="button"
            onClick={onNew}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-manrope font-semibold text-[#12806B] hover:bg-[#EFFEFA] transition-colors"
          >
            <Plus size={14} weight="bold" />
            New
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="space-y-2 p-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#F3F5F1] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <ChatsCircle size={28} className="text-[#E3E6ED] mb-2" />
            <p className="text-sm font-manrope text-[#8094A7]">No conversations yet</p>
            {canStartNew && (
              <button
                type="button"
                onClick={onNew}
                className="mt-3 text-xs font-manrope font-semibold text-[#12806B] hover:underline"
              >
                Start a conversation
              </button>
            )}
          </div>
        ) : (
          threads.map((t) => {
            const active = t.id === activeId;
            const unread = t.unreadCount > 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect(t.id)}
                className={`w-full text-left px-3 py-3 flex items-center gap-3 transition-colors border-b border-[#F0F0F0] last:border-b-0 ${
                  active ? "bg-[#EFFEFA]" : "hover:bg-[#F9F9FB]"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold font-manrope shrink-0 ${
                    t.deliveryId ? "bg-[#FDEBD9] text-[#B05E03]" : "bg-[#EFFEFA] text-[#12806B]"
                  }`}
                >
                  {initials(t.otherName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-manrope font-semibold text-[#161618] truncate">
                      {t.otherName ?? t.subject ?? "Conversation"}
                    </p>
                    <span className="text-xs font-manrope text-[#8094A7] shrink-0">
                      {relativeTime(t.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-manrope text-[#8094A7] truncate">
                      {t.deliveryId ? (
                        <span className="flex items-center gap-1">
                          <Package size={11} className="shrink-0" />
                          {t.lastMessagePreview ?? "No messages yet"}
                        </span>
                      ) : (
                        t.lastMessagePreview ?? "No messages yet"
                      )}
                    </p>
                    {unread && (
                      <span className="h-[18px] min-w-[18px] px-1 flex items-center justify-center rounded-full bg-[#C0392B] text-white text-xs font-manrope font-bold shrink-0">
                        {t.unreadCount > 99 ? "99+" : t.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}