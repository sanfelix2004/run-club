import Link from "next/link";
import { AthleteArea } from "@/components/AthleteArea";
import { AuthButtons } from "@/components/AuthButtons";
import { ClubLogo } from "@/components/ClubLogo";
import { Footer } from "@/components/Footer";
import { getAthleteDashboard } from "@/app/actions/athlete-area";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: `Area Atleta — ${SITE.name}`,
  description: "Consulta i tuoi dati e lo storico eventi del Giovinazzo Sunset Run.",
};

export default async function AthleteAreaPage() {
  const dashboard = await getAthleteDashboard().catch(() => null);

  return (
    <>
      <header className="border-b border-emerald-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2">
            <ClubLogo size={48} />
          </Link>
          <div className="flex items-center gap-3">
            <AuthButtons scrolled />
            <Link
              href="/#events"
              className="hidden rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 sm:inline-block"
            >
              Prenota evento
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <AthleteArea initialDashboard={dashboard} />
      </main>

      <Footer />
    </>
  );
}
