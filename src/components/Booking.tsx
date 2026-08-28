"use client";

import { CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

export function Booking() {
  const scrollToEvents = () => {
    document.getElementById("events")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="booking" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Come iscriversi
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Prenota in pochi click
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-forest/70">
            Scegli un evento dalla lista, compila la scheda fluttuante con i tuoi dati e
            scarica subito il PDF con l&apos;importo da pagare e il QR code di prenotazione.
          </p>

          <ul className="mt-10 space-y-4 text-left">
            {[
              "Clicca sulla card dell'evento che ti interessa",
              "Compila nome, contatti e fascia di passo nella scheda",
              "Scarica il PDF con QR code — la quota si paga all'arrivo",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-forest/70">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={scrollToEvents}
            className="mt-10 inline-flex rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Vedi gli eventi
          </button>
        </FadeIn>
      </div>
    </section>
  );
}
