"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  PARTICIPATION_STATUSES,
  REGISTRATION_STATUSES,
  type ParticipationStatus,
} from "@/lib/registration-types";
import { isAdminAuthenticated } from "@/app/actions/admin-auth";
import { assertEventHasCapacity } from "@/lib/event-capacity";
import { ensureParticipationColumns } from "@/lib/participation";
import {
  adminRegistrationUpdateSchema,
  type AdminRegistrationUpdateData,
} from "@/lib/validations/admin-registration";

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
  participationStatus: ParticipationStatus;
  participationRespondedAt: string | null;
  confirmationSentAt: string | null;
};

export type EventAttendanceSummary = {
  eventTitle: string;
  totalRegistered: number;
  checkedIn: number;
  pending: number;
  cancelled: number;
  participationYes: number;
  participationNo: number;
  participationPending: number;
  attendees: EventAttendee[];
};

function serializeRegistration(r: {
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
  checkedInAt: Date | null;
  createdAt: Date;
  participationStatus?: string | null;
  participationRespondedAt?: Date | null;
  confirmationSentAt?: Date | null;
}): EventAttendee {
  return {
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
    participationStatus: (r.participationStatus ||
      PARTICIPATION_STATUSES.PENDING) as ParticipationStatus,
    participationRespondedAt: r.participationRespondedAt?.toISOString() ?? null,
    confirmationSentAt: r.confirmationSentAt?.toISOString() ?? null,
  };
}

function revalidateRegistrationPaths() {
  revalidatePath("/admin/events");
  revalidatePath("/admin/checkin");
  revalidatePath("/area-atleta");
}

export async function getEventAttendance(
  eventId: string,
): Promise<EventAttendanceSummary | null> {
  const authed = await isAdminAuthenticated();
  if (!authed) return null;

  await ensureParticipationColumns();

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return null;

  const registrations = await prisma.registration.findMany({
    where: { eventId },
    orderBy: [
      { status: "asc" },
      { checkedInAt: "desc" },
      { lastName: "asc" },
      { firstName: "asc" },
    ],
  });

  const active = registrations.filter(
    (r) => r.status !== REGISTRATION_STATUSES.CANCELLED,
  );

  return {
    eventTitle: event.title,
    totalRegistered: active.length,
    checkedIn: active.filter(
      (r) => r.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
    ).length,
    pending: active.filter((r) => r.status === REGISTRATION_STATUSES.PENDING_PAYMENT)
      .length,
    cancelled: registrations.filter(
      (r) => r.status === REGISTRATION_STATUSES.CANCELLED,
    ).length,
    participationYes: active.filter(
      (r) => r.participationStatus === PARTICIPATION_STATUSES.YES,
    ).length,
    participationNo: active.filter(
      (r) => r.participationStatus === PARTICIPATION_STATUSES.NO,
    ).length,
    participationPending: active.filter(
      (r) =>
        !r.participationStatus ||
        r.participationStatus === PARTICIPATION_STATUSES.PENDING,
    ).length,
    attendees: registrations.map(serializeRegistration),
  };
}

export type AdminRegistrationResult =
  | { success: true; attendee: EventAttendee }
  | { success: false; error: string };

async function updateRegistrationRecord(
  registrationId: string,
  data: AdminRegistrationUpdateData,
): Promise<AdminRegistrationResult> {
  const authed = await isAdminAuthenticated();
  if (!authed) return { success: false, error: "Accesso non autorizzato." };

  const parsed = adminRegistrationUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const existing = await prisma.registration.findUnique({
    where: { id: registrationId },
  });
  if (!existing) {
    return { success: false, error: "Iscrizione non trovata." };
  }

  const { status, medicalNotes, ...rest } = parsed.data;

  if (
    existing.status === REGISTRATION_STATUSES.CANCELLED &&
    status !== REGISTRATION_STATUSES.CANCELLED
  ) {
    const capacity = await assertEventHasCapacity(existing.eventId);
    if (!capacity.ok) {
      return { success: false, error: capacity.error };
    }
  }

  let checkedInAt = existing.checkedInAt;
  if (status === REGISTRATION_STATUSES.CANCELLED) {
    checkedInAt = null;
  } else if (status === REGISTRATION_STATUSES.PENDING_PAYMENT) {
    checkedInAt = null;
  } else if (status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN && !checkedInAt) {
    checkedInAt = new Date();
  }

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      ...rest,
      email: rest.email.trim().toLowerCase(),
      medicalNotes: medicalNotes?.trim() || null,
      status,
      checkedInAt,
    },
  });

  revalidateRegistrationPaths();
  return { success: true, attendee: serializeRegistration(updated) };
}

export async function updateRegistrationAdmin(
  registrationId: string,
  data: AdminRegistrationUpdateData,
): Promise<AdminRegistrationResult> {
  return updateRegistrationRecord(registrationId, data);
}

export async function cancelRegistrationAdmin(
  registrationId: string,
): Promise<AdminRegistrationResult> {
  const authed = await isAdminAuthenticated();
  if (!authed) return { success: false, error: "Accesso non autorizzato." };

  const existing = await prisma.registration.findUnique({
    where: { id: registrationId },
  });
  if (!existing) {
    return { success: false, error: "Iscrizione non trovata." };
  }

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: REGISTRATION_STATUSES.CANCELLED,
      checkedInAt: null,
    },
  });

  revalidateRegistrationPaths();
  return { success: true, attendee: serializeRegistration(updated) };
}

export async function restoreRegistrationAdmin(
  registrationId: string,
): Promise<AdminRegistrationResult> {
  const authed = await isAdminAuthenticated();
  if (!authed) return { success: false, error: "Accesso non autorizzato." };

  const existing = await prisma.registration.findUnique({
    where: { id: registrationId },
  });
  if (!existing) {
    return { success: false, error: "Iscrizione non trovata." };
  }

  if (existing.status === REGISTRATION_STATUSES.CANCELLED) {
    const capacity = await assertEventHasCapacity(existing.eventId);
    if (!capacity.ok) {
      return { success: false, error: capacity.error };
    }
  }

  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: REGISTRATION_STATUSES.PENDING_PAYMENT,
      checkedInAt: null,
    },
  });

  revalidateRegistrationPaths();
  return { success: true, attendee: serializeRegistration(updated) };
}
