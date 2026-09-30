import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    let fetchUrl = targetUrl;
    if (targetUrl.startsWith("/")) {
      const origin = new URL(request.url).origin;
      fetchUrl = `${origin}${targetUrl}`;
    }

    const res = await fetch(fetchUrl);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream fetch failed: ${res.statusText}` },
        { status: res.status }
      );
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await res.arrayBuffer();

    return new Response(new Uint8Array(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to proxy image" },
      { status: 500 }
    );
  }
}
