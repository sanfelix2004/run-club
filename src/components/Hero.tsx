"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroVideoBackground } from "@/components/HeroVideoBackground";
import { SITE } from "@/lib/constants";

const REVEAL = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden bg-forest"
    >
      {/* Video — nascosto finché non è pronto */}
      <motion.div
        style={{ y: yBg, scale }}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={REVEAL}
      >
        <HeroVideoBackground onReady={handleReady} />
      </motion.div>

      {/* Testo — appare insieme al video */}
      <motion.div
        style={{ y: yContent, opacity: scrollOpacity }}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 py-32 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 16 }}
          transition={REVEAL}
        >
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-4 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5 text-emerald-300" />
            Giovinazzo, Puglia — Adriatic coast
          </p>

          <h1
            className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl"
            style={{
              textShadow:
                "0 2px 20px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.5)",
            }}
          >
            {SITE.tagline}
            <span className="block text-emerald-300">together.</span>
          </h1>

          <p className="mt-6 max-w-lg rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-lg leading-relaxed text-white shadow-xl backdrop-blur-sm">
            {SITE.description}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              size="lg"
              className="rounded-full bg-emerald-500 px-8 text-white shadow-lg shadow-black/30 hover:bg-emerald-400"
              onClick={() => scrollTo("#booking")}
            >
              Book Your First Run
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-black/30 px-8 text-white shadow-lg backdrop-blur-md hover:bg-black/50"
              onClick={() => scrollTo("#sessions")}
            >
              See Sessions
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => scrollTo("#about")}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/70 transition-colors hover:text-emerald-300"
          aria-label="Scroll to about section"
        >
          <span className="text-xs font-medium uppercase tracking-widest drop-shadow-md">
            Scroll
          </span>
          <ArrowDown className="h-4 w-4 animate-bounce drop-shadow-md" />
        </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
