export interface ConversationSummary {
  id: string;
  threadKey: string;
  deliveryId: string | null;
  subject: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  otherName: string | null;
  otherRole: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  body: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  name: string | null;
}

export interface ThreadParticipants {
  customer: Participant | null;
  courier: Participant | null;
  admin: Participant | null;
}

export interface Conversation {
  id: string;
  threadKey: string;
  deliveryId: string | null;
  customerId: string | null;
  courierId: string | null;
  adminId: string | null;
  subject: string | null;
  createdById: string;
  createdByIdRole: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  customerReadAt: string | null;
  courierReadAt: string | null;
  adminReadAt: string | null;
}

export interface ThreadDetail {
  conversation: Conversation;
  messages: Message[];
  participants: ThreadParticipants;
}

export interface NewMessagePayload {
  conversationId: string;
  message: Message;
}