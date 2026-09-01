"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { MAP_EMBED_URL, SITE } from "@/lib/constants";
import { useCookieConsent, openCookieSettings } from "@/components/CookieBanner";

export function MapsEmbed() {
  const consent = useCookieConsent();
  const canLoadMap = consent?.thirdParty ?? false;

  if (!canLoadMap) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center">
        <MapPin className="h-10 w-10 text-emerald-400" />
        <p className="max-w-sm text-sm leading-relaxed text-forest/70">
          Per visualizzare la mappa Google serve il tuo consenso ai cookie di terze parti.
        </p>
        <button
          type="button"
          onClick={openCookieSettings}
          className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600"
        >
          Gestisci cookie
        </button>
        <Link
          href="https://maps.google.com/?q=Piazza+Vittorio+Emanuele+II+Giovinazzo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          Apri su Google Maps
        </Link>
      </div>
    );
  }

  return (
    <iframe
      title={`Posizione ${SITE.name} su Google Maps`}
      src={MAP_EMBED_URL}
      width="100%"
      height="400"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="w-full"
    />
  );
}
