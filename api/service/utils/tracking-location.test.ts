import { describe, expect, it } from "vitest";
import {
  COARSE_DECIMALS,
  COURIER_NEARBY_MILES,
  coarseLocation,
  isCourierNearby,
  roundCoord,
} from "./tracking-location";

describe("roundCoord", () => {
  it("rounds to two decimals by default", () => {
    expect(roundCoord(45.123456)).toBe(45.12);
    expect(roundCoord(-122.987654)).toBe(-122.99);
  });

  it("respects a custom precision", () => {
    expect(roundCoord(1.23456, 3)).toBe(1.235);
  });

  it("exposes the public coarse precision", () => {
    expect(COARSE_DECIMALS).toBe(2);
  });
});

describe("coarseLocation", () => {
  it("returns null for missing locations", () => {
    expect(coarseLocation(null)).toBeNull();
    expect(coarseLocation(undefined)).toBeNull();
  });

  it("rounds coordinates and preserves the timestamp", () => {
    const recordedAt = new Date("2026-01-01T00:00:00.000Z");
    expect(coarseLocation({ lat: 45.123456, lng: -122.987654, recordedAt })).toEqual({
      lat: 45.12,
      lng: -122.99,
      recordedAt,
    });
  });
});

describe("isCourierNearby", () => {
  it("is false when distance is unknown", () => {
    expect(isCourierNearby(null)).toBe(false);
    expect(isCourierNearby(undefined)).toBe(false);
  });

  it("is true at or under the nearby threshold", () => {
    expect(isCourierNearby(0)).toBe(true);
    expect(isCourierNearby(COURIER_NEARBY_MILES)).toBe(true);
  });

  it("is false beyond the nearby threshold", () => {
    expect(isCourierNearby(COURIER_NEARBY_MILES + 0.1)).toBe(false);
  });
});
