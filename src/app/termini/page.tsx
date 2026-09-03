import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection, LegalShell } from "@/components/legal/LegalShell";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Termini e condizioni — ${LEGAL.siteName}`,
  description: `Condizioni d'uso del sito e dei servizi di ${LEGAL.siteName}.`,
};

export default function TerminiPage() {
  return (
    <LegalShell
      title="Termini e condizioni d'uso"
      description="Regolano l'utilizzo del sito, la registrazione account e le iscrizioni agli eventi."
    >
      <LegalSection title="1. Oggetto">
        <p>
          I presenti termini disciplinano l&apos;accesso e l&apos;uso del sito di{" "}
          {LEGAL.siteName}, inclusi account utente, prenotazioni eventi, download dei biglietti
          PDF e pubblicazione di recensioni.
        </p>
      </LegalSection>

      <LegalSection title="2. Requisiti e account">
        <p>
          Per iscriversi agli eventi o creare un account devi fornire dati veritieri e avere almeno
          16 anni (o il consenso di un genitore/tutore). Sei responsabile della riservatezza delle
          tue credenziali di accesso.
        </p>
      </LegalSection>

      <LegalSection title="3. Iscrizioni agli eventi">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            La quota indicata (attualmente <strong>€5 a corsa</strong>) si paga in loco salvo
            diversa indicazione sull&apos;evento.
          </li>
          <li>
            Ogni evento ha un massimo di <strong>100 prenotazioni</strong>. Al raggiungimento del
            limite non sono accettate nuove iscrizioni.
          </li>
          <li>
            Il PDF con QR code costituisce conferma di prenotazione e va presentato al check-in.
          </li>
          <li>
            Sandwich e bevanda sono inclusi come da descrizione del servizio, salvo comunicazioni
            diverse per singolo evento.
          </li>
          <li>
            L&apos;organizzazione si riserva di modificare orario, percorso o punto di ritrovo per motivi di
            sicurezza o forza maggiore, informando gli iscritti quando possibile.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Salute e responsabilità">
        <p>
          Partecipando alle corse dichiari di essere in condizioni fisiche idonee e di partecipare
          volontariamente, assumendoti la responsabilità della tua attività fisica. Durante
          l&apos;evento i partecipanti sono coperti da assicurazione per la manifestazione. L&apos;organizzazione non
          è responsabile per infortuni derivanti da condizioni preesistenti non comunicate o da
          comportamenti non conformi alle indicazioni dello staff.
        </p>
      </LegalSection>

      <LegalSection title="5. Recensioni">
        <p>
          Le recensioni pubblicate devono essere veritiere, rispettose e pertinenti. Ci riserviamo
          di rimuovere contenuti offensivi, spam o manifestamente falsi. Pubblicando una recensione
          concedi una licenza non esclusiva per mostrarla sul sito.
        </p>
      </LegalSection>

      <LegalSection title="6. Proprietà intellettuale">
        <p>
          Testi, grafica, logo e materiali del sito sono di proprietà di {LEGAL.owner} o dei
          rispettivi titolari. È vietata la riproduzione non autorizzata.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitazione di responsabilità">
        <p>
          Il sito è fornito &quot;così com&apos;è&quot;. Pur impegnandoci per un servizio affidabile,
          non garantiamo l&apos;assenza di interruzioni o errori tecnici. Nei limiti consentiti dalla
          legge, la responsabilità del titolare è limitata agli importi corrisposti per il
          servizio oggetto del reclamo.
        </p>
      </LegalSection>

      <LegalSection title="8. Legge applicabile e foro">
        <p>
          I termini sono regolati dalla legge italiana. Per le controversie con consumatori è
          competente il foro del luogo di residenza o domicilio del consumatore; negli altri casi,
          il foro di Bari.
        </p>
      </LegalSection>

      <LegalSection title="9. Modifiche e contatti">
        <p>
          Possiamo aggiornare questi termini pubblicando la nuova versione sul sito. Per
          informazioni contattaci su{" "}
          <a
            href={LEGAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline"
          >
            {LEGAL.instagramHandle}
          </a>{" "}
          o al numero {LEGAL.phone}. Il trattamento dei dati personali è descritto nella{" "}
          <Link href="/privacy" className="text-emerald-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
