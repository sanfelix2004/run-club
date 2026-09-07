/**
 * Invia (o prepara) messaggi WhatsApp di conferma partecipazione.
 *
 * Modalità TEST (default): solo il numero 3288826170
 *   npx tsx scripts/send-whatsapp-confirmations.ts
 *
 * Tutti gli iscritti attivi (quando pronto):
 *   npx tsx scripts/send-whatsapp-confirmations.ts --all
 *
 * Invio automatico via Meta WhatsApp Cloud API (opzionale):
 *   WHATSAPP_TOKEN=... WHATSAPP_PHONE_NUMBER_ID=... npx tsx scripts/send-whatsapp-confirmations.ts
 *
 * Senza API Meta lo script stampa i link wa.me da aprire (o apre il browser in test).
 */

import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { randomBytes } from "crypto";
import { FEATURED_EVENT } from "../src/lib/constants";

const TEST_PHONE = "3288826170";
const APP_URL =
  process.env.AUTH_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://run-club-olive.vercel.app";

function createPrisma() {
  const url =
    process.env.TURSO_DATABASE_URL ??
    (process.env.DATABASE_URL?.startsWith("libsql://") ? process.env.DATABASE_URL : null);
  const authToken = process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN;

  if (url && authToken) {
    const libsql = createClient({ url, authToken });
    return new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
  }

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./prisma/dev.db";
  }

  return new PrismaClient();
}

function generateConfirmationToken() {
  return randomBytes(24).toString("hex");
}

function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("39") && digits.length >= 11) return digits;
  if (digits.startsWith("0")) return `39${digits.slice(1)}`;
  if (digits.length === 10) return `39${digits}`;
  return digits;
}

function buildMessage(firstName: string, eventTitle: string, confirmationUrl: string) {
  return [
    `Ciao ${firstName}! 🌅`,
    ``,
    `Sei prenotato/a a *${eventTitle}*.`,
    `Ci confermi se partecipi all'evento dell'11 settembre?`,
    ``,
    `Apri questo link e scegli Sì o No:`,
    confirmationUrl,
    ``,
    `Grazie!`,
    `Sunset Run Giovinazzo`,
  ].join("\n");
}

async function ensureColumns(prisma: PrismaClient) {
  const statements = [
    `ALTER TABLE registrations ADD COLUMN participation_status TEXT NOT NULL DEFAULT 'PENDING'`,
    `ALTER TABLE registrations ADD COLUMN confirmation_token TEXT`,
    `ALTER TABLE registrations ADD COLUMN participation_responded_at DATETIME`,
    `ALTER TABLE registrations ADD COLUMN confirmation_sent_at DATETIME`,
  ];

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement);
      console.log("Colonna aggiunta:", statement.slice(0, 50));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        /duplicate column|already exists|column .+ already/i.test(message)
      ) {
        continue;
      }
      console.warn("ALTER skip/warn:", message.slice(0, 120));
    }
  }

  try {
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS registrations_confirmation_token_key ON registrations(confirmation_token)`,
    );
  } catch {
    /* ok */
  }
}

async function sendViaMetaCloudApi(phone: string, message: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return { sent: false as const };

  const to = normalizePhoneForWhatsApp(phone);
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { preview_url: true, body: message },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${body}`);
  }

  return { sent: true as const };
}

async function main() {
  const sendAll = process.argv.includes("--all");
  const prisma = createPrisma();

  try {
    await ensureColumns(prisma);

    const registrations = await prisma.registration.findMany({
      where: {
        eventId: FEATURED_EVENT.id,
        status: { not: "CANCELLED" },
      },
      include: { event: true },
      orderBy: { createdAt: "asc" },
    });

    const targets = sendAll
      ? registrations
      : registrations.filter((r) => {
          const digits = r.phone.replace(/\D/g, "");
          return (
            digits.includes(TEST_PHONE) ||
            digits.includes(`39${TEST_PHONE}`) ||
            normalizePhoneForWhatsApp(r.phone).endsWith(TEST_PHONE)
          );
        });

    if (targets.length === 0) {
      console.error(
        sendAll
          ? "Nessuna prenotazione attiva trovata."
          : `Nessuna prenotazione attiva con telefono ${TEST_PHONE}.\nIscriviti prima con quel numero, oppure riesegui con --all.`,
      );
      process.exit(1);
    }

    console.log(
      sendAll
        ? `Modalità TUTTI: ${targets.length} iscritti`
        : `Modalità TEST: solo ${TEST_PHONE} (${targets.length} match)`,
    );

    for (const registration of targets) {
      let token = registration.confirmationToken;
      if (!token) {
        token = generateConfirmationToken();
        await prisma.registration.update({
          where: { id: registration.id },
          data: { confirmationToken: token },
        });
      }

      const confirmationUrl = `${APP_URL}/conferma/${token}`;
      const message = buildMessage(
        registration.firstName,
        registration.event.title,
        confirmationUrl,
      );
      const waUrl = `https://wa.me/${normalizePhoneForWhatsApp(registration.phone)}?text=${encodeURIComponent(message)}`;

      console.log("\n---");
      console.log(`${registration.firstName} ${registration.lastName} · ${registration.phone}`);
      console.log(`Link conferma: ${confirmationUrl}`);
      console.log(`WhatsApp: ${waUrl}`);

      try {
        const api = await sendViaMetaCloudApi(registration.phone, message);
        if (api.sent) {
          console.log("Inviato via WhatsApp Cloud API ✓");
        } else {
          console.log("API Meta non configurata — usa il link wa.me sopra (aprilo e premi Invia).");
        }
      } catch (error) {
        console.error("Errore invio API:", error instanceof Error ? error.message : error);
      }

      await prisma.registration.update({
        where: { id: registration.id },
        data: { confirmationSentAt: new Date() },
      });
    }

    console.log("\nFatto.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
