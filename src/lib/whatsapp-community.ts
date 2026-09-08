import { SITE } from "@/lib/constants";
import {
  buildCommunityInviteMessage,
  buildCommunityInviteWhatsAppUrl,
  normalizePhoneForWhatsApp,
} from "@/lib/whatsapp-links";

/** Link invito community WhatsApp (impostabile anche da env). */
export function getWhatsAppCommunityInviteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL?.trim() ||
    process.env.WHATSAPP_COMMUNITY_URL?.trim() ||
    ""
  );
}

export function buildSiteCommunityInviteMessage(params: {
  firstName: string;
  communityUrl: string;
}): string {
  return buildCommunityInviteMessage({
    ...params,
    siteName: SITE.name,
  });
}

export function buildSiteCommunityInviteWhatsAppUrl(params: {
  phone: string;
  firstName: string;
  communityUrl: string;
}): string {
  return buildCommunityInviteWhatsAppUrl({
    ...params,
    siteName: SITE.name,
  });
}

export {
  buildCommunityInviteMessage,
  buildCommunityInviteWhatsAppUrl,
  normalizePhoneForWhatsApp,
};
