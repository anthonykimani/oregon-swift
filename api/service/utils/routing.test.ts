import { afterEach, describe, expect, it, vi } from "vitest";
import { estimateRouteDuration, haversineMiles } from "./routing";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("haversineMiles", () => {
  it("is zero for identical points", () => {
    expect(haversineMiles(45.5, -122.6, 45.5, -122.6)).toBeCloseTo(0, 6);
  });

  it("approximates one degree of longitude at the equator", () => {
    // 3958.8 * (pi / 180) ≈ 69.09 miles
    expect(haversineMiles(0, 0, 0, 1)).toBeCloseTo(69.09, 1);
  });
});

describe("estimateRouteDuration", () => {
  it("uses OSRM when a route is returned", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ routes: [{ duration: 600, distance: 3218.688 }] }),
      })
    );

    const result = await estimateRouteDuration(45.5, -122.6, 45.6, -122.7);

    expect(result.source).toBe("osrm");
    expect(result.durationMinutes).toBe(10);
    expect(result.distanceMiles).toBeCloseTo(2, 1);
  });

  it("falls back to haversine at 45mph when OSRM fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const fromLat = 45.51;
    const fromLng = -122.61;
    const toLat = 45.61;
    const toLng = -122.71;
    const straight = haversineMiles(fromLat, fromLng, toLat, toLng);

    const result = await estimateRouteDuration(fromLat, fromLng, toLat, toLng);

    expect(result.source).toBe("haversine");
    expect(result.distanceMiles).toBeCloseTo(straight, 5);
    expect(result.durationMinutes).toBe(Math.round((straight / 45) * 60));
  });

  it("falls back when OSRM returns no route", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ routes: [] }) })
    );

    const result = await estimateRouteDuration(40.1, -80.1, 40.2, -80.2);

    expect(result.source).toBe("haversine");
  });

  it("caches identical requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ routes: [{ duration: 300, distance: 1609.344 }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await estimateRouteDuration(41.1, -81.1, 41.2, -81.2);
    await estimateRouteDuration(41.1, -81.1, 41.2, -81.2);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("coalesces concurrent identical requests", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    const pending = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = vi.fn().mockReturnValue(pending);
    vi.stubGlobal("fetch", fetchMock);

    const first = estimateRouteDuration(42.1, -82.1, 42.2, -82.2);
    const second = estimateRouteDuration(42.1, -82.1, 42.2, -82.2);

    resolveFetch({ ok: true, json: async () => ({ routes: [{ duration: 120, distance: 800 }] }) });

    const [r1, r2] = await Promise.all([first, second]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(r1).toEqual(r2);
  });
});
