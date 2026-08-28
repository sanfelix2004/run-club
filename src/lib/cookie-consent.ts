export type CookieConsent = {
  necessary: true;
  thirdParty: boolean;
  analytics: boolean;
  updatedAt: string;
};

export const COOKIE_CONSENT_KEY = "rcg-cookie-consent";
export const COOKIE_CONSENT_EVENT = "rcg-cookie-consent-change";

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed.necessary !== true) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(consent: Pick<CookieConsent, "thirdParty" | "analytics">) {
  const value: CookieConsent = {
    necessary: true,
    thirdParty: consent.thirdParty,
    analytics: consent.analytics,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
  return value;
}

export function hasThirdPartyConsent(): boolean {
  return getStoredConsent()?.thirdParty ?? false;
}

export function hasAnalyticsConsent(): boolean {
  return getStoredConsent()?.analytics ?? false;
}
