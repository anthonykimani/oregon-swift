"use client";

import { useState, useEffect } from "react";
import { MagnifyingGlass, ChatsCircle } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import type { Conversation } from "@/types/message";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RecipientOption {
  id: string;
  name: string;
  role: string;
}

export function NewThreadDialog({
  open,
  onClose,
  role,
  token,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  role: string;
  token?: string;
  onCreated: (conversationId: string) => void;
}) {
  const isAdmin = role === "admin";
  const [recipients, setRecipients] = useState<RecipientOption[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<RecipientOption | null>(null);
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingRecipients, setLoadingRecipients] = useState(() => isAdmin);

  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setSubject("");
      setSelected(null);
      setSearch("");
      setError("");
    }
  }

  useEffect(() => {
    if (!isAdmin || !token) return;
    let cancelled = false;
    api<{ items: RecipientOption[] }>("/messages/recipients", { token })
      .then((res) => {
        if (!cancelled && res.status === 200 && res.data?.items) {
          setRecipients(res.data.items);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingRecipients(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, token]);

  const filtered = search.trim()
    ? recipients.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()))
    : recipients;

  async function submit() {
    if (!token || submitting) return;
    setSubmitting(true);
    setError("");
    const body: Record<string, string> = { subject: subject.trim() || "Support" };
    if (isAdmin && selected) body[selected.role === "customer" ? "customerUserId" : "courierUserId"] = selected.id;
    const res = await api<{ conversation: Conversation }>("/messages/threads", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    });
    setSubmitting(false);
    if ((res.status === 200 || res.status === 201) && res.data?.conversation) {
      onCreated(res.data.conversation.id);
    } else {
      setError(res.errors?.[0] || "Failed to start conversation");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-manrope">New conversation</DialogTitle>
          <DialogDescription className="font-manrope">
            {isAdmin
              ? "Choose a customer or courier to message."
              : "Start a support conversation with our team."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isAdmin ? (
            <div>
              <Label className="text-xs font-manrope font-semibold text-[#333333] mb-1.5 block">
                Recipient
              </Label>
              <div className="relative mb-2">
                <MagnifyingGlass
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8094A7]"
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search people…"
                  className="pl-9 font-manrope text-sm"
                />
              </div>
              <div className="max-h-56 overflow-y-auto border border-[#E3E6ED] rounded-lg p-1.5">
                {loadingRecipients ? (
                  <div className="p-3 text-center">
                    <div className="h-5 w-5 border-2 border-[#B3BCC6] border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="text-center text-sm font-manrope text-[#8094A7] py-4">
                    No recipients found
                  </p>
                ) : (
                  filtered.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelected(r)}
                      className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors ${
                        selected?.id === r.id ? "bg-[#EFFEFA]" : "hover:bg-[#F9F9FB]"
                      }`}
                    >
                      <span className="h-8 w-8 rounded-full bg-[#F0F0F0] flex items-center justify-center text-xs font-semibold font-manrope text-[#333333] shrink-0">
                        {r.name
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-manrope text-[#161618] truncate">{r.name}</span>
                        <span className="block text-xs font-manrope text-[#8094A7] capitalize">{r.role}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-[#EFFEFA] border border-[#CBE7DD] px-3.5 py-3">
              <ChatsCircle size={20} className="text-[#12806B] shrink-0" />
              <p className="text-xs font-manrope text-[#0E5B4A]">
                Your message goes to our support team, who can assist with deliveries, orders, and
                account questions.
              </p>
            </div>
          )}

          <div>
            <Label className="text-xs font-manrope font-semibold text-[#333333] mb-1.5 block">
              Subject <span className="text-[#8094A7] font-normal">(optional)</span>
            </Label>
            <Textarea
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is this about?"
              rows={2}
              className="font-manrope text-sm resize-none"
            />
          </div>

          {error && (
            <div className="bg-[#FCDEE0] text-[#C0392B] text-xs rounded-lg px-3 py-2">{error}</div>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-10 rounded-xl text-sm font-manrope font-semibold text-[#333333] hover:bg-[#F0F0F0] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || (isAdmin && !selected)}
            className="px-5 h-10 rounded-xl bg-[#173420] text-white text-sm font-manrope font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1F4228] transition-colors"
          >
            {submitting ? "Starting…" : "Start conversation"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}