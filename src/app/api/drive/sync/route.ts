import { NextResponse } from "next/server";
import { requireCoreCommittee } from "@/lib/auth/require-admin";
import { syncEventPhotos } from "@/lib/drive/drive.service";

export async function POST(request: Request) {
  const auth = await requireCoreCommittee();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  let eventId: string;
  try {
    const body = await request.json();
    eventId = body.eventId;
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!eventId) return NextResponse.json({ error: "eventId is required" }, { status: 400 });

  try {
    const report = await syncEventPhotos(eventId);
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
