"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { MAP_EMBED_URL } from "@/lib/constants";

export function Location() {
  return (
    <section id="contact" className="bg-emerald-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Contatti
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Trovaci a Giovinazzo
          </h2>
          <p className="mt-4 text-lg text-forest/70">
            Ci ritroviamo al porto vicino a Piazza Vittorio Emanuele. Cerca la
            bandiera verde — non puoi sbagliare.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-8 lg:grid-cols-5">
          <FadeIn className="lg:col-span-2">
            <div className="flex h-full flex-col gap-6">
              {[
                {
                  icon: MapPin,
                  title: "Indirizzo",
                  text: "Piazza Vittorio Emanuele II\n70054 Giovinazzo BA, Italia",
                },
                {
                  icon: Clock,
                  title: "Orari segreteria",
                  text: "Lun–Ven: 9:00 – 18:00\nSab–Dom: solo orari sessioni",
                },
                {
                  icon: Mail,
                  title: "Email",
                  text: "ciao@runclubgiovinazzo.it",
                },
                {
                  icon: Phone,
                  title: "Telefono",
                  text: "+39 080 123 4567",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                    <item.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-forest">{item.title}</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-forest/60">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-emerald-100 shadow-sm">
              <iframe
                title="Posizione Run Club Giovinazzo su Google Maps"
                src={MAP_EMBED_URL}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
