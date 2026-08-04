"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Receipt, CheckCircle, WarningCircle, ArrowCounterClockwise } from "@phosphor-icons/react";
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

function formatDate(ts: string | null | undefined) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

export default function CourierInvoices() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const token = session?.accessToken;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Invoice | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const [disputeFor, setDisputeFor] = useState<Invoice | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api<{ items: Invoice[]; meta: { total: number } }>("/courier/invoices", { token }).then((res) => {
      if (cancelled) return;
      if (res.status === 200 && res.data) {
        setInvoices(res.data.items);
        if (res.data.items.length > 0 && !selectedId) {
          const processing = res.data.items.find((i) => i.status === "processing");
          setSelectedId(processing?.id || res.data.items[0].id);
        }
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token || !selectedId) return;
    let cancelled = false;
    const id = selectedId;
    api<Invoice>(`/courier/invoices/${id}`, { token }).then((res) => {
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

  const handleConfirm = useCallback((inv: Invoice) => {
    if (!token) return;
    setActionId(inv.id);
    api<Invoice>(`/courier/invoices/${inv.id}/confirm`, { method: "POST", token }).then((res) => {
      setActionId(null);
      if (res.status === 200 && res.data) {
        applyUpdate(res.data);
        toast.success(`Payment for ${res.data.number} confirmed`);
      } else {
        toast.error(res.errors?.[0] || "Failed to confirm");
      }
    });
  }, [token, applyUpdate]);

  const openDispute = (inv: Invoice) => {
    setDisputeFor(inv);
    setReason("");
  };

  const submitDispute = useCallback(() => {
    if (!token || !disputeFor) return;
    if (!reason.trim()) {
      toast.error("Please provide a dispute reason");
      return;
    }
    setSubmitting(true);
    api<Invoice>(`/courier/invoices/${disputeFor.id}/dispute`, {
      method: "POST",
      token,
      body: JSON.stringify({ reason: reason.trim() }),
    }).then((res) => {
      setSubmitting(false);
      if (res.status === 200 && res.data) {
        applyUpdate(res.data);
        setDisputeFor(null);
        toast.success("Dispute raised");
      } else {
        toast.error(res.errors?.[0] || "Failed to raise dispute");
      }
    });
  }, [token, disputeFor, reason, applyUpdate]);

  const summary = useMemo(() => {
    const processing = invoices.filter((i) => i.status === "processing");
    const paid = invoices.filter((i) => i.status === "paid");
    const disputed = invoices.filter((i) => i.status === "disputed");
    const sum = (list: Invoice[]) => list.reduce((s, i) => s + (i.totalCents || 0), 0);
    return [
      {
        key: "processing",
        label: "Awaiting Action",
        amount: sum(processing),
        count: processing.length,
        icon: <ArrowCounterClockwise size={16} />,
        bg: "bg-[#E3EEFB]",
        color: "text-[#2563EB]",
      },
      {
        key: "paid",
        label: "Confirmed Paid",
        amount: sum(paid),
        count: paid.length,
        icon: <CheckCircle size={16} />,
        bg: "bg-[#D9F9E7]",
        color: "text-[#007837]",
      },
      {
        key: "disputed",
        label: "Disputed",
        amount: sum(disputed),
        count: disputed.length,
        icon: <WarningCircle size={16} />,
        bg: "bg-[#FDE7EA]",
        color: "text-[#C0392B]",
      },
    ];
  }, [invoices]);

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD] overflow-y-auto">
      <div className="px-4 sm:px-6 pt-8 pb-4">
        <h1 className="text-xl font-clash-display font-semibold text-[#173420]">Invoices</h1>
        <p className="text-sm text-[#8094A7] font-inter mt-1">
          Confirm payments or raise disputes for invoices linked to your deliveries
        </p>
      </div>

      {!loading && (
        <div className="px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {summary.map((c) => (
            <div key={c.key} className="bg-white border border-[#E3E6ED] rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-inter text-[#666D80]">{c.label}</span>
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg} ${c.color}`}>
                  {c.icon}
                </span>
              </div>
              <div className="text-2xl font-inter font-semibold text-[#173420] mt-2">{formatCents(c.amount)}</div>
              <span className="text-xs text-[#8094A7]">{c.count} invoice{c.count !== 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 sm:px-6 pb-20 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-4 items-start flex-1">
        <div className="bg-[#FEFEFE] border border-[#E3E6ED] rounded-[12px] p-4 shadow-sm min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-[#E0E0E0]">
                  <th className="px-3 py-2.5 text-left text-[11px] font-manrope font-semibold text-[#333333] whitespace-nowrap">Invoice</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-manrope font-semibold text-[#333333] whitespace-nowrap">Customer</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-manrope font-semibold text-[#333333] whitespace-nowrap">Period</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-manrope font-semibold text-[#333333] whitespace-nowrap">Amount</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-manrope font-semibold text-[#333333] whitespace-nowrap">Status</th>
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
                      <td className="px-3 py-4"><div className="h-5 w-16 bg-[#E3E6ED] rounded-full animate-pulse" /></td>
                    </tr>
                  ))
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-14 text-center">
                      <Receipt size={30} className="mx-auto text-[#E3E6ED]" />
                      <p className="text-sm text-[#8094A7] font-inter mt-3">
                        No invoices yet. Invoices appear once they include one of your completed deliveries.
                      </p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const color = statusColor(inv.status);
                    const selected = inv.id === selectedId;
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
                          <div className="text-[11px] font-manrope text-[#757575] whitespace-nowrap">
                            {inv.myDeliveries ?? 0} delivery{(inv.myDeliveries ?? 0) !== 1 ? "s" : ""} of yours
                          </div>
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
                        <td className="px-3 py-3.5 align-middle">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium ${color.bg} ${color.text}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {color.label.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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

              <div className="mt-4">
                <h3 className="text-sm font-manrope font-semibold text-[#333333] mb-2">Deliveries</h3>
                {detail.items && detail.items.length > 0 ? (
                  <div className="border border-[#E3E6ED] rounded-lg overflow-hidden">
                    <table className="w-full text-[11px] font-manrope">
                      <thead>
                        <tr className="bg-[#F9F9FB] text-[#333333]">
                          <th className="text-left py-2 px-3 font-semibold">Tracking</th>
                          <th className="text-right py-2 px-3 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.items.map((it) => (
                          <tr key={it.id} className="border-t border-[#E3E6ED]">
                            <td className="py-2 px-3">
                              <div className="text-[#333333]">{it.trackingNumber || "Delivery"}</div>
                              <div className="text-[#757575]">{it.packageDesc || "—"}</div>
                            </td>
                            <td className="py-2 px-3 text-right text-[#333333] whitespace-nowrap">
                              {formatCents(it.amountCents)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-[#8094A7] py-2">No line items.</p>
                )}
              </div>

              <div className="mt-4 ml-auto w-full max-w-[240px] space-y-1.5 text-sm font-manrope">
                <div className="flex justify-between font-semibold text-[#173420] border-t border-[#E3E6ED] pt-2">
                  <span>Total</span>
                  <span>{formatCents(detail.totalCents)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {detail.status === "processing" && (
                  <>
                    <Button
                      onClick={() => handleConfirm(detail)}
                      disabled={actionId === detail.id}
                      className="h-9 bg-[#173420] hover:bg-[#1F4228] text-white rounded-lg text-sm font-manrope font-medium transition-colors disabled:opacity-60 flex-1"
                    >
                      {actionId === detail.id ? "Confirming…" : "Confirm payment"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openDispute(detail)}
                      disabled={actionId === detail.id}
                      className="h-9 px-3 bg-white border border-[#E3E6ED] rounded-lg text-sm font-manrope text-[#C0392B] hover:bg-[#FDE7EA] transition-colors disabled:opacity-60"
                    >
                      Dispute
                    </Button>
                  </>
                )}
                {detail.status === "disputed" && (
                  <p className="text-xs font-manrope text-[#C0392B] w-full">
                    Disputed: {detail.disputeReason || "No reason provided"}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={Boolean(disputeFor)} onOpenChange={(open) => !open && setDisputeFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise a dispute</DialogTitle>
            <DialogDescription>
              Explain why this invoice payment is incorrect. An admin will review it.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for disputing payment…"
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeFor(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={submitDispute} disabled={submitting || !reason.trim()}>
              {submitting ? "Submitting…" : "Raise dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}