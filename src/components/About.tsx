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
              About Us
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
              run club Giovinazzo
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-forest/70">
              We started as a handful of friends meeting at the old harbour for
              morning jogs. Today we&apos;re a proper community of runners —
              locals, expats, and visitors — who share one thing: the love of
              putting one foot in front of the other.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-forest/70">
              No egos, no pressure. Whether you&apos;re training for your first
              5K or your tenth marathon, you&apos;ll find your pace here. We run
              the seafront at dawn, the hills on weekends, and celebrate every
              finish line together.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "All levels welcome",
                "Coach-led sessions",
                "Coastal & trail routes",
                "Community events year-round",
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
                  src="https://picsum.photos/seed/giovinazzo-about/800/1000"
                  alt="Runners along the Giovinazzo seafront at sunrise"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-lg sm:-left-8">
              <p className="text-3xl font-bold text-emerald-500">320+</p>
              <p className="text-sm font-medium text-forest/60">runners & counting</p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
