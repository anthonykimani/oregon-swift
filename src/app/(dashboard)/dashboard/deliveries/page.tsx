"use client";

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  CaretLeft,
  CaretRight,
  CaretDown,
  DotsThree,
  MagnifyingGlass,
  ArrowsDownUp,
} from "@phosphor-icons/react";
import { api } from "@/lib/api";
import type { Delivery } from "@/types/delivery";
import { DeliveryDetailSheet, statusLabels } from "@/components/customer/delivery-detail-sheet";
import { statusPillStyles, progressByStatus } from "@/components/shared/tracking/types";

const PAGE_SIZE = 12;

type TabKey = "all" | "pending" | "in-transit" | "delivered";

const TAB_GROUPS: Record<TabKey, string[]> = {
  all: [],
  pending: ["pending", "processing"],
  "in-transit": ["picked-up", "in-transit", "out-for-delivery"],
  delivered: ["delivered"],
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in-transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
];

const HEADERS = ["Shipping ID", "Route", "Courier", "Date", "Progress", "Status", "Price"];

function shortAddr(s: string | null | undefined) {
  if (!s) return "—";
  return s.split(",")[0].trim() || s;
}

function formatDate(ts: string | null | undefined) {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCents(cents: number | null | undefined) {
  if (cents == null) return "—";
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
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

function DeliveriesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailId = searchParams.get("id");
  const justCreated = searchParams.get("created");

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const filterKey = `${activeTab}|${searchQuery}|${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const token = session?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api<Delivery[]>("/deliveries", { token }).then((res) => {
      if (cancelled) return;
      if (res.status === 200 && res.data) setDeliveries(res.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const closeSheet = useCallback(() => {
    router.replace("/dashboard/deliveries");
  }, [router]);

  const openDelivery = useCallback(
    (d: Delivery) => {
      router.push(`/dashboard/deliveries?id=${d.id}`);
    },
    [router]
  );

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { all: deliveries.length, pending: 0, "in-transit": 0, delivered: 0 };
    for (const d of deliveries) {
      if (TAB_GROUPS.pending.includes(d.status)) c.pending++;
      if (TAB_GROUPS["in-transit"].includes(d.status)) c["in-transit"]++;
      if (TAB_GROUPS.delivered.includes(d.status)) c.delivered++;
    }
    return c;
  }, [deliveries]);

  const filtered = useMemo(() => {
    let list = deliveries;
    const group = TAB_GROUPS[activeTab];
    if (group.length) list = list.filter((d) => group.includes(d.status));
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((d) =>
        [d.trackingNumber, d.packageDesc, d.pickupAddress, d.dropoffAddress, d.courierName ?? ""]
          .some((v) => (v ?? "").toLowerCase().includes(q))
      );
    }
    list = [...list].sort((a, b) =>
      sortBy === "oldest"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return list;
  }, [deliveries, activeTab, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <div className="h-full flex flex-col bg-[#F3F5F1] overflow-y-auto">
        <div className="px-4 pt-8 pb-5 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-600">Delivery history</p>
          <h1 className="mt-1 text-2xl font-manrope font-semibold tracking-[-0.02em] text-[#173420]">Every shipment, one clear view</h1>
          <p className="mt-1 text-sm text-[#666D80]">Track active work and review completed deliveries.</p>
        </div>

        <div className="px-4 pb-20 sm:px-6 lg:px-8">
          {justCreated && (
            <div className="bg-[#D9F9E7] text-[#007837] text-sm rounded-lg px-4 py-3 mb-4">
              Delivery booked successfully! You can track it below.
            </div>
          )}

          {loading ? (
            <div className="bg-[#FEFEFE] border border-[#E3E6ED] rounded-[12px] p-4">
              <div className="h-10 bg-[#F0F0F0] rounded-lg animate-pulse mb-4" />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 border-b border-[#F0F0F0] py-4 animate-pulse">
                  <div className="h-3 w-24 bg-[#E3E6ED] rounded" />
                  <div className="h-3 w-40 bg-[#E3E6ED] rounded" />
                  <div className="h-3 w-20 bg-[#E3E6ED] rounded" />
                  <div className="h-3 w-28 bg-[#E3E6ED] rounded" />
                  <div className="h-1.5 w-16 bg-[#E3E6ED] rounded-full" />
                  <div className="h-5 w-20 bg-[#E3E6ED] rounded-full" />
                </div>
              ))}
            </div>
          ) : deliveries.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E3E6ED] p-8 text-center">
              <Package size={40} className="mx-auto text-[#8094A7]" />
              <p className="text-sm text-[#8094A7] font-inter mt-4">No deliveries yet.</p>
              <Link href="/dashboard/book" className="inline-block mt-4 px-5 py-2.5 bg-[#173420] text-white text-sm rounded-lg">
                Book your first delivery
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#DCE2D9] bg-white shadow-sm">
              {/* Toolbar */}
              <div className="flex flex-col gap-3 border-b border-[#E5E9E2] p-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-1 bg-[#F0F0F0] rounded-lg p-1 overflow-x-auto">
                  {TABS.map((t) => {
                    const active = activeTab === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setActiveTab(t.key)}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-manrope whitespace-nowrap transition-colors ${
                          active ? "bg-[#173420] text-white" : "text-[#757575] hover:text-[#333333]"
                        }`}
                      >
                        {t.label}{" "}
                        <span className={active ? "text-[#A8CDB4]" : "text-[#A0A0A0]"}>({counts[t.key]})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333333]" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search id, address, courier"
                      className="h-9 w-full sm:w-[220px] pl-9 pr-3 bg-[#F0F0F0] rounded-lg text-xs font-manrope text-[#333333] placeholder:text-[#757575] focus:outline-none focus:ring-1 focus:ring-[#173420]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-manrope text-[#6E6F78]">Sort by:</span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSortMenuOpen((o) => !o)}
                        className="h-9 px-2.5 bg-[#F0F0F0] rounded-lg text-xs font-manrope text-[#333333] flex items-center gap-1.5"
                      >
                        {sortBy === "newest" ? "Newest" : "Oldest"} <CaretDown size={12} />
                      </button>
                      {sortMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setSortMenuOpen(false)} />
                          <div className="absolute right-0 top-10 z-20 bg-white border border-[#E3E6ED] rounded-lg shadow-lg py-1 min-w-[120px]">
                            {(["newest", "oldest"] as const).map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setSortBy(opt);
                                  setSortMenuOpen(false);
                                }}
                                className={`block w-full text-left px-3 py-2 text-xs font-manrope hover:bg-[#F8F8FA] ${
                                  sortBy === opt ? "text-[#173420] font-semibold" : "text-[#333333]"
                                }`}
                              >
                                {opt === "newest" ? "Newest" : "Oldest"}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Link
                    href="/dashboard/book"
                    className="h-9 px-4 bg-[#173420] hover:bg-[#1F4228] text-white rounded-lg text-xs font-manrope font-medium flex items-center gap-1.5 transition-colors"
                  >
                    New Delivery <CaretRight size={12} weight="bold" />
                  </Link>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto px-4 pb-4">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      {HEADERS.map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2.5 text-left text-xs font-manrope font-semibold text-[#333333] whitespace-nowrap"
                        >
                          <span className="inline-flex items-center gap-1">
                            {h}
                            <ArrowsDownUp size={11} className="text-[#B0B0B0]" />
                          </span>
                        </th>
                      ))}
                      <th className="px-3 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-16 text-center">
                          <Package size={32} className="mx-auto text-[#E3E6ED]" />
                          <p className="text-sm text-[#8094A7] font-inter mt-3">No results match your filters.</p>
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((d) => {
                        const pill = statusPillStyles[d.status] || { bg: "bg-[#F0F0F0]", text: "text-[#999999]" };
                        const pct = progressByStatus[d.status] ?? 10;
                        return (
                          <tr
                            key={d.id}
                            onClick={() => openDelivery(d)}
                            className="border-b border-[#E0E0E0] last:border-0 hover:bg-[#F8F8FA] transition-colors cursor-pointer"
                          >
                            <td className="px-3 py-3.5 align-middle">
                              <div className="min-w-0">
                                <div className="text-[13px] font-manrope font-semibold text-[#173420] whitespace-nowrap">
                                  {d.trackingNumber}
                                </div>
                                {d.packageDesc && (
                                  <div className="text-xs font-manrope text-[#757575] truncate max-w-[170px] mt-0.5">
                                    {d.packageDesc}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3.5 align-middle">
                              <div className="min-w-0">
                                <div className="text-xs font-manrope text-[#333333] whitespace-nowrap">
                                  {shortAddr(d.pickupAddress)} <span className="text-[#757575]">(Origin)</span>
                                </div>
                                <div className="text-xs font-manrope text-[#333333] whitespace-nowrap mt-0.5">
                                  {shortAddr(d.dropoffAddress)} <span className="text-[#757575]">(Destination)</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3.5 align-middle">
                              <span className={`text-xs font-manrope whitespace-nowrap ${d.courierName ? "text-[#333333]" : "text-[#757575]"}`}>
                                {d.courierName || "Unassigned"}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 align-middle">
                              <div className="min-w-0">
                                <div className="text-xs font-manrope text-[#333333] whitespace-nowrap">
                                  {formatDate(d.createdAt)} <span className="text-[#757575]">(Booked)</span>
                                </div>
                                {d.scheduledDate && (
                                  <div className="text-xs font-manrope text-[#173420] whitespace-nowrap mt-0.5">
                                    {formatDate(d.scheduledDate)} <span className="text-[#757575]">(Due)</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3.5 align-middle">
                              <div className="flex items-center gap-2">
                                <div className="w-[70px] h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                                  <div className="h-full bg-[#40C4AA] rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs font-manrope text-[#333333] whitespace-nowrap">{pct}%</span>
                              </div>
                            </td>
                            <td className="px-3 py-3.5 align-middle">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium ${pill.bg} ${pill.text}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {(statusLabels[d.status] || d.status).toUpperCase()}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 align-middle">
                              <span className="text-xs font-manrope font-semibold text-[#333333] whitespace-nowrap">
                                {formatCents(d.priceCents)}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 align-middle">
                              <button
                                type="button"
                                aria-label={`View ${d.trackingNumber} details`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDelivery(d);
                                }}
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#333333] hover:bg-[#F0F0F0] transition-colors"
                              >
                                <DotsThree size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
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
                      <span key={`e${i}`} className="text-xs font-manrope text-[#333333] px-1">
                        …
                      </span>
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
            </div>
          )}
        </div>
      </div>

      {/* Delivery detail side sheet */}
      <DeliveryDetailSheet
        open={Boolean(detailId && token)}
        id={detailId}
        token={token}
        onClose={closeSheet}
      />
    </>
  );
}

export default function MyDeliveriesPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-[#F3F5F1]">
        <p className="text-sm text-[#8094A7] font-inter">Loading...</p>
      </div>
    }>
      <DeliveriesContent />
    </Suspense>
  );
}
