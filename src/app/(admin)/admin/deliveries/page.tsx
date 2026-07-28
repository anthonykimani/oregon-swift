"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, ArrowDown, CaretRight } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { api } from "@/lib/api";

interface DeliveryItem {
  id: string;
  trackingNumber: string;
  status: string;
  customerId: string;
  customerName: string | null;
  courierId: string | null;
  courierName: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  packageDesc: string;
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

export default function AdminDeliveries() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchDeliveries = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const res = await api<DeliveryItem[]>("/admin/deliveries", {
        token: session.accessToken,
      });
      if (res.status === 200 && res.data) {
        setDeliveries(res.data);
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

  const filtered = search
    ? deliveries.filter(
        (d) =>
          d.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
          (d.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
          (d.courierName || "").toLowerCase().includes(search.toLowerCase()) ||
          (d.pickupAddress || "").toLowerCase().includes(search.toLowerCase()) ||
          (d.dropoffAddress || "").toLowerCase().includes(search.toLowerCase())
      )
    : deliveries;

  return (
    <div className="h-full flex flex-col bg-[#F5F4FD]">
      <div className="px-5 pt-10 pb-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-clash-display font-semibold text-[#173420]">Deliveries</h1>
            <p className="text-sm text-[#8094A7] font-inter mt-1">{deliveries.length} total deliveries</p>
          </div>
        </div>
        <div className="relative mt-3">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8094A7]" />
          <Input
            placeholder="Search by tracking number, customer, courier, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-white border-[#E3E6ED] rounded-lg text-sm text-[#333333] placeholder:text-[#8094A7]"
          />
        </div>
      </div>

      <div className="px-5 flex-1 min-h-0 pb-5">
        <div className="bg-[#FEFEFE] border border-[#E3E6ED] rounded-xl p-4 flex flex-col min-w-0 h-full">
          {error && (
            <div className="bg-[#FCDEE0] text-[#C0392B] text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
          )}

          {loading ? (
            <div className="flex items-center justify-center flex-1 text-sm text-[#8094A7] font-inter">
              Loading deliveries...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-sm text-[#8094A7] font-inter">
              {search ? "No deliveries match your search" : "No deliveries yet"}
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-[10px] font-manrope">
                <thead>
                  <tr className="bg-[#DCE8D6] rounded-lg">
                    <th className="text-left text-[#333333] font-medium py-3 px-2">
                      <div className="flex items-center gap-1">Tracking <ArrowDown size={10} color="#333333" /></div>
                    </th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Customer</th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Courier</th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Pickup</th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Dropoff</th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Status</th>
                    <th className="text-left text-[#333333] font-medium py-3 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => router.push(`/admin/deliveries/${d.id}`)}
                      className="border-b border-[#E0E0E0] last:border-0 cursor-pointer hover:bg-[#F4F8F2] transition-colors"
                    >
                      <td className="text-[#173420] py-3 px-2 font-semibold">{d.trackingNumber}</td>
                      <td className="text-[#333333] py-3 px-2">{d.customerName || d.customerId?.slice(0, 8) || "—"}</td>
                      <td className="text-[#333333] py-3 px-2">
                        {d.courierName ? (
                          <span className="text-[#173420]">{d.courierName}</span>
                        ) : (
                          <span className="text-[#F04A4A]">Unassigned</span>
                        )}
                      </td>
                      <td className="text-[#333333] py-3 px-2 max-w-[160px] truncate">{d.pickupAddress || "—"}</td>
                      <td className="text-[#333333] py-3 px-2 max-w-[160px] truncate">{d.dropoffAddress || "—"}</td>
                      <td className="py-3 px-2">
                        <StatusBadge label={statusLabels[d.status] || d.status} status={statusVariants[d.status] || "pending"} />
                      </td>
                      <td className="text-[#757575] py-3 px-2 whitespace-nowrap">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
