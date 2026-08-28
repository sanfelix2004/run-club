"use server";

export type OAuthProviders = {
  google: boolean;
  apple: boolean;
};

export async function getOAuthProviders(): Promise<OAuthProviders> {
  const google = Boolean(
    (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) ||
      (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  );
  const apple = Boolean(process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET);

  return { google, apple };
}
