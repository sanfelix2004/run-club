"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  buildConfirmationUrl,
  buildWhatsAppClickToChatUrl,
  buildWhatsAppConfirmMessage,
  ensureConfirmationToken,
  ensureParticipationColumns,
  normalizePhoneForWhatsApp,
} from "@/lib/participation";
import {
  PARTICIPATION_STATUSES,
  REGISTRATION_STATUSES,
  type ParticipationStatus,
} from "@/lib/registration-types";
import { FEATURED_EVENT } from "@/lib/constants";
import { isAdminAuthenticated } from "@/app/actions/admin-auth";

export type ConfirmationLookup =
  | {
      success: true;
      firstName: string;
      lastName: string;
      eventTitle: string;
      eventDateLabel: string;
      participationStatus: ParticipationStatus;
    }
  | { success: false; error: string };

export async function getConfirmationByToken(token: string): Promise<ConfirmationLookup> {
  await ensureParticipationColumns();

  const registration = await prisma.registration.findUnique({
    where: { confirmationToken: token },
    include: { event: true },
  });

  if (!registration) {
    return { success: false, error: "Link non valido o scaduto." };
  }

  if (registration.status === REGISTRATION_STATUSES.CANCELLED) {
    return { success: false, error: "Questa prenotazione risulta annullata." };
  }

  const eventDate = registration.event.dateTime.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Rome",
  });

  return {
    success: true,
    firstName: registration.firstName,
    lastName: registration.lastName,
    eventTitle: registration.event.title,
    eventDateLabel: eventDate,
    participationStatus: (registration.participationStatus ||
      PARTICIPATION_STATUSES.PENDING) as ParticipationStatus,
  };
}

export type ConfirmParticipationResult =
  | { success: true; participationStatus: ParticipationStatus }
  | { success: false; error: string };

export async function submitParticipationConfirmation(
  token: string,
  answer: "YES" | "NO",
): Promise<ConfirmParticipationResult> {
  await ensureParticipationColumns();

  if (answer !== "YES" && answer !== "NO") {
    return { success: false, error: "Risposta non valida." };
  }

  const registration = await prisma.registration.findUnique({
    where: { confirmationToken: token },
  });

  if (!registration) {
    return { success: false, error: "Link non valido o scaduto." };
  }

  if (registration.status === REGISTRATION_STATUSES.CANCELLED) {
    return { success: false, error: "Questa prenotazione risulta annullata." };
  }

  await prisma.registration.update({
    where: { id: registration.id },
    data: {
      participationStatus: answer,
      participationRespondedAt: new Date(),
    },
  });

  revalidatePath("/admin/events");
  revalidatePath(`/conferma/${token}`);

  return { success: true, participationStatus: answer };
}

export type WhatsAppTestSendResult =
  | {
      success: true;
      phone: string;
      confirmationUrl: string;
      whatsappUrl: string;
      message: string;
      registrationName: string;
    }
  | { success: false; error: string };

/** Prepara il messaggio WhatsApp di prova per un numero (default: 3288826170). */
export async function prepareWhatsAppConfirmationTest(
  phone = "3288826170",
): Promise<WhatsAppTestSendResult> {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return { success: false, error: "Accesso non autorizzato." };
  }

  await ensureParticipationColumns();

  const normalized = normalizePhoneForWhatsApp(phone);
  const local = normalized.replace(/^39/, "");

  const registration = await prisma.registration.findFirst({
    where: {
      eventId: FEATURED_EVENT.id,
      status: { not: REGISTRATION_STATUSES.CANCELLED },
      OR: [
        { phone: { contains: local } },
        { phone: { contains: normalized } },
        { phone: phone },
      ],
    },
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });

  if (!registration) {
    return {
      success: false,
      error: `Nessuna prenotazione attiva trovata per il numero ${phone}. Iscriviti prima con quel telefono, oppure usa un iscritto esistente.`,
    };
  }

  const token = await ensureConfirmationToken(registration.id);
  const confirmationUrl = buildConfirmationUrl(token);
  const message = buildWhatsAppConfirmMessage({
    firstName: registration.firstName,
    confirmationUrl,
    eventTitle: registration.event.title,
  });
  const whatsappUrl = buildWhatsAppClickToChatUrl(registration.phone, message);

  await prisma.registration.update({
    where: { id: registration.id },
    data: { confirmationSentAt: new Date() },
  });

  revalidatePath("/admin/events");

  return {
    success: true,
    phone: registration.phone,
    confirmationUrl,
    whatsappUrl,
    message,
    registrationName: `${registration.firstName} ${registration.lastName}`,
  };
}
