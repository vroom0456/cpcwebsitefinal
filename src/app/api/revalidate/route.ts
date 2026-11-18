import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const REVALIDATION_SECRET =
  process.env.REVALIDATION_SECRET || "cpc-revalidation-secret-production-2026";

/**
 * Cross-application cache revalidation endpoint.
 * Called securely by CPC Admin Studio after database mutations so that
 * the public website's static caches reflect changes immediately.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, paths, tags } = body;

    if (!secret || secret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid revalidation secret" },
        { status: 401 }
      );
    }

    const revalidatedPaths: string[] = [];
    if (Array.isArray(paths)) {
      for (const p of paths) {
        if (typeof p === "string" && p.startsWith("/")) {
          revalidatePath(p);
          revalidatedPaths.push(p);
        }
      }
    }

    const revalidatedTags: string[] = [];
    if (Array.isArray(tags)) {
      for (const t of tags) {
        if (typeof t === "string" && t.trim()) {
          revalidateTag(t);
          revalidatedTags.push(t);
        }
      }
    }

    return NextResponse.json({
      revalidated: true,
      paths: revalidatedPaths,
      tags: revalidatedTags,
      timestamp: Date.now(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Revalidation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
