"use client";

import { TrendUp } from "@phosphor-icons/react";

interface MonthlyPoint {
  month: string;
  revenueCents: number;
  outstandingCents: number;
}

const BAR_COLORS = {
  revenue: "#F04A4A",
  outstanding: "#333333",
};

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  })}`;
}

export function ProfitSummary({ data }: { data: MonthlyPoint[] }) {
  const items = data ?? [];

  const totalRevenueCents = items.reduce(
    (s, m) => s + m.revenueCents,
    0
  );
  const firstRevenue = items[0]?.revenueCents ?? 0;
  const lastRevenue = items[items.length - 1]?.revenueCents ?? 0;
  const change =
    firstRevenue > 0
      ? ((lastRevenue - firstRevenue) / firstRevenue) * 100
      : 0;

  const max = Math.max(
    1,
    ...items.flatMap((m) => [m.revenueCents, m.outstandingCents])
  );

  return (
    <section className="bg-[#FEFEFE] border border-[#E3E6ED] rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-manrope text-[#333333]">Profit Summary</h3>
        <button className="flex items-center gap-1.5 h-7 px-3 bg-[#F0F0F0] rounded-lg text-xs text-[#333333] font-manrope hover:bg-gray-200 transition-colors">
          Last 8 Months
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.625 4.5L6 7.875L9.375 4.5"
              stroke="#333333"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-manrope font-semibold text-[#333333]">
              {formatCents(totalRevenueCents)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-manrope font-semibold bg-[#D9F9E7] text-[#007837] rounded-full px-2 py-0.5">
              <TrendUp size={12} weight="bold" />
              {change > 0 ? "+" : ""}{change.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-manrope text-[#757575]">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: BAR_COLORS.revenue }}
            />
            Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: BAR_COLORS.outstanding }}
            />
            Outstanding
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col justify-between text-xs font-manrope text-[#757575] py-0.5">
          <span>$100K</span>
          <span>$75K</span>
          <span>$50K</span>
          <span>$25K</span>
          <span>$0</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-end gap-[6px] h-[190px]">
            {items.map((m) => {
              const revH = (m.revenueCents / max) * 100;
              const outH = (m.outstandingCents / max) * 100;
              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col justify-end gap-[3px]"
                >
                  <div title={`${m.month} revenue`}>
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${Math.max(revH, revH > 0 ? 2 : 0)}%`,
                        backgroundColor: BAR_COLORS.revenue,
                      }}
                    />
                  </div>
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${Math.max(outH, outH > 0 ? 2 : 0)}%`,
                      backgroundColor: BAR_COLORS.outstanding,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-[6px] mt-2">
            {items.map((m) => (
              <span
                key={m.month}
                className="flex-1 text-center text-xs font-manrope text-[#757575]"
              >
                {m.month}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}