"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, forward this to whatever error-tracking service is set up.
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        This gallery hit a snag loading. Try again, or come back in a moment.
      </p>
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
