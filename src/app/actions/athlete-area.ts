"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";

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

export async function getAthleteDashboard(): Promise<AthleteDashboard | null> {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
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
    const nameParts = session?.user?.name?.split(" ") ?? ["Atleta", ""];
    return {
      profile: {
        firstName: nameParts[0] ?? "Atleta",
        lastName: nameParts.slice(1).join(" ") || "—",
        email,
        phone: "—",
        paceCategory: "—",
        emergencyContact: "—",
      },
      stats: {
        totalRegistrations: 0,
        eventsAttended: 0,
        upcomingEvents: 0,
      },
      registrations: [],
    };
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
        (r) =>
          r.event.dateTime >= now && r.status === REGISTRATION_STATUSES.PENDING_PAYMENT,
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
  const session = await auth();
  return Boolean(session?.user?.email);
}
