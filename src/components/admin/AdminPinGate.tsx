"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  isAdminAuthenticated,
  logoutAdmin,
  verifyAdminPin,
} from "@/app/actions/admin-auth";

type AdminPinGateProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AdminPinGate({ title, subtitle, children }: AdminPinGateProps) {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    isAdminAuthenticated().then((ok) => {
      setAuthed(ok);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await verifyAdminPin(pin);
    setSubmitting(false);
    if (result.success) {
      setAuthed(true);
      toast.success("Accesso confermato");
    } else {
      toast.error("Password non valida");
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAuthed(false);
    setPin("");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFBF7]">
        <p className="text-forest/50">Caricamento...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFBF7] p-4">
        <div className="w-full max-w-sm rounded-2xl border border-emerald-100 bg-white p-8 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Back office
          </p>
          <h1 className="mt-1 text-xl font-bold text-forest">{title}</h1>
          <p className="mt-2 text-sm text-forest/60">{subtitle}</p>
          <p className="mt-3 text-xs text-forest/45">
            Usa la password con lettere e numeri (tastiera completa, non solo cifre).
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Native input: evita tastiera numerica iOS (inputMode/pattern del vecchio PIN) */}
            <input
              type="text"
              name="admin-password"
              inputMode="text"
              enterKeyHint="done"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              lang="en"
              placeholder="Password (lettere e numeri)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="h-11 w-full rounded-xl border border-emerald-100 bg-white px-3 text-center text-base text-forest outline-none focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-200"
              style={{ WebkitTextSecurity: "disc" } as CSSProperties}
              autoFocus
            />
            <Button
              type="submit"
              disabled={submitting || !pin}
              className="w-full rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {submitting ? "Verifica..." : "Accedi"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-forest">{title}</h1>
            <p className="truncate text-xs text-forest/50">{subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <AdminNav />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              aria-label="Esci dal back office"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
