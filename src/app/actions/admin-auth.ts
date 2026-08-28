"use server";

import { cookies } from "next/headers";

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
