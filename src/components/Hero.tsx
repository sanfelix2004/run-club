"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroVideoBackground } from "@/components/HeroVideoBackground";
import { SITE } from "@/lib/constants";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <motion.div style={{ y: yBg, scale }} className="absolute inset-0">
        <HeroVideoBackground />
      </motion.div>

      <motion.div
        style={{ y: yContent, opacity }}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 py-32 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md"
          >
            <MapPin className="h-3.5 w-3.5" />
            Giovinazzo, Puglia — Adriatic coast
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl"
          >
            {SITE.tagline}
            <span className="block text-emerald-400">together.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-white/85 drop-shadow-md"
          >
            {SITE.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button
              size="lg"
              className="rounded-full bg-emerald-500 px-8 text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-400"
              onClick={() => scrollTo("#booking")}
            >
              Book Your First Run
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 bg-white/10 px-8 text-white backdrop-blur-md hover:bg-white/20"
              onClick={() => scrollTo("#sessions")}
            >
              See Sessions
            </Button>
          </motion.div>
        </div>

        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          onClick={() => scrollTo("#about")}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60 transition-colors hover:text-emerald-300"
          aria-label="Scroll to about section"
        >
          <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </motion.button>
      </motion.div>
    </section>
  );
}
