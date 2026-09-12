"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MagnifyingGlass,
  FunnelSimple,
  CalendarBlank,
  ArrowsDownUp,
  DotsThree,
  FilePlus,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { StatusBadge } from "@/components/ui/status-badge";

export interface ShipmentItem {
  id: string;
  trackingNumber: string;
  status: string;
  customerName: string | null;
  courierName: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  packageDesc: string;
  packagePieces: number;
  packageWeight: string | null;
  priority: string | null;
  priceCents: number | null;
  pickupWindowStart: string | null;
  scheduledDate: string | null;
  dropoffWindowEnd: string | null;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  "picked-up": "Picked Up",
  "in-transit": "In Transit",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  "failed-attempt": "Failed Attempt",
};

const statusVariants: Record<string, "pending" | "processing" | "in-transit" | "out-for-delivery" | "delivered" | "cancelled"> = {
  pending: "pending",
  processing: "processing",
  "picked-up": "in-transit",
  "in-transit": "in-transit",
  "out-for-delivery": "out-for-delivery",
  delivered: "delivered",
  "failed-attempt": "pending",
  cancelled: "cancelled",
};

const progressByStatus: Record<string, number> = {
  pending: 8,
  processing: 18,
  "picked-up": 30,
  "in-transit": 55,
  "out-for-delivery": 80,
  delivered: 100,
  "failed-attempt": 40,
  cancelled: 0,
};

const tabOrder = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "picked-up", label: "Picked Up" },
  { key: "in-transit", label: "In Transit" },
  { key: "out-for-delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeLabel(item: ShipmentItem): string {
  return item.pickupWindowStart || item.scheduledDate || item.createdAt || "";
}

function routeLabel(item: ShipmentItem): string {
  const pick = item.pickupAddress || "Pickup";
  const drop = item.dropoffAddress || "Dropoff";
  const short = (s: string) => s.split(",")[0].trim() || s;
  if (pick === drop) return pick;
  return `${short(pick)} → ${short(drop)}`;
}

