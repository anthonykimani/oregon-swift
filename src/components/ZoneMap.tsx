"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

function pointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

interface Zone {
  id: string;
  name: string;
  state: string;
  boundaries: number[][][];
  active: boolean;
  zoneType: string;
  centerLat: number | null;
  centerLng: number | null;
  radiusMiles: number | null;
  color: string | null;
}

interface ZoneMapProps {
  zones: Zone[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  className?: string;
  panTo?: { lat: number; lng: number; zoom?: number } | null;
  pickupMarker?: { lat: number; lng: number } | null;
  dropoffMarker?: { lat: number; lng: number } | null;
}

function useStableCallback(fn: (id: string) => void) {
  const ref = useRef(fn);
  ref.current = fn;
  return useRef((id: string) => ref.current(id)).current;
}

function getZoneColor(zone: Zone, index: number): string {
  if (zone.color) return zone.color;
  const palette = ["#173420", "#F3BC24", "#4A90D9", "#9B59B6", "#E67E22"];
  return palette[index % palette.length];
}

export default function ZoneMap({ zones, selectedZoneId, onSelectZone, className, panTo, pickupMarker, dropoffMarker }: ZoneMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const shapesRef = useRef<any[]>([]);
  const markerRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropoffMarkerRef = useRef<any>(null);
  const lineRef = useRef<any>(null);
  const selectRef = useStableCallback(onSelectZone);
  const [mounted, setMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function init() {
      const L = await import("leaflet");
      const el = containerRef.current;
      if (!el || mapRef.current) return;

      const map = L.map(el, {
        center: [45.5, -122.7],
        zoom: 9,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      }).addTo(map);

      map.on("click", (e: any) => {
        const point: [number, number] = [e.latlng.lat, e.latlng.lng];
        for (const shape of shapesRef.current) {
          const zoneId = (shape as any).__zoneId;
          let hit = false;

          if (shape.getLatLngs && shape.getLatLngs()) {
            const ring = (shape.getLatLngs() as any[])[0] as any[];
            const polyPoints: [number, number][] = ring.map((ll: any) => [ll.lat, ll.lng]);
            hit = pointInPolygon(point, polyPoints);
          } else if (shape.getLatLng && shape.getRadius) {
            const center = shape.getLatLng();
            const radius = shape.getRadius();
            hit = map.distance(center, e.latlng) <= radius;
          }

          if (hit) {
            selectRef(zoneId);
            return;
          }
        }
      });

      mapRef.current = map;
      setMapReady(true);
    }

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mapReady) return;

    const map = mapRef.current;
    if (!map) return;

    async function update() {
      const L = await import("leaflet");

      shapesRef.current.forEach((s) => map.removeLayer(s));
      shapesRef.current = [];

      zones.forEach((zone, idx) => {
        const isRadial = zone.zoneType === "radial" && zone.centerLat != null && zone.centerLng != null && zone.radiusMiles != null;
        const isSelected = selectedZoneId === zone.id;
        const baseColor = getZoneColor(zone, idx);

        let shape: any;

        if (isRadial) {
          const radiusMeters = zone.radiusMiles! * 1609.34;
          shape = L.circle([zone.centerLat!, zone.centerLng!], {
            radius: radiusMeters,
            fillColor: baseColor,
            fillOpacity: isSelected ? 0.35 : 0.18,
            color: baseColor,
            weight: isSelected ? 3 : 1.5,
            opacity: 0.6,
          }).addTo(map);
        } else {
          const coords = zone.boundaries?.[0]?.map((c) => [c[1], c[0]] as [number, number]);
          if (!coords || coords.length < 3) return;

          shape = L.polygon(coords, {
            fillColor: baseColor,
            fillOpacity: isSelected ? 0.5 : 0.25,
            color: isSelected ? baseColor : "#666",
            weight: isSelected ? 3 : 1,
          }).addTo(map);
        }

        shape.on("click pointerdown", () => selectRef(zone.id));

        shape.on("mouseover", () => {
          shape.bindTooltip(zone.name, { sticky: true }).openTooltip();
          if (!isSelected) {
            if (isRadial) {
              shape.setStyle({ fillOpacity: 0.3, weight: 2.5, opacity: 0.8 });
            } else {
              shape.setStyle({ fillOpacity: 0.4, weight: 2 });
            }
          }
        });

        shape.on("mouseout", () => {
          shape.closeTooltip();
          if (!isSelected) {
            if (isRadial) {
              shape.setStyle({ fillOpacity: 0.18, weight: 1.5, opacity: 0.6 });
            } else {
              shape.setStyle({ fillOpacity: 0.25, weight: 1 });
            }
          }
        });

        (shape as any).__zoneId = zone.id;
        shapesRef.current.push(shape);
      });

      if (selectedZoneId) {
        const sel = shapesRef.current.find((s) => (s as any).__zoneId === selectedZoneId);
        if (sel) {
          if (sel.getBounds) {
            map.fitBounds(sel.getBounds().pad(0.3));
          } else if (sel.getLatLng && sel.getRadius) {
            map.setView(sel.getLatLng(), 11);
          }
        }
      }
    }

    update();
  }, [zones, selectedZoneId, selectRef, mapReady]);

  useEffect(() => {
    if (!mapReady || !panTo) return;
    mapRef.current?.setView([panTo.lat, panTo.lng], panTo.zoom ?? 14);
  }, [panTo, mapReady]);

  // Pickup / dropoff markers + connecting line
  useEffect(() => {
    if (!mapReady) return;

    const map = mapRef.current;
    if (!map) return;

    async function updateMarkers() {
      const L = await import("leaflet");

      if (pickupMarkerRef.current) { map.removeLayer(pickupMarkerRef.current); pickupMarkerRef.current = null; }
      if (dropoffMarkerRef.current) { map.removeLayer(dropoffMarkerRef.current); dropoffMarkerRef.current = null; }
      if (lineRef.current) { map.removeLayer(lineRef.current); lineRef.current = null; }

      if (pickupMarker) {
        pickupMarkerRef.current = L.circleMarker([pickupMarker.lat, pickupMarker.lng], {
          radius: 10,
          fillColor: "#173420",
          color: "#fff",
          weight: 3,
          fillOpacity: 1,
        }).addTo(map);
        pickupMarkerRef.current.bindTooltip("Pickup", { permanent: false, direction: "top" });
      }

      if (dropoffMarker) {
        dropoffMarkerRef.current = L.circleMarker([dropoffMarker.lat, dropoffMarker.lng], {
          radius: 10,
          fillColor: "#F3BC24",
          color: "#fff",
          weight: 3,
          fillOpacity: 1,
        }).addTo(map);
        dropoffMarkerRef.current.bindTooltip("Dropoff", { permanent: false, direction: "top" });
      }

      if (pickupMarker && dropoffMarker) {
        const pickupLatLng = L.latLng(pickupMarker.lat, pickupMarker.lng);
        const dropoffLatLng = L.latLng(dropoffMarker.lat, dropoffMarker.lng);
        lineRef.current = L.polyline([pickupLatLng, dropoffLatLng], {
          color: "#666",
          weight: 2,
          dashArray: "6 6",
          opacity: 0.6,
        }).addTo(map);

        map.fitBounds(L.latLngBounds([pickupLatLng, dropoffLatLng]).pad(0.3));
      }
    }

    updateMarkers();
  }, [pickupMarker, dropoffMarker, mapReady]);

  async function handleDetectLocation() {
    const map = mapRef.current;
    if (!map || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const L = await import("leaflet");
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 12);

        if (markerRef.current) map.removeLayer(markerRef.current);
        markerRef.current = L.circleMarker([latitude, longitude], {
          radius: 8, fillColor: "#173420", color: "#fff", weight: 2, fillOpacity: 1,
        }).addTo(map);

        markerRef.current.bindPopup("Your location").openPopup();
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  const selected = zones.find((z) => z.id === selectedZoneId);

  return (
    <div className="space-y-3 w-full">
      <div className={`relative ${className || ""}`} style={{ minHeight: 250 }}>
        {!mounted && <div className="absolute inset-0 bg-[#F0F2F5] rounded-xl" />}
        <div ref={containerRef} className="w-full h-full rounded-xl" style={{ minHeight: 250 }} />
        <button
          onClick={handleDetectLocation}
          className="absolute top-3 right-3 z-[1000] bg-white border border-[#E3E6ED] rounded-lg px-3 py-1.5 text-xs text-[#173420] font-medium shadow-sm hover:bg-gray-50"
        >
          Detect my location
        </button>
      </div>

      {selected && (
        <p className="text-sm text-[#173420] font-medium">Selected: {selected.name}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => selectRef(z.id)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              z.id === selectedZoneId
                ? "bg-[#173420] text-white border-[#173420]"
                : "bg-white text-[#666D80] border-[#E3E6ED] hover:border-[#173420]"
            }`}
          >
            {z.name}
          </button>
        ))}
      </div>
    </div>
  );
}
