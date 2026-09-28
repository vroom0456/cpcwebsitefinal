import { EventForm } from "@/components/admin/event-form";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function NewEventPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold">New event</h1>
      <EventForm submitLabel="Create event" />
    </div>
  );
}
