"use client";

import { useEffect, useState } from "react";
import { Truck, Broadcast } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/ui/status-badge";
import { geocodeAddress, formatDistance, formatDurationHours, haversineMiles } from "@/lib/geocode";
import { progressForStatus, statusLabels, statusVariants } from "@/components/shared/tracking/types";
import type { CourierLocation, TrackingShipment } from "@/components/shared/tracking/types";

function formatShortDate(d: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return (
    date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " – " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

function formatRelativeTime(iso: string | null): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return null;
  const diffSec = Math.round((Date.now() - t) / 1000);
  if (diffSec < 0) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  return `${diffHr}h ago`;
}

function formatEtaMinutes(min: number): string {
  if (min <= 0) return "arriving";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function Donut({ pct, label }: { pct: number; label: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(100, pct));
  return (
    <div className="relative w-[68px] h-[68px] shrink-0">
      <svg viewBox="0 0 68 68" className="w-full h-full -rotate-90">
        <circle cx="34" cy="34" r={r} fill="none" stroke="#EDEDED" strokeWidth="7" />
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke="#40C4AA"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (filled / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-manrope font-semibold text-[#052D50]">{filled}%</span>
        <span className="text-[8px] font-manrope text-[#8094A7] leading-none">{label}</span>
      </div>
    </div>
  );
}

function Step({ label, name, time, dot }: { label: string; name: string; time: string; dot: string }) {
  return (
    <div className="flex flex-col items-center text-center min-w-0">
      <span className="text-[9px] font-manrope uppercase tracking-wide text-[#A4ACB9] mb-1">{label}</span>
      <span className={`w-2.5 h-2.5 rounded-full mb-1.5 ${dot}`} />
      <span className="text-[11px] font-manrope text-[#333] font-medium leading-tight line-clamp-2">
        {name}
      </span>
      <span className="text-[9px] font-manrope text-[#8094A7] mt-0.5">{time}</span>
    </div>
  );
}

export function LiveTrackingPanel({
  shipment,
  showHeader = true,
  courierLocation,
  etaMinutes,
  etaDistanceMiles,
  availabilityStatus,
}: {
  shipment: TrackingShipment | null;
  showHeader?: boolean;
  courierLocation?: CourierLocation | null;
  etaMinutes?: number | null;
  etaDistanceMiles?: number | null;
  availabilityStatus?: string | null;
}) {
  const [distance, setDistance] = useState<number | null>(null);
  const liveLocation = courierLocation ?? shipment?.courierLocation ?? null;
  const lastSeen = formatRelativeTime(liveLocation?.recordedAt ?? null);

  useEffect(() => {
    let cancelled = false;
    if (!shipment) {
      setDistance(null);
      return;
    }
    (async () => {
      const [p, d] = await Promise.all([
        geocodeAddress(shipment.pickupAddress || ""),
        geocodeAddress(shipment.dropoffAddress || ""),
      ]);
      if (cancelled) return;
      if (p && d) setDistance(haversineMiles(p, d));
      else setDistance(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [shipment]);

  if (!shipment) {
    return (
      <section className="bg-white border border-[#E3E6ED] rounded-lg p-5 flex items-center justify-center min-h-[240px]">
        <span className="text-sm text-[#8094A7]">Select a shipment to track</span>
      </section>
    );
  }

  const pct = progressForStatus(shipment.status);
  const start = shipment.pickupWindowStart;
  const end = shipment.dropoffWindowEnd || shipment.scheduledDate;
  let durationHours: number | null = null;
  if (start && end) {
    const a = new Date(start).getTime();
    const b = new Date(end).getTime();
    if (!isNaN(a) && !isNaN(b) && b > a) durationHours = (b - a) / 3600000;
  }
  const estDuration = durationHours ?? (distance ? distance / 45 : null);
  const short = (s: string) => s.split(",")[0].trim() || s;
  const hasPackage = shipment.packageDesc || shipment.packagePieces > 1 || shipment.packageWeight;

  return (
    <section className="bg-white border border-[#E3E6ED] rounded-lg p-5 flex flex-col min-w-0">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="text-[10px] font-manrope text-[#8094A7]">Tracking ID</div>
            <div className="text-sm font-manrope font-semibold text-[#052D50] truncate">
              #{shipment.trackingNumber}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge label={statusLabels[shipment.status] || shipment.status} status={statusVariants[shipment.status] || "pending"} />
            <span className="text-[10px] font-manrope text-[#8094A7]">
              {shipment.courierName ? `${shipment.courierName} · ` : ""}
              {shipment.priceCents != null ? `$${(shipment.priceCents / 100).toFixed(2)}` : ""}
            </span>
          </div>
        </div>
      )}

      {/* Live courier ETA strip */}
      {liveLocation && (
        <div className="flex items-center justify-between gap-3 mb-4 px-3 py-2 bg-[#EFFEFA] border border-[#D9F9E7] rounded-lg">
          <div className="flex items-center gap-1.5 text-[11px] font-manrope text-[#12806B] min-w-0">
            <Broadcast size={14} />
            <span className="font-semibold whitespace-nowrap">Live courier</span>
            {availabilityStatus && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    availabilityStatus === "online" ? "bg-[#007837]" : "bg-[#A4ACB9]"
                  }`}
                />
                <span className="capitalize">{availabilityStatus}</span>
              </span>
            )}
            {lastSeen && <span className="text-[#8094A7] truncate">· {lastSeen}</span>}
          </div>
          <div className="text-[11px] font-manrope text-[#333] whitespace-nowrap">
            {etaDistanceMiles != null && (
              <span>{formatDistance(etaDistanceMiles)} away</span>
            )}
            {etaMinutes != null && (
              <span>{etaDistanceMiles != null ? " · " : ""}ETA {formatEtaMinutes(etaMinutes)}</span>
            )}
          </div>
        </div>
      )}

      {/* Donut + stepper */}
      <div className="flex items-center gap-5 mb-5">
        <Donut pct={pct} label={statusLabels[shipment.status] || shipment.status} />
        <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
          <div className="flex-1 min-w-0 max-w-[110px]">
            <Step
              label="Origin"
              name={short(shipment.pickupAddress || "Pickup")}
              time={formatShortDate(shipment.pickupWindowStart)}
              dot="bg-[#173420]"
            />
          </div>

          <div className="flex flex-col items-center shrink-0">
            <div className="flex items-center gap-1">
              <span className="w-6 border-t border-dashed border-[#40C4AA]" />
              <span className="w-6 h-6 rounded-full bg-[#EFFEFA] flex items-center justify-center text-[#12806B]">
                <Truck size={13} />
              </span>
              <span className="w-6 border-t border-dashed border-[#40C4AA]" />
            </div>
            <span className="text-[9px] font-manrope text-[#8094A7] mt-0.5 whitespace-nowrap">
              {distance != null ? formatDistance(distance) : "—"}
              {estDuration != null ? ` · ${formatDurationHours(estDuration)}` : ""}
            </span>
          </div>

          <div className="flex-1 min-w-0 max-w-[110px]">
            <Step
              label="Destination"
              name={short(shipment.dropoffAddress || "Dropoff")}
              time={formatShortDate(shipment.scheduledDate || shipment.dropoffWindowEnd)}
              dot="bg-[#40C4AA]"
            />
          </div>
        </div>
      </div>

      {/* Manifest */}
      <div className="border-t border-[#EDEDED] pt-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-manrope text-[#333]">Shipment Manifest</h4>
          <span className="text-[10px] font-manrope text-[#8094A7]">
            {shipment.packagePieces} piece{shipment.packagePieces > 1 ? "s" : ""}
          </span>
        </div>
        {hasPackage ? (
          <table className="w-full text-[10px] font-manrope">
            <thead>
              <tr className="bg-[#FCF2F2]">
                <th className="py-1.5 px-2 rounded-l font-semibold text-[#333] text-left">No</th>
                <th className="py-1.5 px-2 font-semibold text-[#333] text-left">Description</th>
                <th className="py-1.5 px-2 font-semibold text-[#333] text-left">Pieces</th>
                <th className="py-1.5 px-2 font-semibold text-[#333] text-left">Weight</th>
                <th className="py-1.5 px-2 rounded-r font-semibold text-[#333] text-left">Priority</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#EDEDED] last:border-0">
                <td className="py-2 px-2 text-[#8094A7]">1</td>
                <td className="py-2 px-2 text-[#333]">{shipment.packageDesc || "—"}</td>
                <td className="py-2 px-2 text-[#333]">{shipment.packagePieces}</td>
                <td className="py-2 px-2 text-[#333]">{shipment.packageWeight || "—"}</td>
                <td className="py-2 px-2 text-[#333]">
                  {shipment.priority ? <span className="capitalize">{shipment.priority}</span> : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="text-[11px] font-manrope text-[#8094A7] py-2">No package details</div>
        )}
      </div>
    </section>
  );
}
