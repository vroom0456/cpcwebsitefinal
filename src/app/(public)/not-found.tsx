import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-6xl font-semibold tracking-tight">404</p>
      <h1 className="mt-4 text-xl font-medium">This gallery wandered off frame</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The event or photo you're looking for doesn't exist, or hasn't been published yet.
      </p>
      <Link href="/events" className="mt-6">
        <Button>Browse events</Button>
      </Link>
    </div>
  );
}
