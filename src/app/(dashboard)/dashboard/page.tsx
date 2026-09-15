"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Cube,
  MapPin,
  Package,
  Path,
  Receipt,
  TrendUp,
  Truck,
  WarningCircle,
} from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { DeliveryDetailSheet } from "@/components/customer/delivery-detail-sheet";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  progressForStatus,
  statusLabels,
  statusVariants,
} from "@/components/shared/tracking/types";

interface DeliveryItem {
  id: string;
  trackingNumber: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  packageDesc: string;
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string | null;
}

interface ActivityItem {
  id: string;
  status: string;
  note: string;
  createdAt: string;
  trackingNumber: string;
  deliveryId: string;
}

interface DashboardStats {
  activeDeliveries: number;
  pendingPickups: number;
  totalSpentCents: number;
  attentionDelivery: DeliveryItem | null;
  recentDeliveries: DeliveryItem[];
  recentActivity: ActivityItem[];
}

const activityIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={18} weight="bold" />,
  processing: <Package size={18} weight="bold" />,
  "picked-up": <Truck size={18} weight="bold" />,
  "in-transit": <Truck size={18} weight="bold" />,
  "out-for-delivery": <Path size={18} weight="bold" />,
  delivered: <CheckCircle size={18} weight="fill" />,
  "failed-attempt": <WarningCircle size={18} weight="fill" />,
  cancelled: <Package size={18} />,
};

const activityTone: Record<string, string> = {
  pending: "bg-sun-100 text-[#8a5a00]",
  processing: "bg-[#e3edff] text-[#235bc2]",
  "picked-up": "bg-forest-100 text-forest",
  "in-transit": "bg-forest-100 text-forest",
  "out-for-delivery": "bg-sun-100 text-[#8a5a00]",
  delivered: "bg-[#d9f9e7] text-[#007837]",
  "failed-attempt": "bg-[#fcdee0] text-[#c0392b]",
  cancelled: "bg-[#f0f0f0] text-[#666d80]",
};

