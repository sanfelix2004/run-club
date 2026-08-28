import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const PUBLIC_VIDEO = path.join(process.cwd(), "public", "videos", "hero-run.mp4");

export async function GET() {
  // Prefer the public hero video used by the site.
  const candidates = [
    PUBLIC_VIDEO,
    path.join(process.cwd(), "public", "videos", "kling_20260828_VIDEO_Cinematic__4944_0.mp4"),
  ];

  const filePath = candidates.find((p) => existsSync(p));

  if (!filePath) {
    return NextResponse.json(
      {
        error: "Video non trovato",
        hint: "Metti hero-run.mp4 in public/videos/",
      },
      { status: 404 },
    );
  }

  const buffer = await readFile(filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=3600",
      "Accept-Ranges": "bytes",
    },
  });
}
