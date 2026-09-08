import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import {
  buildWhatsAppClickToChatUrl,
  normalizePhoneForWhatsApp,
} from "@/lib/whatsapp-links";

export function generateConfirmationToken(): string {
  return randomBytes(24).toString("hex");
}

/** Aggiunge le colonne conferma su SQLite/Turso se mancano (idempotente). */
export async function ensureParticipationColumns(): Promise<void> {
  const statements = [
    `ALTER TABLE registrations ADD COLUMN participation_status TEXT NOT NULL DEFAULT 'PENDING'`,
    `ALTER TABLE registrations ADD COLUMN confirmation_token TEXT`,
    `ALTER TABLE registrations ADD COLUMN participation_responded_at DATETIME`,
    `ALTER TABLE registrations ADD COLUMN confirmation_sent_at DATETIME`,
  ];

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        message.includes("duplicate column") ||
        message.includes("already exists") ||
        message.includes("no such table")
      ) {
        continue;
      }
      // Ignore other "column exists" variants from libsql
      if (/column .+ already exists/i.test(message)) continue;
    }
  }

  try {
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS registrations_confirmation_token_key ON registrations(confirmation_token)`,
    );
  } catch {
    /* index may already exist */
  }
}

export async function ensureConfirmationToken(registrationId: string): Promise<string> {
  await ensureParticipationColumns();

  const existing = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: { confirmationToken: true },
  });

  if (existing?.confirmationToken) {
    return existing.confirmationToken;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const token = generateConfirmationToken();
    try {
      await prisma.registration.update({
        where: { id: registrationId },
        data: { confirmationToken: token },
      });
      return token;
    } catch {
      /* rare unique collision */
    }
  }

  throw new Error("Impossibile generare il token di conferma.");
}

export function getAppBaseUrl(): string {
  return (
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://run-club-olive.vercel.app"
  );
}

export function buildConfirmationUrl(token: string): string {
  return `${getAppBaseUrl()}/conferma/${token}`;
}

export function buildWhatsAppConfirmMessage(params: {
  firstName: string;
  confirmationUrl: string;
  eventTitle: string;
}): string {
  return [
    `Ciao ${params.firstName}! 🌅`,
    ``,
    `Sei prenotato/a a *${params.eventTitle}*.`,
    `Ci confermi se partecipi all'evento dell'11 settembre?`,
    ``,
    `Apri questo link e scegli Sì o No:`,
    params.confirmationUrl,
    ``,
    `Grazie!`,
    `Sunset Run Giovinazzo`,
  ].join("\n");
}

export { buildWhatsAppClickToChatUrl, normalizePhoneForWhatsApp };
