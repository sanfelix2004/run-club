#!/usr/bin/env bash
# Copy hero video into public folder (run from project root)
set -euo pipefail

DEST="public/videos/kling_20260828_VIDEO_Cinematic__4944_0.mp4"
DOWNLOAD_DEST="download/kling_20260828_VIDEO_Cinematic__4944_0.mp4"
SOURCES=(
  "$HOME/Downloads/kling_20260828_VIDEO_Cinematic__4944_0.mp4"
  "/Users/frasanf004/Downloads/kling_20260828_VIDEO_Cinematic__4944_0.mp4"
  "download/kling_20260828_VIDEO_Cinematic__4944_0.mp4"
)

for src in "${SOURCES[@]}"; do
  if [ -f "$src" ]; then
    mkdir -p public/videos download
    cp "$src" "$DOWNLOAD_DEST"
    cp "$src" "$DEST"
    echo "✓ Video copiato in download/ e public/videos/ ($(du -h "$DOWNLOAD_DEST" | cut -f1))"
    exit 0
  fi
done

echo "File non trovato. Trascina il video nella cartella:"
echo "  download/kling_20260828_VIDEO_Cinematic__4944_0.mp4"
exit 1
