"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, CircleMarker, Polyline } from "leaflet";
import { ArrowsOutSimple, Plus, Minus } from "@phosphor-icons/react";
import { geocodeAddress } from "@/lib/geocode";
import { StatusBadge } from "@/components/ui/status-badge";
import { statusLabels, statusVariants } from "@/components/shared/tracking/types";

const DEFAULT_VIEW: [number, number] = [45.52, -122.68];

export function TrackingMap({
  trackingNumber,
  status,
  pickupAddress,
  dropoffAddress,
  courierPosition,
}: {
  trackingNumber: string;
  status: string;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  courierPosition?: { lat: number; lng: number } | null;
}) {
  const [mounted, setMounted] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeFailed, setGeocodeFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const pickupRef = useRef<CircleMarker | null>(null);
  const dropoffRef = useRef<CircleMarker | null>(null);
  const courierRef = useRef<CircleMarker | null>(null);
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
    if (!mounted || !mapRef.current) return;

    let cancelled = false;
    setGeocoding(true);
    setGeocodeFailed(false);

    async function run() {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map) return;

      const [pickup, dropoff] = await Promise.all([
        geocodeAddress(pickupAddress || ""),
        geocodeAddress(dropoffAddress || ""),
      ]);

      if (cancelled) return;
      setGeocoding(false);
      setGeocodeFailed(!pickup && !dropoff);

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
          radius: 9,
          fillColor: "#173420",
          color: "#fff",
          weight: 3,
          fillOpacity: 1,
        })
          .addTo(map)
          .bindTooltip("Pickup", { direction: "top" });
      }

      if (dropoff) {
        dropoffRef.current = L.circleMarker(dropoff, {
          radius: 9,
          fillColor: "#40C4AA",
          color: "#fff",
          weight: 3,
          fillOpacity: 1,
        })
          .addTo(map)
          .bindTooltip("Dropoff", { direction: "top" });
      }

      if (pickup && dropoff) {
        const samePoint =
          Math.abs(pickup[0] - dropoff[0]) < 0.0005 &&
          Math.abs(pickup[1] - dropoff[1]) < 0.0005;
        if (!samePoint) {
          lineRef.current = L.polyline([pickup, dropoff], {
            color: "#40C4AA",
            weight: 3,
            dashArray: "6 8",
            opacity: 0.9,
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
  }, [mounted, pickupAddress, dropoffAddress]);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map || cancelled) return;

      if (courierRef.current) {
        map.removeLayer(courierRef.current);
        courierRef.current = null;
      }

      if (!courierPosition) return;

      courierRef.current = L.circleMarker([courierPosition.lat, courierPosition.lng], {
        radius: 8,
        fillColor: "#F3BC24",
        color: "#fff",
        weight: 3,
        fillOpacity: 1,
      })
        .addTo(map)
        .bindTooltip("Courier", { direction: "top" });
    })();

    return () => {
      cancelled = true;
    };
  }, [mounted, courierPosition]);

  function fitRoute() {
    const map = mapRef.current;
    if (!map) return;
    const p = pickupRef.current?.getLatLng();
    const d = dropoffRef.current?.getLatLng();
    const c = courierRef.current?.getLatLng();
    const points: [number, number][] = [];
    if (p) points.push([p.lat, p.lng]);
    if (d) points.push([d.lat, d.lng]);
    if (c) points.push([c.lat, c.lng]);
    if (points.length >= 2) {
      map.fitBounds(points, { padding: [20, 20] });
    } else if (c) {
      map.setView([c.lat, c.lng], 14);
    } else {
      map.setView(DEFAULT_VIEW, 9);
    }
  }

  function zoomBy(delta: number) {
    const map = mapRef.current;
    if (!map) return;
    map.setZoom(map.getZoom() + delta);
  }

  return (
    <div className="relative w-full h-full min-h-[320px] overflow-hidden rounded-lg">
      {!mounted && <div className="absolute inset-0 bg-[#F0F0F0]" />}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Top overlay: tracking id + status */}
      {trackingNumber && (
        <div className="absolute left-3 top-3 z-[1000] flex items-center gap-2 pointer-events-none">
          <div className="bg-white/95 backdrop-blur rounded-md px-3 py-1.5 text-[11px] font-manrope text-[#333] shadow-sm">
            #{trackingNumber}
          </div>
          <StatusBadge
            label={statusLabels[status] || status}
            status={statusVariants[status] || "pending"}
          />
        </div>
      )}

      {geocoding && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur rounded-md px-2.5 py-1 text-[10px] font-manrope text-[#8094A7] shadow-sm">
          Locating pickup &amp; dropoff…
        </div>
      )}

      {geocodeFailed && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-[#FDF3F4] border border-[#F5CED2] rounded-md px-2.5 py-1 text-[10px] font-manrope text-[#C0392B] shadow-sm">
          Live location unavailable
        </div>
      )}

      {/* Zoom + fit controls */}
      <div className="absolute right-3 bottom-3 z-[1000] flex flex-col gap-1.5">
        <button
          onClick={() => zoomBy(1)}
          className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-[#333] hover:bg-[#F5F5F5] transition-colors"
          title="Zoom in"
        >
          <Plus size={15} />
        </button>
        <button
          onClick={() => zoomBy(-1)}
          className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-[#333] hover:bg-[#F5F5F5] transition-colors"
          title="Zoom out"
        >
          <Minus size={15} />
        </button>
        <button
          onClick={fitRoute}
          className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-[#333] hover:bg-[#F5F5F5] transition-colors"
          title="Fit route"
        >
          <ArrowsOutSimple size={15} />
        </button>
      </div>
    </div>
  );
}
