"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      toast.success("Accesso back office confermato");
    } else {
      toast.error("PIN non valido");
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAuthed(false);
    setPin("");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFDFB]">
        <p className="text-forest/50">Caricamento...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFDFB] p-4">
        <div className="w-full max-w-sm rounded-2xl border border-emerald-100 bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-forest">{title}</h1>
          <p className="mt-2 text-sm text-forest/60">{subtitle}</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              type="password"
              inputMode="numeric"
              placeholder="PIN organizzatore"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="rounded-xl border-emerald-100 text-center text-lg tracking-widest"
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
    <div className="min-h-screen bg-[#FAFDFB]">
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-sm font-bold text-forest">{title}</h1>
            <p className="text-xs text-forest/50">{subtitle}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Esci">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      {children}
    </div>
  );
}
