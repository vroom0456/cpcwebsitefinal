import { NextResponse } from "next/server";
import { requireCoreCommittee } from "@/lib/auth/require-admin";
import { syncAllDriveEvents } from "@/lib/drive/drive.service";

export async function POST(request: Request) {
  const auth = await requireCoreCommittee();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const report = await syncAllDriveEvents();
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Global sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
