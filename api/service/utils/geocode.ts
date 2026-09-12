export interface LatLng {
  lat: number;
  lng: number;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const GEOCODE_TIMEOUT_MS = 2500;
const CACHE_TTL_MS = 5 * 60_000;
const MAX_CACHE_ENTRIES = 500;

// Nominatim's usage policy requires an identifying User-Agent with a contact
// URL. Override via env in deployments.
const USER_AGENT =
  process.env.GEOCODE_USER_AGENT ||
  "oregon-courier-api/0.1 (+https://oregonswiftdeliveries.com)";

interface CacheEntry {
  expiresAt: number;
  value: LatLng | null;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<LatLng | null>>();

function normalize(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

function pruneCache() {
  if (cache.size <= MAX_CACHE_ENTRIES) return;
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

async function fetchLatLng(query: string): Promise<LatLng | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);
    const url = `${NOMINATIM_URL}?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timer);
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

/**
 * Minimal server-side forward geocoder using the public Nominatim endpoint.
 * Used as a legacy fallback for deliveries without stored coordinates.
 * Results (including negative results) are cached to avoid hammering the
 * public endpoint, and concurrent identical lookups are coalesced.
 */
export async function geocodeToLatLng(query: string): Promise<LatLng | null> {
  if (!query || !query.trim()) return null;

  const key = normalize(query);

  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = fetchLatLng(query.trim())
    .then((value) => {
      cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
      pruneCache();
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}
