"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";
import { PRICING_PLANS } from "@/lib/constants";

export function Pricing() {
  const scrollToEvents = () => {
    document.querySelector("#events")?.scrollIntoView({ behavior: "smooth" });
  };

  const pricing = PRICING_PLANS[0];

  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Prezzi
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Piani semplici e trasparenti
          </h2>
          <p className="mt-4 text-lg text-forest/70">
            Nessun costo nascosto. Paghi in loco e dopo la corsa ti aspettano sandwich e
            bevanda.
          </p>
        </FadeIn>

        <FadeIn className="mx-auto mt-14 max-w-lg">
          <div className="relative flex flex-col rounded-2xl border border-emerald-400 bg-forest p-8 text-white shadow-xl shadow-forest/20">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold text-white">
              Unica tariffa
            </span>
            <h3 className="text-xl font-semibold">{pricing.name}</h3>
            <p className="mt-2 text-sm text-emerald-100/80">{pricing.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-bold">€{pricing.price}</span>
              <span className="text-sm text-emerald-100/70">{pricing.period}</span>
            </div>
            <ul className="mt-8 space-y-3">
              {pricing.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span className="text-emerald-50/90">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-8 w-full rounded-full bg-emerald-500 text-white hover:bg-emerald-400"
              onClick={scrollToEvents}
            >
              Prenota la prossima corsa
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
