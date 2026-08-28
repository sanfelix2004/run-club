"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { PublicEvent } from "@/app/actions/events";
import { EventRegistrationSheet } from "@/components/EventRegistrationSheet";

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
};

export function EventRegistrationProvider({
  children,
  user = null,
}: EventRegistrationProviderProps) {
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);

  const openRegistration = useCallback((event: PublicEvent) => {
    setSelectedEvent(event);
    setOpen(true);
  }, []);

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
      />
    </EventRegistrationContext.Provider>
  );
}
