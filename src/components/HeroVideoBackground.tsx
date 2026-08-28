"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const VIDEO_SRC = "/videos/hero-run.mp4";
const POSTER_SRC = "/videos/hero-poster.webp";

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      setReady(true);
      video.play().catch(() => {});
    };

    const onCanPlay = () => tryPlay();
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
      {/* Poster — visibile subito mentre il video carica */}
      <Image
        src={POSTER_SRC}
        alt=""
        fill
        priority
        className={`object-cover transition-opacity duration-700 ${
          ready && !failed ? "opacity-0" : "opacity-100"
        }`}
        style={{
          transform: "scale(1.25)",
          objectPosition: "center 36%",
        }}
        sizes="100vw"
        aria-hidden="true"
      />

      {!failed && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={POSTER_SRC}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: "scale(1.25)",
            objectPosition: "center 36%",
          }}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      {/* Overlay scuro a sinistra per leggibilità testo */}
      <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/75 to-forest/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-forest/50 via-transparent to-[#FAFDFB]/90" />
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
