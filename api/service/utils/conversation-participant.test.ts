import { describe, expect, it } from "vitest";
import { isConversationParticipant } from "./conversation-participant";

const conversation = {
  customerId: "customer-1",
  courierId: "courier-1",
  adminId: "admin-1",
};

describe("isConversationParticipant", () => {
  it("accepts each participant role", () => {
    expect(isConversationParticipant(conversation, "customer-1")).toBe(true);
    expect(isConversationParticipant(conversation, "courier-1")).toBe(true);
    expect(isConversationParticipant(conversation, "admin-1")).toBe(true);
  });

  it("rejects non-participants", () => {
    expect(isConversationParticipant(conversation, "stranger")).toBe(false);
  });

  it("rejects missing conversation or user", () => {
    expect(isConversationParticipant(null, "customer-1")).toBe(false);
    expect(isConversationParticipant(undefined, "customer-1")).toBe(false);
    expect(isConversationParticipant(conversation, null)).toBe(false);
    expect(isConversationParticipant(conversation, undefined)).toBe(false);
  });

  it("handles conversations with unset participants", () => {
    const partial = { customerId: "customer-1", courierId: null, adminId: null };
    expect(isConversationParticipant(partial, "customer-1")).toBe(true);
    expect(isConversationParticipant(partial, "courier-1")).toBe(false);
  });
});
