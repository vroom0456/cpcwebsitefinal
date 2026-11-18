import { NextResponse } from "next/server";

/**
 * DECOMMISSIONED: Public unauthenticated Drive synchronization is disabled.
 * Drive synchronization is managed exclusively within CPC Admin Studio
 * by authenticated Core Committee administrators.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Forbidden: Public drive synchronization is disabled. Use CPC Admin Studio.",
    },
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Forbidden: Public drive synchronization is disabled. Use CPC Admin Studio.",
    },
    { status: 403 }
  );
}
