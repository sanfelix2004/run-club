"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FadeIn } from "@/components/FadeIn";

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
              Chi siamo
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
              Giovinazzo Sunset Run
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-forest/70">
              Siamo partiti come un gruppo di amici che si ritrovava al porto vecchio
              per le corse mattutine. Oggi siamo una vera community di runner —
              locali, expat e visitatori — uniti dalla passione per mettere un piede
              davanti all&apos;altro.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-forest/70">
              Niente egos, niente pressione. Che tu stia preparando il tuo primo 5K o
              il decimo maratona, qui trovi il tuo ritmo. Corriamo sul lungomare
              all&apos;alba, in collina nel weekend e festeggiamo ogni traguardo insieme.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Tutti i livelli benvenuti",
                "Sessioni guidate dai coach",
                "Percorsi costieri e trail",
                "Eventi tutto l'anno",
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
