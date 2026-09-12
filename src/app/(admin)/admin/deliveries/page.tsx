"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass, CaretLeft, MapPin, Cube, User, Check, CalendarPlus, Package } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DeliveryMetrics, type DeliveryMeta } from "@/components/admin/delivery-metrics";
import { ShipmentList, type ShipmentItem } from "@/components/admin/shipment-list";
import { AvgDeliveryTimeChart, BusyPeriodsHeatmap } from "@/components/admin/shipment-statistics";
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

function AdminDeliveryDetailView({ id, token, onBack }: { id: string; token: string; onBack: () => void }) {
  const [delivery, setDelivery] = useState<DeliveryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [couriers, setCouriers] = useState<CourierOption[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    api<DeliveryDetail>(`/admin/deliveries/${id}`, { token }).then((res) => {
      if (res.status === 200 && res.data) setDelivery(res.data);
      else setError("Delivery not found");
    }).catch(() => setError("Failed to load")).finally(() => setLoading(false));
  }, [id, token]);

  const loadCouriers = async () => {
    const res = await api<CourierOption[]>("/admin/couriers", { token });
    if (res.status === 200 && res.data) setCouriers(res.data);
  };

  useEffect(() => {
    if (delivery && !delivery.courierId) {
      loadCouriers();
    }
  }, [delivery]);

  async function handleAssign() {
    if (!selectedCourierId) return;
    setAssigning(true);
    setAssignMsg("");
    const res = await api(`/admin/deliveries/${id}/assign`, {
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
        <button onClick={onBack} className="text-sm text-[#173420] underline">Back to deliveries</button>
      </div>
    );
  }

  if (!delivery) return null;

  const events = delivery.trackingEvents || [];

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD] overflow-y-auto">
      <div className="px-5 pt-8 pb-4">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-[#8094A7] hover:text-[#173420] mb-3">
          <CaretLeft size={14} /> Deliveries
        </button>
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

        <div className="bg-white rounded-xl border border-[#E3E6ED] p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#173420] mb-3">
            <User size={16} /> Customer
          </h3>
          <p className="text-sm text-[#333333]">{delivery.customerName || "—"}</p>
          <p className="text-xs text-[#8094A7]">{delivery.customerEmail || ""}</p>
        </div>

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

interface DeliveriesPayload {
  items: ShipmentItem[];
  meta: DeliveryMeta;
}

function AdminDeliveriesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailId = searchParams.get("id");

  const token = session?.accessToken;
  const [items, setItems] = useState<ShipmentItem[]>([]);
  const [meta, setMeta] = useState<DeliveryMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchDeliveries = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const res = await api<DeliveriesPayload>("/admin/deliveries", { token: session.accessToken });
      if (res.status === 200 && res.data) {
        setItems(res.data.items ?? []);
        setMeta(res.data.meta ?? null);
      } else {
        setError(res.errors?.[0] || `API returned status ${res.status}`);
      }
    } catch {
      setError("Network error — is the API server running?");
    }
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }
    if (status === "authenticated") {
      fetchDeliveries();
    }
  }, [status, fetchDeliveries, router]);

  if (detailId && token) {
    return <AdminDeliveryDetailView id={detailId} token={token} onBack={() => router.push("/admin/deliveries")} />;
  }

  return (
    <div className="min-h-full flex flex-col bg-[#F5F4FD]">
      {/* Top bar */}
      <div className="px-4 sm:px-5 pt-8 sm:pt-10 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-clash-display font-semibold text-[#052D50]">Deliveries</h1>
            <p className="text-sm text-[#8094A7] font-inter mt-1">{meta?.totalDeliveries ?? items.length} total shipments</p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="h-9 px-4 bg-[#EFFEFA] hover:bg-[#DFF7F0] text-[#12806B] rounded-lg text-sm gap-1.5">
              <CalendarPlus size={16} /> Schedule Delivery
            </Button>
            <Button className="h-9 px-4 bg-[#173420] hover:bg-[#1F4228] text-white rounded-lg text-sm gap-1.5">
              <Package size={16} /> New Shipment
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-[#FCDEE0] text-[#C0392B] text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}
      </div>

      {/* Hero / search block */}
      <div className="px-4 sm:px-5 pb-4">
        <div className="bg-white border border-[#E3E6ED] rounded-lg px-5 py-8 flex flex-col items-center">
          <h2 className="text-2xl font-clash-display font-semibold text-[#052D50] text-center">
            Shipment Management
          </h2>
          <p className="text-sm font-inter text-[#8094A7] text-center mt-2 mb-5 max-w-md">
            Search, track, and manage every delivery across Oregon City in one place.
          </p>
          <div className="relative w-full max-w-[500px]">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45617D]" />
            <input
              placeholder="Search by tracking number, customer, courier, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[38px] pl-9 pr-20 bg-white border border-[#E3E6ED] rounded-lg text-sm text-[#333333] placeholder:text-[#45617D] focus:outline-none focus:border-[#052D50]"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2 flex items-center bg-[#F4F7FD] rounded text-xs font-manrope text-[#45617D]">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4 sm:px-5 pb-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[10px]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#E3E6ED] rounded-lg p-5 animate-pulse min-h-[120px]">
                <div className="h-3 w-24 bg-[#E3E6ED] rounded mb-5" />
                <div className="h-7 w-16 bg-[#E3E6ED] rounded mb-2" />
                <div className="h-3 w-28 bg-[#E3E6ED] rounded" />
              </div>
            ))}
          </div>
        ) : (
          <DeliveryMetrics meta={meta} />
        )}
      </div>

      {/* Shipment list */}
      <div className="px-4 sm:px-5 pb-4">
        <ShipmentList
          items={items}
          statusCounts={meta?.statusCounts ?? {}}
          loading={loading}
          error={error}
          search={search}
          onSearchChange={setSearch}
          onSelect={(id) => router.push(`/admin/deliveries?id=${id}`)}
        />
      </div>

      {/* Statistics */}
      <div className="px-4 sm:px-5 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-[10px]">
        {loading ? (
          <>
            <div className="bg-white border border-[#E3E6ED] rounded-lg p-5 animate-pulse min-h-[260px]" />
            <div className="bg-white border border-[#E3E6ED] rounded-lg p-5 animate-pulse min-h-[260px]" />
          </>
        ) : (
          <>
            <AvgDeliveryTimeChart data={meta?.deliveriesByMonth ?? []} />
            <BusyPeriodsHeatmap
              rows={meta?.busyPeriods?.rows ?? []}
              labels={meta?.busyPeriods?.labels}
              max={meta?.busyPeriods?.max ?? 0}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminDeliveriesPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center bg-[#F5F4FD]">
        <p className="text-sm text-[#8094A7] font-inter">Loading...</p>
      </div>
    }>
      <AdminDeliveriesContent />
    </Suspense>
  );
}
