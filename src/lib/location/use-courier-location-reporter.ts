"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface PositionFix {
  lat: number;
  lng: number;
  accuracy: number | null;
  speed: number | null;
}

const MIN_INTERVAL_MS = 10_000;
const MOVEMENT_THRESHOLD_M = 20;

function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Streams the courier's browser GPS position to the API while enabled (online).
 * Sends at most one fix per MIN_INTERVAL_MS, and only when the position moved
 * meaningfully from the last sent fix. Presence (`lastSeenAt`) is bumped by the
 * API on every accepted request, so an active driver stays "online" even between
 * broadcasted fixes.
 */
export function useCourierLocationReporter(token?: string, enabled: boolean = false) {
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<PositionFix | null>(null);
  const lastSentAtRef = useRef<number>(0);
  const errorNotifiedRef = useRef(false);

  const send = useCallback(
    async (fix: PositionFix) => {
      if (!token) return;
      try {
        await api("/courier/location", {
          method: "POST",
          token,
          body: JSON.stringify(fix),
        });
      } catch {
        // Swallow transient network errors; the next fix retries naturally.
      }
    },
    [token]
  );

  useEffect(() => {
    if (!token || !enabled) return;

    if (!("geolocation" in navigator)) {
      if (!errorNotifiedRef.current) {
        errorNotifiedRef.current = true;
        toast.error("Geolocation isn't supported by this browser");
      }
      return;
    }

    errorNotifiedRef.current = false;
    lastSentRef.current = null;
    lastSentAtRef.current = 0;

    const onPosition = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy, speed } = pos.coords;
      const fix: PositionFix = {
        lat: latitude,
        lng: longitude,
        accuracy: Number.isFinite(accuracy) ? accuracy : null,
        speed: Number.isFinite(speed as number) ? (speed as number) : null,
      };

      const now = Date.now();
      const elapsed = now - lastSentAtRef.current;
      const last = lastSentRef.current;
      const moved =
        !last || haversineMeters(last.lat, last.lng, fix.lat, fix.lng) >= MOVEMENT_THRESHOLD_M;

      if (elapsed < MIN_INTERVAL_MS && !moved) return;

      lastSentRef.current = fix;
      lastSentAtRef.current = now;
      void send(fix);
    };

    const onError = (err: GeolocationPositionError) => {
      if (errorNotifiedRef.current) return;
      errorNotifiedRef.current = true;
      const message =
        err.code === err.PERMISSION_DENIED
          ? "Location access denied — enable it in your browser to be visible to dispatch."
          : err.code === err.POSITION_UNAVAILABLE
            ? "Your location is temporarily unavailable."
            : "Couldn't read your location right now.";
      toast.error(message);
    };

    const watchId = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 5_000,
      timeout: 15_000,
    });
    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [token, enabled, send]);

  return null;
}
