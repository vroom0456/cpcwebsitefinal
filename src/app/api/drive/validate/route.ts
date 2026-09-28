import { NextResponse } from "next/server";
import { requireCoreCommittee } from "@/lib/auth/require-admin";
import { validateDriveFolder } from "@/lib/drive/drive.service";

export async function POST(request: Request) {
  const auth = await requireCoreCommittee();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  let folderId: string;
  try {
    const body = await request.json();
    folderId = body.folderId;
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!folderId) return NextResponse.json({ error: "folderId is required" }, { status: 400 });

  const result = await validateDriveFolder(folderId);
  return NextResponse.json(result);
}
