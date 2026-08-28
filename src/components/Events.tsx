"use client";

import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";
import type { PublicEvent } from "@/app/actions/events";

type EventsProps = {
  events: PublicEvent[];
};

export function Events({ events }: EventsProps) {
  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="events" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Eventi
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Prossimi meetup
          </h2>
          <p className="mt-4 text-lg text-forest/70">
            Iscriviti a un evento, scarica il pass con QR code e vieni a correre con noi.
          </p>
        </FadeIn>

        {events.length === 0 ? (
          <FadeIn className="mt-14 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-12 text-center">
            <p className="text-forest/60">Nessun evento in programma al momento.</p>
            <p className="mt-2 text-sm text-forest/40">Torna presto — ne arrivano di nuovi!</p>
          </FadeIn>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, i) => (
              <FadeIn key={event.id} delay={i * 0.08}>
                <article className="flex h-full flex-col rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/10">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-forest">{event.title}</h3>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                      €{event.priceAmount.toFixed(2).replace(".", ",")}
                    </span>
                  </div>

                  {event.description && (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-forest/65">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-4 space-y-2 text-sm text-forest/70">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-emerald-500" />
                      {event.date} · {event.time}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                      {event.locationName}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0 text-emerald-500" />
                      {event.registrationCount} iscritti
                    </p>
                  </div>

                  <Button
                    className="mt-6 w-full rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
                    onClick={scrollToBooking}
                  >
                    Iscriviti
                  </Button>
                </article>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
