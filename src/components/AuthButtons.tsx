"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthUI } from "@/components/AuthUIProvider";

type AuthButtonsProps = {
  scrolled?: boolean;
  className?: string;
};

export function AuthButtons({ scrolled = true, className }: AuthButtonsProps) {
  const { data: session, status } = useSession();
  const { openLogin, openRegister } = useAuthUI();

  if (status === "loading") {
    return (
      <div className={className}>
        <div className="h-9 w-24 animate-pulse rounded-full bg-emerald-100/50" />
      </div>
    );
  }

  if (session?.user) {
    const name = session.user.name?.split(" ")[0] ?? "Atleta";
    return (
      <div className={`flex items-center gap-2 ${className ?? ""}`}>
        <Link
          href="/area-atleta"
          className={`hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:inline-flex ${
            scrolled
              ? "text-forest/80 hover:bg-emerald-50 hover:text-emerald-600"
              : "text-white/90 hover:bg-white/10 hover:text-white"
          }`}
        >
          <User className="h-4 w-4" />
          {name}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`rounded-full ${
            scrolled ? "text-forest/60 hover:text-forest" : "text-white/70 hover:text-white"
          }`}
        >
          <LogOut className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Esci</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={openLogin}
        className={`rounded-full ${
          scrolled
            ? "text-forest/80 hover:bg-emerald-50 hover:text-emerald-600"
            : "text-white/90 hover:bg-white/10 hover:text-white"
        }`}
      >
        Accedi
      </Button>
      <Button
        size="sm"
        onClick={openRegister}
        className="rounded-full bg-white/20 px-4 text-white backdrop-blur-sm hover:bg-white/30 sm:bg-emerald-500 sm:text-white sm:hover:bg-emerald-600"
      >
        Registrati
      </Button>
    </div>
  );
}
