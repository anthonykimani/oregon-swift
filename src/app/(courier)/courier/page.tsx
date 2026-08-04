"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  DotsThree,
  Truck,
  Clock,
  ArrowRight,
  CheckCircle,
  Package,
  MapPin,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { CourierDeliverySheet } from "@/components/courier/courier-delivery-sheet";
import {
  statusPillStyles,
  progressByStatus,
  statusLabels,
} from "@/components/shared/tracking/types";

interface DashboardStats {
  activeJobs: number;
  upcomingJobs: number;
  deliveredCount: number;
  totalEarnedCents: number;
  recentDeliveries: DeliveryItem[];
  recentActivity: ActivityItem[];
}

interface DeliveryItem {
  id: string;
  trackingNumber: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  packageDesc: string;
  createdAt: string;
  customerName?: string | null;
}

interface ActivityItem {
  id: string;
  status: string;
  note: string;
  createdAt: string;
  trackingNumber: string;
  deliveryId: string;
}

const activityIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={18} className="text-[#B8860B]" />,
  processing: <Package size={18} className="text-[#235BC2]" />,
  "picked-up": <Truck size={18} className="text-[#333333]" />,
  "in-transit": <Truck size={18} className="text-[#333333]" />,
  "out-for-delivery": <Truck size={18} className="text-[#F04A4A]" />,
  delivered: <CheckCircle size={18} className="text-[#007837]" />,
  "failed-attempt": <Package size={18} className="text-[#F04A4A]" />,
  cancelled: <Package size={18} className="text-[#999999]" />,
};

