"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessagesView } from "@/components/messages/messages-view";

function AdminMessagesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("thread");

  return (
    <MessagesView
      token={session?.accessToken}
      myId={session?.user?.id || ""}
      myRole={session?.user?.role || "admin"}
      basePath="/admin/messages"
      initialConversationId={threadId}
    />
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <AdminMessagesContent />
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
