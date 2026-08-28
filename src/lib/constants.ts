export const SITE = {
  name: "Giovinazzo Sunset Run",
  tagline: "Corri al tramonto",
  description:
    "Community di running sulla costa adriatica — corse al tramonto, percorsi sul mare e persone fantastiche a Giovinazzo.",
} as const;

export const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#events", label: "Eventi" },
  { href: "#about", label: "Chi siamo" },
  { href: "#partners", label: "Partner" },
  { href: "#pricing", label: "Prezzi" },
  { href: "#booking", label: "Iscrizione" },
  { href: "#reviews", label: "Recensioni" },
  { href: "#contact", label: "Contatti" },
] as const;

export const PRICING_PLANS = [
  {
    name: "Corsa Singola",
    price: "5",
    period: "a corsa",
    description: "Un prezzo chiaro, tutto incluso dopo la corsa.",
    highlighted: true,
    features: [
      "Corsa di gruppo sul lungomare di Giovinazzo",
      "Sandwich incluso",
      "Bevanda a piacere",
      "Prenotazione con QR code",
      "Tutti i livelli benvenuti",
    ],
  },
] as const;

export const SOCIAL_LINKS = [
  { href: "https://instagram.com", label: "Instagram", icon: "instagram" as const },
  { href: "https://facebook.com", label: "Facebook", icon: "facebook" as const },
  { href: "https://strava.com", label: "Strava", icon: "strava" as const },
] as const;

export const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2945.8!2d16.6711!3d41.1853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1337f2e8c8c8c8c9%3A0x0!2sGiovinazzo%20BA%2C%20Italy!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit";
