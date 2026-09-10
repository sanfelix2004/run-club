"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isValidQrToken, parseQrPayload, generateQrToken } from "@/lib/qr";
import {
  isPaidStatus,
  isRacePresentStatus,
  REGISTRATION_STATUSES,
} from "@/lib/registration-types";
import { ensureFeaturedEvent } from "@/lib/featured-event";
import { FEATURED_EVENT } from "@/lib/constants";
import { assertEventHasCapacity } from "@/lib/event-capacity";
import { generateConfirmationToken } from "@/lib/participation";
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
        paidAt: string | null;
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

async function ensurePaidAtColumn() {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE registrations ADD COLUMN paid_at DATETIME`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/duplicate column|already exists/i.test(message)) {
      /* ignore */
    }
  }
}

function revalidateCheckInPaths() {
  revalidatePath("/admin/checkin");
  revalidatePath("/admin/events");
  revalidatePath("/area-atleta");
}

export async function lookupRegistrationByQr(qrToken: string): Promise<ScanResult> {
  await ensurePaidAtColumn();
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
      paidAt: registration.paidAt?.toISOString() ?? null,
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

/** Scansione QR.
 *  - raceDay=false (oggi): solo pagamento → PAID
 *  - raceDay=true (domani): se non ha pagato → paga+presente; se già pagato → solo presente
 */
export async function confirmCheckIn(
  registrationId: string,
  options?: { raceDay?: boolean },
): Promise<CheckInResult> {
  await ensurePaidAtColumn();
  const raceDay = options?.raceDay === true;

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    return { success: false, error: "Registrazione non trovata." };
  }

  if (registration.status === REGISTRATION_STATUSES.CANCELLED) {
    return { success: false, error: "Questo biglietto è stato annullato." };
  }

  const event = await prisma.event.findUnique({ where: { id: registration.eventId } });
  const price = event?.priceAmount ?? 5;
  const priceLabel = `€${price.toFixed(2).replace(".", ",")}`;

  if (raceDay) {
    if (isRacePresentStatus(registration.status)) {
      return {
        success: false,
        error: `Già presente alla corsa${
          registration.checkedInAt
            ? ` dalle ${registration.checkedInAt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`
            : ""
        }.`,
      };
    }

    const now = new Date();
    const wasAlreadyPaid = registration.status === REGISTRATION_STATUSES.PAID;

    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
        paidAt: registration.paidAt ?? now,
        checkedInAt: now,
      },
    });

    revalidateCheckInPaths();

    return {
      success: true,
      message: wasAlreadyPaid
        ? `${registration.firstName} ${registration.lastName} — presente alla corsa (già pagato).`
        : `${registration.firstName} ${registration.lastName} — ${priceLabel} incassati e presente alla corsa.`,
    };
  }

  if (isPaidStatus(registration.status)) {
    return {
      success: false,
      error: `Pagamento già registrato${
        registration.paidAt
          ? ` il ${registration.paidAt.toLocaleString("it-IT")}`
          : registration.checkedInAt
            ? ` il ${registration.checkedInAt.toLocaleString("it-IT")}`
            : ""
      }.`,
    };
  }

  await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: REGISTRATION_STATUSES.PAID,
      paidAt: new Date(),
    },
  });

  revalidateCheckInPaths();

  return {
    success: true,
    message: `${registration.firstName} ${registration.lastName} — pagamento ${priceLabel} registrato. Presenza corsa da confermare il giorno evento.`,
  };
}

/** Annulla solo il pagamento (QR di nuovo utilizzabile). */
export async function undoCheckIn(registrationId: string): Promise<CheckInResult> {
  await ensurePaidAtColumn();

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    return { success: false, error: "Registrazione non trovata." };
  }

  if (!isPaidStatus(registration.status)) {
    return { success: false, error: "Questa persona non risulta ancora pagata." };
  }

  await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: REGISTRATION_STATUSES.PENDING_PAYMENT,
      paidAt: null,
      checkedInAt: null,
    },
  });

  revalidateCheckInPaths();

  return {
    success: true,
    message: `${registration.firstName} ${registration.lastName} — pagamento annullato. Il QR è di nuovo utilizzabile.`,
  };
}

/** Segna una persona pagata come presente alla corsa. */
export async function markRacePresent(registrationId: string): Promise<CheckInResult> {
  await ensurePaidAtColumn();

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    return { success: false, error: "Registrazione non trovata." };
  }

  if (registration.status === REGISTRATION_STATUSES.CANCELLED) {
    return { success: false, error: "Iscrizione annullata." };
  }

  if (isRacePresentStatus(registration.status)) {
    return { success: false, error: "Questa persona risulta già presente alla corsa." };
  }

  if (registration.status !== REGISTRATION_STATUSES.PAID) {
    return {
      success: false,
      error: "Prima registra il pagamento con il QR, poi segna la presenza alla corsa.",
    };
  }

  await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
      checkedInAt: new Date(),
      paidAt: registration.paidAt ?? new Date(),
    },
  });

  revalidateCheckInPaths();

  return {
    success: true,
    message: `${registration.firstName} ${registration.lastName} — presente alla corsa.`,
  };
}

/** Bottone domani: tutti i pagati diventano presenti alla corsa. */
export async function markAllPaidAsRacePresent(): Promise<CheckInResult> {
  await ensurePaidAtColumn();

  const event = await getActiveEvent();
  if (!event) {
    return { success: false, error: "Nessun evento attivo trovato." };
  }

  const result = await prisma.registration.updateMany({
    where: {
      eventId: event.id,
      status: REGISTRATION_STATUSES.PAID,
    },
    data: {
      status: REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
      checkedInAt: new Date(),
    },
  });

  // Assicura paidAt sui record che non ce l'avevano (legacy)
  await prisma.$executeRawUnsafe(
    `UPDATE registrations SET paid_at = checked_in_at WHERE event_id = ? AND status = ? AND paid_at IS NULL AND checked_in_at IS NOT NULL`,
    event.id,
    REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
  );

  revalidateCheckInPaths();

  if (result.count === 0) {
    return {
      success: false,
      error: "Nessun pagato da segnare come presente. Scansiona prima i QR (pagamento).",
    };
  }

  return {
    success: true,
    message: `${result.count} persone segnate come presenti alla corsa.`,
  };
}

export async function undoRacePresent(registrationId: string): Promise<CheckInResult> {
  await ensurePaidAtColumn();

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    return { success: false, error: "Registrazione non trovata." };
  }

  if (!isRacePresentStatus(registration.status)) {
    return { success: false, error: "Questa persona non risulta presente alla corsa." };
  }

  await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: REGISTRATION_STATUSES.PAID,
      checkedInAt: null,
      paidAt: registration.paidAt ?? registration.checkedInAt ?? new Date(),
    },
  });

  revalidateCheckInPaths();

  return {
    success: true,
    message: `${registration.firstName} ${registration.lastName} — presenza corsa annullata (resta pagato).`,
  };
}

export type WalkInRegistrationResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function registerWalkIn(
  data: WalkInRegistrationData & { raceDay?: boolean },
): Promise<WalkInRegistrationResult> {
  await ensurePaidAtColumn();

  const parsed = walkInRegistrationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const event = await getActiveEvent();
  if (!event) {
    return { success: false, error: "Nessun evento attivo trovato." };
  }

  const { firstName, lastName, phone, hasPaid } = parsed.data;
  const raceDay = data.raceDay === true;
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
  const now = new Date();

  let status: string = REGISTRATION_STATUSES.PENDING_PAYMENT;
  let paidAt: Date | null = null;
  let checkedInAt: Date | null = null;

  if (hasPaid && raceDay) {
    status = REGISTRATION_STATUSES.PAID_AND_CHECKED_IN;
    paidAt = now;
    checkedInAt = now;
  } else if (hasPaid) {
    status = REGISTRATION_STATUSES.PAID;
    paidAt = now;
  }

  await prisma.registration.create({
    data: {
      eventId: event.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      phone: normalizedPhone,
      paceCategory: "Medio 5:00/km",
      qrToken: generateQrToken(),
      confirmationToken: generateConfirmationToken(),
      status,
      paidAt,
      checkedInAt,
    },
  });

  revalidateCheckInPaths();

  const paymentNote = !hasPaid
    ? "pagamento in sospeso"
    : raceDay
      ? `€${event.priceAmount.toFixed(2).replace(".", ",")} incassati e presente alla corsa`
      : `€${event.priceAmount.toFixed(2).replace(".", ",")} incassati (presenza corsa da segnare dopo)`;

  return {
    success: true,
    message: `${firstName} ${lastName} registrato in loco — ${paymentNote}.`,
  };
}

export type CheckInStats = {
  eventId: string | null;
  eventTitle: string;
  totalRegistered: number;
  paidCount: number;
  racePresentCount: number;
  pendingPayment: number;
  totalCollected: number;
};

export type PaidAttendee = {
  id: string;
  firstName: string;
  lastName: string;
  paceCategory: string;
  paidAt: string;
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
  await ensurePaidAtColumn();

  const event = await getActiveEvent();
  if (!event) {
    return {
      eventId: null,
      eventTitle: "",
      totalRegistered: 0,
      paidCount: 0,
      racePresentCount: 0,
      pendingPayment: 0,
      totalCollected: 0,
    };
  }

  const [totalRegistered, paidOnly, racePresent] = await Promise.all([
    prisma.registration.count({
      where: { eventId: event.id, status: { not: REGISTRATION_STATUSES.CANCELLED } },
    }),
    prisma.registration.count({
      where: { eventId: event.id, status: REGISTRATION_STATUSES.PAID },
    }),
    prisma.registration.count({
      where: {
        eventId: event.id,
        status: REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
      },
    }),
  ]);

  const paidCount = paidOnly + racePresent;

  return {
    eventId: event.id,
    eventTitle: event.title,
    totalRegistered,
    paidCount,
    racePresentCount: racePresent,
    pendingPayment: totalRegistered - paidCount,
    totalCollected: paidCount * event.priceAmount,
  };
}

export async function getPaidAttendees(): Promise<PaidAttendee[]> {
  await ensurePaidAtColumn();
  const event = await getActiveEvent();
  if (!event) return [];

  const registrations = await prisma.registration.findMany({
    where: {
      eventId: event.id,
      status: REGISTRATION_STATUSES.PAID,
    },
    orderBy: { paidAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      paceCategory: true,
      paidAt: true,
      createdAt: true,
    },
  });

  return registrations.map((r) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    paceCategory: r.paceCategory,
    paidAt: (r.paidAt ?? r.createdAt).toISOString(),
  }));
}

export async function getPresentAttendees(): Promise<PresentAttendee[]> {
  await ensurePaidAtColumn();
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
