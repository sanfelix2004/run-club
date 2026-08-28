import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { auth } from "@/auth";
import { AuthProvider } from "@/components/AuthProvider";
import { AuthUIProvider } from "@/components/AuthUIProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { SITE } from "@/lib/constants";
import { isGoogleOAuthEnabled } from "@/lib/oauth-config";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }, { url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/logo.png",
  },
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    type: "website",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth().catch(() => null);
  const googleOAuthEnabled = isGoogleOAuthEnabled();

  return (
    <html lang="it" className={`${dmSans.variable} h-full scroll-smooth`}>
      <head>
        <link
          rel="preload"
          href="/videos/hero-run.mp4"
          as="fetch"
          type="video/mp4"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full bg-[#FFFBF7] font-sans text-forest antialiased">
        <AuthProvider session={session}>
          <AuthUIProvider googleOAuthEnabled={googleOAuthEnabled}>
            {children}
          </AuthUIProvider>
        </AuthProvider>
        <Toaster position="top-center" richColors closeButton className="z-[300]" />
        <CookieBanner />
      </body>
    </html>
  );
}
