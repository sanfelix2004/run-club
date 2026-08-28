import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "videos", "hero-run.mp4");

  if (!existsSync(filePath)) {
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
