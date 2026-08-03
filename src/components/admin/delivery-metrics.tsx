"use client";

export interface DeliveryMeta {
  totalDeliveries: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  overdueDeliveries: number;
  activeCouriers: number;
  avgDeliveryTimeDays: number;
  deltas: {
    total: number;
    pending: number;
    completed: number;
    overdue: number | null;
  };
  statusCounts: Record<string, number>;
  deliveriesByMonth: { month: string; count: number; avgDays: number | null }[];
  busyPeriods: {
    rows: { label: string; values: number[] }[];
    min: number;
    max: number;
    labels: string[];
  };
}

function formatDelta(v: number | null | undefined): string | null {
  if (v == null) return null;
  if (v > 0) return `+${v}%`;
  if (v < 0) return `${v}%`;
  return "0%";
}

function MetricCard({
  label,
  value,
  delta,
  subtitle,
}: {
  label: string;
  value: string;
  delta?: string | null;
  subtitle?: string;
}) {
  return (
    <div className="bg-white border border-[#E3E6ED] rounded-lg p-5 flex flex-col justify-between min-w-0">
      <span className="text-sm font-inter text-[#295279] mb-5">{label}</span>
      <div>
        <div className="text-2xl font-inter font-semibold text-[#052D50] mb-2">
          {value}
        </div>
        <div className="flex items-center gap-2">
          {delta != null && (
            <span className="text-xs font-inter-tight font-semibold bg-[#EFFEFA] text-[#40C4AA] rounded-full px-2 py-0.5 leading-none">
              {delta}
            </span>
          )}
          {subtitle && <span className="text-xs text-[#8094A7]">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}

export function DeliveryMetrics({ meta }: { meta: DeliveryMeta | null }) {
  const cards: {
    label: string;
    value: string;
    delta?: string | null;
    subtitle?: string;
  }[] = [
    {
      label: "Total Deliveries",
      value: String(meta?.totalDeliveries ?? 0),
      delta: formatDelta(meta?.deltas?.total),
    },
    {
      label: "Pending Deliveries",
      value: String(meta?.pendingDeliveries ?? 0),
      delta: formatDelta(meta?.deltas?.pending),
    },
    {
      label: "Completed Deliveries",
      value: String(meta?.completedDeliveries ?? 0),
      delta: formatDelta(meta?.deltas?.completed),
    },
    {
      label: "Overdue Deliveries",
      value: String(meta?.overdueDeliveries ?? 0),
      subtitle: "past scheduled window",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[10px]">
      {cards.map((c) => (
        <MetricCard key={c.label} {...c} />
      ))}
    </div>
  );
}
