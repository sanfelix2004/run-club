"use server";

import { prisma } from "@/lib/db";
import { generateQrToken } from "@/lib/qr";
import { formatEventDate } from "@/lib/pdf";
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
  data: RegistrationFormData,
): Promise<RegistrationResult> {
  const parsed = registrationSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dati non validi. Controlla i campi e riprova.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const event = await prisma.event.findFirst({
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

export async function getUpcomingEvent() {
  const event = await prisma.event.findFirst({
    orderBy: { dateTime: "asc" },
  });

  if (!event) return null;

  const { date, time } = formatEventDate(event.dateTime);

  return {
    id: event.id,
    title: event.title,
    date,
    time,
    dateTime: event.dateTime.toISOString(),
    locationName: event.locationName,
    priceAmount: event.priceAmount,
    currency: event.currency,
  };
}
