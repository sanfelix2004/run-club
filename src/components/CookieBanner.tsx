"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COOKIE_CONSENT_EVENT,
  getStoredConsent,
  saveConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [thirdParty, setThirdParty] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      setVisible(true);
      return;
    }
    setThirdParty(stored.thirdParty);
    setAnalytics(stored.analytics);
  }, []);

  useEffect(() => {
    const openSettings = () => {
      const stored = getStoredConsent();
      if (stored) {
        setThirdParty(stored.thirdParty);
        setAnalytics(stored.analytics);
      }
      setShowSettings(true);
      setVisible(true);
    };

    window.addEventListener("rcg-open-cookie-settings", openSettings);
    return () => window.removeEventListener("rcg-open-cookie-settings", openSettings);
  }, []);

  const applyConsent = useCallback((consent: Pick<CookieConsent, "thirdParty" | "analytics">) => {
    saveConsent(consent);
    setThirdParty(consent.thirdParty);
    setAnalytics(consent.analytics);
    setVisible(false);
    setShowSettings(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[250] p-4 sm:p-6">
      <div
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-modal="true"
        className="mx-auto max-w-3xl rounded-2xl border border-emerald-100 bg-white p-5 shadow-2xl shadow-forest/10 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 id="cookie-banner-title" className="text-lg font-semibold text-forest">
              {showSettings ? "Preferenze cookie" : "Questo sito utilizza i cookie"}
            </h2>
            {!showSettings ? (
              <p className="mt-2 text-sm leading-relaxed text-forest/70">
                Usiamo cookie necessari per login e prenotazioni. Con il tuo consenso possiamo
                caricare anche servizi di terze parti come Google Maps. Leggi la{" "}
                <Link href="/cookie" className="font-medium text-emerald-600 hover:underline">
                  Cookie Policy
                </Link>{" "}
                e la{" "}
                <Link href="/privacy" className="font-medium text-emerald-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                <label className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="mt-1 h-4 w-4 rounded border-emerald-200"
                  />
                  <span>
                    <span className="block text-sm font-medium text-forest">Necessari</span>
                    <span className="mt-1 block text-sm text-forest/60">
                      Sessione, sicurezza e memorizzazione delle preferenze cookie. Sempre attivi.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 rounded-xl border border-emerald-100 p-4">
                  <input
                    type="checkbox"
                    checked={thirdParty}
                    onChange={(e) => setThirdParty(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-emerald-200 text-emerald-500 focus:ring-emerald-400"
                  />
                  <span>
                    <span className="block text-sm font-medium text-forest">Terze parti</span>
                    <span className="mt-1 block text-sm text-forest/60">
                      Google Maps e login Google, se li utilizzi.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 rounded-xl border border-emerald-100 p-4 opacity-70">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    disabled
                    className="mt-1 h-4 w-4 rounded border-emerald-200 text-emerald-500 focus:ring-emerald-400"
                  />
                  <span>
                    <span className="block text-sm font-medium text-forest">Statistiche</span>
                    <span className="mt-1 block text-sm text-forest/60">
                      Al momento non utilizziamo cookie analitici.
                    </span>
                  </span>
                </label>
              </div>
            )}
          </div>
          {showSettings && (
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="shrink-0 rounded-full p-1 text-forest/40 hover:bg-emerald-50 hover:text-forest"
              aria-label="Chiudi impostazioni"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          {!showSettings ? (
            <>
              <Button
                variant="outline"
                className="rounded-full border-emerald-200"
                onClick={() => applyConsent({ thirdParty: false, analytics: false })}
              >
                Solo necessari
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-emerald-200"
                onClick={() => setShowSettings(true)}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Personalizza
              </Button>
              <Button
                className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
                onClick={() => applyConsent({ thirdParty: true, analytics: false })}
              >
                Accetta tutti
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="rounded-full border-emerald-200"
                onClick={() => applyConsent({ thirdParty: false, analytics: false })}
              >
                Rifiuta opzionali
              </Button>
              <Button
                className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
                onClick={() => applyConsent({ thirdParty, analytics: false })}
              >
                Salva preferenze
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function openCookieSettings() {
  window.dispatchEvent(new Event("rcg-open-cookie-settings"));
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    setConsent(getStoredConsent());

    const onChange = (event: Event) => {
      const custom = event as CustomEvent<CookieConsent>;
      setConsent(custom.detail ?? getStoredConsent());
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
  }, []);

  return consent;
}
