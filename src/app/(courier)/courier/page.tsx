"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Truck, Cube, Phone, ArrowRight } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/ui/status-badge";
import { api } from "@/lib/api";

interface DeliveryItem {
  id: string;
  trackingNumber: string;
  status: string;
  pickupAddress: string;
  pickupContactName: string;
  pickupContactPhone: string;
  dropoffAddress: string;
  dropoffContactName: string;
  dropoffContactPhone: string;
  packageDesc: string;
  packagePieces: number;
  packageWeight: string;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  "picked-up": "Picked Up",
  "in-transit": "In Transit",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  "failed-attempt": "Failed Attempt",
  cancelled: "Cancelled",
};

const statusVariants: Record<string, "pending" | "processing" | "in-transit" | "out-for-delivery" | "delivered" | "cancelled"> = {
  pending: "pending",
  "picked-up": "in-transit",
  "in-transit": "in-transit",
  "out-for-delivery": "out-for-delivery",
  delivered: "delivered",
  "failed-attempt": "pending",
  cancelled: "cancelled",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={18} className="text-[#B8860B]" />,
  "picked-up": <Truck size={18} className="text-[#173420]" />,
  "in-transit": <Truck size={18} className="text-[#3D724D]" />,
  "out-for-delivery": <Truck size={18} className="text-[#F04A4A]" />,
  delivered: <Cube size={18} className="text-[#007837]" />,
  "failed-attempt": <Clock size={18} className="text-[#C0392B]" />,
  cancelled: <Cube size={18} className="text-[#999999]" />,
};

export default function CourierHome() {
  const { data: session } = useSession();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const token = session?.accessToken;
  const firstName = session?.user?.firstname || session?.user?.name?.split(" ")[0] || "Courier";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!token) return;
    api<DeliveryItem[]>("/courier/deliveries", { token }).then((res) => {
      if (res.status === 200 && res.data) setDeliveries(res.data);
    }).finally(() => setLoading(false));
  }, [token]);

  const activeJobs = deliveries.filter((d) => !["delivered", "cancelled"].includes(d.status));
  const upcomingJobs = deliveries.filter((d) => d.status === "pending");
  const todayCompleted = deliveries.filter((d) => d.status === "delivered");

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 sm:px-6 pt-8 pb-4">
        <p className="text-sm font-inter text-[#8094A7]">{greeting},</p>
        <h1 className="text-xl font-clash-display font-semibold text-[#173420]">{firstName}</h1>
        <p className="text-sm text-[#666D80] mt-1">Today&apos;s overview</p>
      </div>

      <div className="px-4 sm:px-6 pb-4">
        <div className="grid grid-cols-3 gap-[10px]">
          <div className="bg-white border border-[#E3E6ED] rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-inter text-[#2D5A3A]">Active</span>
              <Truck size={16} className="text-[#173420]" />
            </div>
            <div className="text-2xl font-inter font-semibold text-[#173420]">{activeJobs.length}</div>
            <span className="text-xs font-inter text-[#8094A7]">in progress</span>
          </div>
          <div className="bg-white border border-[#E3E6ED] rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-inter text-[#2D5A3A]">Upcoming</span>
              <Clock size={16} className="text-[#173420]" />
            </div>
            <div className="text-2xl font-inter font-semibold text-[#173420]">{upcomingJobs.length}</div>
            <span className="text-xs font-inter text-[#8094A7]">pending pickup</span>
          </div>
          <div className="bg-white border border-[#E3E6ED] rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-inter text-[#2D5A3A]">Completed</span>
              <Cube size={16} className="text-[#173420]" />
            </div>
            <div className="text-2xl font-inter font-semibold text-[#173420]">{todayCompleted.length}</div>
            <span className="text-xs font-inter text-[#8094A7]">all time</span>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 flex-1 min-h-0 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-manrope text-[#333333]">
            {activeJobs.length > 0 ? "Today's Jobs" : "No Active Jobs"}
          </h2>
          {deliveries.length > 0 && (
            <button
              onClick={() => router.push("/courier/account")}
              className="text-xs text-[#173420] font-medium hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[#E3E6ED] rounded-xl p-4 animate-pulse">
                <div className="h-4 w-32 bg-[#E3E6ED] rounded mb-3" />
                <div className="h-3 w-full bg-[#E3E6ED] rounded mb-2" />
                <div className="h-3 w-3/4 bg-[#E3E6ED] rounded" />
              </div>
            ))}
          </div>
        ) : deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#E3E6ED] rounded-xl">
            <Truck size={40} className="text-[#E3E6ED] mb-4" />
            <p className="text-sm font-medium text-[#666D80] mb-1">No jobs assigned yet</p>
            <p className="text-xs text-[#8094A7]">When a delivery is assigned to you, it will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-auto">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => router.push(`/courier/deliveries?id=${job.id}`)}
                className="bg-white border border-[#E3E6ED] rounded-xl p-4 shadow-sm cursor-pointer hover:border-[#173420] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#173420] font-manrope">{job.trackingNumber}</span>
                    <StatusBadge label={statusLabels[job.status] || job.status} status={statusVariants[job.status] || "pending"} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#8094A7]">
                    {statusIcons[job.status]}
                    <span>{statusLabels[job.status]}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-[#3D724D] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-[#8094A7]">Pickup</p>
                      <p className="text-xs text-[#333333] truncate">{job.pickupAddress || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-[#F04A4A] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-[#8094A7]">Dropoff</p>
                      <p className="text-xs text-[#333333] truncate">{job.dropoffAddress || "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E3E6ED] flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-[#8094A7]">
                    <Phone size={12} />
                    <span>{job.pickupContactName || job.dropoffContactName || "—"}</span>
                  </div>
                  <span className="text-xs text-[#173420] font-medium flex items-center gap-1">
                    View details <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
