import { afterEach, describe, expect, it, vi } from "vitest";
import { geocodeToLatLng } from "./geocode";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("geocodeToLatLng", () => {
  it("returns null for empty input", async () => {
    expect(await geocodeToLatLng("")).toBeNull();
    expect(await geocodeToLatLng("   ")).toBeNull();
  });

  it("parses a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ lat: "45.52", lon: "-122.68" }],
      })
    );

    expect(await geocodeToLatLng("Portland, OR")).toEqual({ lat: 45.52, lng: -122.68 });
  });

  it("returns null when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    expect(await geocodeToLatLng("Nowhere Unique 999")).toBeNull();
  });

  it("returns null on a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => [] })
    );

    expect(await geocodeToLatLng("Bad Response Place")).toBeNull();
  });

  it("ignores malformed coordinate values", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => [{ lat: "n/a", lon: "n/a" }] })
    );

    expect(await geocodeToLatLng("Malformed Place")).toBeNull();
  });

  it("caches negative results", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", fetchMock);

    await geocodeToLatLng("Repeated Missing Place");
    await geocodeToLatLng("Repeated Missing Place");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
