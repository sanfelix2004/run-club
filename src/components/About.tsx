"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeIn } from "@/components/FadeIn";
import { SITE } from "@/lib/constants";

export function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);

  return (
    <section id="about" ref={ref} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
              L&apos;evento
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
              {SITE.name}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-forest/70">
              Una serata di corsa al tramonto sul lungomare di Giovinazzo. Un percorso leggero,
              atmosfera rilassata e un momento per correre insieme prima di festeggiare con sandwich
              e bevanda inclusi.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-forest/70">
              Niente pressione: che tu corra per la prima volta o da anni, l&apos;importante è
              godersi il tramonto e l&apos;energia della serata. Il punto di ritrovo viene
              comunicato prima dell&apos;11 settembre.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Tutti i livelli benvenuti",
                "Corsa al tramonto",
                "Sandwich e bevanda inclusi",
                "Prenotazione con QR code",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm font-medium text-forest shadow-sm"
                >
                  <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.15} className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-emerald-900/10">
              <motion.div style={{ y: imageY }} className="relative aspect-[4/5]">
                <Image
                  src="/images/giovinazzo-porto.jpg"
                  alt="Il porto di Giovinazzo sul mare Adriatico"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
