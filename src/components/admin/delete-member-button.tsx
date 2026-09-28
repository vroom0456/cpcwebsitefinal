"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMember } from "@/lib/actions/members.actions";

export function DeleteMemberButton({ memberId, memberName }: { memberId: string; memberName: string }) {
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
      <span className="text-muted-foreground">Remove "{memberName}"?</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          startTransition(async () => {
            await deleteMember(memberId);
            router.push("/admin/team");
          })
        }
        disabled={isPending}
      >
        {isPending ? "Removing…" : "Confirm"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  );
}
