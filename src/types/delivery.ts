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
  courierName?: string | null;
  courierPhone?: string | null;
  courierVehicle?: string | null;
  customerName?: string | null;
  latestEvent?: TrackingEvent | null;
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
  periodStart: string | null;
  periodEnd: string | null;
  status: string;
  subtotalCents?: number;
  taxCents?: number;
  totalCents: number;
  dueDate?: string | null;
  issuedAt: string | null;
  paidAt: string | null;
  paymentRequestedAt?: string | null;
  confirmedBy?: string | null;
  disputedBy?: string | null;
  disputeReason?: string | null;
  adminNote?: string | null;
  billTo?: { name: string; email: string } | null;
  items?: InvoiceLineItem[];
  customerName?: string | null;
  itemCount?: number;
  courierCount?: number;
  courierNames?: string[];
  myDeliveries?: number;
  overdue?: boolean;
  paymentEvents?: PaymentEvent[];
}

export interface PaymentEvent {
  id: string;
  invoiceId: string;
  action: string;
  actorId?: string | null;
  actorRole?: string | null;
  note?: string | null;
  createdAt: string;
  actorName?: string | null;
}

export interface InvoiceLineItem {
  id: string;
  deliveryId: string;
  amountCents: number;
  trackingNumber: string | null;
  packageDesc: string | null;
  packagePieces: number;
  shipmentType: string | null;
  origin: string | null;
  destination: string | null;
}
