export interface LatLngRecord {
  lat: number;
  lng: number;
  recordedAt?: Date | string;
}

// Public tracking is unauthenticated, so courier position is deliberately
// coarse (~1 km at 2 decimals) to avoid exposing a driver's exact location.
export const COARSE_DECIMALS = 2;
export const COURIER_NEARBY_MILES = 1;

export function roundCoord(value: number, decimals = COARSE_DECIMALS): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function coarseLocation(location: LatLngRecord | null | undefined): {
  lat: number;
  lng: number;
  recordedAt?: Date | string;
} | null {
  if (!location) return null;
  return {
    lat: roundCoord(location.lat),
    lng: roundCoord(location.lng),
    recordedAt: location.recordedAt,
  };
}

export function isCourierNearby(distanceMiles: number | null | undefined): boolean {
  return distanceMiles != null && distanceMiles <= COURIER_NEARBY_MILES;
}
