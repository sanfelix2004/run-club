"use server";

import { prisma } from "@/lib/db";
import { generateQrToken } from "@/lib/qr";
import {
  registrationSchema,
  type RegistrationFormData,
} from "@/lib/validations/registration";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";

export type RegistrationResult =
  | {
      success: true;
      registration: {
        id: string;
        qrToken: string;
        firstName: string;
        lastName: string;
        paceCategory: string;
        status: string;
        event: {
          title: string;
          dateTime: string;
          locationName: string;
          priceAmount: number;
          currency: string;
        };
      };
    }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function registerForMeetup(
  data: RegistrationFormData & { eventId?: string },
): Promise<RegistrationResult> {
  const parsed = registrationSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dati non validi. Controlla i campi e riprova.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let event = data.eventId
    ? await prisma.event.findFirst({
        where: { id: data.eventId, dateTime: { gte: now } },
      })
    : await prisma.event.findFirst({
        where: { dateTime: { gte: now } },
        orderBy: { dateTime: "asc" },
      });

  if (!event) {
    return {
      success: false,
      error: "Nessun evento disponibile al momento. Riprova più tardi.",
    };
  }

  const { firstName, lastName, email, phone, emergencyName, emergencyPhone, paceCategory } =
    parsed.data;

  const qrToken = generateQrToken();
  const emergencyContact = `${emergencyName} — ${emergencyPhone}`;

  const registration = await prisma.registration.create({
    data: {
      eventId: event.id,
      firstName,
      lastName,
      email,
      phone,
      emergencyContact,
      paceCategory,
      qrToken,
      status: REGISTRATION_STATUSES.PENDING_PAYMENT,
    },
    include: { event: true },
  });

  return {
    success: true,
    registration: {
      id: registration.id,
      qrToken: registration.qrToken,
      firstName: registration.firstName,
      lastName: registration.lastName,
      paceCategory: registration.paceCategory,
      status: registration.status,
      event: {
        title: registration.event.title,
        dateTime: registration.event.dateTime.toISOString(),
        locationName: registration.event.locationName,
        priceAmount: registration.event.priceAmount,
        currency: registration.event.currency,
      },
    },
  };
}
