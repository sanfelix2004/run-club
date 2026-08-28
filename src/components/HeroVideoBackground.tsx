"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/videos/kling_20260828_VIDEO_Cinematic__4944_0.mp4";

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = async () => {
      try {
        await video.play();
        setReady(true);
      } catch {
        setFailed(true);
      }
    };

    play();

    const onCanPlay = () => setReady(true);
    const onError = () => setFailed(true);

    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-forest">
      {!failed && (
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            className={`absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-1000 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: "translate(-50%, -50%) scale(1.25)",
              objectPosition: "center 36%",
            }}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        </div>
      )}

      <div className="absolute inset-0 bg-forest/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest/75 via-forest/30 to-forest/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-forest/35 via-transparent to-[#FAFDFB]/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#FAFDFB] via-transparent to-transparent" />

      <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

      {failed && (
        <div className="absolute inset-0 bg-gradient-to-br from-forest via-emerald-900 to-emerald-800" />
      )}
    </div>
  );
}
