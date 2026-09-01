"use client";

import { MapPin, Phone } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { SITE } from "@/lib/constants";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const CONTACT_ITEMS = [
  {
    icon: MapPin,
    title: "Luogo",
    text: "11 settembre — Piazzale dell'Aereonautica (ritrovo ore 18:30)",
  },
  {
    icon: Phone,
    title: "Telefono",
    text: SITE.phone,
    href: `tel:${SITE.phoneTel}`,
  },
  {
    icon: InstagramIcon,
    title: "Instagram",
    text: `${SITE.instagramHandle} — scrivici in DM`,
    href: SITE.instagram,
  },
] as const;

export function Location() {
  return (
    <section id="contact" className="bg-emerald-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Contatti
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Resta in contatto con noi
          </h2>
          <p className="mt-4 text-lg text-forest/70">
            Il punto di ritrovo è il Piazzale dell&apos;Aereonautica alle ore 18:30. Per domande
            chiama o scrivici su Instagram.
          </p>
        </FadeIn>

        <div className="mx-auto mt-14 grid max-w-2xl gap-4">
          {CONTACT_ITEMS.map((item, index) => (
            <FadeIn key={item.title} delay={index * 0.06}>
              <div className="flex gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <item.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-forest">{item.title}</p>
                  {"href" in item && item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="mt-1 block text-sm text-emerald-600 hover:underline"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-forest/60">{item.text}</p>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
