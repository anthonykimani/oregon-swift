"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, CircleMarker, Polyline } from "leaflet";
import {
  ArrowRight,
  DotsThree,
  ChatTeardrop,
  Phone,
  ArrowsOutSimple,
} from "@phosphor-icons/react";
import { geocodeAddress } from "@/lib/geocode";

interface TimelineStep {
  status: string;
  note: string;
  locationText: string;
  createdAt: string;
}

interface DeliveryTrack {
  trackingNumber: string;
  status: string;
  courierName: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  dropoffDate: string;
  timeline: TimelineStep[];
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  "picked-up": "Picked Up",
  "in-transit": "In Transit",
  "out-for-delivery": "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const DEFAULT_VIEW: [number, number] = [45.52, -122.68];

function formatDate(d: string) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(d: string) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DeliveryTrackingCard({
  data,
  loading = false,
}: {
  data: DeliveryTrack | null;
  loading?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const pickupRef = useRef<CircleMarker | null>(null);
  const dropoffRef = useRef<CircleMarker | null>(null);
  const lineRef = useRef<Polyline | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function init() {
      const el = containerRef.current;
      if (!el || mapRef.current) return;

      const L = await import("leaflet");
      const map = L.map(el, {
        center: DEFAULT_VIEW,
        zoom: 9,
        zoomControl: false,
      });
      L.control.zoom({ position: "topright" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);
      requestAnimationFrame(() => map.invalidateSize());
      mapRef.current = map;
    }

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !mapRef.current || !data) return;

    const track = data;
    let cancelled = false;
    setGeocoding(true);

    async function run() {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map) return;

      const [pickup, dropoff] = await Promise.all([
        geocodeAddress(track.pickupAddress),
        geocodeAddress(track.dropoffAddress),
      ]);

      if (cancelled) return;
      setGeocoding(false);

      if (pickupRef.current) {
        map.removeLayer(pickupRef.current);
        pickupRef.current = null;
      }
      if (dropoffRef.current) {
        map.removeLayer(dropoffRef.current);
        dropoffRef.current = null;
      }
      if (lineRef.current) {
        map.removeLayer(lineRef.current);
        lineRef.current = null;
      }

      if (pickup) {
        pickupRef.current = L.circleMarker(pickup, {
          radius: 8,
          fillColor: "#173420",
          color: "#fff",
          weight: 3,
          fillOpacity: 1,
        })
          .addTo(map)
          .bindTooltip("Pickup", { permanent: false, direction: "top" });
      }

      if (dropoff) {
        dropoffRef.current = L.circleMarker(dropoff, {
          radius: 8,
          fillColor: "#F04A4A",
          color: "#fff",
          weight: 3,
          fillOpacity: 1,
        })
          .addTo(map)
          .bindTooltip("Dropoff", { permanent: false, direction: "top" });
      }

      if (pickup && dropoff) {
        const samePoint =
          Math.abs(pickup[0] - dropoff[0]) < 0.0005 &&
          Math.abs(pickup[1] - dropoff[1]) < 0.0005;
        if (!samePoint) {
          lineRef.current = L.polyline([pickup, dropoff], {
            color: "#F04A4A",
            weight: 2.5,
            dashArray: "6 6",
            opacity: 0.8,
          }).addTo(map);
        }
        map.fitBounds(L.latLngBounds([pickup, dropoff]).pad(0.4));
      } else if (pickup) {
        map.setView(pickup, 13);
      } else if (dropoff) {
        map.setView(dropoff, 13);
      } else {
        map.setView(DEFAULT_VIEW, 9);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [data, mounted]);

  function fitRoute() {
    const map = mapRef.current;
    if (!map) return;
    const p = pickupRef.current?.getLatLng();
    const d = dropoffRef.current?.getLatLng();
    if (p && d) {
      map.fitBounds(
        [
          [p.lat, p.lng],
          [d.lat, d.lng],
        ],
        { padding: [20, 20] }
      );
    } else {
      map.setView(DEFAULT_VIEW, 9);
    }
  }

  const timeline = [...(data?.timeline ?? [])];

  return (
    <section className="bg-[#FEFEFE] border border-[#E3E6ED] rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-manrope text-[#333333]">Delivery Tracking</h3>
        <button className="w-7 h-7 flex items-center justify-center bg-[#F0F0F0] rounded-lg text-[#333333] hover:bg-[#E3E6ED] transition-colors">
          <DotsThree size={16} />
        </button>
      </div>

      {/* map */}
      <div className="relative rounded-lg h-[200px] overflow-hidden mb-4">
        {!mounted && <div className="absolute inset-0 bg-[#F0F0F0]" />}
        <div ref={containerRef} className="absolute inset-0 rounded-lg z-0" />

        {loading && (
          <div className="absolute inset-0 z-[1000] bg-[#FEFEFE] flex items-center justify-center">
            <div className="h-8 w-2/3 bg-[#E3E6ED] rounded-lg animate-pulse" />
          </div>
        )}

        {!loading && !data && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#FEFEFE]">
            <span className="text-sm text-[#8094A7] font-manrope">
              No active deliveries to track
            </span>
          </div>
        )}

        {!loading && data && (
          <>
            <div className="absolute left-2 top-2 right-2 flex items-center gap-1 pointer-events-none z-[1000]">
              <div className="flex-1 bg-white/95 backdrop-blur rounded-md px-3 py-1.5 text-xs font-manrope text-[#757575] shadow-sm truncate">
                {data.trackingNumber}
              </div>
              <button
                onClick={fitRoute}
                title="Fit route"
                className="pointer-events-auto w-7 h-7 bg-white rounded-md shadow-sm flex items-center justify-center text-[#333333] hover:bg-[#F5F5F5] transition-colors"
              >
                <ArrowsOutSimple size={14} />
              </button>
            </div>

            {geocoding && (
              <div className="absolute bottom-2 left-2 z-[1000] bg-white/95 backdrop-blur rounded-md px-2.5 py-1 text-xs font-manrope text-[#757575] shadow-sm">
                Locating pickup &amp; dropoff…
              </div>
            )}
          </>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 bg-[#E3E6ED] rounded" />
            <div className="h-5 w-16 bg-[#E3E6ED] rounded-full" />
          </div>
          <div className="h-3 w-full bg-[#E3E6ED] rounded" />
          <div className="h-3 w-2/3 bg-[#E3E6ED] rounded" />
          <div className="flex items-center gap-3 py-1">
            <div className="w-9 h-9 rounded-full bg-[#E3E6ED]" />
            <div className="h-3 w-32 bg-[#E3E6ED] rounded" />
          </div>
        </div>
      ) : (
        data && (
          <>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-manrope text-[#757575]">Tracking ID</div>
          <div className="text-sm font-manrope text-[#333333]">
            #{data.trackingNumber || "—"}
          </div>
        </div>
        <span className="inline-flex items-center bg-[#FCDFE0] text-[#333333] text-xs font-manrope font-medium rounded-full px-3 py-1">
          {statusLabels[data.status] || data.status}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-manrope text-[#757575]">Departure</div>
          <div className="text-xs font-manrope text-[#333333] truncate">
            {data.pickupAddress || "—"}
          </div>
          <div className="text-xs font-manrope text-[#757575]">
            {formatDate(data.pickupDate)} {formatTime(data.pickupDate)}
          </div>
        </div>
        <ArrowRight size={18} className="text-[#333333] shrink-0" />
        <div className="flex-1 min-w-0 text-right">
          <div className="text-xs font-manrope text-[#757575]">Destination</div>
          <div className="text-xs font-manrope text-[#333333] truncate">
            {data.dropoffAddress || "—"}
          </div>
          <div className="text-xs font-manrope text-[#757575]">
            {formatDate(data.dropoffDate) || "est."}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-[#F0F0F0] rounded-lg px-3 py-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#F04A4A] flex items-center justify-center text-[#fff] text-xs font-semibold font-manrope">
            {(data.courierName || "?").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-manrope text-[#757575]">Courier</div>
            <div className="text-xs font-manrope text-[#333333]">
              {data.courierName || "Unassigned"}
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#333333] shadow-sm hover:bg-[#F5F5F5] transition-colors">
            <ChatTeardrop size={16} />
          </button>
          <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#333333] shadow-sm hover:bg-[#F5F5F5] transition-colors">
            <Phone size={16} />
          </button>
        </div>
      </div>

      <div className="border-t border-[#E1E1E1] pt-3">
        <h4 className="text-sm font-manrope text-[#333333] mb-3">
          Shipment History
        </h4>
        <div className="space-y-0">
          {timeline.length === 0 ? (
            <div className="text-xs font-manrope text-[#8094A7]">
              No events yet
            </div>
          ) : (
            timeline.map((s, i) => (
              <div key={i} className="flex gap-2.5 relative pb-3 last:pb-0">
                {i < timeline.length - 1 && (
                  <div className="absolute left-[4px] top-5 bottom-0 w-px bg-[#C4C4C4]" />
                )}
                <div className="w-2 h-2 rounded-full bg-[#F04A4A] mt-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-manrope text-[#333333]">
                    {statusLabels[s.status] || s.status || "Update"}
                    {s.locationText && (
                      <span className="text-[#757575] font-normal">
                        {" "}
                        · {s.locationText}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-manrope text-[#757575]">
                    {formatTime(s.createdAt)} {formatDate(s.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
          </>
        )
      )}
    </section>
  );
}