import Link from "next/link";
import { Footer } from "@/components/Footer";
import { ClubLogo } from "@/components/ClubLogo";
import { LEGAL, LEGAL_LINKS } from "@/lib/legal";
import { SITE } from "@/lib/constants";

type LegalShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function LegalShell({ title, description, children }: LegalShellProps) {
  return (
    <>
      <header className="border-b border-emerald-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2">
            <ClubLogo size={48} />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
          >
            Torna al sito
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-forest/50">Ultimo aggiornamento: {LEGAL.lastUpdated}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-4 text-lg leading-relaxed text-forest/70">{description}</p>
        )}
        <div className="mt-10 space-y-8 text-forest/80">{children}</div>

        <nav
          aria-label="Altre pagine legali"
          className="mt-14 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6"
        >
          <p className="text-sm font-semibold text-forest">Documenti correlati</p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-emerald-600 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <Footer />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-forest">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-forest/75 sm:text-base">
        {children}
      </div>
    </section>
  );
}
