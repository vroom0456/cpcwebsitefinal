import { redirect } from "next/navigation";

interface AdminGalleryEventPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function AdminGalleryEventPage({ params }: AdminGalleryEventPageProps) {
  const { eventId } = await params;
  redirect(`/admin/events/${eventId}`);
}
