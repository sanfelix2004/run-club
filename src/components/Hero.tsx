"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleCanvas } from "@/components/ParticleCanvas";
import { SITE } from "@/lib/constants";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <motion.div style={{ y: yBg }} className="absolute inset-0">
        <ParticleCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/60 via-white/40 to-white" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-forest/10 blur-3xl" />
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
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-emerald-700 backdrop-blur-sm"
          >
            <MapPin className="h-3.5 w-3.5" />
            Giovinazzo, Puglia — Adriatic coast
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl font-bold leading-[1.1] tracking-tight text-forest sm:text-6xl lg:text-7xl"
          >
            {SITE.tagline}
            <span className="block text-emerald-500">together.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-forest/70"
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
              className="rounded-full bg-emerald-500 px-8 text-white hover:bg-emerald-600"
              onClick={() => scrollTo("#booking")}
            >
              Book Your First Run
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-emerald-200 bg-white/70 px-8 text-forest backdrop-blur-sm hover:bg-emerald-50"
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
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-forest/50 transition-colors hover:text-emerald-500"
          aria-label="Scroll to about section"
        >
          <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </motion.button>
      </motion.div>
    </section>
  );
}
