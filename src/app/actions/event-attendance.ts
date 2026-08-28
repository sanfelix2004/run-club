"use server";

import { prisma } from "@/lib/db";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";
import { isAdminAuthenticated } from "@/app/actions/admin-auth";

export type EventAttendee = {
  id: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContact: string | null;
  medicalNotes: string | null;
  paceCategory: string;
  qrToken: string;
  status: string;
  checkedInAt: string | null;
  createdAt: string;
};

export type EventAttendanceSummary = {
  eventTitle: string;
  totalRegistered: number;
  checkedIn: number;
  pending: number;
  attendees: EventAttendee[];
};

export async function getEventAttendance(
  eventId: string,
): Promise<EventAttendanceSummary | null> {
  const authed = await isAdminAuthenticated();
  if (!authed) return null;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return null;

  const registrations = await prisma.registration.findMany({
    where: {
      eventId,
      status: { not: REGISTRATION_STATUSES.CANCELLED },
    },
    orderBy: [{ checkedInAt: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
  });

  const checkedIn = registrations.filter(
    (r) => r.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
  ).length;

  return {
    eventTitle: event.title,
    totalRegistered: registrations.length,
    checkedIn,
    pending: registrations.length - checkedIn,
    attendees: registrations.map((r) => ({
      id: r.id,
      userId: r.userId,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      phone: r.phone,
      emergencyContact: r.emergencyContact,
      medicalNotes: r.medicalNotes,
      paceCategory: r.paceCategory,
      qrToken: r.qrToken,
      status: r.status,
      checkedInAt: r.checkedInAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
