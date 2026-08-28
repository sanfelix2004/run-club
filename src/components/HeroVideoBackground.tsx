"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const VIDEO_SRC = "/videos/hero-run.mp4";

type HeroVideoBackgroundProps = {
  onReady: () => void;
};

export function HeroVideoBackground({ onReady }: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readyCalled = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => {
      if (readyCalled.current) return;
      readyCalled.current = true;
      video.play().catch(() => {});
      onReady();
    };

    const onLoadedData = () => markReady();
    const onCanPlay = () => markReady();
    const onError = () => markReady(); // mostra comunque il testo se il video fallisce

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);

    video.load();

    if (video.readyState >= 2) markReady();

    return () => {
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
    };
  }, [onReady]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          transform: "scale(1.25)",
          objectPosition: "center 36%",
        }}
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/75 to-forest/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-forest/50 via-transparent to-[#FFFBF7]/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#FFFBF7] via-transparent to-transparent" />

      <noscript>
        <Link
          href="/upload-video"
          className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white"
        >
          Video non disponibile
        </Link>
      </noscript>
    </div>
  );
}
