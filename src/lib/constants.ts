export const SITE = {
  name: "Sunset Run Giovinazzo",
  tagline: "Corri al tramonto",
  description:
    "Una corsa al tramonto a Giovinazzo — quota €5 con riscaldamento alla palestra Netium, avocado toast, acqua e dopo la gara sandwich e bevanda.",
  phone: "+39 366 934 7250",
  phoneTel: "+393669347250",
  instagram: "https://www.instagram.com/sunsetrun.giovinazzo/",
  instagramHandle: "@sunsetrun.giovinazzo",
  insuranceNote:
    "Durante l'evento siete coperti da assicurazione per la partecipazione alla manifestazione.",
} as const;

export const FEATURED_EVENT = {
  id: "sunset-run-2026-09-11",
  title: "Sunset Run Giovinazzo — 11 settembre",
  description:
    "Ore 19:00 ritrovo e riscaldamento alla palestra Netium con avocado toast e acqua inclusi. Poi corsa al tramonto sul lungomare. Dopo la gara: sandwich e bevanda.",
  /** 11 settembre 2026, ore 19:00 (Italia) */
  dateTimeIso: "2026-09-11T17:00:00.000Z",
  locationName: "Palestra Netium Giovinazzo — riscaldamento ore 19:00",
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
    description: "Un prezzo chiaro, tutto incluso dopo la corsa.",
    highlighted: true,
    features: [
      "Riscaldamento ore 19:00 alla palestra Netium",
      "Avocado toast e acqua al ritrovo",
      "Corsa al tramonto",
      "Sandwich e bevanda dopo la gara",
      "Prenotazione con QR code",
    ],
  },
] as const;

export const SOCIAL_LINKS = [
  { href: SITE.instagram, label: "Instagram", icon: "instagram" as const },
] as const;

export const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2945.8!2d16.6711!3d41.1853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1337f2e8c8c8c8c9%3A0x0!2sGiovinazzo%20BA%2C%20Italy!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit";
