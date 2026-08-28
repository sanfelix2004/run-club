import { randomBytes, createHmac } from "crypto";

const QR_SECRET = process.env.QR_SECRET ?? "run-club-giovinazzo-secret-key";
const QR_PREFIX = "RCG:";

export function generateQrToken(): string {
  const payload = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", QR_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 16);
  return `${payload}.${signature}`;
}

export function isValidQrToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = createHmac("sha256", QR_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 16);
  return signature === expected;
}

/** Payload codificato nel QR code (prenotazione evento) */
export function buildQrPayload(qrToken: string): string {
  return `${QR_PREFIX}${qrToken}`;
}

/** Estrae il token dal testo letto dallo scanner */
export function parseQrPayload(raw: string): string {
  const trimmed = raw.trim();

  if (trimmed.startsWith(QR_PREFIX)) {
    return trimmed.slice(QR_PREFIX.length);
  }

  const urlMatch = trimmed.match(/\/api\/ticket\/([^/?#\s]+)/);
  if (urlMatch) return urlMatch[1];

  return trimmed;
}
