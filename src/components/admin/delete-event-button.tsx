"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteEvent } from "@/lib/actions/events.actions";

export function DeleteEventButton({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Delete "{eventTitle}" permanently?</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          startTransition(async () => {
            await deleteEvent(eventId);
            router.push("/admin/events");
          })
        }
        disabled={isPending}
      >
        {isPending ? "Deleting…" : "Confirm delete"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  );
}
