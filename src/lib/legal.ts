import { SITE } from "@/lib/constants";

export const LEGAL = {
  siteName: SITE.name,
  owner: SITE.name,
  address: "Piazza Vittorio Emanuele II, 70054 Giovinazzo (BA), Italia",
  phone: SITE.phone,
  instagram: SITE.instagram,
  instagramHandle: SITE.instagramHandle,
  vatOrFiscalCode: "—",
  lastUpdated: "1 settembre 2026",
} as const;

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookie", label: "Cookie Policy" },
  { href: "/termini", label: "Termini e condizioni" },
  { href: "/note-legali", label: "Note legali" },
] as const;
