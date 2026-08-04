"use client";

import { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Receipt,
  CheckCircle,
  WarningCircle,
  Bank,
  Clock,
  ArrowCounterClockwise,
  Plus,
  CaretDown,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { api } from "@/lib/api";
import type { Invoice } from "@/types/delivery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 10;

type TabKey = "all" | "processing" | "disputed" | "paid" | "overdue" | "unpaid";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "processing", label: "Processing" },
  { key: "disputed", label: "Disputed" },
  { key: "paid", label: "Paid" },
  { key: "overdue", label: "Overdue" },
  { key: "unpaid", label: "Unpaid" },
];

function formatDate(ts: string | null | undefined) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(ts: string | null | undefined) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatCents(cents: number | null | undefined) {
  if (cents == null) return "$0.00";
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  paid: { bg: "bg-[#D9F9E7]", text: "text-[#007837]", label: "Paid" },
  processing: { bg: "bg-[#E3EEFB]", text: "text-[#2563EB]", label: "Processing" },
  disputed: { bg: "bg-[#FDE7EA]", text: "text-[#C0392B]", label: "Disputed" },
  sent: { bg: "bg-[#E3EEFB]", text: "text-[#2563EB]", label: "Sent" },
  unpaid: { bg: "bg-[#FEF7E0]", text: "text-[#B8860B]", label: "Unpaid" },
  draft: { bg: "bg-[#F0F0F0]", text: "text-[#999999]", label: "Draft" },
};

function statusColor(status: string) {
  return STATUS_COLORS[status] || { bg: "bg-[#F0F0F0]", text: "text-[#999999]", label: status };
}

const ACTION_LABELS: Record<string, string> = {
  requested: "Payment requested",
  confirmed: "Payment confirmed",
  disputed: "Dispute raised",
  approved: "Payment approved",
  released: "Released",
};

function InvoicesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const token = session?.accessToken;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Invoice | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [releaseFor, setReleaseFor] = useState<Invoice | null>(null);
  const [releaseNote, setReleaseNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  const load = useCallback(() => {
    if (!token) return;
    api<{ items: Invoice[]; counts: Record<string, number> }>("/admin/invoices", { token }).then((res) => {
      if (res.status === 200 && res.data) {
        setInvoices(res.data.items);
        setCounts(res.data.counts || {});
        setSelectedId((prev) => prev || res.data.items[0]?.id || null);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    load();
  }, [token, load]);

  useEffect(() => {
    if (!token || !selectedId) return;
    let cancelled = false;
    const id = selectedId;
    api<Invoice>(`/admin/invoices/${id}`, { token }).then((res) => {
      if (cancelled) return;
      if (res.status === 200 && res.data) setDetail(res.data);
    });
    return () => { cancelled = true; };
  }, [token, selectedId]);

  const detailLoading = Boolean(selectedId && (!detail || detail.id !== selectedId));

  const applyUpdate = useCallback((updated: Invoice) => {
    setInvoices((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)));
    setDetail((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  }, []);

  const handleApprove = useCallback((inv: Invoice) => {
    if (!token) return;
    setActionId(inv.id);
    api<Invoice>(`/admin/invoices/${inv.id}/approve`, { method: "POST", token }).then((res) => {
      setActionId(null);
      if (res.status === 200 && res.data) {
        applyUpdate(res.data);
        toast.success(`${res.data.number} approved`);
      } else {
        toast.error(res.errors?.[0] || "Failed to approve");
      }
    });
  }, [token, applyUpdate]);

  const openRelease = (inv: Invoice) => {
    setReleaseFor(inv);
    setReleaseNote("");
  };

  const submitRelease = useCallback(() => {
    if (!token || !releaseFor) return;
    setSubmitting(true);
    api<Invoice>(`/admin/invoices/${releaseFor.id}/release`, {
      method: "POST",
      token,
      body: JSON.stringify({ note: releaseNote.trim() }),
    }).then((res) => {
      setSubmitting(false);
      if (res.status === 200 && res.data) {
        applyUpdate(res.data);
        setReleaseFor(null);
        toast.success(`${res.data.number} released`);
      } else {
        toast.error(res.errors?.[0] || "Failed to release");
      }
    });
  }, [token, releaseFor, releaseNote, applyUpdate]);

  const handleGenerate = useCallback(() => {
    if (!token) return;
    setActionId("generate");
    api<{ created: number; updated: number; billed: number }>("/admin/invoices/generate", {
      method: "POST",
      token,
    }).then((res) => {
      setActionId(null);
      if (res.status === 200 && res.data) {
        toast.success(`Generated ${res.data.created} invoice(s)`);
        setLoading(true);
        load();
      } else {
        toast.error(res.errors?.[0] || "Failed to generate invoices");
      }
    });
  }, [token, load]);

  const summary = useMemo(() => {
    const isOverdue = (i: Invoice) => i.overdue === true;
    const sum = (list: Invoice[]) => list.reduce((s, i) => s + (i.totalCents || 0), 0);
    const cards: { key: string; label: string; amount: number; count: number; icon: React.ReactNode; bg: string; color: string }[] = [];
    const defs = [
      { key: "processing", label: "Processing", icon: <Clock size={16} />, bg: "bg-[#E3EEFB]", color: "text-[#2563EB]" },
      { key: "paid", label: "Paid", icon: <CheckCircle size={16} />, bg: "bg-[#D9F9E7]", color: "text-[#007837]" },
      { key: "disputed", label: "Disputed", icon: <WarningCircle size={16} />, bg: "bg-[#FDE7EA]", color: "text-[#C0392B]" },
      { key: "overdue", label: "Overdue", icon: <ArrowCounterClockwise size={16} />, bg: "bg-[#FCDEE0]", color: "text-[#C0392B]" },
      { key: "unpaid", label: "Unpaid", icon: <Bank size={16} />, bg: "bg-[#F0F0F0]", color: "text-[#333333]" },
    ];
    for (const d of defs) {
      let list: Invoice[] = [];
      if (d.key === "overdue") list = invoices.filter(isOverdue);
      else if (d.key === "unpaid") list = invoices.filter((i) => ["unpaid", "sent", "draft"].includes(i.status));
      else list = invoices.filter((i) => i.status === d.key);
      cards.push({ ...d, amount: sum(list), count: list.length });
    }
    return cards;
  }, [invoices]);

  const filtered = useMemo(() => {
    let list = invoices;
    if (tab === "processing") list = list.filter((i) => i.status === "processing");
    if (tab === "disputed") list = list.filter((i) => i.status === "disputed");
    if (tab === "paid") list = list.filter((i) => i.status === "paid");
    if (tab === "overdue") list = list.filter((i) => i.overdue === true);
    if (tab === "unpaid") list = list.filter((i) => ["unpaid", "sent", "draft"].includes(i.status));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((i) =>
        i.number.toLowerCase().includes(q) ||
        (i.customerName || "").toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => new Date(b.issuedAt || b.id).getTime() - new Date(a.issuedAt || a.id).getTime());
  }, [invoices, tab, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <div className="h-full flex flex-col bg-[#F5F4FD] overflow-y-auto">
        <div className="px-4 sm:px-6 pt-8 pb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-clash-display font-semibold text-[#173420]">Invoices</h1>
            <p className="text-sm text-[#8094A7] font-inter mt-1">
              Bird&apos;s-eye view of customer invoices, payments and disputes
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={actionId === "generate"}
            className="h-9 px-4 bg-[#F3BC24] hover:bg-[#F5C94A] text-white rounded-lg text-sm font-manrope font-medium transition-colors disabled:opacity-60"
          >
            <Plus size={16} weight="bold" />
            {actionId === "generate" ? "Generating…" : "Generate invoices"}
          </Button>
        </div>

        <div className="px-4 sm:px-6 grid grid-cols-2 xl:grid-cols-5 gap-3 mb-4">
          {loading
            ? [...Array(5)].map((_, i) => (
                <div key={i} className="bg-white border border-[#E3E6ED] rounded-xl p-4 animate-pulse">
                  <div className="h-3 w-24 bg-[#E3E6ED] rounded mb-5" />
                  <div className="h-7 w-20 bg-[#E3E6ED] rounded mb-2" />
                  <div className="h-3 w-16 bg-[#E3E6ED] rounded" />
                </div>
              ))
            : summary.map((c) => (
                <div key={c.key} className="bg-white border border-[#E3E6ED] rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-inter text-[#666D80]">{c.label}</span>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg} ${c.color}`}>{c.icon}</span>
                  </div>
                  <div className="text-2xl font-inter font-semibold text-[#173420] mt-2">{formatCents(c.amount)}</div>
                  <span className="text-xs text-[#8094A7]">{c.count} invoice{c.count !== 1 ? "s" : ""}</span>
                </div>
              ))}
        </div>

        <div className="px-4 sm:px-6 pb-20 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-4 items-start flex-1">
          <div className="bg-[#FEFEFE] border border-[#E3E6ED] rounded-[12px] p-4 shadow-sm min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-1 bg-[#F0F0F0] rounded-lg p-1 overflow-x-auto">
                {TABS.map((t) => {
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTab(t.key)}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-manrope whitespace-nowrap transition-colors ${
                        active ? "bg-[#173420] text-white" : "text-[#757575] hover:text-[#333333]"
                      }`}
                    >
                      {t.label} <span className={active ? "text-[#A8CDB4]" : "text-[#A0A0A0]"}>({counts[t.key] ?? 0})</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative flex-1 lg:flex-none">
                <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333333]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search invoices or customer"
                  className="h-9 w-full lg:w-[220px] pl-9 pr-3 bg-[#F0F0F0] rounded-lg text-xs font-manrope text-[#333333] placeholder:text-[#757575] focus:outline-none focus:ring-1 focus:ring-[#173420]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="px-3 py-2.5 text-left text-[11px] font-manrope font-semibold text-[#333333] whitespace-nowrap">Invoice</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-manrope font-semibold text-[#333333] whitespace-nowrap">Customer</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-manrope font-semibold text-[#333333] whitespace-nowrap">Period</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-manrope font-semibold text-[#333333] whitespace-nowrap">Amount</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-manrope font-semibold text-[#333333] whitespace-nowrap">Couriers</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-manrope font-semibold text-[#333333] whitespace-nowrap">Status</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-manrope font-semibold text-[#333333] whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-[#F0F0F0]">
                        <td className="px-3 py-4"><div className="h-3 w-20 bg-[#E3E6ED] rounded animate-pulse" /></td>
                        <td className="px-3 py-4"><div className="h-3 w-24 bg-[#E3E6ED] rounded animate-pulse" /></td>
                        <td className="px-3 py-4"><div className="h-3 w-24 bg-[#E3E6ED] rounded animate-pulse" /></td>
                        <td className="px-3 py-4"><div className="h-3 w-16 bg-[#E3E6ED] rounded animate-pulse" /></td>
                        <td className="px-3 py-4"><div className="h-3 w-16 bg-[#E3E6ED] rounded animate-pulse" /></td>
                        <td className="px-3 py-4"><div className="h-5 w-16 bg-[#E3E6ED] rounded-full animate-pulse" /></td>
                        <td className="px-3 py-4"><div className="h-5 w-24 bg-[#E3E6ED] rounded animate-pulse" /></td>
                      </tr>
                    ))
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-14 text-center">
                        <Receipt size={30} className="mx-auto text-[#E3E6ED]" />
                        <p className="text-sm text-[#8094A7] font-inter mt-3">
                          {invoices.length === 0
                            ? "No invoices yet. Click “Generate invoices” to build them from billable deliveries."
                            : "No results match your filters."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((inv) => {
                      const color = statusColor(inv.status);
                      const selected = inv.id === selectedId;
                      const needsAction = inv.status === "processing" || inv.status === "disputed";
                      return (
                        <tr
                          key={inv.id}
                          onClick={() => setSelectedId(inv.id)}
                          className={`border-b border-[#E0E0E0] last:border-0 cursor-pointer transition-colors ${
                            selected ? "bg-[#F8F8FA]" : "hover:bg-[#F8F8FA]"
                          }`}
                        >
                          <td className="px-3 py-3.5 align-middle">
                            <div className="text-[13px] font-manrope font-semibold text-[#173420] whitespace-nowrap">{inv.number}</div>
                            <div className="text-[11px] font-manrope text-[#757575] whitespace-nowrap">{inv.itemCount ?? 0} deliveries</div>
                          </td>
                          <td className="px-3 py-3.5 align-middle text-xs font-manrope text-[#333333] whitespace-nowrap">
                            {inv.customerName || "—"}
                          </td>
                          <td className="px-3 py-3.5 align-middle text-xs font-manrope text-[#333333] whitespace-nowrap">
                            {inv.periodStart ? formatDate(inv.periodStart) : "—"}
                          </td>
                          <td className="px-3 py-3.5 align-middle text-xs font-manrope font-semibold text-[#333333] whitespace-nowrap">
                            {formatCents(inv.totalCents)}
                          </td>
                          <td className="px-3 py-3.5 align-middle text-xs font-manrope text-[#333333] whitespace-nowrap">
                            {inv.courierCount ? `${inv.courierCount}` : "—"}
                          </td>
                          <td className="px-3 py-3.5 align-middle">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium ${color.bg} ${color.text}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {color.label.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 align-middle" onClick={(e) => e.stopPropagation()}>
                            {needsAction ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleApprove(inv)}
                                  disabled={actionId === inv.id}
                                  className="h-8 px-3 bg-[#173420] hover:bg-[#1F4228] text-white rounded-lg text-xs font-manrope font-medium transition-colors disabled:opacity-60"
                                >
                                  {actionId === inv.id ? "…" : "Approve"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openRelease(inv)}
                                  disabled={actionId === inv.id}
                                  className="h-8 px-3 bg-white border border-[#E3E6ED] rounded-lg text-xs font-manrope text-[#C0392B] hover:bg-[#FDE7EA] transition-colors disabled:opacity-60"
                                >
                                  Release
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-manrope text-[#A0A0A0]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!loading && invoices.length > 0 && (
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E0E0E0] mt-2">
                <div className="flex items-center gap-1.5 text-sm font-manrope text-[#757575]">
                  Show <span className="h-7 px-2.5 bg-white border border-[#E0E0E0] rounded-lg text-xs font-manrope text-[#333333] flex items-center gap-1">{PAGE_SIZE} <CaretDown size={12} /></span>
                  of {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-[#E0E0E0] flex items-center justify-center text-[#333333] disabled:opacity-40 text-xs font-manrope"
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  <span className="text-xs font-manrope text-[#333333] px-1">{currentPage} / {totalPages}</span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-[#E0E0E0] flex items-center justify-center text-[#333333] disabled:opacity-40 text-xs font-manrope"
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#FEFEFE] border border-[#E3E6ED] rounded-[12px] p-4 shadow-sm min-w-0">
            {detailLoading ? (
              <div className="space-y-4">
                <div className="h-6 w-40 bg-[#E3E6ED] rounded animate-pulse" />
                <div className="h-20 bg-[#E3E6ED] rounded-lg animate-pulse" />
                <div className="h-32 bg-[#E3E6ED] rounded-lg animate-pulse" />
              </div>
            ) : !detail ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Receipt size={36} className="text-[#E3E6ED]" />
                <p className="text-sm text-[#8094A7] font-inter mt-3">Select an invoice to review</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-clash-display font-semibold text-[#173420] truncate">Invoice {detail.number}</h2>
                    <p className="text-xs text-[#8094A7] mt-0.5">
                      {detail.customerName || "Customer"} · {formatDate(detail.periodStart)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium whitespace-nowrap ${statusColor(detail.status).bg} ${statusColor(detail.status).text}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {statusColor(detail.status).label.toUpperCase()}
                  </span>
                </div>

                <div className="mt-4 ml-auto w-full max-w-[240px] space-y-1.5 text-sm font-manrope">
                  <div className="flex justify-between font-semibold text-[#173420] border-t border-[#E3E6ED] pt-2">
                    <span>Total</span>
                    <span>{formatCents(detail.totalCents)}</span>
                  </div>
                </div>

                {detail.disputeReason && (
                  <div className="mt-4 bg-[#FDE7EA] border border-[#F5C2C6] rounded-lg p-3 text-xs font-manrope">
                    <p className="font-semibold text-[#C0392B]">Dispute reason</p>
                    <p className="text-[#7A2A22] mt-1">{detail.disputeReason}</p>
                  </div>
                )}
                {detail.adminNote && (
                  <div className="mt-2 bg-[#FEF7E0] border border-[#EEDFA8] rounded-lg p-3 text-xs font-manrope">
                    <p className="font-semibold text-[#B8860B]">Admin note</p>
                    <p className="text-[#7A6422] mt-1">{detail.adminNote}</p>
                  </div>
                )}

                <div className="mt-4">
                  <h3 className="text-sm font-manrope font-semibold text-[#333333] mb-2">Payment history</h3>
                  {detail.paymentEvents && detail.paymentEvents.length > 0 ? (
                    <div className="space-y-0">
                      {detail.paymentEvents.map((ev, idx) => (
                        <div key={ev.id} className="relative pl-5 pb-4 last:pb-0">
                          {idx < detail.paymentEvents!.length - 1 && (
                            <div className="absolute left-1.5 top-2 bottom-0 w-px bg-[#E3E6ED]" />
                          )}
                          <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-[#173420]" />
                          <p className="text-xs font-manrope font-semibold text-[#333333]">
                            {ACTION_LABELS[ev.action] || ev.action}
                            {ev.actorName ? <span className="text-[#757575] font-normal"> · {ev.actorName}</span> : null}
                          </p>
                          <p className="text-[11px] font-manrope text-[#8094A7]">
                            {formatDateTime(ev.createdAt)}{ev.actorRole ? ` · ${ev.actorRole}` : ""}
                          </p>
                          {ev.note ? (
                            <p className="text-[11px] font-manrope text-[#666D80] mt-0.5">{ev.note}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#8094A7] py-2">No payment events recorded.</p>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {(detail.status === "processing" || detail.status === "disputed") && (
                    <>
                      <Button
                        onClick={() => handleApprove(detail)}
                        disabled={actionId === detail.id}
                        className="h-9 bg-[#173420] hover:bg-[#1F4228] text-white rounded-lg text-sm font-manrope font-medium transition-colors disabled:opacity-60 flex-1"
                      >
                        {actionId === detail.id ? "Approving…" : "Approve"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => openRelease(detail)}
                        disabled={actionId === detail.id}
                        className="h-9 px-3 bg-white border border-[#E3E6ED] rounded-lg text-sm font-manrope text-[#C0392B] hover:bg-[#FDE7EA] transition-colors disabled:opacity-60"
                      >
                        Release
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={Boolean(releaseFor)} onOpenChange={(open) => !open && setReleaseFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release invoice</DialogTitle>
            <DialogDescription>
              Return this invoice to <strong>unpaid</strong> so the customer can retry payment. Add a note for the record.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={releaseNote}
            onChange={(e) => setReleaseNote(e.target.value)}
            placeholder="Reason for release (optional)…"
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseFor(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submitRelease} disabled={submitting}>
              {submitting ? "Releasing…" : "Release invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminInvoicesPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-[#F5F4FD]">
        <p className="text-sm text-[#8094A7] font-inter">Loading...</p>
      </div>
    }>
      <InvoicesContent />
    </Suspense>
  );
}