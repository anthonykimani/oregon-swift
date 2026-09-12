export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Minimal server-side forward geocoder using the public Nominatim endpoint.
 * Used for coarse live-ETA anchors (dropoff) when no stored coordinate exists.
 * Returns null on any failure so callers can fall back to zone centers.
 */
export async function geocodeToLatLng(query: string): Promise<LatLng | null> {
  if (!query || !query.trim()) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
      query.trim()
    )}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "oregon-courier-api/0.1" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { lat?: string; lon?: string }[];
    if (Array.isArray(data) && data.length > 0) {
      const lat = parseFloat(String(data[0].lat ?? ""));
      const lng = parseFloat(String(data[0].lon ?? ""));
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return { lat, lng };
      }
    }
  } catch {
    // ignore
  }
  return null;
}
