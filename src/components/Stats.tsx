"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { FadeIn } from "@/components/FadeIn";
import { STATS } from "@/lib/constants";

function AnimatedCounter({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const spring = useSpring(0, { duration: 2000, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, spring, value]);

  useEffect(() => {
    return display.on("change", (v) => setShown(v));
  }, [display]);

  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 bg-forest" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #10B981 0%, transparent 50%), radial-gradient(circle at 80% 50%, #10B981 0%, transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
            By the Numbers
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A community that keeps growing
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition-colors hover:bg-white/10">
                <p className="text-4xl font-bold text-emerald-400 sm:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium text-emerald-100/80">
                  {stat.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
