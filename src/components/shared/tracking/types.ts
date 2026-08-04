export interface TrackingEvent {
  id?: string;
  status: string;
  note: string | null;
  locationText: string | null;
  createdAt: string;
}

export interface TrackingShipment {
  id: string;
  trackingNumber: string;
  status: string;
  customerId: string;
  customerName: string | null;
  courierId: string | null;
  courierName: string | null;
  courierPhone: string | null;
  courierVehicle: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  packageDesc: string | null;
  packagePieces: number;
  packageWeight: string | null;
  packageSizeClass: string | null;
  priority: string | null;
  priceCents: number | null;
  pickupWindowStart: string | null;
  pickupWindowEnd: string | null;
  scheduledDate: string | null;
  dropoffWindowEnd: string | null;
  createdAt: string;
  latestEvent: TrackingEvent | null;
}

export const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  "picked-up": "Picked Up",
  "in-transit": "In Transit",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  "failed-attempt": "Failed Attempt",
};

export const statusVariants: Record<string, "pending" | "processing" | "in-transit" | "out-for-delivery" | "delivered" | "cancelled"> = {
  pending: "pending",
  processing: "processing",
  "picked-up": "in-transit",
  "in-transit": "in-transit",
  "out-for-delivery": "out-for-delivery",
  delivered: "delivered",
  "failed-attempt": "pending",
  cancelled: "cancelled",
};

export const progressByStatus: Record<string, number> = {
  pending: 10,
  processing: 20,
  "picked-up": 35,
  "in-transit": 60,
  "out-for-delivery": 80,
  delivered: 100,
  "failed-attempt": 40,
  cancelled: 0,
};

export function progressForStatus(status: string): number {
  return progressByStatus[status] ?? 10;
}

export const statusPillStyles: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-[#FFF3D6]", text: "text-[#B8860B]" },
  processing: { bg: "bg-[#E3EDFF]", text: "text-[#235BC2]" },
  "in-transit": { bg: "bg-[#E0E0E0]", text: "text-[#333333]" },
  "out-for-delivery": { bg: "bg-[#FCDEE0]", text: "text-[#F04A4A]" },
  delivered: { bg: "bg-[#D9F9E7]", text: "text-[#007837]" },
  "failed-attempt": { bg: "bg-[#FCDEE0]", text: "text-[#F04A4A]" },
  cancelled: { bg: "bg-[#F0F0F0]", text: "text-[#999999]" },
};
