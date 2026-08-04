"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessagesView } from "@/components/messages/messages-view";

function CourierMessagesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("thread");

  return (
    <MessagesView
      token={session?.accessToken}
      myId={session?.user?.id || ""}
      myRole={session?.user?.role || "courier"}
      basePath="/courier/messages"
      initialConversationId={threadId}
    />
  );
}

export default function CourierMessagesPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <CourierMessagesContent />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="h-full flex items-center justify-center bg-[#F5F4FD]">
      <p className="text-sm text-[#8094A7]">Loading messages...</p>
    </div>
  );
}
