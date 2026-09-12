"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Plus,
  DotsThree,
  Cube,
  Truck,
  Clock,
  ArrowRight,
  CheckCircle,
  Package,
  MapPin,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { DeliveryDetailSheet } from "@/components/customer/delivery-detail-sheet";

interface DashboardStats {
  activeDeliveries: number;
  pendingPickups: number;
  totalSpentCents: number;
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
}

interface ActivityItem {
  id: string;
  status: string;
  note: string;
  createdAt: string;
  trackingNumber: string;
  deliveryId: string;
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  "in-transit": "In Transit",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const activityIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={18} className="text-[#B8860B]" />,
  processing: <Package size={18} className="text-[#235BC2]" />,
  "in-transit": <Truck size={18} className="text-[#333333]" />,
  "out-for-delivery": <Truck size={18} className="text-[#F04A4A]" />,
  delivered: <CheckCircle size={18} className="text-[#007837]" />,
  cancelled: <Package size={18} className="text-[#999999]" />,
};

const activityBg: Record<string, string> = {
  pending: "bg-[#FFF3D6]",
  processing: "bg-[#E3EDFF]",
  "in-transit": "bg-[#F0F0F0]",
  "out-for-delivery": "bg-[#FCDEE0]",
  delivered: "bg-[#D9F9E7]",
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
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

const progressByStatus: Record<string, number> = {
  pending: 10,
  processing: 20,
  "picked-up": 35,
  "in-transit": 60,
  "out-for-delivery": 80,
  delivered: 100,
  "failed-attempt": 40,
  cancelled: 0,
};

const statusPillStyles: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-[#FFF3D6]", text: "text-[#B8860B]" },
  processing: { bg: "bg-[#E3EDFF]", text: "text-[#235BC2]" },
  "in-transit": { bg: "bg-[#E0E0E0]", text: "text-[#333333]" },
  "out-for-delivery": { bg: "bg-[#FCDEE0]", text: "text-[#F04A4A]" },
  delivered: { bg: "bg-[#D9F9E7]", text: "text-[#007837]" },
  cancelled: { bg: "bg-[#F0F0F0]", text: "text-[#999999]" },
};

function StatSkeleton() {
  return (
    <div className="bg-white border border-[#E3E6ED] rounded-lg p-5 animate-pulse shadow-sm min-h-[135px]">
      <div className="h-3 w-24 bg-[#E3E6ED] rounded mb-5" />
      <div className="h-7 w-16 bg-[#E3E6ED] rounded mb-2" />
      <div className="h-3 w-28 bg-[#E3E6ED] rounded" />
    </div>
  );
}

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const firstName = session?.user?.firstname || session?.user?.name?.split(" ")[0] || "there";
  const token = session?.accessToken;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api<DashboardStats>("/dashboard/stats", { token })
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

  const deliveries = stats?.recentDeliveries ?? [];
  const activity = stats?.recentActivity ?? [];
  const hasDeliveries = deliveries.length > 0;

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD] pb-0">
      <div className="px-5 pt-10 pb-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-inter text-[#8094A7]">{greeting},</p>
            <h1 className="text-2xl font-medium text-[#161618]">{firstName}</h1>
          </div>
          <Link href="/dashboard/book">
            <Button className="h-10 px-4 bg-[#F3BC24] hover:bg-[#F5C94A] rounded-[10px] text-[#173420] font-semibold text-sm gap-2 border-0">
              <Plus size={18} weight="bold" />
              Book a Delivery
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
                  <span className="text-sm font-inter text-[#2D5A3A]">Active Deliveries</span>
                  <DotsThree size={16} className="text-[#173420]" />
                </div>
                <div>
                  <div className="text-2xl font-inter font-semibold text-[#173420] mb-1">
                    {stats?.activeDeliveries ?? 0}
                  </div>
                  <span className="text-xs font-inter text-[#8094A7]">currently in progress</span>
                </div>
              </div>
              <div className="bg-white border border-[#E3E6ED] rounded-lg p-5 min-h-[135px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-inter text-[#2D5A3A]">Pending Pickups</span>
                  <DotsThree size={16} className="text-[#173420]" />
                </div>
                <div>
                  <div className="text-2xl font-inter font-semibold text-[#173420] mb-1">
                    {stats?.pendingPickups ?? 0}
                  </div>
                  <span className="text-xs font-inter text-[#8094A7]">awaiting pickup</span>
                </div>
              </div>
              <div className="bg-white border border-[#E3E6ED] rounded-lg p-5 min-h-[135px] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-inter text-[#2D5A3A]">Total Spent</span>
                  <DotsThree size={16} className="text-[#173420]" />
                </div>
                <div>
                  <div className="text-2xl font-inter font-semibold text-[#173420] mb-1">
                    {formatCents(stats?.totalSpentCents ?? 0)}
                  </div>
                  <span className="text-xs font-inter text-[#8094A7]">all time</span>
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
            <h3 className="text-base font-manrope font-medium text-[#161618]">Recent Deliveries</h3>
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-white border border-[#e5e5ec] rounded-[7px] text-xs font-medium text-[#161618]">
              {deliveries.length}
            </span>
            <div className="flex-1" />
            {hasDeliveries && (
              <Link
                href="/dashboard/deliveries"
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
              <Cube size={40} className="text-[#E3E6ED] mb-4" />
              <p className="text-sm font-medium text-[#666D80] mb-1">No deliveries yet</p>
              <p className="text-xs text-[#8094A7] mb-4">Book your first delivery to get started</p>
              <Link
                href="/dashboard/book"
                className="text-sm text-[#173420] font-medium hover:underline flex items-center gap-1"
              >
                Book your first delivery <ArrowRight size={14} />
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
                          setActiveDeliveryId(d.id);
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
                              setActiveDeliveryId(d.id);
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
                    <p className="text-xs font-manrope text-[#333333] leading-[1.5]">
                      {a.trackingNumber}{a.note ? ` — ${a.note}` : ""}
                    </p>
                    <p className="text-xs font-manrope text-[#757575]">{timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delivery detail side sheet */}
      <DeliveryDetailSheet
        open={sheetOpen}
        id={activeDeliveryId}
        token={token}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
