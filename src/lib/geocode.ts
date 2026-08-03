export type LatLng = [number, number];

const NOMINATIM_MIN_GAP_MS = 1100;

function normalizeQuery(q: string): string {
  return q.trim().replace(/\s+/g, " ").toLowerCase();
}

const cache = new Map<string, LatLng | null>();
const inflight = new Map<string, Promise<LatLng | null>>();
let queue: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

function buildQueries(raw: string): string[] {
  const queries: string[] = [raw];

  const stripped = raw.replace(/\s*,\s*United States$/i, "").trim();
  if (stripped && stripped !== raw) queries.push(stripped);

  if (!/(\bOregon\b|\bOR\b)/i.test(raw)) queries.push(`${raw}, Oregon, USA`);

  return queries;
}

async function throttledFetch(url: string): Promise<Response> {
  const result = queue.then(async () => {
    const wait = Math.max(0, lastRequestAt + NOMINATIM_MIN_GAP_MS - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();
    return fetch(url);
  });
  queue = result.catch(() => undefined);
  return result;
}

async function fetchGeocode(query: string): Promise<LatLng | null> {
  const res = await throttledFetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
      query
    )}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }
  return null;
}

async function lookup(raw: string): Promise<LatLng | null> {
  for (const query of buildQueries(raw)) {
    const hit = await fetchGeocode(query);
    if (hit) return hit;
  }
  return null;
}

export async function geocodeAddress(q: string): Promise<LatLng | null> {
  if (!q) return null;

  const key = normalizeQuery(q);
  if (cache.has(key)) return cache.get(key) ?? null;

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = lookup(q)
    .then((result) => {
      cache.set(key, result);
      inflight.delete(key);
      return result;
    })
    .catch(() => {
      cache.set(key, null);
      inflight.delete(key);
      return null;
    });

  inflight.set(key, promise);
  return promise;
}

export function clearGeocodeCache() {
  cache.clear();
  inflight.clear();
  queue = Promise.resolve();
}

const EARTH_RADIUS_MI = 3958.8;

export function haversineMiles(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(h));
}

export function formatDistance(miles: number): string {
  if (miles >= 10) return `${Math.round(miles).toLocaleString()} mi`;
  return `${miles.toFixed(1)} mi`;
}

export function formatDurationHours(hours: number): string {
  if (hours <= 0) return "est.";
  if (hours < 24) {
    const h = Math.round(hours * 10) / 10;
    return `${h} hr${h === 1 ? "" : "s"}`;
  }
  const days = Math.floor(hours / 24);
  const rem = Math.round(hours % 24);
  return rem > 0 ? `${days}d ${rem}h` : `${days}d`;
}