"use client";

import Image from "next/image";
import { Clock } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { SESSIONS } from "@/lib/constants";

export function Sessions() {
  return (
    <section id="sessions" className="bg-emerald-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Allenamenti
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Trova la tua corsa
          </h2>
          <p className="mt-4 text-lg text-forest/70">
            Sei allenamenti settimanali tra costa e campagna. Partecipa quando vuoi —
            prenota in anticipo così sappiamo che vieni.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SESSIONS.map((session, i) => (
            <FadeIn key={session.title} delay={i * 0.08}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/10">
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image
                    src={session.image}
                    alt={session.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/40 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold text-forest">{session.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-forest/65">
                    {session.description}
                  </p>
                  <p className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600">
                    <Clock className="h-4 w-4" />
                    {session.time}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
