import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/legal/LegalShell";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Note legali — ${LEGAL.siteName}`,
  description: `Informazioni legali e dati del titolare di ${LEGAL.siteName}.`,
};

export default function NoteLegaliPage() {
  return (
    <LegalShell
      title="Note legali"
      description="Informazioni sul titolare del sito ai sensi della normativa vigente."
    >
      <LegalSection title="Titolare del sito">
        <ul className="space-y-2">
          <li>
            <strong>Denominazione:</strong> {LEGAL.owner}
          </li>
          <li>
            <strong>Sede:</strong> {LEGAL.address}
          </li>
          <li>
            <strong>Instagram:</strong>{" "}
            <a
              href={LEGAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              {LEGAL.instagramHandle}
            </a>
          </li>
          <li>
            <strong>Telefono:</strong>{" "}
            <a href={`tel:${LEGAL.phone.replace(/\s/g, "")}`} className="text-emerald-600 hover:underline">
              {LEGAL.phone}
            </a>
          </li>
          <li>
            <strong>P. IVA / C.F.:</strong> {LEGAL.vatOrFiscalCode}
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Hosting">
        <p>
          Il sito è ospitato su infrastruttura cloud. I dati sono trattati principalmente all&apos;interno
          dell&apos;Unione Europea, salvo i servizi di terze parti descritti nella Cookie Policy.
        </p>
      </LegalSection>

      <LegalSection title="Proprietà intellettuale">
        <p>
          Salvo diversa indicazione, tutti i contenuti del sito (testi, immagini, marchi, logo) sono
          di proprietà di {LEGAL.owner} o utilizzati con licenza. È vietata la copia non autorizzata.
        </p>
      </LegalSection>

      <LegalSection title="Collegamenti esterni">
        <p>
          Il sito può contenere link a siti di terze parti (social network, mappe, provider di
          login). Non siamo responsabili dei contenuti o delle politiche privacy di tali siti.
        </p>
      </LegalSection>

      <LegalSection title="Reclami e segnalazioni">
        <p>
          Per segnalazioni su contenuti illeciti, errori o richieste legali contattaci su{" "}
          <a
            href={LEGAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline"
          >
            {LEGAL.instagramHandle}
          </a>{" "}
          o al numero {LEGAL.phone}.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
