"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const VIDEO_SRC = "/videos/kling_20260828_VIDEO_Cinematic__4944_0.mp4";

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      setReady(true);
      video.play().catch(() => {
        /* autoplay blocked — video still visible on interaction */
      });
    };

    const onLoadedData = () => tryPlay();
    const onError = () => setFailed(true);

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("error", onError);

    if (video.readyState >= 2) tryPlay();

    return () => {
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("error", onError);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-forest">
      {!failed && (
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: "scale(1.25)",
              objectPosition: "center 36%",
            }}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        </div>
      )}

      <div className="absolute inset-0 bg-forest/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest/60 via-forest/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-forest/25 via-transparent to-[#FAFDFB]/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#FAFDFB] via-transparent to-transparent" />

      {failed && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-forest via-emerald-900 to-emerald-800" />
          <div className="absolute bottom-24 left-1/2 z-20 w-full max-w-sm -translate-x-1/2 px-4">
            <Link
              href="/upload-video"
              className="block rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-sm text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              Video non caricato — clicca qui per caricarlo
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
