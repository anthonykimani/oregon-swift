"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { CaretLeft, MapPin, Cube, User, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { api } from "@/lib/api";

interface CourierOption {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  profile: { vehicleType: string; active: boolean } | null;
}

interface DeliveryDetail {
  id: string;
  trackingNumber: string;
  status: string;
  customerId: string;
  customerName: string | null;
  customerEmail: string | null;
  courierId: string | null;
  courierName: string | null;
  courierEmail: string | null;
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
  priceCents: number | null;
  createdAt: string;
  trackingEvents: { id: string; status: string; note: string; createdAt: string }[];
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

export default function AdminDeliveryDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [delivery, setDelivery] = useState<DeliveryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [couriers, setCouriers] = useState<CourierOption[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState("");

  const token = session?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }
    if (!token || !params.id) return;
    setLoading(true);
    api<DeliveryDetail>(`/admin/deliveries/${params.id}`, { token }).then((res) => {
      if (res.status === 200 && res.data) setDelivery(res.data);
      else setError("Delivery not found");
    }).catch(() => setError("Failed to load")).finally(() => setLoading(false));
  }, [token, params.id, status, router]);

  const loadCouriers = async () => {
    if (!token) return;
    const res = await api<CourierOption[]>("/admin/couriers", { token });
    if (res.status === 200 && res.data) setCouriers(res.data);
  };

  useEffect(() => {
    if (token && delivery && !delivery.courierId) {
      loadCouriers();
    }
  }, [token, delivery]);

  async function handleAssign() {
    if (!token || !params.id || !selectedCourierId) return;
    setAssigning(true);
    setAssignMsg("");
    const res = await api(`/admin/deliveries/${params.id}/assign`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ courierId: selectedCourierId }),
    });
    setAssigning(false);
    if (res.status === 200 && res.data) {
      setAssignMsg("Courier assigned successfully");
      setDelivery(res.data.delivery);
    } else {
      setAssignMsg(res.errors?.[0] || "Failed to assign courier");
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F5F4FD]">
        <p className="text-sm text-[#8094A7] font-inter">Loading...</p>
      </div>
    );
  }

  if (error && !delivery) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#F5F4FD] gap-4">
        <p className="text-sm text-[#C0392B] font-inter">{error}</p>
        <Link href="/admin/deliveries" className="text-sm text-[#173420] underline">Back to deliveries</Link>
      </div>
    );
  }

  if (!delivery) return null;

  const events = delivery.trackingEvents || [];

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD] overflow-y-auto">
      <div className="px-5 pt-8 pb-4">
        <Link href="/admin/deliveries" className="inline-flex items-center gap-1 text-sm text-[#8094A7] hover:text-[#173420] mb-3">
          <CaretLeft size={14} /> Deliveries
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-clash-display font-semibold text-[#173420]">{delivery.trackingNumber}</h1>
          <StatusBadge label={statusLabels[delivery.status] || delivery.status} status={statusVariants[delivery.status] || "pending"} />
        </div>
      </div>

      <div className="px-5 pb-20 space-y-4 max-w-3xl">
        {assignMsg && (
          <div className={`text-sm rounded-lg px-4 py-3 ${assignMsg.includes("success") ? "bg-[#D9F9E7] text-[#007837]" : "bg-[#FCDEE0] text-[#C0392B]"}`}>
            {assignMsg}
          </div>
        )}

        {/* Courier Assignment */}
        <div className="bg-white rounded-xl border border-[#E3E6ED] p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#173420] mb-3">
            <User size={16} /> Assigned Courier
          </h3>
          {delivery.courierId ? (
            <div>
              <p className="text-sm text-[#333333] font-medium">{delivery.courierName || "Unknown"}</p>
              <p className="text-xs text-[#8094A7]">{delivery.courierEmail || ""}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[#F04A4A]">Unassigned</p>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCourierId}
                  onChange={(e) => setSelectedCourierId(e.target.value)}
                  className="flex-1 h-9 px-3 bg-white border border-[#E3E6ED] rounded-lg text-sm text-[#333333] focus:outline-none focus:border-[#173420]"
                >
                  <option value="">Select a courier...</option>
                  {couriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstname} {c.lastname} — {c.email} {c.profile ? `(${c.profile.vehicleType})` : ""}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleAssign}
                  disabled={!selectedCourierId || assigning}
                  className="h-9 px-4 bg-[#173420] hover:bg-[#1F4228] rounded-lg text-white text-xs gap-1 disabled:opacity-50"
                >
                  {assigning ? "..." : <><Check size={14} weight="bold" /> Assign</>}
                </Button>
              </div>
              {couriers.length === 0 && (
                <p className="text-xs text-[#8094A7]">No active couriers available. Approve couriers in Applications first.</p>
              )}
            </div>
          )}
        </div>

        {/* Tracking Timeline */}
        {events.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E3E6ED] p-5">
            <h3 className="text-sm font-semibold text-[#173420] mb-4">Tracking</h3>
            <div className="space-y-0">
              {events.map((e, i) => (
                <div key={e.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${i === events.length - 1 ? "bg-[#173420]" : "bg-[#E3E6ED]"}`} />
                    {i < events.length - 1 && <div className="w-px flex-1 bg-[#E3E6ED] min-h-[24px]" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-[#333]">{e.note}</p>
                    <p className="text-xs text-[#8094A7]">{new Date(e.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-[#E3E6ED] p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#173420] mb-3">
            <User size={16} /> Customer
          </h3>
          <p className="text-sm text-[#333333]">{delivery.customerName || "—"}</p>
          <p className="text-xs text-[#8094A7]">{delivery.customerEmail || ""}</p>
        </div>

        {/* Pickup & Dropoff */}
        <div className="bg-white rounded-xl border border-[#E3E6ED] p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-semibold text-[#173420] uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin size={12} className="text-[#3D724D]" /> Pickup
              </h3>
              <p className="text-sm text-[#333]">{delivery.pickupAddress || "—"}</p>
              <p className="text-xs text-[#8094A7]">{delivery.pickupContactName}{delivery.pickupContactPhone ? ` | ${delivery.pickupContactPhone}` : ""}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#173420] uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin size={12} className="text-[#F04A4A]" /> Dropoff
              </h3>
              <p className="text-sm text-[#333]">{delivery.dropoffAddress || "—"}</p>
              <p className="text-xs text-[#8094A7]">{delivery.dropoffContactName}{delivery.dropoffContactPhone ? ` | ${delivery.dropoffContactPhone}` : ""}</p>
            </div>
          </div>
        </div>

        {/* Package */}
        <div className="bg-white rounded-xl border border-[#E3E6ED] p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#173420] mb-3">
            <Cube size={16} className="text-[#3D724D]" /> Package
          </h3>
          <p className="text-sm text-[#333]">{delivery.packageDesc || "—"}</p>
          <p className="text-xs text-[#8094A7] mt-1">
            {delivery.packagePieces} piece{delivery.packagePieces > 1 ? "s" : ""}
            {delivery.packageWeight ? ` · ${delivery.packageWeight} lbs` : ""}
            {delivery.packageFragile ? " · Fragile" : ""}
            {delivery.priceCents ? ` · $${(delivery.priceCents / 100).toFixed(2)}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
