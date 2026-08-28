import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const FILENAME = "kling_20260828_VIDEO_Cinematic__4944_0.mp4";
const MAX_BYTES = 200 * 1024 * 1024; // 200 MB

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

    if (!file.type.startsWith("video/") && !file.name.toLowerCase().endsWith(".mp4") && !file.name.toLowerCase().endsWith(".mov")) {
      return NextResponse.json(
        { error: "Il file deve essere un video (MP4 o MOV)." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File troppo grande (max 200 MB)." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const downloadDir = path.join(process.cwd(), "download");
    const publicDir = path.join(process.cwd(), "public", "videos");

    await mkdir(downloadDir, { recursive: true });
    await mkdir(publicDir, { recursive: true });

    const downloadPath = path.join(downloadDir, FILENAME);
    const publicPath = path.join(publicDir, FILENAME);

    await writeFile(downloadPath, buffer);
    await writeFile(publicPath, buffer);

    return NextResponse.json({
      success: true,
      message: "Video caricato con successo!",
      size: file.size,
      path: `download/${FILENAME}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Errore durante il caricamento. Riprova." },
      { status: 500 },
    );
  }
}

export async function GET() {
  const downloadPath = path.join(process.cwd(), "download", FILENAME);
  const exists = existsSync(downloadPath);

  return NextResponse.json({
    uploaded: exists,
    filename: FILENAME,
  });
}
