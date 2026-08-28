"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";
import { PRICING_PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Pricing() {
  const scrollToEvents = () => {
    document.querySelector("#events")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Simple, honest plans
          </h2>
          <p className="mt-4 text-lg text-forest/70">
            No hidden fees, no long contracts. Pick what works for you and start
            running with us.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {PRICING_PLANS.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-8 transition-all duration-300",
                  plan.highlighted
                    ? "border-emerald-400 bg-forest text-white shadow-xl shadow-forest/20 scale-[1.02]"
                    : "border-emerald-100 bg-white text-forest shadow-sm hover:shadow-md",
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p
                  className={cn(
                    "mt-2 text-sm",
                    plan.highlighted ? "text-emerald-100/80" : "text-forest/60",
                  )}
                >
                  {plan.description}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">€{plan.price}</span>
                  <span
                    className={cn(
                      "text-sm",
                      plan.highlighted ? "text-emerald-100/70" : "text-forest/50",
                    )}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          plan.highlighted ? "text-emerald-300" : "text-emerald-500",
                        )}
                      />
                      <span
                        className={
                          plan.highlighted ? "text-emerald-50/90" : "text-forest/70"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "mt-8 w-full rounded-full",
                    plan.highlighted
                      ? "bg-emerald-500 text-white hover:bg-emerald-400"
                      : "bg-emerald-500 text-white hover:bg-emerald-600",
                  )}
                  onClick={scrollToEvents}
                >
                  Get Started
                </Button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
