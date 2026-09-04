export const EVENT_TIMEZONE = "Europe/Rome";

/** Capienza massima iscrizioni attive per evento (mostrata solo come n/102). */
export const MAX_EVENT_REGISTRATIONS = 102;

export const SITE = {
  name: "Sunset Run Giovinazzo",
  tagline: "Corri al tramonto",
  description:
    "Giovinazzo Sunset Run — corsa di 3,5 km al tramonto. Ritrovo ore 18:30 al Piazzale dell'Aereonautica, arrivo a Buonvento con DJ set, avocado toast e acqua.",
  phone: "+39 366 934 7250",
  phoneTel: "+393669347250",
  instagram: "https://www.instagram.com/giovinazzo_sunset_run/",
  instagramHandle: "@giovinazzo_sunset_run",
  insuranceNote:
    "Durante l'evento siete coperti da assicurazione per la partecipazione alla manifestazione.",
} as const;

export const FEATURED_EVENT = {
  id: "sunset-run-2026-09-11",
  title: "Giovinazzo Sunset Run — 11 settembre",
  description:
    "Evento organizzato da Corner Giovinazzo, in collaborazione con Netium e Buonvento. Ore 18:30 ritrovo e riscaldamento al Piazzale dell'Aereonautica (a cura di Netium). Corsa di 3,5 km al tramonto. Arrivo a Buonvento con DJ set, avocado toast e acqua offerti da Corner.",
  /** 11 settembre 2026, ore 18:30 (Europe/Rome) */
  dateTimeIso: "2026-09-11T16:30:00.000Z",
  locationName: "Piazzale dell'Aereonautica, Giovinazzo — ritrovo ore 18:30",
  arrivalLocation: "Buonvento Giovinazzo — arrivo, DJ set e ristoro",
  distanceKm: 3.5,
  priceAmount: 5,
  currency: "EUR",
} as const;

export const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#events", label: "Evento" },
  { href: "#about", label: "Chi siamo" },
  { href: "#partners", label: "Partner" },
  { href: "#pricing", label: "Prezzi" },
  { href: "#booking", label: "Iscrizione" },
  { href: "#reviews", label: "Recensioni" },
  { href: "#contact", label: "Contatti" },
] as const;

export const PRICING_PLANS = [
  {
    name: "Quota evento",
    price: "5",
    period: "a persona",
    description: "Un prezzo chiaro per partecipare alla Sunset Run.",
    highlighted: true,
    features: [
      "Riscaldamento ore 18:30 — Piazzale dell'Aereonautica",
      "Corsa di 3,5 km al tramonto",
      "Arrivo a Buonvento con DJ set",
      "Avocado toast e acqua offerti da Corner",
      "Prenotazione con QR code",
    ],
  },
] as const;

export const SOCIAL_LINKS = [
  { href: SITE.instagram, label: "Instagram", icon: "instagram" as const },
] as const;

export const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2945.8!2d16.6711!3d41.1853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1337f2e8c8c8c8c9%3A0x0!2sGiovinazzo%20BA%2C%20Italy!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit";
