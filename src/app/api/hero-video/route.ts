import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const FILENAME = "kling_20260828_VIDEO_Cinematic__4944_0.mp4";

const CANDIDATES = [
  path.join(process.cwd(), "download", FILENAME),
  path.join(process.cwd(), "public", "videos", FILENAME),
];

export async function GET() {
  const filePath = CANDIDATES.find((p) => existsSync(p));

  if (!filePath) {
    return NextResponse.json(
      {
        error: "Video non trovato",
        hint: `Metti il file in: download/${FILENAME}`,
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
