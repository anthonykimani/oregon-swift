"use client";

import { useEffect, useRef } from "react";
import { Crosshair } from "lucide-react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";

const PORTLAND: [number, number] = [45.5152, -122.6784];

type LabelDirection = "top" | "right" | "bottom" | "left";

const connections: { label: string; point: [number, number]; direction: LabelDirection }[] = [
  { label: "Washington", point: [47.4, -120.7], direction: "top" },
  { label: "Idaho", point: [44.2, -114.5], direction: "right" },
  { label: "California", point: [39.4, -121.4], direction: "left" },
  { label: "Nevada", point: [39.5, -117.1], direction: "right" },
];

const cities: { label: string; point: [number, number]; direction: LabelDirection }[] = [
  { label: "Sparks", point: [39.5349, -119.7527], direction: "bottom" },
  { label: "Los Angeles", point: [34.0522, -118.2437], direction: "left" },
  { label: "San Diego", point: [32.7157, -117.1611], direction: "bottom" },
];

const BOUNDS_POINTS: [number, number][] = [
  PORTLAND,
  ...connections.map((c) => c.point),
  ...cities.map((c) => c.point),
];

const FIT_OPTIONS = {
  paddingTopLeft: [40, 96] as [number, number],
  paddingBottomRight: [40, 96] as [number, number],
  maxZoom: 6,
};

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
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        className: "coverage-map-tiles",
      }).addTo(map);

      const tooltipOffset = (direction: LabelDirection): [number, number] =>
        direction === "bottom" ? [0, 9] : direction === "left" ? [-9, 0] : direction === "right" ? [9, 0] : [0, -9];

      connections.forEach(({ label, point, direction }) => {
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
            direction,
            className: "coverage-map-label",
            offset: tooltipOffset(direction),
          });
      });

      cities.forEach(({ label, point, direction }) => {
        L.polyline([PORTLAND, point], {
          color: "#2d5a3a",
          weight: 1.5,
          opacity: 0.45,
          dashArray: "2 8",
        }).addTo(map);

        L.circleMarker(point, {
          radius: 4,
          color: "#f3efe4",
          weight: 3,
          fillColor: "#2d5a3a",
          fillOpacity: 1,
        })
          .addTo(map)
          .bindTooltip(label, {
            permanent: true,
            direction,
            className: "coverage-map-label coverage-map-label--city",
            offset: tooltipOffset(direction),
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
          direction: "bottom",
          className: "coverage-map-label coverage-map-label--hub",
          offset: [0, 14],
        });

      map.fitBounds(BOUNDS_POINTS, FIT_OPTIONS);

      mapRef.current = map;
      requestAnimationFrame(() => {
        map.invalidateSize();
        map.fitBounds(BOUNDS_POINTS, FIT_OPTIONS);
      });
    }

    initialiseMap();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  function resetView() {
    mapRef.current?.fitBounds(BOUNDS_POINTS, { ...FIT_OPTIONS, animate: true });
  }

  return (
    <div className="coverage-map-shell relative min-h-[540px] overflow-hidden border border-forest/15 bg-[#dcdccb] shadow-[0_24px_70px_rgba(23,52,32,0.13)] sm:min-h-[560px]">
      <div
        ref={containerRef}
        role="region"
        aria-label="Interactive OpenStreetMap showing Oregon Swift regional coverage from Portland to Washington, Idaho, California, and Nevada, including Sparks, Los Angeles, and San Diego"
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
        <span className="flex items-center gap-2"><i className="size-2 rounded-full border-2 border-[#f3efe4] bg-[#2d5a3a] shadow-[0_0_0_1px_#173420]" />Service city</span>
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
        .coverage-map-shell .coverage-map-label--city {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.03em;
          padding: 3px 6px;
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
