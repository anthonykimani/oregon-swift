"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessagesView } from "@/components/messages/messages-view";

function CustomerMessagesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("thread");

  return (
    <MessagesView
      token={session?.accessToken}
      myId={session?.user?.id || ""}
      myRole={session?.user?.role || "customer"}
      basePath="/dashboard/messages"
      initialConversationId={threadId}
    />
  );
}

export default function CustomerMessagesPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <CustomerMessagesContent />
    </Suspense>
  );
}

function PageFallback() {
  return (
    <div className="h-full flex items-center justify-center bg-[#F3F5F1]">
      <p className="text-sm text-[#8094A7]">Loading messages...</p>
    </div>
  );
}
