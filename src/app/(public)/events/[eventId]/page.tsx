import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { eventId } = await params;
  redirect(`/gallery/${eventId}`);
}
