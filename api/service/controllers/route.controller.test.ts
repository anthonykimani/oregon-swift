import { afterEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import RouteController from "./route.controller";

interface MockRes {
  res: Response;
  send: ReturnType<typeof vi.fn>;
}

function mockRes(): MockRes {
  const send = vi.fn();
  return { res: { send } as unknown as Response, send };
}

function mockReq(query: Record<string, unknown>): Request {
  return { query } as unknown as Request;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("RouteController.estimate", () => {
  it("rejects missing coordinates", async () => {
    const { res, send } = mockRes();

    await RouteController.estimate(mockReq({}), res);

    const body = send.mock.calls[0][0];
    expect(body.status).toBe(400);
    expect(body.data).toBeNull();
  });

  it("rejects non-numeric coordinates", async () => {
    const { res, send } = mockRes();

    await RouteController.estimate(
      mockReq({ fromLat: "abc", fromLng: "0", toLat: "0", toLng: "0" }),
      res
    );

    expect(send.mock.calls[0][0].status).toBe(400);
  });

  it("rejects out-of-range coordinates", async () => {
    const { res, send } = mockRes();

    await RouteController.estimate(
      mockReq({ fromLat: "95", fromLng: "0", toLat: "0", toLng: "0" }),
      res
    );

    expect(send.mock.calls[0][0].status).toBe(400);
  });

  it("returns an estimate for valid coordinates", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { res, send } = mockRes();

    await RouteController.estimate(
      mockReq({ fromLat: "45.5", fromLng: "-122.6", toLat: "45.6", toLng: "-122.7" }),
      res
    );

    const body = send.mock.calls[0][0];
    expect(body.status).toBe(200);
    expect(body.data.source).toBe("haversine");
    expect(typeof body.data.durationMinutes).toBe("number");
    expect(typeof body.data.distanceMiles).toBe("number");
  });
});
