"use client";

import { useEffect, useRef } from "react";
import { Crosshair } from "lucide-react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";

const PORTLAND: [number, number] = [45.5152, -122.6784];
const REGIONAL_VIEW: [number, number] = [43.9, -120.4];
const REGIONAL_ZOOM = 5;

const connections = [
  { label: "Washington", point: [47.4, -120.7] as [number, number] },
  { label: "Idaho", point: [44.2, -114.5] as [number, number] },
  { label: "California", point: [39.4, -121.4] as [number, number] },
  { label: "Nevada", point: [39.5, -117.1] as [number, number] },
];

export default function CoverageMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initialiseMap() {
      const L = await import("leaflet");
      const element = containerRef.current;
      if (!element || mapRef.current || cancelled) return;

      const map = L.map(element, {
        center: REGIONAL_VIEW,
        zoom: REGIONAL_ZOOM,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        className: "coverage-map-tiles",
      }).addTo(map);

      connections.forEach(({ label, point }) => {
        L.polyline([PORTLAND, point], {
          color: "#2d5a3a",
          weight: 2,
          opacity: 0.72,
          dashArray: "7 9",
        }).addTo(map);

        L.circleMarker(point, {
          radius: 5,
          color: "#173420",
          weight: 2,
          fillColor: "#f3efe4",
          fillOpacity: 1,
        })
          .addTo(map)
          .bindTooltip(label, {
            permanent: true,
            direction: "top",
            className: "coverage-map-label",
            offset: [0, -7],
          });
      });

      L.circleMarker(PORTLAND, {
        radius: 11,
        color: "#f3efe4",
        weight: 4,
        fillColor: "#f3bc24",
        fillOpacity: 1,
      })
        .addTo(map)
        .bindTooltip("Portland · home base", {
          permanent: true,
          direction: "right",
          className: "coverage-map-label coverage-map-label--hub",
          offset: [13, 0],
        });

      mapRef.current = map;
      requestAnimationFrame(() => map.invalidateSize());
    }

    initialiseMap();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  function resetView() {
    mapRef.current?.setView(REGIONAL_VIEW, REGIONAL_ZOOM, { animate: true });
  }

  return (
    <div className="coverage-map-shell relative min-h-[460px] overflow-hidden border border-forest/15 bg-[#dcdccb] shadow-[0_24px_70px_rgba(23,52,32,0.13)] sm:min-h-[560px]">
      <div
        ref={containerRef}
        role="region"
        aria-label="Interactive OpenStreetMap showing Oregon Swift regional coverage from Portland to Washington, Idaho, California, and Nevada"
        className="absolute inset-0 z-0"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start justify-between bg-gradient-to-b from-[#102b1b]/80 via-[#102b1b]/40 to-transparent p-4 pb-14 sm:p-6 sm:pb-16">
        <div>
          <p className="font-manrope text-[10px] font-bold uppercase tracking-[0.22em] text-sun-300">Regional dispatch</p>
          <p className="mt-1 font-manrope text-xs font-medium text-white/80">Drag to explore · scroll controls stay with the page</p>
        </div>
      </div>

      <button
        type="button"
        onClick={resetView}
        aria-label="Reset regional map view"
        className="absolute right-4 top-4 z-[600] inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/45 bg-[#102b1b]/75 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-[#102b1b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#102b1b] sm:right-6 sm:top-6"
      >
        <Crosshair aria-hidden="true" size={18} />
      </button>

      <div className="pointer-events-none absolute inset-x-4 bottom-7 z-[500] flex flex-wrap gap-x-5 gap-y-2 bg-[#f3efe4]/92 px-4 py-3 font-manrope text-[11px] font-semibold text-forest shadow-lg backdrop-blur-md sm:inset-x-auto sm:bottom-8 sm:left-6">
        <span className="flex items-center gap-2"><i className="size-2.5 rounded-full border-2 border-[#f3efe4] bg-sun-500 shadow-[0_0_0_1px_#173420]" />Portland hub</span>
        <span className="flex items-center gap-2"><i className="w-5 border-t-2 border-dashed border-forest-600" />Regional connection</span>
      </div>

      <style jsx global>{`
        .coverage-map-shell .coverage-map-tiles {
          filter: grayscale(0.28) sepia(0.16) saturate(0.72) hue-rotate(78deg) brightness(0.96) contrast(0.94);
        }
        .coverage-map-shell .coverage-map-label {
          border: 1px solid rgba(23, 52, 32, 0.2);
          border-radius: 2px;
          background: rgba(243, 239, 228, 0.94);
          box-shadow: 0 5px 16px rgba(23, 52, 32, 0.16);
          color: #173420;
          font-family: var(--font-manrope);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding: 5px 7px;
        }
        .coverage-map-shell .coverage-map-label::before {
          display: none;
        }
        .coverage-map-shell .coverage-map-label--hub {
          background: #173420;
          border-color: #173420;
          color: #f3efe4;
        }
        .coverage-map-shell .leaflet-control-zoom {
          border: 0;
          box-shadow: 0 8px 24px rgba(23, 52, 32, 0.18);
        }
        .coverage-map-shell .leaflet-control-zoom a {
          border-color: rgba(23, 52, 32, 0.12);
          background: rgba(243, 239, 228, 0.94);
          color: #173420;
        }
        .coverage-map-shell .leaflet-control-attribution {
          background: rgba(243, 239, 228, 0.86);
          color: #45644d;
          font-family: var(--font-manrope);
          font-size: 9px;
        }
      `}</style>
    </div>
  );
}
