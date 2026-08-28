export const SITE = {
  name: "run club giovinazzo",
  tagline: "run",
  description:
    "A friendly running community on the Adriatic coast — sunrise sessions, seaside trails, and good people in Giovinazzo.",
} as const;

export const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#sessions", label: "Sessions" },
  { href: "#pricing", label: "Pricing" },
  { href: "#booking", label: "Booking" },
  { href: "#contact", label: "Contact" },
] as const;

export const SESSIONS = [
  {
    title: "Sunrise Seafront Run",
    description:
      "Start your day with a 5–8 km loop along the lungomare. Easy pace, great views, coffee after.",
    image: "https://picsum.photos/seed/giovinazzo-sunrise/600/400",
    time: "Tue & Thu · 6:30 AM",
  },
  {
    title: "Tempo Tuesday",
    description:
      "Structured intervals at the track near the port. Build speed with coaches who keep it fun.",
    image: "https://picsum.photos/seed/giovinazzo-tempo/600/400",
    time: "Tue · 7:00 PM",
  },
  {
    title: "Weekend Long Run",
    description:
      "Explore the countryside trails toward Molfetta. All levels welcome — we regroup every 2 km.",
    image: "https://picsum.photos/seed/giovinazzo-trail/600/400",
    time: "Sat · 8:00 AM",
  },
  {
    title: "Strength & Mobility",
    description:
      "Complement your running with bodyweight circuits and stretching in our studio space.",
    image: "https://picsum.photos/seed/giovinazzo-strength/600/400",
    time: "Wed · 6:00 PM",
  },
  {
    title: "Social Recovery Walk",
    description:
      "Easy walk through the old town followed by aperitivo. Perfect for rest days and new members.",
    image: "https://picsum.photos/seed/giovinazzo-walk/600/400",
    time: "Sun · 10:00 AM",
  },
  {
    title: "Kids Run Club",
    description:
      "Games-based running for ages 8–14. Safe, supervised, and designed to make fitness feel like play.",
    image: "https://picsum.photos/seed/giovinazzo-kids/600/400",
    time: "Fri · 4:30 PM",
  },
] as const;

export const STATS = [
  { value: 320, suffix: "+", label: "Active Members" },
  { value: 48, suffix: "", label: "Weekly Sessions" },
  { value: 12, suffix: " km", label: "Longest Coastal Route" },
  { value: 4, suffix: " yrs", label: "Running Together" },
] as const;

export const PRICING_PLANS = [
  {
    name: "Drop-In",
    price: "8",
    period: "per session",
    description: "Perfect for visitors or trying us out.",
    features: [
      "Any open group session",
      "Coach-led warm-up",
      "Post-run stretch guide",
      "Community WhatsApp access",
    ],
    highlighted: false,
  },
  {
    name: "Monthly",
    price: "35",
    period: "per month",
    description: "Our most popular plan for regular runners.",
    features: [
      "Unlimited group sessions",
      "Strength & mobility classes",
      "Training plan check-ins",
      "Member events & races",
      "10% off merch",
    ],
    highlighted: true,
  },
  {
    name: "Annual",
    price: "320",
    period: "per year",
    description: "Best value for committed club members.",
    features: [
      "Everything in Monthly",
      "2 private coaching sessions",
      "Race entry fee support",
      "Priority event booking",
      "Free club kit",
    ],
    highlighted: false,
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "I moved to Giovinazzo last year and this club made me feel at home instantly. The sunrise runs are the best part of my week.",
    name: "Elena R.",
    role: "Member since 2024",
    image: "https://picsum.photos/seed/testimonial-elena/120/120",
  },
  {
    quote:
      "Never thought I'd enjoy running until I joined. The coaches are encouraging without being intense — exactly my vibe.",
    name: "Marco D.",
    role: "Member since 2023",
    image: "https://picsum.photos/seed/testimonial-marco/120/120",
  },
  {
    quote:
      "Our family does the kids session on Fridays and the weekend long run together. It's become our favourite tradition.",
    name: "Sara & Luca B.",
    role: "Family membership",
    image: "https://picsum.photos/seed/testimonial-sara/120/120",
  },
  {
    quote:
      "The coastal routes are stunning and the community is genuinely welcoming. Casual, friendly, and well organised.",
    name: "Giulia M.",
    role: "Member since 2022",
    image: "https://picsum.photos/seed/testimonial-giulia/120/120",
  },
] as const;

export const SOCIAL_LINKS = [
  { href: "https://instagram.com", label: "Instagram", icon: "instagram" as const },
  { href: "https://facebook.com", label: "Facebook", icon: "facebook" as const },
  { href: "https://strava.com", label: "Strava", icon: "strava" as const },
] as const;

export const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2945.8!2d16.6711!3d41.1853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1337f2e8c8c8c8c9%3A0x0!2sGiovinazzo%20BA%2C%20Italy!5e0!3m2!1sen!2sit!4v1700000000000!5m2!1sen!2sit";
