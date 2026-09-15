import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";

const mocks = vi.hoisted(() => ({
  getRepository: vi.fn(),
}));

vi.mock("../configs/ormconfig", () => ({
  default: { getRepository: mocks.getRepository },
}));

import DashboardController from "./dashboard.controller";

function mockResponse() {
  const send = vi.fn();
  return { response: { send } as unknown as Response, send };
}

function mockRequest(customerId?: string) {
  return { user: customerId ? { id: customerId } : undefined } as unknown as Request;
}

function repositories(attentionDelivery: Record<string, unknown> | null) {
  const deliveryRepo = {
    count: vi.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(1),
    findOne: vi.fn().mockResolvedValue(attentionDelivery),
    find: vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([]),
  };
  const queryBuilder = {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    getRawOne: vi.fn().mockResolvedValue({ total: "12500" }),
  };
  const invoiceRepo = { createQueryBuilder: vi.fn().mockReturnValue(queryBuilder) };
  const trackingRepo = { find: vi.fn() };
  mocks.getRepository
    .mockReturnValueOnce(deliveryRepo)
    .mockReturnValueOnce(invoiceRepo)
    .mockReturnValueOnce(trackingRepo);
  return { deliveryRepo };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DashboardController.stats attentionDelivery", () => {
  it("selects the most recently updated active delivery for the authenticated customer", async () => {
    const active = { id: "delivery-1", customerId: "customer-1", status: "in-transit" };
    const { deliveryRepo } = repositories(active);
    const { response, send } = mockResponse();

    await DashboardController.stats(mockRequest("customer-1"), response);

    const options = deliveryRepo.findOne.mock.calls[0][0];
    expect(options.where.customerId).toBe("customer-1");
    expect(options.where.status._type).toBe("not");
    expect(options.where.status._value._type).toBe("in");
    expect(options.where.status._value._value).toEqual(["delivered", "cancelled"]);
    expect(options.order).toEqual({ updatedAt: "DESC" });
    expect(send.mock.calls[0][0]).toMatchObject({
      status: 200,
      data: { attentionDelivery: active, activeDeliveries: 2, pendingPickups: 1, totalSpentCents: 12500 },
    });
  });

  it("returns null when the customer has no active delivery", async () => {
    repositories(null);
    const { response, send } = mockResponse();

    await DashboardController.stats(mockRequest("customer-2"), response);

    expect(send.mock.calls[0][0].status).toBe(200);
    expect(send.mock.calls[0][0].data.attentionDelivery).toBeNull();
  });

  it("rejects requests without an authenticated customer", async () => {
    const { response, send } = mockResponse();

    await DashboardController.stats(mockRequest(), response);

    expect(send.mock.calls[0][0]).toMatchObject({ status: 401, data: null });
    expect(mocks.getRepository).not.toHaveBeenCalled();
  });
});
