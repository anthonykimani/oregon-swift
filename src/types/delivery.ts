export interface Delivery {
  id: string;
  trackingNumber: string;
  customerId: string;
  courierId: string | null;
  serviceTypeId: string;
  status: string;
  priority: string | null;
  pickupZoneId: string;
  pickupAddress: string;
  pickupContactName: string;
  pickupContactPhone: string;
  pickupWindowStart: string | null;
  pickupWindowEnd: string | null;
  dropoffZoneId: string;
  dropoffAddress: string;
  dropoffContactName: string;
  dropoffContactPhone: string;
  dropoffWindowStart: string | null;
  dropoffWindowEnd: string | null;
  scheduledDate: string | null;
  packageDesc: string;
  packagePieces: number;
  packageWeight: string | null;
  packageSizeClass: string | null;
  packageFragile: boolean;
  priceCents: number | null;
  needsQuote: boolean;
  createdAt: string;
  updatedAt: string;
  trackingEvents?: TrackingEvent[];
}

export interface TrackingEvent {
  id: string;
  deliveryId: string;
  status: string;
  actorId: string | null;
  note: string;
  locationText: string | null;
  createdAt: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  number: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  totalCents: number;
  issuedAt: string;
  paidAt: string | null;
}
