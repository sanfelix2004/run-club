"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { formatEventDate } from "@/lib/pdf";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";
import { isAdminAuthenticated } from "@/app/actions/admin-auth";
import { eventSchema, type EventFormData } from "@/lib/validations/event";
import { ensureFeaturedEvent } from "@/lib/featured-event";
import { MAX_EVENT_REGISTRATIONS } from "@/lib/constants";
import { isEventFull } from "@/lib/event-capacity";

export type PublicEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  dateTime: string;
  locationName: string;
  priceAmount: number;
  currency: string;
  registrationCount: number;
  maxRegistrations: number;
  isFull: boolean;
};

export type AdminEvent = PublicEvent & {
  checkedInCount: number;
};

function serializeEvent(
  event: {
    id: string;
    title: string;
    description: string | null;
    dateTime: Date;
    locationName: string;
    priceAmount: number;
    currency: string;
    _count?: { registrations: number };
  },
): PublicEvent {
  const { date, time } = formatEventDate(event.dateTime);
  const registrationCount = event._count?.registrations ?? 0;
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date,
    time,
    dateTime: event.dateTime.toISOString(),
    locationName: event.locationName,
    priceAmount: event.priceAmount,
    currency: event.currency,
    registrationCount,
    maxRegistrations: MAX_EVENT_REGISTRATIONS,
    isFull: isEventFull(registrationCount),
  };
}

export async function getUpcomingEvents(): Promise<PublicEvent[]> {
  try {
  await ensureFeaturedEvent();

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const events = await prisma.event.findMany({
    where: { dateTime: { gte: now } },
    orderBy: { dateTime: "asc" },
    include: {
      _count: {
        select: {
          registrations: {
            where: { status: { not: REGISTRATION_STATUSES.CANCELLED } },
          },
        },
      },
    },
  });

  return events.map(serializeEvent);
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function getAllEventsAdmin(): Promise<AdminEvent[]> {
  const authed = await isAdminAuthenticated();
  if (!authed) return [];

  const events = await prisma.event.findMany({
    orderBy: { dateTime: "asc" },
    include: {
      registrations: {
        where: { status: { not: REGISTRATION_STATUSES.CANCELLED } },
        select: { status: true },
      },
    },
  });

  return events.map((event) => {
    const base = serializeEvent({
      ...event,
      _count: { registrations: event.registrations.length },
    });
    return {
      ...base,
      checkedInCount: event.registrations.filter(
        (r) => r.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
      ).length,
    };
  });
}

type ActionResult =
  | { success: true; event: PublicEvent }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createEvent(data: EventFormData): Promise<ActionResult> {
  const authed = await isAdminAuthenticated();
  if (!authed) return { success: false, error: "Accesso non autorizzato." };

  const parsed = eventSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dati non validi.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const event = await prisma.event.create({
    data: {
      title: parsed.data.title,
      dateTime: new Date(parsed.data.dateTime),
      locationName: parsed.data.locationName,
      priceAmount: parsed.data.priceAmount,
      currency: parsed.data.currency,
      description: parsed.data.description || null,
    },
    include: { _count: { select: { registrations: true } } },
  });

  revalidatePath("/");
  revalidatePath("/admin/events");

  return { success: true, event: serializeEvent(event) };
}

export async function updateEvent(
  id: string,
  data: EventFormData,
): Promise<ActionResult> {
  const authed = await isAdminAuthenticated();
  if (!authed) return { success: false, error: "Accesso non autorizzato." };

  const parsed = eventSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dati non validi.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const event = await prisma.event.update({
    where: { id },
    data: {
      title: parsed.data.title,
      dateTime: new Date(parsed.data.dateTime),
      locationName: parsed.data.locationName,
      priceAmount: parsed.data.priceAmount,
      currency: parsed.data.currency,
      description: parsed.data.description || null,
    },
    include: { _count: { select: { registrations: true } } },
  });

  revalidatePath("/");
  revalidatePath("/admin/events");

  return { success: true, event: serializeEvent(event) };
}

export async function deleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
  const authed = await isAdminAuthenticated();
  if (!authed) return { success: false, error: "Accesso non autorizzato." };

  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { registrations: true } } },
  });

  if (!event) {
    return { success: false, error: "Evento non trovato." };
  }

  try {
    await prisma.event.delete({ where: { id } });
  } catch (error) {
    console.error("Error deleting event:", error);
    return {
      success: false,
      error:
        "Impossibile eliminare l'evento. Riprova o contatta il supporto tecnico.",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/events");

  return { success: true };
}

export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          registrations: {
            where: { status: { not: REGISTRATION_STATUSES.CANCELLED } },
          },
        },
      },
    },
  });

  if (!event) return null;
  return serializeEvent(event);
}
