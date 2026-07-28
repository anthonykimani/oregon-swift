"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { CaretLeft, MapPin, Phone, Cube, CheckCircle, Truck, Package, XCircle, Clock } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/ui/status-badge";
import { api } from "@/lib/api";

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

export default function CourierJobDetail() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<DeliveryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const token = session?.accessToken;

  useEffect(() => {
    if (!token || !params.id) return;
    api<DeliveryDetail>(`/courier/deliveries/${params.id}`, { token }).then((res) => {
      if (res.status === 200 && res.data) setJob(res.data);
      else setError("Job not found");
    }).catch(() => setError("Failed to load")).finally(() => setLoading(false));
  }, [token, params.id]);

  async function handleStatusUpdate(status: string) {
    if (!token || !params.id) return;
    setUpdating(true);
    setError("");
    const res = await api(`/courier/deliveries/${params.id}/status`, {
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
          <button onClick={() => router.push("/courier")} className="text-sm text-[#173420] hover:underline">
            Back to jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const isComplete = ["delivered", "cancelled", "failed-attempt"].includes(job.status);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 sm:px-6 pt-6 pb-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-[#173420] mb-3 font-inter">
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
