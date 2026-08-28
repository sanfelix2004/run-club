import { randomBytes, createHmac } from "crypto";

const QR_SECRET = process.env.QR_SECRET ?? "run-club-giovinazzo-secret-key";

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
