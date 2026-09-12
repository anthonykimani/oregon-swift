"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { geocodeAddress, haversineMiles } from "@/lib/geocode";
import {
  messagingSocket,
  type LocationUpdatePayload,
} from "@/lib/messaging/socket-client";
import type { CourierLocation } from "@/components/shared/tracking/types";

export interface LiveCourierTracking {
  location: CourierLocation | null;
  etaMinutes: number | null;
  etaDistanceMiles: number | null;
  etaSource: "osrm" | "haversine" | null;
}

const FALLBACK_SPEED_MPH = 45;

interface EtaEstimate {
  etaMinutes: number;
  etaDistanceMiles: number;
  etaSource: "osrm" | "haversine";
}

function fallbackEta(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): EtaEstimate {
  const distanceMiles = haversineMiles([fromLat, fromLng], [toLat, toLng]);
  return {
    etaMinutes: Math.round((distanceMiles / FALLBACK_SPEED_MPH) * 60),
    etaDistanceMiles: distanceMiles,
    etaSource: "haversine",
  };
}

/**
 * Tracks a courier's live position for a selected shipment: seeds from the
 * latest stored location, then follows `location:update` socket events, and
 * computes a live ETA to the dropoff address via /route/estimate (with a
 * straight-line fallback when the API is unavailable).
 */
export function useLiveCourierTracking(
  token?: string,
  courierId?: string | null,
  dropoffAddress?: string | null,
  baseLocation?: CourierLocation | null
): LiveCourierTracking {
  // Socket location is stored keyed by courierId so stale values self-invalidate
  // when the selected shipment changes (no synchronous reset needed).
  const [socketLocation, setSocketLocation] = useState<{
    courierId: string;
    location: CourierLocation;
  } | null>(null);

  // Dropoff coordinates are keyed by the address string for the same reason.
  const [dropoffState, setDropoffState] = useState<{
    key: string;
    coords: [number, number];
  } | null>(null);

  // ETA is keyed by the location+dropoff it was computed for.
  const [etaState, setEtaState] = useState<{ key: string } & EtaEstimate | null>(null);

  useEffect(() => {
    if (!token || !courierId) return;

    messagingSocket.connect(token);
    const onLocation = (payload: LocationUpdatePayload) => {
      if (payload.courierId !== courierId) return;
      setSocketLocation({
        courierId,
        location: {
          lat: payload.lat,
          lng: payload.lng,
          accuracy: payload.accuracy,
          speed: payload.speed,
          recordedAt: payload.recordedAt,
        },
      });
    };
    messagingSocket.onLocationUpdate(onLocation);
    return () => {
      messagingSocket.offLocationUpdate(onLocation);
    };
  }, [token, courierId]);

  useEffect(() => {
    if (!dropoffAddress) return;
    let cancelled = false;
    geocodeAddress(dropoffAddress).then((coords) => {
      if (!cancelled && coords) setDropoffState({ key: dropoffAddress, coords });
    });
    return () => {
      cancelled = true;
    };
  }, [dropoffAddress]);

  const location =
    (socketLocation && socketLocation.courierId === courierId
      ? socketLocation.location
      : null) ??
    baseLocation ??
    null;

  const dropoff =
    dropoffState && dropoffState.key === dropoffAddress ? dropoffState.coords : null;

  const etaKey =
    location && dropoff
      ? `${location.recordedAt}|${dropoff[0]},${dropoff[1]}`
      : null;

  useEffect(() => {
    if (!location || !dropoff || !etaKey) return;
    let cancelled = false;

    const fromLat = location.lat;
    const fromLng = location.lng;
    const [toLat, toLng] = dropoff;

    const apply = (estimate: EtaEstimate) => {
      if (!cancelled) setEtaState({ key: etaKey, ...estimate });
    };

    api<{ distanceMiles: number; durationMinutes: number; source: string }>(
      `/route/estimate?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`,
      { token }
    )
      .then((res) => {
        if (cancelled) return;
        if (res.status === 200 && res.data) {
          apply({
            etaMinutes: res.data.durationMinutes,
            etaDistanceMiles: res.data.distanceMiles,
            etaSource: res.data.source === "osrm" ? "osrm" : "haversine",
          });
        } else {
          apply(fallbackEta(fromLat, fromLng, toLat, toLng));
        }
      })
      .catch(() => apply(fallbackEta(fromLat, fromLng, toLat, toLng)));

    return () => {
      cancelled = true;
    };
  }, [location, dropoff, etaKey, token]);

  const eta = etaState && etaState.key === etaKey ? etaState : null;

  return {
    location,
    etaMinutes: eta?.etaMinutes ?? null,
    etaDistanceMiles: eta?.etaDistanceMiles ?? null,
    etaSource: eta?.etaSource ?? null,
  };
}
