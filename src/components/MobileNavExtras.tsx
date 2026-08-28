"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";

type MobileNavExtrasProps = {
  onNavigate?: () => void;
};

export function MobileNavExtras({ onNavigate }: MobileNavExtrasProps) {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const name = session.user.name?.split(" ")[0] ?? "Atleta";

  return (
    <Link
      href="/area-atleta"
      onClick={onNavigate}
      className="mt-4 flex w-full items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-3 text-base font-medium text-forest transition-colors hover:bg-emerald-50"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
        <User className="h-5 w-5" />
      </span>
      <span>
        Area atleta
        <span className="block text-sm font-normal text-forest/60">Ciao, {name}</span>
      </span>
    </Link>
  );
}
