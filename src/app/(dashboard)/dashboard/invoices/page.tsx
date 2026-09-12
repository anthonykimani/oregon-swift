"use client";

import { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bank,
  Download,
  CheckCircle,
  Clock,
  WarningCircle,
  CaretLeft,
  CaretRight,
  CaretDown,
  MagnifyingGlass,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import { api } from "@/lib/api";
import type { Invoice } from "@/types/delivery";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const PAGE_SIZE = 8;

type TabKey = "all" | "processing" | "paid" | "pending" | "overdue";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "processing", label: "Processing" },
  { key: "paid", label: "Paid" },
  { key: "pending", label: "Pending" },
  { key: "overdue", label: "Overdue" },
];

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

function isOverdue(inv: Invoice): boolean {
  if (inv.status === "paid" || inv.status === "disputed") return false;
  if (!inv.dueDate) return false;
  return new Date(inv.dueDate).getTime() < Date.now();
}

function invoicePill(inv: Invoice): { bg: string; text: string; label: string } {
  if (isOverdue(inv)) return { bg: "bg-[#FCDEE0]", text: "text-[#C0392B]", label: "Overdue" };
  const map: Record<string, { bg: string; text: string; label: string }> = {
    paid: { bg: "bg-[#D9F9E7]", text: "text-[#007837]", label: "Paid" },
    processing: { bg: "bg-[#E3EEFB]", text: "text-[#2563EB]", label: "Processing" },
    disputed: { bg: "bg-[#FDE7EA]", text: "text-[#C0392B]", label: "Disputed" },
    sent: { bg: "bg-[#E3EEFB]", text: "text-[#2563EB]", label: "Sent" },
    unpaid: { bg: "bg-[#FEF7E0]", text: "text-[#B8860B]", label: "Unpaid" },
    draft: { bg: "bg-[#F0F0F0]", text: "text-[#999999]", label: "Draft" },
  };
  return map[inv.status] || { bg: "bg-[#F0F0F0]", text: "text-[#999999]", label: inv.status };
}

function pageItems(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("...");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("...");
  items.push(total);
  return items;
}

function InvoicesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const token = session?.accessToken;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Invoice | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filterKey = `${tab}|${query}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api<{ created: string[]; updated: string[]; billed: number }>("/invoices/generate", {
      method: "POST",
      token,
    })
      .then(() => api<Invoice[]>("/invoices", { token }))
      .then((res) => {
        if (cancelled) return;
        if (res.status === 200 && res.data) {
          setInvoices(res.data);
          if (res.data.length > 0 && !selectedId) setSelectedId(res.data[0].id);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token || !selectedId) return;
    let cancelled = false;
    const id = selectedId;
    api<Invoice>(`/invoices/${id}`, { token }).then((res) => {
      if (cancelled) return;
      if (res.status === 200 && res.data) setDetail(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [token, selectedId]);

  const detailLoading = Boolean(selectedId && (!detail || detail.id !== selectedId));

  const applyInvoiceUpdate = useCallback((updated: Invoice) => {
    setInvoices((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)));
    setDetail((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  }, []);

  const handlePay = useCallback(
    (inv: Invoice) => {
      if (!token) return;
      setActionId(inv.id);
      api<Invoice>(`/invoices/${inv.id}/pay`, { method: "POST", token }).then((res) => {
        if (res.status === 200 && res.data) applyInvoiceUpdate(res.data);
        setActionId(null);
      });
    },
    [token, applyInvoiceUpdate]
  );

  const handleSend = useCallback(
    (inv: Invoice) => {
      if (!token) return;
      setActionId(inv.id);
      api<Invoice>(`/invoices/${inv.id}/send`, { method: "POST", token }).then((res) => {
        if (res.status === 200 && res.data) applyInvoiceUpdate(res.data);
        setActionId(null);
      });
    },
    [token, applyInvoiceUpdate]
  );

  const handleDownloadPdf = useCallback(
    async (inv: Invoice) => {
      if (!token) return;
      setActionId(inv.id);
      try {
        const res = await fetch(`${API_URL}/invoices/${inv.id}/pdf`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${inv.number}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        // silent
      }
      setActionId(null);
    },
    [token]
  );

  const summary = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "paid");
    const processing = invoices.filter((i) => i.status === "processing");
    const overdue = invoices.filter(isOverdue);
    const unpaid = invoices.filter((i) => i.status !== "paid");
    const sum = (list: Invoice[]) => list.reduce((s, i) => s + (i.totalCents || 0), 0);
    return [
      { key: "paid", label: "Paid Invoices", amount: sum(paid), count: paid.length, icon: <CheckCircle size={16} />, bg: "bg-[#D9F9E7]", color: "text-[#007837]" },
      { key: "processing", label: "Processing", amount: sum(processing), count: processing.length, icon: <Clock size={16} />, bg: "bg-[#E3EEFB]", color: "text-[#2563EB]" },
      { key: "overdue", label: "Overdue Invoices", amount: sum(overdue), count: overdue.length, icon: <WarningCircle size={16} />, bg: "bg-[#FCDEE0]", color: "text-[#C0392B]" },
      { key: "unpaid", label: "Unpaid Invoices", amount: sum(unpaid), count: unpaid.length, icon: <Bank size={16} />, bg: "bg-[#F0F0F0]", color: "text-[#333333]" },
    ];
  }, [invoices]);

  const filtered = useMemo(() => {
    let list = invoices;
    if (tab === "paid") list = list.filter((i) => i.status === "paid");
    if (tab === "processing") list = list.filter((i) => i.status === "processing");
    if (tab === "pending") list = list.filter((i) => i.status !== "paid" && i.status !== "processing" && i.status !== "disputed" && !isOverdue(i));
    if (tab === "overdue") list = list.filter(isOverdue);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((i) => i.number.toLowerCase().includes(q));
    }
    return [...list].sort(
      (a, b) => new Date(b.issuedAt || b.id).getTime() - new Date(a.issuedAt || a.id).getTime()
    );
  }, [invoices, tab, query]);

  const tabCounts = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "paid").length;
    const processing = invoices.filter((i) => i.status === "processing").length;
    const overdue = invoices.filter(isOverdue).length;
    const pending = invoices.filter((i) => i.status !== "paid" && i.status !== "processing" && i.status !== "disputed" && !isOverdue(i)).length;
    return { all: invoices.length, paid, processing, pending, overdue };
  }, [invoices]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <div className="h-full flex flex-col bg-[#F5F4FD] overflow-y-auto">
        <div className="px-4 sm:px-6 pt-8 pb-4">
          <h1 className="text-xl font-clash-display font-semibold text-[#173420]">Invoices &amp; Billing</h1>
          <p className="text-sm text-[#8094A7] font-inter mt-1">
            View and pay your delivery invoices
          </p>
        </div>

        {/* Overview cards */}
        <div className="px-4 sm:px-6 grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          {loading
            ? [...Array(4)].map((_, i) => (
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
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg} ${c.color}`}>
                      {c.icon}
                    </span>
                  </div>
                  <div className="text-2xl font-inter font-semibold text-[#173420] mt-2">
                    {formatCents(c.amount)}
                  </div>
                  <span className="text-xs text-[#8094A7]">
                    {c.count} invoice{c.count !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
        </div>

        {/* Two-pane: list + detail */}
        <div className="px-4 sm:px-6 pb-20 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-4 items-start">
          {/* Left: Recent Shipments */}
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
                      {t.label} <span className={active ? "text-[#A8CDB4]" : "text-[#A0A0A0]"}>({tabCounts[t.key]})</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 lg:flex-none">
                  <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333333]" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search invoices"
                    className="h-9 w-full lg:w-[200px] pl-9 pr-3 bg-[#F0F0F0] rounded-lg text-xs font-manrope text-[#333333] placeholder:text-[#757575] focus:outline-none focus:ring-1 focus:ring-[#173420]"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="px-3 py-2.5 text-left text-xs font-manrope font-semibold text-[#333333] whitespace-nowrap">Invoice</th>
                    <th className="px-3 py-2.5 text-left text-xs font-manrope font-semibold text-[#333333] whitespace-nowrap">Issue Date</th>
                    <th className="px-3 py-2.5 text-left text-xs font-manrope font-semibold text-[#333333] whitespace-nowrap">Due Date</th>
                    <th className="px-3 py-2.5 text-left text-xs font-manrope font-semibold text-[#333333] whitespace-nowrap">Amount</th>
                    <th className="px-3 py-2.5 text-left text-xs font-manrope font-semibold text-[#333333] whitespace-nowrap">Status</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-[#F0F0F0]">
                        <td className="px-3 py-4">
                          <div className="h-3 w-20 bg-[#E3E6ED] rounded animate-pulse" />
                        </td>
                        <td className="px-3 py-4"><div className="h-3 w-24 bg-[#E3E6ED] rounded animate-pulse" /></td>
                        <td className="px-3 py-4"><div className="h-3 w-24 bg-[#E3E6ED] rounded animate-pulse" /></td>
                        <td className="px-3 py-4"><div className="h-3 w-16 bg-[#E3E6ED] rounded animate-pulse" /></td>
                        <td className="px-3 py-4"><div className="h-5 w-16 bg-[#E3E6ED] rounded-full animate-pulse" /></td>
                        <td className="px-3 py-4" />
                      </tr>
                    ))
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-14 text-center">
                        <Bank size={30} className="mx-auto text-[#E3E6ED]" />
                        <p className="text-sm text-[#8094A7] font-inter mt-3">
                          {invoices.length === 0
                            ? "No invoices yet — they appear once your deliveries are on their way or delivered."
                            : "No results match your filters."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((inv) => {
                      const pill = invoicePill(inv);
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
                            <div className="text-[13px] font-manrope font-semibold text-[#173420] whitespace-nowrap">
                              {inv.number}
                            </div>
                            {inv.items && inv.items.length > 0 && (
                              <div className="text-xs font-manrope text-[#757575] whitespace-nowrap">
                                {inv.items.length} delivery{inv.items.length !== 1 ? "s" : ""}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3.5 align-middle text-xs font-manrope text-[#333333] whitespace-nowrap">
                            {formatDate(inv.issuedAt)}
                          </td>
                          <td className="px-3 py-3.5 align-middle text-xs font-manrope whitespace-nowrap">
                            <span className={isOverdue(inv) ? "text-[#C0392B]" : "text-[#333333]"}>
                              {formatDate(inv.dueDate)}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 align-middle text-xs font-manrope font-semibold text-[#333333] whitespace-nowrap">
                            {formatCents(inv.totalCents)}
                          </td>
                          <td className="px-3 py-3.5 align-middle">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium ${pill.bg} ${pill.text}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {pill.label.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 align-middle">
                            <button
                              type="button"
                              aria-label={`Download ${inv.number}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadPdf(inv);
                              }}
                              disabled={actionId === inv.id}
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#333333] hover:bg-[#F0F0F0] transition-colors disabled:opacity-50"
                            >
                              <Download size={16} />
                            </button>
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
                  Show
                  <button
                    type="button"
                    className="h-7 px-2.5 bg-white border border-[#E0E0E0] rounded-lg text-xs font-manrope text-[#333333] flex items-center gap-1"
                  >
                    {PAGE_SIZE} <CaretDown size={12} />
                  </button>
                  of {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-[#E0E0E0] flex items-center justify-center text-[#333333] disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <CaretLeft size={14} />
                  </button>
                  {pageItems(currentPage, totalPages).map((p, i) =>
                    p === "..." ? (
                      <span key={`e${i}`} className="text-xs font-manrope text-[#333333] px-1">…</span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-manrope ${
                          p === currentPage
                            ? "bg-[#173420] text-white"
                            : "bg-white border border-[#E0E0E0] text-[#333333] hover:bg-[#F8F8FA]"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-[#E0E0E0] flex items-center justify-center text-[#333333] disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <CaretRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Invoice Details */}
          <div className="bg-[#FEFEFE] border border-[#E3E6ED] rounded-[12px] p-4 shadow-sm min-w-0">
            {detailLoading ? (
              <div className="space-y-4">
                <div className="h-6 w-40 bg-[#E3E6ED] rounded animate-pulse" />
                <div className="h-20 bg-[#E3E6ED] rounded-lg animate-pulse" />
                <div className="h-32 bg-[#E3E6ED] rounded-lg animate-pulse" />
                <div className="h-16 bg-[#E3E6ED] rounded-lg animate-pulse" />
              </div>
            ) : !detail ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Bank size={36} className="text-[#E3E6ED]" />
                <p className="text-sm text-[#8094A7] font-inter mt-3">
                  Select an invoice to view details
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-clash-display font-semibold text-[#173420] truncate">
                      Invoice {detail.number}
                    </h2>
                    <p className="text-xs text-[#8094A7] mt-0.5">
                      Issued {formatDate(detail.issuedAt)}
                      {detail.dueDate ? ` · Due ${formatDate(detail.dueDate)}` : ""}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium whitespace-nowrap ${invoicePill(detail).bg} ${invoicePill(detail).text}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {invoicePill(detail).label.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 bg-[#F9F9FB] rounded-lg p-3 text-xs font-manrope">
                  <div className="min-w-0">
                    <p className="text-[#8094A7] mb-0.5">Bill From</p>
                    <p className="text-[#333333] font-medium">Oregon Swift Deliveries</p>
                    <p className="text-[#757575]">billing@oregonswift.com</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#8094A7] mb-0.5">Bill To</p>
                    <p className="text-[#333333] font-medium">{detail.billTo?.name || "You"}</p>
                    <p className="text-[#757575] truncate">{detail.billTo?.email}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-manrope font-semibold text-[#333333] mb-2">Package Summary</h3>
                  {detail.items && detail.items.length > 0 ? (
                    <div className="border border-[#E3E6ED] rounded-lg overflow-hidden">
                      <table className="w-full text-xs font-manrope">
                        <thead>
                          <tr className="bg-[#F9F9FB] text-[#333333]">
                            <th className="text-left py-2 px-3 font-semibold">Description</th>
                            <th className="text-left py-2 px-3 font-semibold">Type</th>
                            <th className="text-left py-2 px-3 font-semibold">Qty</th>
                            <th className="text-right py-2 px-3 font-semibold">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.items.map((it) => (
                            <tr key={it.id} className="border-t border-[#E3E6ED]">
                              <td className="py-2 px-3">
                                <div className="text-[#333333]">{it.packageDesc || "Delivery"}</div>
                                <div className="text-[#757575]">{it.trackingNumber}</div>
                              </td>
                              <td className="py-2 px-3 text-[#333333] whitespace-nowrap">{it.shipmentType || "—"}</td>
                              <td className="py-2 px-3 text-[#333333]">{it.packagePieces}</td>
                              <td className="py-2 px-3 text-right text-[#333333] whitespace-nowrap">
                                {(it.amountCents / 100).toFixed(2)}
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
                  <div className="flex justify-between text-[#333333]">
                    <span>Sub Total</span>
                    <span>{formatCents(detail.subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between text-[#333333]">
                    <span>Tax (8%)</span>
                    <span>{formatCents(detail.taxCents)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#173420] border-t border-[#E3E6ED] pt-2">
                    <span>Total</span>
                    <span>{formatCents(detail.totalCents)}</span>
                  </div>
                </div>

                {detail.status === "disputed" && detail.disputeReason ? (
                  <div className="mt-4 bg-[#FDE7EA] border border-[#F5C2C6] rounded-lg p-3 text-xs font-manrope">
                    <p className="font-semibold text-[#C0392B]">Dispute reason</p>
                    <p className="text-[#7A2A22] mt-1">{detail.disputeReason}</p>
                  </div>
                ) : null}

                <div className="mt-4 flex items-center gap-2">
                  {detail.status === "unpaid" || detail.status === "sent" || detail.status === "draft" ? (
                    <button
                      type="button"
                      onClick={() => handlePay(detail)}
                      disabled={actionId === detail.id}
                      className="h-9 px-4 bg-[#173420] hover:bg-[#1F4228] text-white rounded-lg text-sm font-manrope font-medium transition-colors disabled:opacity-60 flex-1"
                    >
                      {actionId === detail.id ? "Processing…" : "Pay now"}
                    </button>
                  ) : detail.status === "processing" ? (
                    <div className="flex-1 h-9 px-3 rounded-lg bg-[#E3EEFB] flex items-center gap-2 text-xs font-manrope text-[#2563EB]">
                      <Clock size={14} />
                      Payment processing — awaiting courier confirmation
                    </div>
                  ) : detail.status === "disputed" ? (
                    <div className="flex-1 h-9 px-3 rounded-lg bg-[#FDE7EA] flex items-center gap-2 text-xs font-manrope text-[#C0392B]">
                      <WarningCircle size={14} />
                      Under review — disputed by courier
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(detail)}
                    disabled={actionId === detail.id}
                    className="h-9 px-3 bg-white border border-[#E3E6ED] rounded-lg text-sm font-manrope text-[#333333] hover:bg-[#F8F8FA] transition-colors disabled:opacity-60 flex items-center gap-1.5"
                  >
                    <Download size={14} /> PDF
                  </button>
                  {detail.status === "unpaid" || detail.status === "draft" ? (
                    <button
                      type="button"
                      onClick={() => handleSend(detail)}
                      disabled={actionId === detail.id}
                      className="h-9 px-3 bg-white border border-[#E3E6ED] rounded-lg text-sm font-manrope text-[#333333] hover:bg-[#F8F8FA] transition-colors disabled:opacity-60 flex items-center gap-1.5"
                    >
                      <PaperPlaneTilt size={14} /> Send
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function InvoicesPage() {
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
