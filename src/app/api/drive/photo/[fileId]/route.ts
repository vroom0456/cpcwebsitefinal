import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await props.params;

  if (!fileId) {
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
  }

  // Fast 307 redirect directly to Google's globally distributed Edge CDN
  // Browser follows this in milliseconds and caches the 80KB image locally
  const response = NextResponse.redirect(
    `https://lh3.googleusercontent.com/d/${fileId}=s1200`,
    { status: 307 }
  );

  response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return response;
}

