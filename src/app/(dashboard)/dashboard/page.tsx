"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  DotsThree,
  Cube,
  Truck,
  Clock,
  ArrowRight,
  CheckCircle,
  Package,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { api } from "@/lib/api";

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

const statusVariants: Record<string, "pending" | "processing" | "in-transit" | "out-for-delivery" | "delivered" | "cancelled"> = {
  pending: "pending",
  processing: "processing",
  "in-transit": "in-transit",
  "out-for-delivery": "out-for-delivery",
  delivered: "delivered",
  cancelled: "cancelled",
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
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            <h1 className="text-2xl font-medium text-[#161618]" style={{ fontFamily: "Geist, var(--font-sans)" }}>{firstName}</h1>
          </div>
          <Link href="/dashboard/book">
            <Button className="h-10 px-4 bg-[#F3BC24] hover:bg-[#F5C94A] rounded-[10px] text-[#173420] font-semibold text-sm gap-2 border-0" style={{ fontFamily: "Geist, var(--font-sans)" }}>
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-manrope text-[#333333]">Recent Deliveries</h3>
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
                <div key={i} className="flex items-center gap-4 py-3 border-b border-[#E0E0E0]">
                  <div className="h-3 w-24 bg-[#E3E6ED] rounded" />
                  <div className="h-3 w-20 bg-[#E3E6ED] rounded" />
                  <div className="h-3 w-20 bg-[#E3E6ED] rounded" />
                  <div className="h-3 w-16 bg-[#E3E6ED] rounded" />
                  <div className="h-5 w-20 bg-[#E3E6ED] rounded-full" />
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
              <table className="w-full text-[10px] font-manrope">
                <thead>
                  <tr>
                    <th className="text-left font-manrope text-[10px] font-semibold text-[#333333] tracking-[0.05em] py-3 px-2 bg-[#DCE8D6] rounded-l-lg">Tracking ID</th>
                    <th className="text-left font-manrope text-[10px] font-semibold text-[#333333] tracking-[0.05em] py-3 px-2 bg-[#DCE8D6]">Pickup</th>
                    <th className="text-left font-manrope text-[10px] font-semibold text-[#333333] tracking-[0.05em] py-3 px-2 bg-[#DCE8D6]">Dropoff</th>
                    <th className="text-left font-manrope text-[10px] font-semibold text-[#333333] tracking-[0.05em] py-3 px-2 bg-[#DCE8D6]">Date</th>
                    <th className="text-left font-manrope text-[10px] font-semibold text-[#333333] tracking-[0.05em] py-3 px-2 bg-[#DCE8D6] rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => router.push(`/dashboard/deliveries?id=${d.id}`)}
                      className="border-b border-[#E0E0E0] last:border-0 cursor-pointer hover:bg-[#F4F8F2] transition-colors"
                    >
                      <td className="text-[#173420] py-3 px-2 font-medium">{d.trackingNumber}</td>
                      <td className="text-[#333333] py-3 px-2 max-w-[140px] truncate">{d.pickupAddress || "—"}</td>
                      <td className="text-[#333333] py-3 px-2 max-w-[140px] truncate">{d.dropoffAddress || "—"}</td>
                      <td className="text-[#333333] py-3 px-2 whitespace-nowrap">{formatDate(d.createdAt)}</td>
                      <td className="py-3 px-2">
                        <StatusBadge
                          label={statusLabels[d.status] || d.status}
                          status={statusVariants[d.status] || "pending"}
                        />
                      </td>
                    </tr>
                  ))}
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
    </div>
  );
}
