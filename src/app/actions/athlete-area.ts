"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";
import {
  athleteLoginSchema,
  type AthleteLoginData,
} from "@/lib/validations/athlete-area";

const ATHLETE_COOKIE = "runclub_athlete_email";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function phonesMatch(stored: string, input: string): boolean {
  const a = normalizePhone(stored);
  const b = normalizePhone(input);
  if (!a || !b) return false;
  if (a === b) return true;
  const minLen = 9;
  if (a.length >= minLen && b.length >= minLen) {
    return a.slice(-minLen) === b.slice(-minLen);
  }
  return false;
}

async function getAuthenticatedEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ATHLETE_COOKIE)?.value;
  if (!value) return null;
  return decodeURIComponent(value).toLowerCase();
}

export type AthleteRegistration = {
  id: string;
  qrToken: string;
  status: string;
  paceCategory: string;
  checkedInAt: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    dateTime: string;
    locationName: string;
    priceAmount: number;
  };
};

export type AthleteDashboard = {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    paceCategory: string;
    emergencyContact: string;
  };
  stats: {
    totalRegistrations: number;
    eventsAttended: number;
    upcomingEvents: number;
  };
  registrations: AthleteRegistration[];
};

export type AthleteLoginResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function loginAthleteArea(data: AthleteLoginData): Promise<AthleteLoginResult> {
  const parsed = athleteLoginSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dati non validi. Controlla email e telefono.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { phone } = parsed.data;

  const registrations = await prisma.registration.findMany({
    where: {
      email,
      status: { not: REGISTRATION_STATUSES.CANCELLED },
    },
  });

  if (registrations.length === 0) {
    return {
      success: false,
      error: "Nessuna iscrizione trovata con questa email.",
    };
  }

  const phoneMatches = registrations.some((r) => phonesMatch(r.phone, phone));

  if (!phoneMatches) {
    return {
      success: false,
      error: "Email o telefono non corrispondono ai dati di iscrizione.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(ATHLETE_COOKIE, encodeURIComponent(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return { success: true };
}

export async function logoutAthleteArea(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ATHLETE_COOKIE);
}

export async function getAthleteDashboard(): Promise<AthleteDashboard | null> {
  const email = await getAuthenticatedEmail();
  if (!email) return null;

  const registrations = await prisma.registration.findMany({
    where: {
      email,
      status: { not: REGISTRATION_STATUSES.CANCELLED },
    },
    include: { event: true },
    orderBy: { event: { dateTime: "desc" } },
  });

  if (registrations.length === 0) {
    await logoutAthleteArea();
    return null;
  }

  const latest = registrations[0];
  const now = new Date();

  return {
    profile: {
      firstName: latest.firstName,
      lastName: latest.lastName,
      email: latest.email,
      phone: latest.phone,
      paceCategory: latest.paceCategory,
      emergencyContact: latest.emergencyContact,
    },
    stats: {
      totalRegistrations: registrations.length,
      eventsAttended: registrations.filter(
        (r) => r.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
      ).length,
      upcomingEvents: registrations.filter(
        (r) => r.event.dateTime >= now && r.status === REGISTRATION_STATUSES.PENDING_PAYMENT,
      ).length,
    },
    registrations: registrations.map((r) => ({
      id: r.id,
      qrToken: r.qrToken,
      status: r.status,
      paceCategory: r.paceCategory,
      checkedInAt: r.checkedInAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      event: {
        id: r.event.id,
        title: r.event.title,
        dateTime: r.event.dateTime.toISOString(),
        locationName: r.event.locationName,
        priceAmount: r.event.priceAmount,
      },
    })),
  };
}

export async function isAthleteAuthenticated(): Promise<boolean> {
  const email = await getAuthenticatedEmail();
  if (!email) return false;

  const count = await prisma.registration.count({
    where: {
      email,
      status: { not: REGISTRATION_STATUSES.CANCELLED },
    },
  });

  return count > 0;
}
