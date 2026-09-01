"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeIn } from "@/components/FadeIn";
import { FEATURED_EVENT, SITE } from "@/lib/constants";

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
              Giovinazzo Sunset Run
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-forest/70">
              Evento organizzato da <strong>Corner Giovinazzo</strong>, in collaborazione con{" "}
              <strong>Netium</strong> e <strong>Buonvento</strong>. Ci ritroviamo alle ore{" "}
              <strong>18:30</strong> al <strong>Piazzale dell&apos;Aereonautica</strong>: Netium
              guida il riscaldamento, poi partiamo per una corsa di{" "}
              <strong>{FEATURED_EVENT.distanceKm} km</strong> al tramonto.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-forest/70">
              Il traguardo è a <strong>Buonvento</strong>, con DJ set a cura di Buonvento.
              Corner mette a disposizione <strong>avocado toast e acqua</strong> per tutti.
              Tutti i livelli sono benvenuti.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Ritrovo ore 18:30 — Piazzale dell'Aereonautica",
                "Riscaldamento a cura di Netium",
                "3,5 km al tramonto",
                "Arrivo a Buonvento con DJ set",
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