export function ShipmentList({
  items,
  statusCounts,
  loading,
  error,
  search,
  onSearchChange,
  onSelect,
}: {
  items: ShipmentItem[];
  statusCounts: Record<string, number>;
  loading?: boolean;
  error?: string;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [thisMonth, setThisMonth] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    setPage(1);
  }, [activeTab, search, thisMonth, sortAsc]);

  const filtered = useMemo(() => {
    let rows = items;
    if (activeTab !== "all") {
      rows = rows.filter((d) => d.status === activeTab);
    }
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (d) =>
          d.trackingNumber.toLowerCase().includes(q) ||
          (d.customerName || "").toLowerCase().includes(q) ||
          (d.courierName || "").toLowerCase().includes(q) ||
          (d.pickupAddress || "").toLowerCase().includes(q) ||
          (d.dropoffAddress || "").toLowerCase().includes(q)
      );
    }
    if (thisMonth) {
      const now = new Date();
      rows = rows.filter((d) => {
        const t = new Date(timeLabel(d));
        return t.getMonth() === now.getMonth() && t.getFullYear() === now.getFullYear();
      });
    }
    rows = [...rows].sort((a, b) => {
      const ta = new Date(timeLabel(a)).getTime();
      const tb = new Date(timeLabel(b)).getTime();
      return sortAsc ? ta - tb : tb - ta;
    });
    return rows;
  }, [items, activeTab, search, thisMonth, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startEntry = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endEntry = Math.min(safePage * pageSize, filtered.length);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const tabs = tabOrder
    .map((t) => ({ ...t, count: t.key === "all" ? (items.length) : (statusCounts[t.key] ?? 0) }))
    .filter((t) => t.key === "all" || t.count > 0);

  return (
    <section className="bg-white border border-[#E3E6ED] rounded-lg flex flex-col min-w-0 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 sm:px-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative w-full lg:w-72">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8094A7]" />
            <input
              placeholder="Search shipment..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-white border border-[#E3E6ED] rounded-md text-sm text-[#333] placeholder:text-[#8094A7] focus:outline-none focus:border-[#052D50]"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-inter transition-colors ${
                thisMonth ? "bg-[#EFFEFA] text-[#12806B]" : "bg-[#F4F7FD] text-[#45617D] hover:bg-gray-100"
              }`}
              onClick={() => setThisMonth((v) => !v)}
            >
              <CalendarBlank size={15} /> This Month
            </button>
            <button className="flex items-center gap-1.5 h-9 px-3 bg-[#F4F7FD] text-[#45617D] rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
              <FunnelSimple size={15} /> Filter
            </button>
            <button
              className="flex items-center gap-1.5 h-9 px-3 bg-[#F4F7FD] text-[#45617D] rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
              onClick={() => setSortAsc((v) => !v)}
            >
              <ArrowsDownUp size={15} /> {sortAsc ? "Oldest" : "Newest"}
            </button>
            <button className="w-9 h-9 flex items-center justify-center bg-[#F4F7FD] text-[#45617D] rounded-md hover:bg-gray-100 transition-colors">
              <DotsThree size={18} />
            </button>
            <button className="flex items-center gap-1.5 h-9 px-3 bg-[#173420] text-white rounded-md text-sm font-medium hover:bg-[#1F4228] transition-colors">
              <FilePlus size={15} /> New Invoice
            </button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const count = t.key === "all" ? items.length : (statusCounts[t.key] ?? 0);
            if (t.key !== "all" && count === 0) return null;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-manrope font-semibold transition-colors ${
                  active
                    ? "bg-[#052D50] text-white"
                    : "bg-[#F3F4F8] text-[#45617D] hover:bg-gray-200"
                }`}
              >
                {t.label}
                <span
                  className={`px-1.5 rounded-full text-xs ${
                    active ? "bg-white/20 text-white" : "bg-white text-[#8094A7]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-w-0 overflow-x-auto">
        {error ? (
          <div className="bg-[#FCDEE0] text-[#C0392B] text-sm rounded-lg px-4 py-3">{error}</div>
        ) : loading ? (
          <div className="flex items-center justify-center h-48 text-sm text-[#8094A7]">Loading shipments...</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-[#8094A7]">
            {search || activeTab !== "all" || thisMonth ? "No shipments match your filters" : "No shipments yet"}
          </div>
        ) : (
          <table className="w-full min-w-[920px] text-xs font-manrope">
            <thead>
              <tr className="bg-[#FCF2F2]">
                <th className="text-left text-[#333] font-semibold py-2.5 px-3">Shipping ID</th>
                <th className="text-left text-[#333] font-semibold py-2.5 px-3">Customer</th>
                <th className="text-left text-[#333] font-semibold py-2.5 px-3">Courier</th>
                <th className="text-left text-[#333] font-semibold py-2.5 px-3">Package</th>
                <th className="text-left text-[#333] font-semibold py-2.5 px-3">Weight</th>
                <th className="text-left text-[#333] font-semibold py-2.5 px-3">Route</th>
                <th className="text-left text-[#333] font-semibold py-2.5 px-3">Date</th>
                <th className="text-left text-[#333] font-semibold py-2.5 px-3">Progress</th>
                <th className="text-left text-[#333] font-semibold py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((d) => {
                const pct = progressByStatus[d.status] ?? 10;
                return (
                  <tr
                    key={d.id}
                    onClick={() => onSelect(d.id)}
                    className="border-b border-[#E0E0E0] last:border-0 cursor-pointer hover:bg-[#F8F9FC] transition-colors"
                  >
                    <td className="text-[#052D50] py-3 px-3 font-semibold">{d.trackingNumber}</td>
                    <td className="text-[#333] py-3 px-3">{d.customerName || "—"}</td>
                    <td className="py-3 px-3">
                      {d.courierName ? (
                        <span className="text-[#173420]">{d.courierName}</span>
                      ) : (
                        <span className="text-[#F04A4A]">Unassigned</span>
                      )}
                    </td>
                    <td className="text-[#333] py-3 px-3 max-w-[120px] truncate">
                      {d.packageDesc || `${d.packagePieces} piece${d.packagePieces > 1 ? "s" : ""}`}
                    </td>
                    <td className="text-[#757575] py-3 px-3">{d.packageWeight || "—"}</td>
                    <td className="text-[#333] py-3 px-3 max-w-[180px] truncate">{routeLabel(d)}</td>
                    <td className="text-[#757575] py-3 px-3 whitespace-nowrap">{formatDate(timeLabel(d))}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-[#E3E6ED] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#40C4AA]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#8094A7] font-medium">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge
                        label={statusLabels[d.status] || d.status}
                        status={statusVariants[d.status] || "pending"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-[#EDEDED]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-[#E3E6ED] hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <CaretLeft size={14} className="text-[#173420]" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-[#DCE8D6] rounded-lg text-sm font-inter text-[#173420]">
            {safePage}
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-[#E3E6ED] hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <CaretRight size={14} className="text-[#173420]" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-inter text-[#8094A7]">
            Showing {startEntry} to {endEntry} of {filtered.length} shipments
          </span>
        </div>
      </div>
    </section>
  );
}