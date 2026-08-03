"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  Cube,
  DotsThree,
} from "@phosphor-icons/react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActivityItem } from "@/components/ui/activity-item";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { DeliveryTrackingCard } from "@/components/admin/delivery-tracking";
import { ProductCategories } from "@/components/admin/product-categories";
import { ProfitSummary } from "@/components/admin/profit-summary";
import { api } from "@/lib/api";

interface DashboardStats {
  totalDeliveries: number;
  activeDeliveries: number;
  pendingPickups: number;
  totalCouriers: number;
  totalRevenueCents: number;
  recentDeliveries: DeliveryItem[];
  recentActivity: ActivityItemData[];
  deliveryTracking: DeliveryTrackData | null;
  statusBreakdown: Record<string, number>;
  monthlyRevenue: MonthlyRevenuePoint[];
}

interface DeliveryTrackData {
  id: string;
  trackingNumber: string;
  status: string;
  courierName: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  dropoffDate: string;
  timeline: TrackingStep[];
}

interface TrackingStep {
  status: string;
  note: string;
  locationText: string;
  createdAt: string;
}

interface MonthlyRevenuePoint {
  month: string;
  revenueCents: number;
  outstandingCents: number;
}

interface DeliveryItem {
  id: string;
  trackingNumber: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  createdAt: string;
}

interface DeliveryDetail {
  id: string;
  trackingNumber: string;
  status: string;
  courierId: string | null;
  courierName: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupWindowStart: string | null;
  dropoffWindowEnd: string | null;
  scheduledDate: string | null;
  createdAt: string;
  trackingEvents: TrackingEventItem[];
}

interface TrackingEventItem {
  status: string;
  note: string;
  locationText: string;
  createdAt: string;
}

