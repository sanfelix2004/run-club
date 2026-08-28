"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AuthDialog } from "@/components/AuthDialog";

type AuthUIContextValue = {
  openLogin: () => void;
  openRegister: () => void;
};

const AuthUIContext = createContext<AuthUIContextValue | null>(null);

export function useAuthUI() {
  const ctx = useContext(AuthUIContext);
  if (!ctx) {
    throw new Error("useAuthUI must be used within AuthUIProvider");
  }
  return ctx;
}

type AuthUIProviderProps = {
  children: React.ReactNode;
};

export function AuthUIProvider({ children }: AuthUIProviderProps) {
  const { status } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("register");
  const [promptShown, setPromptShown] = useState(false);

  const openLogin = useCallback(() => {
    setMode("login");
    setDialogOpen(true);
  }, []);

  const openRegister = useCallback(() => {
    setMode("register");
    setDialogOpen(true);
  }, []);

  useEffect(() => {
    if (status !== "unauthenticated") return;

    const dismissed = localStorage.getItem("auth_prompt_dismissed");
    if (!dismissed && !promptShown) {
      const timer = setTimeout(() => {
        setMode("register");
        setDialogOpen(true);
        setPromptShown(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [status, promptShown]);

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open && status === "unauthenticated") {
      localStorage.setItem("auth_prompt_dismissed", "1");
    }
  };

  return (
    <AuthUIContext.Provider value={{ openLogin, openRegister }}>
      {children}
      <AuthDialog open={dialogOpen} onOpenChange={handleOpenChange} defaultMode={mode} />
    </AuthUIContext.Provider>
  );
}
