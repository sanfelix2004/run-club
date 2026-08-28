"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { AthleteProfile } from "@/app/actions/athlete-profile";
import type { PublicEvent } from "@/app/actions/events";
import { useAuthUI } from "@/components/AuthUIProvider";
import { EventRegistrationSheet } from "@/components/EventRegistrationSheet";
import { consumePendingEvent, savePendingEvent } from "@/lib/pending-event";

type BookingUser = {
  name: string;
  email: string;
} | null;

type EventRegistrationContextValue = {
  openRegistration: (event: PublicEvent) => void;
};

const EventRegistrationContext = createContext<EventRegistrationContextValue | null>(null);

export function useEventRegistration() {
  const ctx = useContext(EventRegistrationContext);
  if (!ctx) {
    throw new Error("useEventRegistration must be used within EventRegistrationProvider");
  }
  return ctx;
}

type EventRegistrationProviderProps = {
  children: React.ReactNode;
  user?: BookingUser;
  bookingProfile?: AthleteProfile | null;
};

export function EventRegistrationProvider({
  children,
  user: serverUser = null,
  bookingProfile: serverBookingProfile = null,
}: EventRegistrationProviderProps) {
  const { data: session, status } = useSession();
  const { openLogin } = useAuthUI();
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);

  const user: BookingUser =
    session?.user?.email
      ? {
          name: session.user.name ?? "",
          email: session.user.email,
        }
      : serverUser;

  const bookingProfile =
    status === "authenticated" ? serverBookingProfile : null;

  const showRegistration = useCallback((event: PublicEvent) => {
    setSelectedEvent(event);
    setOpen(true);
  }, []);

  const openRegistration = useCallback(
    (event: PublicEvent) => {
      if (status === "loading") {
        toast.message("Verifica accesso in corso...", {
          description: "Riprova tra un attimo.",
        });
        return;
      }

      if (status !== "authenticated") {
        savePendingEvent(event);
        toast.message("Accedi o registrati per prenotare", {
          description: "Serve un account per iscriverti all'evento e scaricare il PDF con QR code.",
        });
        openLogin();
        return;
      }

      showRegistration(event);
    },
    [openLogin, showRegistration, status],
  );

  useEffect(() => {
    if (status !== "authenticated") return;

    const pendingEvent = consumePendingEvent();
    if (pendingEvent) {
      showRegistration(pendingEvent);
    }
  }, [showRegistration, status]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTimeout(() => setSelectedEvent(null), 300);
    }
  };

  return (
    <EventRegistrationContext.Provider value={{ openRegistration }}>
      {children}
      <EventRegistrationSheet
        event={selectedEvent}
        open={open}
        onOpenChange={handleOpenChange}
        user={user}
        bookingProfile={bookingProfile}
      />
    </EventRegistrationContext.Provider>
  );
}
