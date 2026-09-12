export interface RouteEstimate {
  distanceMiles: number;
  durationMinutes: number;
  source: "osrm" | "haversine";
}

const EARTH_RADIUS_MI = 3958.8;
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";
const OSRM_TIMEOUT_MS = 2500;
const FALLBACK_SPEED_MPH = 45;

const CACHE_TTL_MS = 30_000;
const MAX_CACHE_ENTRIES = 500;

interface CacheEntry {
  expiresAt: number;
  value: RouteEstimate;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<RouteEstimate>>();

export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(a));
}

function cacheKey(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): string {
  return [fromLat, fromLng, toLat, toLng].map((n) => n.toFixed(4)).join(":");
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

async function computeRouteDuration(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<RouteEstimate> {
  const distanceMiles = haversineMiles(fromLat, fromLng, toLat, toLng);

  try {
    const url = `${OSRM_URL}/${fromLng},${fromLat};${toLng},${toLat}?overview=false&alternatives=false`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = (await res.json()) as {
        routes?: { duration?: number; distance?: number }[];
      };
      const route = data?.routes?.[0];
      if (route && typeof route.duration === "number") {
        return {
          distanceMiles:
            typeof route.distance === "number" ? route.distance / 1609.344 : distanceMiles,
          durationMinutes: Math.round(route.duration / 60),
          source: "osrm",
        };
      }
    }
  } catch {
    // Fall through to the naive estimate below.
  }

  return {
    distanceMiles,
    durationMinutes: Math.round((distanceMiles / FALLBACK_SPEED_MPH) * 60),
    source: "haversine",
  };
}

/**
 * Estimate driving distance and duration between two coordinates.
 * Prefers the free OSRM public server; falls back to a naive straight-line
 * estimate at 45 mph when OSRM is unreachable or times out.
 *
 * Results are cached briefly and concurrent identical requests are coalesced
 * so public tracking cannot amplify load on the external routing service.
 */
export async function estimateRouteDuration(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<RouteEstimate> {
  const key = cacheKey(fromLat, fromLng, toLat, toLng);

  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = computeRouteDuration(fromLat, fromLng, toLat, toLng)
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
