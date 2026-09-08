/** Helper WhatsApp sicuri per il client (niente Prisma/DB). */

export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("39") && digits.length >= 11) return digits;
  if (digits.startsWith("0")) return `39${digits.slice(1)}`;
  if (digits.length === 10) return `39${digits}`;
  return digits;
}

export function buildWhatsAppClickToChatUrl(phone: string, message: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function buildCommunityInviteMessage(params: {
  firstName: string;
  communityUrl: string;
  siteName?: string;
}): string {
  const siteName = params.siteName ?? "Sunset Run Giovinazzo";
  return [
    `Ciao ${params.firstName}! 🌅`,
    ``,
    `Entra nella community WhatsApp di *${siteName}* per aggiornamenti sull'11 settembre:`,
    params.communityUrl,
    ``,
    `Ci vediamo al tramonto!`,
  ].join("\n");
}

export function buildCommunityInviteWhatsAppUrl(params: {
  phone: string;
  firstName: string;
  communityUrl: string;
  siteName?: string;
}): string {
  const message = buildCommunityInviteMessage({
    firstName: params.firstName,
    communityUrl: params.communityUrl,
    siteName: params.siteName,
  });
  return buildWhatsAppClickToChatUrl(params.phone, message);
}
