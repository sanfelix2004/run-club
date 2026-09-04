import { prisma } from "@/lib/db";
import { MAX_EVENT_REGISTRATIONS } from "@/lib/constants";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";

export async function countActiveRegistrations(eventId: string): Promise<number> {
  return prisma.registration.count({
    where: {
      eventId,
      status: { not: REGISTRATION_STATUSES.CANCELLED },
    },
  });
}

export async function assertEventHasCapacity(
  eventId: string,
): Promise<{ ok: true; count: number } | { ok: false; error: string; count: number }> {
  const count = await countActiveRegistrations(eventId);

  if (count >= MAX_EVENT_REGISTRATIONS) {
    return {
      ok: false,
      count,
      error: "Iscrizioni chiuse per questo evento.",
    };
  }

  return { ok: true, count };
}

export function isEventFull(registrationCount: number): boolean {
  return registrationCount >= MAX_EVENT_REGISTRATIONS;
}

/** Contatore stile "33 persone/102" — senza messaggi marketing sul limite. */
export function formatRegistrationCapacity(count: number): string {
  return `${count} persone/${MAX_EVENT_REGISTRATIONS}`;
}
