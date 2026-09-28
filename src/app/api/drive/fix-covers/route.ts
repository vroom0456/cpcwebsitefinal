import { NextResponse } from "next/server";
import { fixAllEventCoverPhotosAction } from "@/lib/actions/events.actions";
import { requireCoreCommittee } from "@/lib/auth/require-admin";

export async function POST() {
  const auth = await requireCoreCommittee();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const result = await fixAllEventCoverPhotosAction();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fix covers failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
