"use client";

import { Suspense, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Clock, Truck, Cube, Phone, ArrowRight, Funnel, MagnifyingGlass, CaretLeft, CheckCircle, Package, XCircle } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
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

interface DeliveryDetail {
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
  packageFragile: boolean;
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

const statusActions: { status: string; label: string; icon: React.ElementType; color: string }[] = [
  { status: "picked-up", label: "Picked Up", icon: Package, color: "#173420" },
  { status: "in-transit", label: "In Transit", icon: Truck, color: "#3D724D" },
  { status: "out-for-delivery", label: "Out for Delivery", icon: Truck, color: "#F3BC24" },
  { status: "delivered", label: "Delivered", icon: CheckCircle, color: "#007837" },
  { status: "failed-attempt", label: "Failed Attempt", icon: XCircle, color: "#F04A4A" },
];

const statusFilters = ["All", "Active", "Pending", "Picked Up", "In Transit", "Out for Delivery", "Delivered", "Failed Attempt", "Cancelled"];
const activeStatuses = ["pending", "picked-up", "in-transit", "out-for-delivery", "failed-attempt"];

function JobDetailView({ id, token, onBack }: { id: string; token: string; onBack: () => void }) {
  const [job, setJob] = useState<DeliveryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    api<DeliveryDetail>(`/courier/deliveries/${id}`, { token }).then((res) => {
      if (res.status === 200 && res.data) setJob(res.data);
      else setError("Job not found");
    }).catch(() => setError("Failed to load")).finally(() => setLoading(false));
  }, [token, id]);

  async function handleStatusUpdate(status: string) {
    if (!token) return;
    setUpdating(true);
    setError("");
    const res = await api(`/courier/deliveries/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
    setUpdating(false);
    if (res.status === 200 && res.data) {
      setJob(res.data.delivery);
    } else {
      setError(res.errors?.[0] || "Failed to update status");
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-sm text-[#8094A7]">Loading job details...</div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#C0392B] mb-3">{error}</p>
          <button onClick={onBack} className="text-sm text-[#173420] hover:underline">Back to jobs</button>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const isComplete = ["delivered", "cancelled", "failed-attempt"].includes(job.status);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 sm:px-6 pt-6 pb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-[#173420] mb-3 font-inter">
          <CaretLeft size={16} /> Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-clash-display font-semibold text-[#173420]">{job.trackingNumber}</h1>
            <div className="mt-1">
              <StatusBadge label={statusLabels[job.status] || job.status} status={statusVariants[job.status] || "pending"} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 flex-1 overflow-y-auto pb-20 space-y-4">
        <div className="bg-white border border-[#E3E6ED] rounded-xl p-4 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#173420] mb-3">
            <MapPin size={16} className="text-[#3D724D]" /> Pickup Location
          </h3>
          <p className="text-sm text-[#333333]">{job.pickupAddress || "—"}</p>
          {(job.pickupContactName || job.pickupContactPhone) && (
            <div className="flex items-center gap-2 mt-2 text-xs text-[#666D80]">
              <Phone size={12} />
              <span>{job.pickupContactName}{job.pickupContactPhone ? ` — ${job.pickupContactPhone}` : ""}</span>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#E3E6ED] rounded-xl p-4 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#173420] mb-3">
            <MapPin size={16} className="text-[#F04A4A]" /> Dropoff Location
          </h3>
          <p className="text-sm text-[#333333]">{job.dropoffAddress || "—"}</p>
          {(job.dropoffContactName || job.dropoffContactPhone) && (
            <div className="flex items-center gap-2 mt-2 text-xs text-[#666D80]">
              <Phone size={12} />
              <span>{job.dropoffContactName}{job.dropoffContactPhone ? ` — ${job.dropoffContactPhone}` : ""}</span>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#E3E6ED] rounded-xl p-4 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#173420] mb-3">
            <Cube size={16} className="text-[#3D724D]" /> Package Details
          </h3>
          <p className="text-sm text-[#333333]">{job.packageDesc || "—"}</p>
          <p className="text-xs text-[#8094A7] mt-1">
            {job.packagePieces} piece{job.packagePieces > 1 ? "s" : ""}
            {job.packageWeight ? ` · ${job.packageWeight} lbs` : ""}
            {job.packageFragile ? " · Fragile" : ""}
          </p>
        </div>

        {error && (
          <div className="bg-[#FCDEE0] text-[#C0392B] text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        {!isComplete && (
          <div className="bg-white border border-[#E3E6ED] rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-[#173420] mb-3">Update Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {statusActions.map((action) => {
                const Icon = action.icon;
                const disabled = updating || job.status === action.status;
                return (
                  <button
                    key={action.status}
                    onClick={() => handleStatusUpdate(action.status)}
                    disabled={disabled}
                    className="flex items-center gap-2 px-3 py-3 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      color: action.color,
                      borderColor: disabled ? "#E3E6ED" : action.color,
                      backgroundColor: disabled ? "#F9F9F9" : `${action.color}08`,
                    }}
                  >
                    <Icon size={16} weight="bold" />
                    {updating ? "Updating..." : action.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CourierDeliveriesContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailId = searchParams.get("id");

  const token = session?.accessToken;
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    api<DeliveryItem[]>("/courier/deliveries", { token }).then((res) => {
      if (res.status === 200 && res.data) setDeliveries(res.data);
    }).finally(() => setLoading(false));
  }, [token]);

  if (detailId && token) {
    return <JobDetailView id={detailId} token={token} onBack={() => router.push("/courier/deliveries")} />;
  }

  const filtered = deliveries.filter((d) => {
    if (statusFilter === "Active") {
      if (!activeStatuses.includes(d.status)) return false;
    } else if (statusFilter !== "All") {
      const filterKey = statusFilter.toLowerCase().replace(/\s+/g, "-");
      if (d.status !== filterKey) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (!d.trackingNumber.toLowerCase().includes(q) &&
          !d.pickupAddress?.toLowerCase().includes(q) &&
          !d.dropoffAddress?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 sm:px-6 pt-8 pb-4">
        <h1 className="text-xl font-clash-display font-semibold text-[#173420]">My Deliveries</h1>
        <p className="text-sm text-[#666D80] font-inter mt-1">All deliveries assigned to you</p>
      </div>

      <div className="px-4 sm:px-6 pb-4 space-y-3">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8094A7]" />
          <Input
            placeholder="Search by tracking number or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-white border-[#E3E6ED] rounded-lg text-sm text-[#333333] placeholder:text-[#8094A7]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Funnel size={14} className="text-[#8094A7] shrink-0" />
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`shrink-0 h-7 px-3 rounded-full text-xs font-medium font-inter transition-colors whitespace-nowrap ${
                statusFilter === f
                  ? "bg-[#173420] text-white"
                  : "bg-white text-[#666D80] border border-[#E3E6ED] hover:border-[#173420]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 flex-1 min-h-0 pb-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#E3E6ED] rounded-xl p-4 animate-pulse">
                <div className="h-4 w-32 bg-[#E3E6ED] rounded mb-3" />
                <div className="h-3 w-full bg-[#E3E6ED] rounded mb-2" />
                <div className="h-3 w-3/4 bg-[#E3E6ED] rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#E3E6ED] rounded-xl">
            <Truck size={40} className="text-[#E3E6ED] mb-4" />
            <p className="text-sm font-medium text-[#666D80] mb-1">
              {search || statusFilter !== "All" ? "No deliveries match your search" : "No deliveries assigned yet"}
            </p>
            <p className="text-xs text-[#8094A7]">
              {search || statusFilter !== "All"
                ? "Try a different search or filter"
                : "When a delivery is assigned to you, it will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 overflow-auto">
            {filtered.map((job) => (
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
                    <Clock size={12} />
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
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

export default function CourierDeliveriesPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="animate-pulse text-sm text-[#8094A7]">Loading...</div></div>}>
      <CourierDeliveriesContent />
    </Suspense>
  );
}