const activityBg: Record<string, string> = {
  pending: "bg-[#FFF3D6]",
  processing: "bg-[#E3EDFF]",
  "picked-up": "bg-[#F0F0F0]",
  "in-transit": "bg-[#F0F0F0]",
  "out-for-delivery": "bg-[#FCDEE0]",
  delivered: "bg-[#D9F9E7]",
  "failed-attempt": "bg-[#FCDEE0]",
  cancelled: "bg-[#F0F0F0]",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function StatSkeleton() {
  return (
    <div className="bg-white border border-[#E3E6ED] rounded-lg p-5 animate-pulse shadow-sm min-h-[135px]">
      <div className="h-3 w-24 bg-[#E3E6ED] rounded mb-5" />
      <div className="h-7 w-16 bg-[#E3E6ED] rounded mb-2" />
      <div className="h-3 w-28 bg-[#E3E6ED] rounded" />
    </div>
  );
}

export default function CourierHome() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const firstName = session?.user?.firstname || session?.user?.name?.split(" ")[0] || "Courier";
  const courierName = session?.user?.firstname && session?.user?.lastname
    ? `${session.user.firstname} ${session.user.lastname}`
    : session?.user?.name || null;
  const token = session?.accessToken;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const load = useCallback(() => {
    if (!token) return;
    api<DashboardStats>("/courier/stats", { token })
      .then((res) => {
        if (res.status === 200 && res.data) {
          setStats(res.data);
        } else {
          setError(res.errors?.[0] || "Failed to load dashboard");
        }
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const deliveries = stats?.recentDeliveries ?? [];
  const activity = stats?.recentActivity ?? [];
  const hasDeliveries = deliveries.length > 0;

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD] pb-0">
      <div className="px-5 pt-10 pb-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-inter text-[#8094A7]">{greeting},</p>
            <h1 className="text-2xl font-medium text-[#161618]" style={{ fontFamily: "Geist, var(--font-sans)" }}>{firstName}</h1>
          </div>
          <Link href="/courier/deliveries">
            <Button className="h-10 px-4 bg-[#F3BC24] hover:bg-[#F5C94A] rounded-[10px] text-[#173420] font-semibold text-sm gap-2 border-0" style={{ fontFamily: "Geist, var(--font-sans)" }}>
              <Truck size={18} weight="bold" />
              View Deliveries
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-[#FCDEE0] text-[#C0392B] text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}

        <div className="grid grid-cols-3 gap-[10px]">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white border border-[#E3E6ED] rounded-lg p-5 min-h-[135px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-inter text-[#2D5A3A]">Active Jobs</span>
                  <DotsThree size={16} className="text-[#173420]" />
                </div>
                <div>
                  <div className="text-2xl font-inter font-semibold text-[#173420] mb-1">
                    {stats?.activeJobs ?? 0}
                  </div>
                  <span className="text-xs font-inter text-[#8094A7]">currently in progress</span>
                </div>
              </div>
              <div className="bg-white border border-[#E3E6ED] rounded-lg p-5 min-h-[135px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-inter text-[#2D5A3A]">Upcoming Pickups</span>
                  <DotsThree size={16} className="text-[#173420]" />
                </div>
                <div>
                  <div className="text-2xl font-inter font-semibold text-[#173420] mb-1">
                    {stats?.upcomingJobs ?? 0}
                  </div>
                  <span className="text-xs font-inter text-[#8094A7]">awaiting pickup</span>
                </div>
              </div>
              <div className="bg-white border border-[#E3E6ED] rounded-lg p-5 min-h-[135px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-inter text-[#2D5A3A]">Total Earned</span>
                  <CurrencyCircleDollar size={16} className="text-[#173420]" />
                </div>
                <div>
                  <div className="text-2xl font-inter font-semibold text-[#173420] mb-1">
                    {formatCents(stats?.totalEarnedCents ?? 0)}
                  </div>
                  <span className="text-xs font-inter text-[#8094A7]">
                    {stats?.deliveredCount ?? 0} deliveries
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-5 flex-1 flex gap-[10px] min-h-0 pb-5">
        <div className="flex-1 bg-[#FEFEFE] border border-[#E3E6ED] rounded-xl p-4 flex flex-col min-w-0 shadow-sm">
          <div className="flex items-center gap-2 bg-[#f9f9fb] rounded-[10px] px-4 py-2.5 mb-4">
            <span className="w-[10px] h-[10px] rounded-full bg-[#173420] shrink-0" />
            <h3 className="text-base font-manrope font-medium text-[#161618]">Recent Jobs</h3>
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-white border border-[#e5e5ec] rounded-[7px] text-xs font-medium text-[#161618]">
              {deliveries.length}
            </span>
            <div className="flex-1" />
            {hasDeliveries && (
              <Link
                href="/courier/deliveries"
                className="text-xs text-[#173420] font-medium hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="animate-pulse flex-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 py-3.5 border-b border-[#f3f4f6]">
                  <div className="h-3 w-28 bg-[#E3E6ED] rounded" />
                  <div className="h-3 w-40 bg-[#E3E6ED] rounded" />
                  <div className="h-3 w-40 bg-[#E3E6ED] rounded" />
                  <div className="h-3 w-16 bg-[#E3E6ED] rounded" />
                  <div className="h-5 w-24 bg-[#E3E6ED] rounded-full" />
                </div>
              ))}
            </div>
          ) : !hasDeliveries ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <Truck size={40} className="text-[#E3E6ED] mb-4" />
              <p className="text-sm font-medium text-[#666D80] mb-1">No jobs assigned yet</p>
              <p className="text-xs text-[#8094A7] mb-4">When a delivery is assigned to you, it will appear here</p>
              <Link
                href="/courier/deliveries"
                className="text-sm text-[#173420] font-medium hover:underline flex items-center gap-1"
              >
                View deliveries <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm font-manrope">
                <thead>
                  <tr className="border-b border-[#e2e4e9]/30">
                    <th className="text-left font-manrope text-[14px] font-medium text-[#44444a] py-3 px-3 bg-[#f9f9fb] rounded-l-lg whitespace-nowrap">Tracking ID</th>
                    <th className="text-left font-manrope text-[14px] font-medium text-[#44444a] py-3 px-3 bg-[#f9f9fb]">Pickup</th>
                    <th className="text-left font-manrope text-[14px] font-medium text-[#44444a] py-3 px-3 bg-[#f9f9fb]">Dropoff</th>
                    <th className="text-left font-manrope text-[14px] font-medium text-[#44444a] py-3 px-3 bg-[#f9f9fb]">Date</th>
                    <th className="text-left font-manrope text-[14px] font-medium text-[#44444a] py-3 px-3 bg-[#f9f9fb]">Status</th>
                    <th className="text-left font-manrope text-[14px] font-medium text-[#44444a] py-3 px-3 bg-[#f9f9fb]">Progress</th>
                    <th className="text-left font-manrope text-[14px] font-medium text-[#44444a] py-3 px-3 bg-[#f9f9fb] rounded-r-lg"></th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => {
                    const pill = statusPillStyles[d.status] || { bg: "bg-[#F0F0F0]", text: "text-[#999999]" };
                    const pct = progressByStatus[d.status] ?? 10;
                    return (
                      <tr
                        key={d.id}
                        onClick={() => {
                          setActiveId(d.id);
                          setSheetOpen(true);
                        }}
                        className="border-b border-[#f3f4f6] last:border-0 cursor-pointer hover:bg-[#F8F8FA] transition-colors"
                      >
                        <td className="text-[#161618] py-3.5 px-3 font-medium whitespace-nowrap">{d.trackingNumber}</td>
                        <td className="text-[#333333] py-3.5 px-3 max-w-[150px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin size={13} className="text-[#173420] shrink-0" />
                            <span className="truncate">{d.pickupAddress || "—"}</span>
                          </div>
                        </td>
                        <td className="text-[#333333] py-3.5 px-3 max-w-[150px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin size={13} className="text-[#40C4AA] shrink-0" />
                            <span className="truncate">{d.dropoffAddress || "—"}</span>
                          </div>
                        </td>
                        <td className="text-[#333333] py-3.5 px-3 whitespace-nowrap">{formatDate(d.createdAt)}</td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium ${pill.bg} ${pill.text}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {(statusLabels[d.status] || d.status).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-[75px] h-[6px] bg-[#f1f1f5] rounded-full overflow-hidden">
                              <div className="h-full bg-[#40C4AA] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-[#44444a]">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <button
                            type="button"
                            aria-label={`View ${d.trackingNumber} details`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveId(d.id);
                              setSheetOpen(true);
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-[#f1f1f5] rounded-[10px] hover:bg-[#F8F8FA] transition-colors"
                          >
                            <DotsThree size={16} className="text-[#252528]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="hidden lg:flex w-[299px] bg-[#FEFEFE] border border-[#E3E6ED] rounded-xl p-4 flex-col shrink-0 shadow-sm">
          <h3 className="text-sm font-manrope text-[#333333] mb-4">Recent Activity</h3>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E3E6ED] shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-32 bg-[#E3E6ED] rounded mb-1" />
                    <div className="h-3 w-16 bg-[#E3E6ED] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <Clock size={32} className="text-[#E3E6ED] mb-3" />
              <p className="text-xs text-[#8094A7]">No recent activity</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto space-y-0">
              {activity.map((a, i) => (
                <div key={a.id} className="flex gap-3 pb-4 relative">
                  {i < activity.length - 1 && (
                    <div className="absolute left-[17px] top-9 bottom-0 w-px bg-[#E0E0E0]" />
                  )}
                  <div className={`w-9 h-9 rounded-3xl flex items-center justify-center shrink-0 ${activityBg[a.status] || "bg-[#F0F0F0]"}`}>
                    {activityIcons[a.status] || <Package size={18} className="text-[#8094A7]" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-manrope text-[#333333] leading-[1.5]">
                      {a.trackingNumber}{a.note ? ` — ${a.note}` : ""}
                    </p>
                    <p className="text-[10px] font-manrope text-[#757575]">{timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delivery detail side sheet */}
      <CourierDeliverySheet
        open={sheetOpen}
        id={activeId}
        token={token}
        courierName={courierName}
        onClose={() => setSheetOpen(false)}
        onStatusUpdated={load}
      />
    </div>
  );
}