interface ActivityItemData {
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
  "picked-up": "Picked Up",
  "in-transit": "In Transit",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusVariants: Record<string, "pending" | "processing" | "in-transit" | "out-for-delivery" | "delivered" | "cancelled"> = {
  pending: "pending",
  processing: "processing",
  "picked-up": "in-transit",
  "in-transit": "in-transit",
  "out-for-delivery": "out-for-delivery",
  delivered: "delivered",
  cancelled: "cancelled",
};

const activityIcons: Record<string, React.ElementType> = {
  pending: Clock,
  processing: Package,
  "in-transit": Truck,
  "out-for-delivery": Truck,
  delivered: CheckCircle,
  cancelled: Package,
};

const activityBg: Record<string, string> = {
  pending: "#FFF3D6",
  processing: "#E3EDFF",
  "in-transit": "#F0F0F0",
  "out-for-delivery": "#FCDEE0",
  delivered: "#D9F9E7",
  cancelled: "#F0F0F0",
};

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

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

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<DeliveryTrackData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);

  const token = session?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }
    if (!token) return;
    api<DashboardStats>("/admin/dashboard/stats", { token }).then((res) => {
      if (res.status === 200 && res.data) {
        setStats(res.data);
        if (!selectedTrack) setSelectedTrack(res.data.deliveryTracking ?? null);
      } else setError(res.errors?.[0] || "Failed to load dashboard");
    }).catch(() => setError("Failed to load dashboard")).finally(() => setLoading(false));
  }, [token, status, router]);

  const selectDelivery = async (id: string) => {
    if (id === selectedId) return;
    setSelectedId(id);
    setTrackLoading(true);
    try {
      const res = await api<DeliveryDetail>("/admin/deliveries/" + id, { token });
      if (res.status === 200 && res.data) {
        const d = res.data;
        setSelectedTrack({
          id: d.id,
          trackingNumber: d.trackingNumber,
          status: d.status,
          courierName: d.courierName || "Unassigned",
          pickupAddress: d.pickupAddress,
          dropoffAddress: d.dropoffAddress,
          pickupDate: d.pickupWindowStart || d.createdAt,
          dropoffDate: d.scheduledDate || d.dropoffWindowEnd || d.createdAt,
          timeline: [...(d.trackingEvents ?? [])]
            .reverse()
            .map((e) => ({
              status: e.status,
              note: e.note,
              locationText: e.locationText,
              createdAt: e.createdAt,
            })),
        });
      }
    } catch {
      setSelectedId(null);
    } finally {
      setTrackLoading(false);
    }
  };

  const deliveries = stats?.recentDeliveries ?? [];
  const activity = stats?.recentActivity ?? [];

  return (
    <div className="min-h-full flex flex-col bg-[#F5F4FD]">
      <div className="px-4 sm:px-5 pt-8 sm:pt-10 pb-5">
        {error && (
          <div className="bg-[#FCDEE0] text-[#C0392B] text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[10px]">
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-[#E3E6ED] rounded-lg p-5 animate-pulse min-h-[135px]">
                  <div className="h-3 w-24 bg-[#E3E6ED] rounded mb-5" />
                  <div className="h-7 w-16 bg-[#E3E6ED] rounded mb-2" />
                  <div className="h-3 w-28 bg-[#E3E6ED] rounded" />
                </div>
              ))}
            </>
          ) : (
            <>
              <StatCard label="Active Deliveries" value={String(stats?.activeDeliveries ?? 0)} subtitle="currently in progress" />
              <StatCard label="Pending Pickups" value={String(stats?.pendingPickups ?? 0)} subtitle="awaiting pickup" />
              <StatCard label="Revenue" value={formatCents(stats?.totalRevenueCents ?? 0)} subtitle="from paid invoices" />
              <StatCard label="Active Couriers" value={String(stats?.totalCouriers ?? 0)} subtitle="available for dispatch" />
            </>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-5 flex flex-col xl:flex-row gap-[10px]">
        <div className="flex-1 bg-[#FEFEFE] border border-[#E3E6ED] rounded-xl p-4 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-manrope text-[#333333]">Recent Deliveries</h3>
          </div>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-[#E0E0E0]">
                    <div className="h-3 w-24 bg-[#E3E6ED] rounded" />
                    <div className="h-3 w-20 bg-[#E3E6ED] rounded" />
                    <div className="h-3 w-20 bg-[#E3E6ED] rounded" />
                    <div className="h-5 w-20 bg-[#E3E6ED] rounded-full" />
                  </div>
                ))}
              </div>
            ) : deliveries.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-[#8094A7] font-inter">
                No deliveries yet
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-[10px] font-manrope">
                <thead>
                  <tr className="bg-[#DCE8D6] rounded-lg">
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Tracking</th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Pickup</th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Dropoff</th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Date</th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => selectDelivery(d.id)}
                      className={`border-b border-[#E0E0E0] last:border-0 cursor-pointer transition-colors ${
                        selectedId === d.id
                          ? "bg-[#EDF2EA]"
                          : "hover:bg-[#F4F8F2]"
                      }`}
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
        </div>

        <div className="w-full xl:w-[380px] flex-shrink-0">
          {loading ? (
            <div className="bg-[#FEFEFE] border border-[#E3E6ED] rounded-xl p-4 animate-pulse h-full">
              <div className="h-3 w-32 bg-[#E3E6ED] rounded mb-4" />
              <div className="h-32 bg-[#E3E6ED] rounded-lg mb-4" />
              <div className="h-4 w-40 bg-[#E3E6ED] rounded mb-2" />
              <div className="h-3 w-28 bg-[#E3E6ED] rounded" />
            </div>
          ) : (
            <DeliveryTrackingCard data={selectedTrack} loading={trackLoading} />
          )}
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-5 pt-[10px] grid grid-cols-1 lg:grid-cols-3 gap-[10px]">
        <ProductCategories breakdown={stats?.statusBreakdown ?? {}} />
        <ProfitSummary data={stats?.monthlyRevenue ?? []} />
        <div className="bg-[#FEFEFE] border border-[#E3E6ED] rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-manrope text-[#333333]">Recent Activity</h3>
            <button className="w-7 h-7 flex items-center justify-center bg-[#F0F0F0] rounded-lg hover:bg-gray-100 transition-colors">
              <DotsThree size={16} color="#333333" />
            </button>
          </div>
          <div className="flex-1 overflow-auto space-y-0">
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
              <div className="flex items-center justify-center h-full text-sm text-[#8094A7] font-inter">
                No recent activity
              </div>
            ) : (
              activity.map((a, i) => (
                <ActivityItem
                  key={a.id}
                  icon={activityIcons[a.status] || Cube}
                  iconBg={activityBg[a.status] || "#F0F0F0"}
                  text={`${a.trackingNumber} — ${a.note || ""}`}
                  time={timeAgo(a.createdAt)}
                  isLast={i === activity.length - 1}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <PaginationBar totalEntries={deliveries.length} startEntry={0} endEntry={deliveries.length} />
    </div>
  );
}
