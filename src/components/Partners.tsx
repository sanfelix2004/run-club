"use client";

import Image from "next/image";
import { FadeIn } from "@/components/FadeIn";
import { PARTNERS } from "@/lib/partners";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function Partners() {
  return (
    <section id="partners" className="border-y border-emerald-100 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Collaborazione
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Nato dalla collaborazione di tre realtà di Giovinazzo
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-forest/70">
            Sunset Run Giovinazzo nasce dall&apos;incontro tra sport, convivialità e territorio.
            Netium, Corner Pub e Buonvento mettono insieme energia, ospitalità e passione per
            portare in pista questo evento sulla costa adriatica.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PARTNERS.map((partner, index) => (
            <FadeIn key={partner.id} delay={index * 0.08}>
              <a
                href={partner.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col items-center rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label={`Visita il profilo Instagram di ${partner.name}`}
              >
                <div
                  className={`flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 shadow-sm ${partner.logoClassName}`}
                >
                  <Image
                    src={partner.logo}
                    alt={`Logo ${partner.name}`}
                    width={220}
                    height={120}
                    className="max-h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-forest transition-colors group-hover:text-emerald-700">
                  {partner.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-emerald-600">{partner.tagline}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-forest/65">
                  {partner.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-forest/50 transition-colors group-hover:text-emerald-600">
                  <InstagramIcon className="h-4 w-4" />
                  Seguici su Instagram
                </span>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