function timeAgo(dateStr: string) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function shortAddress(address: string) {
  return address?.split(",")[0]?.trim() || "Address unavailable";
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading dashboard">
      <div className="min-h-[320px] animate-pulse rounded-2xl bg-forest/15" />
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[#dfe1e7] bg-[#dfe1e7] sm:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse bg-white" />)}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-[360px] animate-pulse rounded-2xl bg-white" />
        <div className="h-[360px] animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const requestId = useRef(0);

  const token = session?.accessToken;
  const firstName = session?.user?.firstname || session?.user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const response = await api<DashboardStats>("/dashboard/stats", { token });
      if (currentRequest !== requestId.current) return;
      if (response.status === 200 && response.data) setStats(response.data);
      else setError(response.errors?.[0] || "Dashboard data could not be loaded.");
    } catch {
      if (currentRequest === requestId.current) setError("Dashboard data could not be loaded.");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const currentRequest = ++requestId.current;
    api<DashboardStats>("/dashboard/stats", { token })
      .then((response) => {
        if (currentRequest !== requestId.current) return;
        if (response.status === 200 && response.data) setStats(response.data);
        else setError(response.errors?.[0] || "Dashboard data could not be loaded.");
      })
      .catch(() => {
        if (currentRequest === requestId.current) setError("Dashboard data could not be loaded.");
      })
      .finally(() => {
        if (currentRequest === requestId.current) setLoading(false);
      });
    return () => { requestId.current += 1; };
  }, [token]);

  function openDelivery(id: string) {
    setActiveDeliveryId(id);
    setSheetOpen(true);
  }

  const deliveries = stats?.recentDeliveries ?? [];
  const activity = stats?.recentActivity ?? [];
  const attention = stats?.attentionDelivery ?? null;

  return (
    <div className="min-h-full bg-[#f4f5f1] px-4 py-7 font-manrope sm:px-6 sm:py-9 xl:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-7 flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-forest-600">{greeting}, {firstName}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#161618] sm:text-3xl">Your delivery desk</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#666d80]">See what is moving, what is waiting, and what changed most recently.</p>
          </div>
          <p className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-[#8094a7] md:block">Customer dispatch</p>
        </header>

        {error && (
          <div role="alert" className="mb-5 flex flex-col gap-3 rounded-xl border border-[#efb9bd] bg-[#fff4f5] px-4 py-4 text-sm text-[#8f292f] sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2"><WarningCircle size={20} weight="fill" />{error}</span>
            <button type="button" onClick={loadDashboard} className="min-h-11 cursor-pointer self-start rounded-lg bg-[#8f292f] px-4 font-semibold text-white transition-colors hover:bg-[#742126] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f292f] focus-visible:ring-offset-2 sm:self-auto">Try again</button>
          </div>
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : stats ? (
          <div className="space-y-5">
            {attention ? (
              <section aria-labelledby="attention-title" className="relative isolate overflow-hidden rounded-2xl bg-forest px-5 py-6 text-white shadow-[0_22px_60px_rgba(23,52,32,0.18)] sm:px-7 sm:py-7 lg:px-9">
                <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-[radial-gradient(circle_at_center,rgba(243,188,36,0.18),transparent_68%)]" />
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:items-end">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sun-300">Latest active delivery</p>
                      <StatusBadge label={statusLabels[attention.status] || attention.status} status={statusVariants[attention.status] || "pending"} className="border border-white/15" />
                    </div>
                    <h2 id="attention-title" className="mt-4 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">{attention.trackingNumber}</h2>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-white/65">{attention.packageDesc || "Delivery details"}</p>

                    <div className="mt-7 grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Pickup</p>
                        <p className="mt-1 truncate text-base font-semibold" title={attention.pickupAddress}>{shortAddress(attention.pickupAddress)}</p>
                      </div>
                      <ArrowRight className="hidden text-sun-400 sm:block" size={22} aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Dropoff</p>
                        <p className="mt-1 truncate text-base font-semibold" title={attention.dropoffAddress}>{shortAddress(attention.dropoffAddress)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Route progress</p>
                        <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-sun-400">{progressForStatus(attention.status)}%</p>
                      </div>
                      <p className="text-right text-xs leading-5 text-white/55">Updated<br />{timeAgo(attention.updatedAt || attention.createdAt)}</p>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15" aria-label={`${progressForStatus(attention.status)} percent complete`}>
                      <div className="h-full rounded-full bg-sun-500" style={{ width: `${progressForStatus(attention.status)}%` }} />
                    </div>
                    <button type="button" onClick={() => openDelivery(attention.id)} className="mt-6 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-sun-500 px-5 text-sm font-bold text-forest transition-colors hover:bg-sun-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-forest">
                      View delivery <ArrowRight size={17} weight="bold" />
                    </button>
                  </div>
                </div>
              </section>
            ) : (
              <section aria-labelledby="attention-title" className="grid gap-5 rounded-2xl border border-forest/10 bg-[#edf2ea] px-5 py-7 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-7">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-white text-forest shadow-sm"><CheckCircle size={25} weight="fill" /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-600">All clear</p>
                  <h2 id="attention-title" className="mt-1 text-xl font-semibold text-forest">No active deliveries right now.</h2>
                  <p className="mt-1 text-sm text-[#666d80]">Your completed delivery history is still available below.</p>
                </div>
                <Link href="/dashboard/book" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-forest px-5 text-sm font-bold text-white transition-colors hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">Book a delivery</Link>
              </section>
            )}

            <section aria-label="Delivery summary" className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[#dfe1e7] bg-[#dfe1e7] sm:grid-cols-3">
              <Link href="/dashboard/deliveries" className="group flex min-h-24 items-center justify-between bg-white px-5 py-4 transition-colors hover:bg-forest-50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest">
                <span><span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#8094a7]">Active</span><span className="mt-1 block text-2xl font-semibold text-forest">{stats.activeDeliveries}</span></span>
                <Truck size={22} className="text-forest-600 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/dashboard/deliveries" className="group flex min-h-24 items-center justify-between bg-white px-5 py-4 transition-colors hover:bg-sun-50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest">
                <span><span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#8094a7]">Pending pickup</span><span className="mt-1 block text-2xl font-semibold text-forest">{stats.pendingPickups}</span></span>
                <Clock size={22} className="text-[#9a6a00]" />
              </Link>
              <Link href="/dashboard/invoices" className="group flex min-h-24 items-center justify-between bg-white px-5 py-4 transition-colors hover:bg-forest-50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest">
                <span><span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#8094a7]">Total spent</span><span className="mt-1 block text-2xl font-semibold text-forest">{formatCents(stats.totalSpentCents)}</span></span>
                <Receipt size={22} className="text-forest-600" />
              </Link>
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <section aria-labelledby="recent-deliveries-title" className="overflow-hidden rounded-2xl border border-[#dfe1e7] bg-white">
                <div className="flex items-center justify-between gap-4 border-b border-[#e3e6ed] px-5 py-4 sm:px-6">
                  <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-600">Operations</p><h2 id="recent-deliveries-title" className="mt-1 text-lg font-semibold text-[#161618]">Recent deliveries</h2></div>
                  {deliveries.length > 0 && <Link href="/dashboard/deliveries" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-forest hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">View all <ArrowRight size={15} /></Link>}
                </div>
                {deliveries.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center"><Cube size={36} className="text-[#a4acb9]" /><p className="mt-4 font-semibold text-[#333]">No deliveries yet</p><p className="mt-1 text-sm text-[#8094a7]">Book your first delivery to start tracking it here.</p></div>
                ) : (
                  <div className="divide-y divide-[#edf0ea]">
                    {deliveries.map((delivery) => {
                      const progress = progressForStatus(delivery.status);
                      return (
                        <button key={delivery.id} type="button" onClick={() => openDelivery(delivery.id)} className="group grid w-full cursor-pointer gap-4 px-5 py-4 text-left transition-colors hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest sm:grid-cols-[minmax(170px,0.7fr)_minmax(240px,1.3fr)_minmax(170px,0.8fr)_auto] sm:items-center sm:px-6">
                          <div className="min-w-0"><p className="font-semibold text-forest">{delivery.trackingNumber}</p><p className="mt-1 truncate text-xs text-[#8094a7]">{delivery.packageDesc || "Delivery"}</p></div>
                          <div className="flex min-w-0 items-center gap-3"><MapPin size={17} className="shrink-0 text-forest-600" /><p className="min-w-0 truncate text-sm text-[#333]" title={`${delivery.pickupAddress} to ${delivery.dropoffAddress}`}>{shortAddress(delivery.pickupAddress)} <span className="text-[#a4acb9]">→</span> {shortAddress(delivery.dropoffAddress)}</p></div>
                          <div className="min-w-0"><div className="flex items-center justify-between gap-2"><StatusBadge label={statusLabels[delivery.status] || delivery.status} status={statusVariants[delivery.status] || "pending"} /><span className="text-xs font-semibold text-[#666d80]">{progress}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf0ea]"><div className="h-full rounded-full bg-forest-600" style={{ width: `${progress}%` }} /></div></div>
                          <div className="flex items-center justify-between gap-3 sm:block sm:text-right"><span className="text-xs text-[#8094a7]">{formatDate(delivery.createdAt)}</span><ArrowRight size={16} className="text-forest opacity-70 transition-transform group-hover:translate-x-0.5 sm:ml-auto sm:mt-2" /></div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              <aside aria-labelledby="recent-activity-title" className="rounded-2xl border border-[#dfe1e7] bg-white px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-600">Timeline</p><h2 id="recent-activity-title" className="mt-1 text-lg font-semibold text-[#161618]">Recent activity</h2></div><TrendUp size={20} className="text-forest-600" /></div>
                {activity.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center text-center"><Clock size={32} className="text-[#a4acb9]" /><p className="mt-3 text-sm text-[#8094a7]">No recent activity</p></div>
                ) : (
                  <ol className="mt-6 space-y-0">
                    {activity.map((item, index) => (
                      <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                        {index < activity.length - 1 && <span className="absolute bottom-0 left-[17px] top-9 w-px bg-[#dfe8d6]" aria-hidden="true" />}
                        <span className={`relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full ${activityTone[item.status] || "bg-[#f0f0f0] text-[#666d80]"}`}>{activityIcons[item.status] || <Package size={18} />}</span>
                        <button type="button" onClick={() => openDelivery(item.deliveryId)} className="min-w-0 cursor-pointer rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
                          <span className="block text-sm font-semibold text-[#333] hover:text-forest">{statusLabels[item.status] || item.status}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-[#666d80]">{item.trackingNumber}{item.note ? ` · ${item.note}` : ""}</span>
                          <span className="mt-1 block text-xs font-medium text-[#8094a7]">{timeAgo(item.createdAt)}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </aside>
            </div>
          </div>
        ) : null}
      </div>

      <DeliveryDetailSheet open={sheetOpen} id={activeDeliveryId} token={token} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
