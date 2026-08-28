#!/usr/bin/env bash
# Copy hero video into public folder (run from project root)
set -euo pipefail

DEST="public/videos/kling_20260828_VIDEO_Cinematic__4944_0.mp4"
SOURCES=(
  "$HOME/Downloads/kling_20260828_VIDEO_Cinematic__4944_0.mp4"
  "/Users/frasanf004/Downloads/kling_20260828_VIDEO_Cinematic__4944_0.mp4"
  "download/kling_20260828_VIDEO_Cinematic__4944_0.mp4"
)

for src in "${SOURCES[@]}"; do
  if [ -f "$src" ]; then
    mkdir -p public/videos
    cp "$src" "$DEST"
    echo "✓ Video copiato in $DEST ($(du -h "$DEST" | cut -f1))"
    exit 0
  fi
done

echo "File non trovato. Carica il video in:"
echo "  public/videos/kling_20260828_VIDEO_Cinematic__4944_0.mp4"
exit 1
