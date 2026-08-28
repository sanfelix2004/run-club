"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerWithEmail } from "@/app/actions/auth";
import { ModalPortal } from "@/components/ModalPortal";
import { PrivacyConsentField } from "@/components/PrivacyConsentField";

type AuthMode = "login" | "register";

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: AuthMode;
  googleOAuthEnabled: boolean;
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AuthDialog({
  open,
  onOpenChange,
  defaultMode = "login",
  googleOAuthEnabled,
}: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setFieldErrors({});
      return;
    }

    setMode(defaultMode);
  }, [open, defaultMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  const googleNotConfigured = !googleOAuthEnabled;

  const handleGoogleOAuth = () => {
    if (!googleOAuthEnabled) {
      toast.error(
        "Accesso con Google non ancora attivo. Usa email e password oppure chiedi allo staff di configurare OAuth.",
        { duration: 5000 },
      );
      return;
    }

    setLoading(true);
    void signIn("google", { callbackUrl: window.location.href });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Email o password non corretti.");
      return;
    }

    toast.success("Accesso effettuato!");
    onOpenChange(false);
    window.location.reload();
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      acceptPrivacy: formData.get("acceptPrivacy") === "true",
    };

    const result = await registerWithEmail(data);
    if (!result.success) {
      setLoading(false);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      toast.error(result.error);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      toast.success("Account creato! Ora puoi accedere.");
      setMode("login");
      return;
    }

    toast.success("Registrazione completata!");
    onOpenChange(false);
    window.location.reload();
  };

  if (!open) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto p-4">
        <button
          type="button"
          className="fixed inset-0 z-0 bg-forest/70 backdrop-blur-md"
          aria-label="Chiudi"
          onClick={() => onOpenChange(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-dialog-title"
          className="relative z-[1] my-auto w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-2xl sm:p-8"
        >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1 text-forest/40 transition-colors hover:bg-emerald-50 hover:text-forest"
          aria-label="Chiudi"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 id="auth-dialog-title" className="text-2xl font-bold text-forest">
          {mode === "login" ? "Accedi" : "Registrati"}
        </h2>
        <p className="mt-1 text-sm text-forest/60">
          {mode === "login"
            ? "Bentornato! Accedi per gestire le tue prenotazioni."
            : "Crea un account per prenotare eventi e vedere il tuo storico."}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleGoogleOAuth}
            className={`h-11 w-full rounded-xl border-emerald-100 ${googleNotConfigured ? "opacity-70" : ""}`}
          >
            <GoogleIcon className="mr-2 h-5 w-5" />
            {loading ? "Reindirizzamento..." : "Continua con Google"}
          </Button>
          {googleNotConfigured && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
              Google non è ancora collegato a questo sito. Per ora usa{" "}
              <strong>email e password</strong>. Per attivarlo serve configurare le
              credenziali OAuth nel file <code className="rounded bg-amber-100 px-1">.env</code>.
            </p>
          )}
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-emerald-100" />
          <span className="text-xs text-forest/40">oppure con email</span>
          <div className="h-px flex-1 bg-emerald-100" />
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                required
                className="rounded-xl border-emerald-100"
                placeholder="marco@example.com"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500">{fieldErrors.email[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                required
                className="rounded-xl border-emerald-100"
                placeholder="••••••••"
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-500">{fieldErrors.password[0]}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-500 py-5 text-white hover:bg-emerald-600"
            >
              {loading ? "Accesso..." : "Accedi"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">Nome</Label>
              <Input
                id="register-name"
                name="name"
                required
                className="rounded-xl border-emerald-100"
                placeholder="Marco Rossi"
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-500">{fieldErrors.name[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                name="email"
                type="email"
                required
                className="rounded-xl border-emerald-100"
                placeholder="marco@example.com"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500">{fieldErrors.email[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                name="password"
                type="password"
                required
                className="rounded-xl border-emerald-100"
                placeholder="Minimo 8 caratteri"
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-500">{fieldErrors.password[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-confirm">Conferma password</Label>
              <Input
                id="register-confirm"
                name="confirmPassword"
                type="password"
                required
                className="rounded-xl border-emerald-100"
                placeholder="Ripeti la password"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500">{fieldErrors.confirmPassword[0]}</p>
              )}
            </div>
            <PrivacyConsentField
              id="register-acceptPrivacy"
              error={fieldErrors.acceptPrivacy?.[0]}
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-500 py-5 text-white hover:bg-emerald-600"
            >
              {loading ? "Registrazione..." : "Crea account"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-forest/60">
          {mode === "login" ? (
            <>
              Non hai un account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setFieldErrors({});
                }}
                className="font-medium text-emerald-600 hover:underline"
              >
                Registrati
              </button>
            </>
          ) : (
            <>
              Hai già un account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setFieldErrors({});
                }}
                className="font-medium text-emerald-600 hover:underline"
              >
                Accedi
              </button>
            </>
          )}
        </p>
        </div>
      </div>
    </ModalPortal>
  );
}
