"use client";

import { DotsThree } from "@phosphor-icons/react";

interface Segment {
  label: string;
  count: number;
}

const STATUS_COLORS: Array<{ key: string; color: string }> = [
  { key: "pending", color: "#F04A4A" },
  { key: "processing", color: "#FCDFE0" },
  { key: "picked-up", color: "#333333" },
  { key: "in-transit", color: "#757575" },
  { key: "out-for-delivery", color: "#E0E0E0" },
  { key: "delivered", color: "#F0F0F0" },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  "picked-up": "Picked Up",
  "in-transit": "In Transit",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function ProductCategories({
  breakdown,
}: {
  breakdown: Record<string, number>;
}) {
  const entries = Object.entries(breakdown ?? {});
  const total = entries.reduce((s, [, c]) => s + c, 0);

const seeded = entries.map(([status, count]) => {
    const match = STATUS_COLORS.find((c) => c.key === status);
    return {
      status,
      label: STATUS_LABELS[status] || status,
      count,
      color: match?.color ?? "#F0F0F0",
    };
  });

  return (
    <section className="bg-[#FEFEFE] border border-[#E3E6ED] rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-manrope text-[#333333]">
            Deliveries by Status
          </h3>
        </div>
        <button className="w-7 h-7 flex items-center justify-center bg-[#F0F0F0] rounded-lg text-[#333333] hover:bg-[#E3E6ED] transition-colors">
          <DotsThree size={16} />
        </button>
      </div>

      <div className="flex items-end justify-between mb-2">
        <span className="text-[11px] font-manrope text-[#757575]">
          Total Shipments
        </span>
        <span className="text-2xl font-manrope font-semibold text-[#333333]">
          {total.toLocaleString()}
        </span>
      </div>

      <div className="flex h-3.5 rounded overflow-hidden mb-4 bg-[#F0F0F0]">
        {total === 0 ? (
          <div className="w-full bg-[#E0E0E0]" />
        ) : (
          seeded.map((s) => (
            <div
              key={s.status}
              title={`${s.label} — ${s.count}`}
              style={{
                width: `${(s.count / total) * 100}%`,
                backgroundColor: s.color,
              }}
            />
          ))
        )}
      </div>

      <div className="flex flex-col gap-3">
        {total === 0 ? (
          <div className="text-sm text-[#8094A7] font-manrope">
            No shipments yet
          </div>
        ) : (
          seeded.map((s) => (
            <div key={s.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-sm font-manrope text-[#333333]">
                  {s.label}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#F0F0F0] rounded px-2 py-0.5">
                <span className="text-xs font-manrope text-[#757575]">
                  {s.count} shipment{s.count !== 1 ? "s" : ""}
                </span>
                <span className="h-3 w-px bg-[#E0E0E0]" />
                <span className="text-xs font-manrope text-[#333333]">
                  {total ? `${Math.round((s.count / total) * 100)}%` : "0%"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}