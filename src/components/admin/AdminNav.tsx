"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, QrCode } from "lucide-react";

const links = [
  { href: "/admin/events", label: "Eventi", icon: CalendarDays },
  { href: "/admin/checkin", label: "Check-in", icon: QrCode },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 rounded-full border border-emerald-100 bg-emerald-50/50 p-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-white text-forest shadow-sm"
                : "text-forest/60 hover:text-forest"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
