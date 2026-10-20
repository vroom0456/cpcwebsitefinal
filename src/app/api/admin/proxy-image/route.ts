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

    const parsed = new URL(fetchUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
    }

    const host = parsed.hostname.toLowerCase();
    // Block loopback, internal network, and cloud metadata services
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "169.254.169.254" ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      host.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    ) {
      return NextResponse.json({ error: "Access to private network is forbidden" }, { status: 403 });
    }

    const res = await fetch(fetchUrl);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream fetch failed: ${res.statusText}` },
        { status: res.status }
      );
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Target is not an image" }, { status: 400 });
    }
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
