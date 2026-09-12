export interface ConversationParticipants {
  customerId: string | null;
  courierId: string | null;
  adminId: string | null;
}

export function isConversationParticipant(
  conversation: ConversationParticipants | null | undefined,
  userId: string | null | undefined
): boolean {
  if (!conversation || !userId) return false;
  return (
    conversation.customerId === userId ||
    conversation.courierId === userId ||
    conversation.adminId === userId
  );
}
