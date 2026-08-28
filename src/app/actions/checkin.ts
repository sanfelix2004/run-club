"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { isValidQrToken } from "@/lib/qr";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";

const ADMIN_COOKIE = "runclub_admin_auth";

function getAdminPin(): string {
  return process.env.ADMIN_PIN ?? "runclub2026";
}

export async function verifyAdminPin(pin: string): Promise<{ success: boolean }> {
  if (pin !== getAdminPin()) {
    return { success: false };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });

  return { success: true };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "authenticated";
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

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
        priceAmount: number;
      };
    }
  | { success: false; error: string };

export async function lookupRegistrationByQr(qrToken: string): Promise<ScanResult> {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return { success: false, error: "Accesso non autorizzato." };
  }

  if (!isValidQrToken(qrToken)) {
    return { success: false, error: "QR code non valido o corrotto." };
  }

  const registration = await prisma.registration.findUnique({
    where: { qrToken },
    include: { event: true },
  });

  if (!registration) {
    return { success: false, error: "Biglietto non trovato nel sistema." };
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
      priceAmount: registration.event.priceAmount,
    },
  };
}

export type CheckInResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function confirmCheckIn(registrationId: string): Promise<CheckInResult> {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return { success: false, error: "Accesso non autorizzato." };
  }

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

  return {
    success: true,
    message: `${registration.firstName} ${registration.lastName} — presenza confermata e €5,00 incassati.`,
  };
}

export type CheckInStats = {
  totalRegistered: number;
  checkedIn: number;
  pending: number;
  totalCollected: number;
};

export async function getCheckInStats(): Promise<CheckInStats> {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return { totalRegistered: 0, checkedIn: 0, pending: 0, totalCollected: 0 };
  }

  const event = await prisma.event.findFirst({ orderBy: { dateTime: "asc" } });
  if (!event) {
    return { totalRegistered: 0, checkedIn: 0, pending: 0, totalCollected: 0 };
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
    totalRegistered,
    checkedIn,
    pending: totalRegistered - checkedIn,
    totalCollected: checkedIn * event.priceAmount,
  };
}
