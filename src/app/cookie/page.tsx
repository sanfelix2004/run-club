import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection, LegalShell } from "@/components/legal/LegalShell";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Cookie Policy — ${LEGAL.siteName}`,
  description: `Informazioni sui cookie utilizzati da ${LEGAL.siteName}.`,
};

export default function CookiePage() {
  return (
    <LegalShell
      title="Cookie Policy"
      description="Questa informativa descrive come utilizziamo cookie e tecnologie simili sul sito."
    >
      <LegalSection title="1. Cosa sono i cookie">
        <p>
          I cookie sono piccoli file di testo che i siti salvano sul tuo dispositivo per
          memorizzare preferenze, mantenere la sessione o raccogliere informazioni tecniche.
          Tecnologie simili includono localStorage e sessionStorage.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookie utilizzati da noi">
        <div className="overflow-x-auto rounded-xl border border-emerald-100">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-emerald-50/80 text-forest">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome / tipo</th>
                <th className="px-4 py-3 font-semibold">Finalità</th>
                <th className="px-4 py-3 font-semibold">Durata</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              <tr>
                <td className="px-4 py-3">Cookie di sessione Auth.js</td>
                <td className="px-4 py-3">Login e mantenimento sessione utente</td>
                <td className="px-4 py-3">Sessione / fino a scadenza</td>
                <td className="px-4 py-3">Necessari</td>
              </tr>
              <tr>
                <td className="px-4 py-3">rcg-cookie-consent (localStorage)</td>
                <td className="px-4 py-3">Memorizza le tue preferenze sui cookie</td>
                <td className="px-4 py-3">12 mesi</td>
                <td className="px-4 py-3">Necessari</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Google Maps (iframe)</td>
                <td className="px-4 py-3">Visualizzazione mappa del punto di ritrovo</td>
                <td className="px-4 py-3">Variabile</td>
                <td className="px-4 py-3">Terze parti (opzionali)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Google OAuth</td>
                <td className="px-4 py-3">Accesso con account Google, se scegli questa opzione</td>
                <td className="px-4 py-3">Variabile</td>
                <td className="px-4 py-3">Terze parti (opzionali)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="3. Come gestire le preferenze">
        <p>
          Al primo accesso ti mostriamo un banner per accettare, rifiutare o personalizzare i
          cookie non necessari. Puoi modificare la scelta in qualsiasi momento dal link{" "}
          <strong>Gestisci cookie</strong> nel footer del sito.
        </p>
        <p>
          Puoi anche gestire i cookie dal browser (blocco, cancellazione). La disattivazione dei
          cookie necessari può impedire il corretto funzionamento del login e delle prenotazioni.
        </p>
      </LegalSection>

      <LegalSection title="4. Titolare e contatti">
        <p>
          Titolare: {LEGAL.owner} — {LEGAL.address}. Email:{" "}
          <a href={`mailto:${LEGAL.privacyEmail}`} className="text-emerald-600 hover:underline">
            {LEGAL.privacyEmail}
          </a>
          . Per il trattamento dei dati personali vedi anche la{" "}
          <Link href="/privacy" className="text-emerald-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
