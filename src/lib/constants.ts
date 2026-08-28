export const SITE = {
  name: "Run Club Giovinazzo",
  tagline: "Corri",
  description:
    "Una community di running sulla costa adriatica — sessioni all'alba, percorsi sul mare e persone fantastiche a Giovinazzo.",
} as const;

export const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#events", label: "Eventi" },
  { href: "#about", label: "Chi siamo" },
  { href: "#sessions", label: "Allenamenti" },
  { href: "#pricing", label: "Prezzi" },
  { href: "#booking", label: "Iscrizione" },
  { href: "#contact", label: "Contatti" },
] as const;

export const SESSIONS = [
  {
    title: "Corsa al tramonto sul lungomare",
    description:
      "Inizia la giornata con un giro di 5–8 km lungo il lungomare. Passo facile, panorama stupendo e caffè dopo.",
    image: "https://picsum.photos/seed/giovinazzo-sunrise/600/400",
    time: "Mar e Gio · 6:30",
  },
  {
    title: "Martedì tempo",
    description:
      "Interval training strutturati sulla pista vicino al porto. Velocità e divertimento con i coach.",
    image: "https://picsum.photos/seed/giovinazzo-tempo/600/400",
    time: "Mar · 19:00",
  },
  {
    title: "Lungo del weekend",
    description:
      "Percorsi di campagna verso Molfetta. Tutti i livelli — ci ritroviamo ogni 2 km.",
    image: "https://picsum.photos/seed/giovinazzo-trail/600/400",
    time: "Sab · 8:00",
  },
  {
    title: "Forza e mobilità",
    description:
      "Circuiti a corpo libero e stretching per completare il tuo allenamento da runner.",
    image: "https://picsum.photos/seed/giovinazzo-strength/600/400",
    time: "Mer · 18:00",
  },
  {
    title: "Camminata di recupero",
    description:
      "Passeggiata leggera nel centro storico e aperitivo. Perfetta per i giorni di riposo e i nuovi iscritti.",
    image: "https://picsum.photos/seed/giovinazzo-walk/600/400",
    time: "Dom · 10:00",
  },
  {
    title: "Run per bambini",
    description:
      "Corsa a gioco per bambini 8–14 anni. Sicura, supervisionata e pensata per far divertire.",
    image: "https://picsum.photos/seed/giovinazzo-kids/600/400",
    time: "Ven · 16:30",
  },
] as const;

export const STATS = [
  { value: 320, suffix: "+", label: "Atleti attivi" },
  { value: 48, suffix: "", label: "Sessioni settimanali" },
  { value: 12, suffix: " km", label: "Percorso costiero più lungo" },
  { value: 4, suffix: " anni", label: "Corriamo insieme" },
] as const;

export const PRICING_PLANS = [
  {
    name: "Singola sessione",
    price: "8",
    period: "a sessione",
    description: "Perfetto per chi è di passaggio o vuole provare.",
    features: [
      "Qualsiasi sessione di gruppo aperta",
      "Riscaldamento guidato dal coach",
      "Stretching post-corsa",
      "Accesso al gruppo WhatsApp",
    ],
    highlighted: false,
  },
  {
    name: "Mensile",
    price: "35",
    period: "al mese",
    description: "Il piano più scelto per chi corre spesso.",
    features: [
      "Sessioni di gruppo illimitate",
      "Lezioni di forza e mobilità",
      "Check-in sul piano di allenamento",
      "Eventi e gare per i soci",
      "10% di sconto sul merchandising",
    ],
    highlighted: true,
  },
  {
    name: "Annuale",
    price: "320",
    period: "all'anno",
    description: "Il miglior valore per i runner più costanti.",
    features: [
      "Tutto incluso nel piano Mensile",
      "2 sessioni private con il coach",
      "Contributo per iscrizioni alle gare",
      "Prenotazione prioritaria agli eventi",
      "Kit del club in omaggio",
    ],
    highlighted: false,
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "Mi sono trasferita a Giovinazzo l'anno scorso e questo club mi ha fatto sentire subito a casa. Le corse all'alba sono il momento migliore della settimana.",
    name: "Elena R.",
    role: "Socia dal 2024",
    image: "https://picsum.photos/seed/testimonial-elena/120/120",
  },
  {
    quote:
      "Non pensavo mi sarebbe piaciuto correre finché non mi sono iscritto. I coach sono incoraggianti senza essere invadenti — proprio il mio stile.",
    name: "Marco D.",
    role: "Socio dal 2023",
    image: "https://picsum.photos/seed/testimonial-marco/120/120",
  },
  {
    quote:
      "In famiglia facciamo la sessione kids il venerdì e il lungo del weekend insieme. È diventata la nostra tradizione preferita.",
    name: "Sara & Luca B.",
    role: "Iscrizione familiare",
    image: "https://picsum.photos/seed/testimonial-sara/120/120",
  },
  {
    quote:
      "I percorsi costieri sono spettacolari e la community è davvero accogliente. Casual, amichevole e ben organizzata.",
    name: "Giulia M.",
    role: "Socia dal 2022",
    image: "https://picsum.photos/seed/testimonial-giulia/120/120",
  },
] as const;

export const SOCIAL_LINKS = [
  { href: "https://instagram.com", label: "Instagram", icon: "instagram" as const },
  { href: "https://facebook.com", label: "Facebook", icon: "facebook" as const },
  { href: "https://strava.com", label: "Strava", icon: "strava" as const },
] as const;

export const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2945.8!2d16.6711!3d41.1853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1337f2e8c8c8c8c9%3A0x0!2sGiovinazzo%20BA%2C%20Italy!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit";
