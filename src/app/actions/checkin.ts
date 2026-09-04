"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isValidQrToken, parseQrPayload, generateQrToken } from "@/lib/qr";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";
import { ensureFeaturedEvent } from "@/lib/featured-event";
import { FEATURED_EVENT } from "@/lib/constants";
import { assertEventHasCapacity } from "@/lib/event-capacity";
import { walkInRegistrationSchema } from "@/lib/validations/walk-in-registration";
import type { WalkInRegistrationData } from "@/lib/validations/walk-in-registration";
export type ScanResult =
  | {
      success: true;
      registration: {
        id: string;
        firstName: string;
        lastName: string;
        paceCategory: string;
        status: string;
        checkedInAt: string | null;
        email: string;
        phone: string;
      };
      event: {
        title: string;
        dateTime: string;
        locationName: string;
        priceAmount: number;
      };
    }
  | { success: false; error: string };

export async function lookupRegistrationByQr(qrToken: string): Promise<ScanResult> {
  const token = parseQrPayload(qrToken);

  if (!isValidQrToken(token)) {
    return { success: false, error: "QR code non valido o corrotto." };
  }

  const registration = await prisma.registration.findUnique({
    where: { qrToken: token },
    include: { event: true },
  });

  if (!registration) {
    return { success: false, error: "Biglietto non trovato nel sistema." };
  }

  if (registration.status === REGISTRATION_STATUSES.CANCELLED) {
    return { success: false, error: "Questa prenotazione è stata annullata." };
  }

  return {
    success: true,
    registration: {
      id: registration.id,
      firstName: registration.firstName,
      lastName: registration.lastName,
      paceCategory: registration.paceCategory,
      status: registration.status,
      checkedInAt: registration.checkedInAt?.toISOString() ?? null,
      email: registration.email,
      phone: registration.phone,
    },
    event: {
      title: registration.event.title,
      dateTime: registration.event.dateTime.toISOString(),
      locationName: registration.event.locationName,
      priceAmount: registration.event.priceAmount,
    },
  };
}

export type CheckInResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function confirmCheckIn(registrationId: string): Promise<CheckInResult> {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    return { success: false, error: "Registrazione non trovata." };
  }

  if (registration.status === REGISTRATION_STATUSES.CANCELLED) {
    return { success: false, error: "Questo biglietto è stato annullato." };
  }

  if (registration.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN) {
    return {
      success: false,
      error: `Biglietto già utilizzato il ${registration.checkedInAt?.toLocaleString("it-IT") ?? "—"}.`,
    };
  }

  await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
      checkedInAt: new Date(),
    },
  });

  const event = await prisma.event.findUnique({ where: { id: registration.eventId } });
  const price = event?.priceAmount ?? 5;

  return {
    success: true,
    message: `${registration.firstName} ${registration.lastName} — presenza confermata e €${price.toFixed(2).replace(".", ",")} incassati.`,
  };
}

export async function undoCheckIn(registrationId: string): Promise<CheckInResult> {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    return { success: false, error: "Registrazione non trovata." };
  }

  if (registration.status !== REGISTRATION_STATUSES.PAID_AND_CHECKED_IN) {
    return { success: false, error: "Questa persona non risulta ancora presente." };
  }

  await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: REGISTRATION_STATUSES.PENDING_PAYMENT,
      checkedInAt: null,
    },
  });

  revalidatePath("/admin/checkin");
  revalidatePath("/admin/events");
  revalidatePath("/area-atleta");

  return {
    success: true,
    message: `${registration.firstName} ${registration.lastName} — check-in annullato. Il QR è di nuovo utilizzabile.`,
  };
}

export type WalkInRegistrationResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function registerWalkIn(
  data: WalkInRegistrationData,
): Promise<WalkInRegistrationResult> {
  const parsed = walkInRegistrationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const event = await getActiveEvent();
  if (!event) {
    return { success: false, error: "Nessun evento attivo trovato." };
  }

  const { firstName, lastName, phone, hasPaid } = parsed.data;
  const normalizedPhone = phone.replace(/\s/g, "");

  const existing = await prisma.registration.findFirst({
    where: {
      eventId: event.id,
      phone: normalizedPhone,
      status: { not: REGISTRATION_STATUSES.CANCELLED },
    },
  });

  if (existing) {
    return {
      success: false,
      error: `${existing.firstName} ${existing.lastName} è già iscritto con questo numero.`,
    };
  }

  const capacity = await assertEventHasCapacity(event.id);
  if (!capacity.ok) {
    return { success: false, error: capacity.error };
  }

  const email = `walkin.${normalizedPhone.replace(/\D/g, "")}.${event.id.slice(0, 8)}@giovinazzo-sunset.run`;

  await prisma.registration.create({
    data: {
      eventId: event.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      phone: normalizedPhone,
      paceCategory: "Medio 5:00/km",
      qrToken: generateQrToken(),
      status: hasPaid
        ? REGISTRATION_STATUSES.PAID_AND_CHECKED_IN
        : REGISTRATION_STATUSES.PENDING_PAYMENT,
      checkedInAt: hasPaid ? new Date() : null,
    },
  });

  revalidatePath("/admin/checkin");
  revalidatePath("/admin/events");
  revalidatePath("/area-atleta");

  const paymentNote = hasPaid
    ? `€${event.priceAmount.toFixed(2).replace(".", ",")} incassati`
    : "pagamento in sospeso";

  return {
    success: true,
    message: `${firstName} ${lastName} registrato in loco — ${paymentNote}.`,
  };
}

export type CheckInStats = {
  eventId: string | null;
  eventTitle: string;
  totalRegistered: number;
  checkedIn: number;
  pending: number;
  totalCollected: number;
};

export type PresentAttendee = {
  id: string;
  firstName: string;
  lastName: string;
  paceCategory: string;
  checkedInAt: string;
};

async function getActiveEvent() {
  await ensureFeaturedEvent();

  const featured = await prisma.event.findUnique({
    where: { id: FEATURED_EVENT.id },
  });
  if (featured) return featured;

  const now = new Date();
  return (
    (await prisma.event.findFirst({
      where: { dateTime: { gte: now } },
      orderBy: { dateTime: "asc" },
    })) ??
    (await prisma.event.findFirst({
      orderBy: { dateTime: "desc" },
    }))
  );
}

export async function getCheckInStats(): Promise<CheckInStats> {
  const event = await getActiveEvent();
  if (!event) {
    return {
      eventId: null,
      eventTitle: "",
      totalRegistered: 0,
      checkedIn: 0,
      pending: 0,
      totalCollected: 0,
    };
  }

  const [totalRegistered, checkedIn] = await Promise.all([
    prisma.registration.count({
      where: { eventId: event.id, status: { not: REGISTRATION_STATUSES.CANCELLED } },
    }),
    prisma.registration.count({
      where: {
        eventId: event.id,
        status: REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
      },
    }),
  ]);

  return {
    eventId: event.id,
    eventTitle: event.title,
    totalRegistered,
    checkedIn,
    pending: totalRegistered - checkedIn,
    totalCollected: checkedIn * event.priceAmount,
  };
}

export async function getPresentAttendees(): Promise<PresentAttendee[]> {
  const event = await getActiveEvent();
  if (!event) return [];

  const registrations = await prisma.registration.findMany({
    where: {
      eventId: event.id,
      status: REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
    },
    orderBy: { checkedInAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      paceCategory: true,
      checkedInAt: true,
    },
  });

  return registrations
    .filter((r) => r.checkedInAt)
    .map((r) => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      paceCategory: r.paceCategory,
      checkedInAt: r.checkedInAt!.toISOString(),
    }));
}
