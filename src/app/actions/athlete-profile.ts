"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PACE_CATEGORIES } from "@/lib/registration-types";
import {
  athleteProfileSchema,
  type AthleteProfileData,
} from "@/lib/validations/athlete-profile";

export type AthleteProfile = AthleteProfileData & {
  email: string;
};

export type ProfileUpdateResult =
  | { success: true; profile: AthleteProfile }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

function splitName(fullName: string | null | undefined) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function resolveProfile(user: {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  paceCategory: string | null;
  medicalNotes: string | null;
}): AthleteProfile {
  const fromName = splitName(user.name);
  return {
    email: user.email,
    firstName: user.firstName ?? fromName.firstName,
    lastName: user.lastName ?? fromName.lastName,
    phone: user.phone ?? "",
    paceCategory:
      (user.paceCategory as AthleteProfile["paceCategory"]) ?? PACE_CATEGORIES[1],
    medicalNotes: user.medicalNotes ?? "",
  };
}

function profileFromSession(session: {
  user?: { email?: string | null; name?: string | null };
}): AthleteProfile {
  const fromName = splitName(session.user?.name);
  return {
    email: session.user?.email?.toLowerCase() ?? "",
    firstName: fromName.firstName,
    lastName: fromName.lastName,
    phone: "",
    paceCategory: PACE_CATEGORIES[1],
    medicalNotes: "",
  };
}

async function ensureAthleteUser(session: {
  user?: { id?: string; email?: string | null; name?: string | null; image?: string | null };
}) {
  const email = session.user?.email?.toLowerCase();
  if (!email) return null;

  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) return byEmail;

  const userId = session.user?.id;
  if (userId) {
    const byId = await prisma.user.findUnique({ where: { id: userId } });
    if (byId) return byId;
  }

  try {
    return await prisma.user.create({
      data: {
        email,
        name: session.user?.name ?? null,
        image: session.user?.image ?? null,
      },
    });
  } catch {
    return prisma.user.findUnique({ where: { email } });
  }
}

export async function getAthleteProfile(): Promise<AthleteProfile | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await ensureAthleteUser(session);
  if (!user) return profileFromSession(session);
  return resolveProfile(user);
}

export async function getAthleteProfileForBooking(): Promise<AthleteProfile | null> {
  return getAthleteProfile();
}

export async function getOrCreateAthleteUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return ensureAthleteUser(session);
}

export async function updateAthleteProfile(
  data: AthleteProfileData,
): Promise<ProfileUpdateResult> {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Devi essere autenticato." };
  }

  const parsed = athleteProfileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dati non validi. Controlla i campi e riprova.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const athlete = await ensureAthleteUser(session);
  if (!athlete) {
    return { success: false, error: "Impossibile caricare il profilo. Riprova." };
  }

  const { firstName, lastName, phone, paceCategory, medicalNotes } = parsed.data;
  const fullName = `${firstName} ${lastName}`.trim();

  const user = await prisma.user.update({
    where: { id: athlete.id },
    data: {
      name: fullName,
      firstName,
      lastName,
      phone,
      paceCategory,
      medicalNotes: medicalNotes?.trim() || null,
    },
  });

  revalidatePath("/area-atleta");

  return {
    success: true,
    profile: resolveProfile(user),
  };
}
