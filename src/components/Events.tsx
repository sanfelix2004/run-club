"use client";

import { Calendar, Flag, MapPin, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";
import { useEventRegistration } from "@/components/EventRegistrationProvider";
import { FEATURED_EVENT, EVENT_TIMEZONE } from "@/lib/constants";
import type { PublicEvent } from "@/app/actions/events";

type EventsProps = {
  events: PublicEvent[];
};

function formatFeaturedDate() {
  const date = new Date(FEATURED_EVENT.dateTimeIso);
  return {
    date: date.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: EVENT_TIMEZONE,
    }),
    time: date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: EVENT_TIMEZONE,
    }),
  };
}

export function Events({ events }: EventsProps) {
  const { openRegistration } = useEventRegistration();
  const featured =
    events.find((event) => event.id === FEATURED_EVENT.id) ?? events[0] ?? null;
  const { date, time } = formatFeaturedDate();

  return (
    <section id="events" className="bg-emerald-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Prossima edizione
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            11 settembre a Giovinazzo
          </h2>
          <p className="mt-4 text-lg text-forest/70">
            Un solo appuntamento: corri al tramonto, prenota il posto e scarica subito il PDF con QR
            code.
          </p>
        </FadeIn>

        {featured ? (
          <FadeIn className="mx-auto mt-14 max-w-3xl">
            <article className="overflow-hidden rounded-3xl border-2 border-emerald-200 bg-white shadow-xl shadow-emerald-900/10">
              <div className="bg-gradient-to-r from-forest to-emerald-700 px-6 py-5 text-white sm:px-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" />
                    In programma
                  </span>
                  <span className="rounded-full bg-emerald-400 px-3 py-1 text-sm font-bold text-forest">
                    €{featured.priceAmount.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-bold sm:text-3xl">{featured.title}</h3>
                <p className="mt-2 text-sm text-emerald-100 sm:text-base">
                  {featured.description ?? FEATURED_EVENT.description}
                </p>
              </div>

              <div className="space-y-3 px-6 py-6 text-sm text-forest/75 sm:px-8">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-emerald-500" />
                  {date} · ore {time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                  {featured.locationName}
                </p>
                <p className="flex items-center gap-2">
                  <Flag className="h-4 w-4 shrink-0 text-emerald-500" />
                  {FEATURED_EVENT.distanceKm} km · arrivo {FEATURED_EVENT.arrivalLocation}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-emerald-500" />
                  {featured.registrationCount} iscritti
                </p>
              </div>

              <div className="border-t border-emerald-100 px-6 py-5 sm:px-8">
                <Button
                  className="w-full rounded-full bg-emerald-500 py-6 text-base font-semibold text-white hover:bg-emerald-600"
                  onClick={() => openRegistration(featured)}
                >
                  Iscriviti all&apos;evento dell&apos;11 settembre
                </Button>
              </div>
            </article>
          </FadeIn>
        ) : (
          <FadeIn className="mt-14 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-12 text-center">
            <p className="text-forest/60">L&apos;evento dell&apos;11 settembre sarà disponibile a breve.</p>
            <p className="mt-2 text-sm text-forest/40">
              Seguici su Instagram per gli aggiornamenti.
            </p>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
