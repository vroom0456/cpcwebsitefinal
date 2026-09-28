import { NextResponse } from "next/server";
import { syncAllDriveEvents } from "@/lib/drive/drive.service";
import { requireCoreCommittee } from "@/lib/auth/require-admin";

export async function POST(request: Request) {
  try {
    const report = await syncAllDriveEvents();
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Global sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
