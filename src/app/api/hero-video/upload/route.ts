import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const FILENAME = "hero-run.mp4";
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB (Vercel-friendly)

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("video");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Nessun file selezionato." },
        { status: 400 },
      );
    }

    if (
      !file.type.startsWith("video/") &&
      !file.name.toLowerCase().endsWith(".mp4") &&
      !file.name.toLowerCase().endsWith(".mov")
    ) {
      return NextResponse.json(
        { error: "Il file deve essere un video (MP4 o MOV)." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File troppo grande (max 50 MB)." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicDir = path.join(process.cwd(), "public", "videos");
    await mkdir(publicDir, { recursive: true });
    const publicPath = path.join(publicDir, FILENAME);
    await writeFile(publicPath, buffer);

    return NextResponse.json({
      success: true,
      message: "Video caricato con successo!",
      size: file.size,
      path: `public/videos/${FILENAME}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Errore durante il caricamento. Riprova." },
      { status: 500 },
    );
  }
}

export async function GET() {
  const publicPath = path.join(process.cwd(), "public", "videos", FILENAME);
  return NextResponse.json({
    uploaded: existsSync(publicPath),
    filename: FILENAME,
  });
}
