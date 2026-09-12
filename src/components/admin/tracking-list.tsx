"use client";

import { useMemo, useState } from "react";
import {
  MagnifyingGlass,
  FunnelSimple,
  CaretDown,
  CaretUp,
  ChatTeardrop,
  Phone,
  Truck,
} from "@phosphor-icons/react";
import { StatusBadge } from "@/components/ui/status-badge";
import { progressForStatus, statusLabels, statusVariants, type TrackingShipment } from "@/components/shared/tracking/types";

const statusGroups: { key: string; label: string; statuses: string[] }[] = [
  { key: "all", label: "All", statuses: [] },
  { key: "delivered", label: "Delivered", statuses: ["delivered"] },
  { key: "in-transit", label: "In Transit", statuses: ["in-transit"] },
  { key: "processing", label: "Processing", statuses: ["pending", "processing", "picked-up"] },
  { key: "out-for-delivery", label: "Out for Delivery", statuses: ["out-for-delivery"] },
];

function countForGroup(statusCounts: Record<string, number>, group: typeof statusGroups[number]): number {
  if (group.key === "all") {
    return Object.values(statusCounts).reduce((s, v) => s + v, 0);
  }
  return group.statuses.reduce((s, st) => s + (statusCounts[st] ?? 0), 0);
}

function formatEventTime(ts: string) {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }) +
    " – " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function TrackingList({
  items,
  statusCounts,
  selectedId,
  onSelect,
  expandedId,
  onToggleExpand,
}: {
  items: TrackingShipment[];
  statusCounts: Record<string, number>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    const group = statusGroups.find((g) => g.key === activeTab);
    let rows = items;
    if (group && group.statuses.length > 0) {
      rows = rows.filter((d) => group.statuses.includes(d.status));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (d) =>
          d.trackingNumber.toLowerCase().includes(q) ||
          (d.courierName || "").toLowerCase().includes(q) ||
          (d.customerName || "").toLowerCase().includes(q) ||
          (d.pickupAddress || "").toLowerCase().includes(q) ||
          (d.dropoffAddress || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [items, activeTab, search]);

  return (
    <div className="flex flex-col min-w-0 h-full">
      {/* Search + filter */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8094A7]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shipment"
            className="w-full h-9 pl-9 pr-3 bg-white border border-[#E3E6ED] rounded-md text-sm text-[#333] placeholder:text-[#8094A7] focus:outline-none focus:border-[#052D50]"
          />
        </div>
        <button className="flex items-center gap-1.5 h-9 px-3 bg-white border border-[#E3E6ED] rounded-md text-sm font-inter text-[#45617D] hover:bg-gray-50 transition-colors">
          <FunnelSimple size={15} /> Filter
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {statusGroups.map((g) => {
          const count = countForGroup(statusCounts, g);
          const active = activeTab === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setActiveTab(g.key)}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-manrope font-semibold transition-colors ${
                active ? "bg-[#052D50] text-white" : "bg-[#F3F4F8] text-[#45617D] hover:bg-gray-200"
              }`}
            >
              {g.label}
              <span className={`px-1.5 rounded-full text-xs ${active ? "bg-white/20 text-white" : "bg-white text-[#8094A7]"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
        {filtered.length === 0 ? (
          <div className="text-center text-sm text-[#8094A7] py-12">
            {search || activeTab !== "all" ? "No shipments match" : "No shipments yet"}
          </div>
        ) : (
          filtered.map((d) => {
            const expanded = expandedId === d.id;
            const selected = selectedId === d.id;
            const pct = progressForStatus(d.status);
            return (
              <div
                key={d.id}
                onClick={() => onSelect(d.id)}
                className={`bg-white border rounded-lg transition-colors cursor-pointer ${
                  selected ? "border-[#052D50] ring-1 ring-[#052D50]/10" : "border-[#E3E6ED] hover:border-[#C4CBD6]"
                }`}
              >
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <div className="text-sm font-manrope font-semibold text-[#052D50]">
                        #{d.trackingNumber}
                      </div>
                      <div className="text-xs font-manrope text-[#8094A7] truncate">
                        {d.courierName || "Unassigned"}
                      </div>
                    </div>
                    <StatusBadge
                      label={statusLabels[d.status] || d.status}
                      status={statusVariants[d.status] || "pending"}
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-[#E3E6ED] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#40C4AA]" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-manrope text-[#8094A7] w-9 text-right">{pct}%</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-manrope text-[#A4ACB9]">
                      Courier · {d.courierName || "—"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand(d.id);
                      }}
                      className="flex items-center gap-1 text-xs font-manrope text-[#45617D] hover:text-[#052D50] transition-colors"
                    >
                      {expanded ? (
                        <>
                          Close <CaretUp size={12} />
                        </>
                      ) : (
                        <>
                          Details <CaretDown size={12} />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-[#E3E6ED] px-4 py-3 space-y-3">
                    {d.latestEvent ? (
                      <div className="flex gap-2.5">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-[#40C4AA] mt-1 shrink-0" />
                          <div className="w-px flex-1 bg-[#C4CBD6] min-h-[12px]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-manrope text-[#333]">
                            {d.latestEvent.note || statusLabels[d.latestEvent.status] || "Update"}
                          </div>
                          {d.latestEvent.locationText && (
                            <div className="text-xs font-manrope text-[#8094A7] truncate">
                              {d.latestEvent.locationText}
                            </div>
                          )}
                          <div className="text-xs font-manrope text-[#A4ACB9]">
                            {formatEventTime(d.latestEvent.createdAt)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-manrope text-[#8094A7]">No events yet</div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#F0F0F0]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#EFFEFA] flex items-center justify-center text-[#12806B] text-xs font-semibold font-manrope">
                          {(d.courierName || "?").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-manrope text-[#8094A7]">Courier</div>
                          <div className="text-xs font-manrope text-[#333]">
                            {d.courierName || "Unassigned"}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          className="relative w-8 h-8 bg-[#F0F0F0] rounded-lg flex items-center justify-center text-[#333] hover:bg-[#E3E6ED] transition-colors"
                          title="Message courier"
                        >
                          <ChatTeardrop size={15} />
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F04A4A]" />
                        </button>
                        <button
                          className="w-8 h-8 bg-[#F0F0F0] rounded-lg flex items-center justify-center text-[#333] hover:bg-[#E3E6ED] transition-colors"
                          title={d.courierPhone ? `Call ${d.courierPhone}` : "Call courier"}
                        >
                          <Phone size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      {filtered.length > 0 && (
        <div className="pt-2 mt-2 border-t border-[#E3E6ED] flex items-center gap-1.5 text-xs font-manrope text-[#A4ACB9]">
          <Truck size={13} />
          {filtered.length} shipment{filtered.length > 1 ? "s" : ""} tracked
        </div>
      )}
    </div>
  );
}