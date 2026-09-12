"use client";

import { TrendUp, Clock, ChartBar } from "@phosphor-icons/react";

interface StatPoint {
  month: string;
  count: number;
  avgDays: number | null;
}

interface HeatRow {
  label: string;
  values: number[];
}

function heatColor(t: number): string {
  const a = [232, 251, 247];
  const b = [64, 196, 170];
  const c = [13, 104, 88];
  const t1 = Math.min(1, Math.max(0, t));
  let rgb: number[];
  if (t1 <= 0.5) {
    const s = t1 / 0.5;
    rgb = a.map((v, i) => Math.round(v + (b[i] - v) * s));
  } else {
    const s = (t1 - 0.5) / 0.5;
    rgb = b.map((v, i) => Math.round(v + (c[i] - v) * s));
  }
  return `rgb(${rgb.join(",")})`;
}

export function AvgDeliveryTimeChart({ data }: { data: StatPoint[] }) {
  const items = data ?? [];
  const maxDays = Math.max(1, ...items.map((m) => m.avgDays ?? 0));

  return (
    <section className="bg-white border border-[#E3E6ED] rounded-lg p-5 flex flex-col min-w-0">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-manrope text-[#295279]">Average Delivery Time</h3>
        <span className="inline-flex items-center gap-1 text-xs font-inter font-semibold bg-[#EFFEFA] text-[#40C4AA] rounded-full px-2 py-0.5">
          <Clock size={12} /> days
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-manrope font-semibold text-[#052D50]">
            {items.length > 0
              ? (items.reduce((s, m) => s + (m.avgDays ?? 0), 0) / items.filter((m) => m.avgDays != null).length || 0).toFixed(1)
              : "0.0"}
          </span>
          <span className="text-xs font-inter text-[#8094A7]">avg days / delivery</span>
        </div>
      </div>

      <div className="flex gap-3 flex-1">
        <div className="flex flex-col justify-between text-xs font-manrope text-[#8094A7] py-0.5">
          <span>{Math.round(maxDays)}</span>
          <span>{Math.round(maxDays / 2)}</span>
          <span>0</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-end gap-[6px] h-[150px]">
            {items.map((m) => {
              const h = m.avgDays == null ? 0 : (m.avgDays / maxDays) * 100;
              return (
                <div
                  key={m.month}
                  title={`${m.month}: ${m.avgDays == null ? "n/a" : m.avgDays + " days"} (${m.count})`}
                  className="flex-1 flex flex-col justify-end"
                >
                  <div className="w-full rounded-t-sm bg-[#40C4AA] opacity-80"
                    style={{ height: `${Math.max(h, h > 0 ? 2 : 0)}%` }} />
                </div>
              );
            })}
          </div>
          <div className="flex gap-[6px] mt-2">
            {items.map((m) => (
              <span key={m.month} className="flex-1 text-center text-xs font-manrope text-[#8094A7] truncate">
                {m.month}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BusyPeriodsHeatmap({
  rows,
  labels,
  max,
}: {
  rows: HeatRow[];
  labels?: string[];
  max: number;
}) {
  const hourLabels = labels && labels.length > 0
    ? labels
    : Array.from({ length: 13 }, (_, i) => `${8 + i}:00`);

  return (
    <section className="bg-white border border-[#E3E6ED] rounded-lg p-5 flex flex-col min-w-0">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-manrope text-[#295279]">Busy Periods</h3>
        <span className="inline-flex items-center gap-1 text-xs font-inter font-semibold bg-[#EFFEFA] text-[#40C4AA] rounded-full px-2 py-0.5">
          <ChartBar size={12} /> deliveries / hour
        </span>
      </div>

      <div className="flex flex-1">
        <div className="flex flex-col mr-2 shrink-0">
          <div className="h-6" />
          {rows.map((r) => (
            <div key={r.label} className="h-6 flex items-center justify-end pr-2 text-xs font-manrope text-[#8094A7]">
              {r.label}
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="grid mb-1" style={{ gridTemplateColumns: `repeat(${hourLabels.length}, minmax(0,1fr))` }}>
            {hourLabels.map((l, i) => (
              <div key={l} className={`text-center text-xs font-manrope text-[#8094A7] ${i % 2 === 0 ? "" : "opacity-0"}`}>
                {l}
              </div>
            ))}
          </div>
          {rows.map((r) => (
            <div key={r.label} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `repeat(${r.values.length}, minmax(0,1fr))` }}>
              {r.values.map((v, i) => (
                <div
                  key={i}
                  title={`${r.label} ${hourLabels[i]}: ${v}`}
                  className="h-6 rounded-sm"
                  style={{ backgroundColor: heatColor(max > 0 ? v / max : 0) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3">
        <span className="text-xs font-manrope text-[#8094A7]">Low</span>
        <div className="flex">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <div key={t} className="w-4 h-3" style={{ backgroundColor: heatColor(t) }} />
          ))}
        </div>
        <span className="text-xs font-manrope text-[#8094A7]">High</span>
      </div>
    </section>
  );
}