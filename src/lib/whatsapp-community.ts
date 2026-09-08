import {
  buildWhatsAppClickToChatUrl,
  normalizePhoneForWhatsApp,
} from "@/lib/participation";
import { SITE } from "@/lib/constants";

/** Link invito community WhatsApp (impostabile anche da env). */
export function getWhatsAppCommunityInviteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL?.trim() ||
    process.env.WHATSAPP_COMMUNITY_URL?.trim() ||
    ""
  );
}

export function buildCommunityInviteMessage(params: {
  firstName: string;
  communityUrl: string;
}): string {
  return [
    `Ciao ${params.firstName}! 🌅`,
    ``,
    `Entra nella community WhatsApp di *${SITE.name}* per aggiornamenti sull'11 settembre:`,
    params.communityUrl,
    ``,
    `Ci vediamo al tramonto!`,
  ].join("\n");
}

export function buildCommunityInviteWhatsAppUrl(params: {
  phone: string;
  firstName: string;
  communityUrl: string;
}): string {
  const message = buildCommunityInviteMessage({
    firstName: params.firstName,
    communityUrl: params.communityUrl,
  });
  return buildWhatsAppClickToChatUrl(params.phone, message);
}

export { normalizePhoneForWhatsApp };
