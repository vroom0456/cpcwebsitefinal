import { redirect } from "next/navigation";

interface EditEventPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { eventId } = await params;
  redirect(`/admin/events/${eventId}`);
}
