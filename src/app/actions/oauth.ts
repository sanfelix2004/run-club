"use server";

import { isGoogleOAuthEnabled } from "@/lib/oauth-config";

export type OAuthProviders = {
  google: boolean;
};

export async function getOAuthProviders(): Promise<OAuthProviders> {
  return { google: isGoogleOAuthEnabled() };
}
