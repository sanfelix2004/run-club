import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection, LegalShell } from "@/components/legal/LegalShell";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Privacy Policy — ${LEGAL.siteName}`,
  description: `Informativa sul trattamento dei dati personali di ${LEGAL.siteName}.`,
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Informativa sulla privacy"
      description="Ai sensi del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018."
    >
      <LegalSection title="1. Titolare del trattamento">
        <p>
          Il titolare del trattamento è <strong>{LEGAL.owner}</strong>, con sede in{" "}
          {LEGAL.address}. Per qualsiasi richiesta relativa ai tuoi dati personali puoi
          scrivere a{" "}
          <a href={`mailto:${LEGAL.privacyEmail}`} className="text-emerald-600 hover:underline">
            {LEGAL.privacyEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Tipologie di dati trattati">
        <p>Trattiamo le seguenti categorie di dati, in base al servizio che utilizzi:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Dati identificativi e di contatto:</strong> nome, cognome, email, numero di
            telefono.
          </li>
          <li>
            <strong>Dati relativi all&apos;account:</strong> credenziali di accesso (password
            conservata in forma crittografata), eventuale immagine profilo da login social.
          </li>
          <li>
            <strong>Dati di profilo atleta:</strong> nome, telefono, fascia di passo,
            eventuali patologie o note mediche (facoltative, fornite volontariamente).
          </li>
          <li>
            <strong>Dati di iscrizione agli eventi:</strong> fascia di passo, telefono,
            note mediche al momento della prenotazione, stato prenotazione e pagamento,
            token QR per il check-in.
          </li>
          <li>
            <strong>Recensioni:</strong> testo della recensione e nome visualizzato.
          </li>
          <li>
            <strong>Dati tecnici:</strong> indirizzo IP, log di sistema, cookie e identificatori
            di sessione (vedi la{" "}
            <Link href="/cookie" className="text-emerald-600 hover:underline">
              Cookie Policy
            </Link>
            ).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalità e base giuridica">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Gestione iscrizioni e account</strong> — esecuzione del contratto / misure
            precontrattuali (art. 6.1.b GDPR).
          </li>
          <li>
            <strong>Emissione biglietti PDF e check-in eventi</strong> — esecuzione del contratto.
          </li>
          <li>
            <strong>Pubblicazione recensioni sul sito</strong> — consenso o legittimo interesse
            alla trasparenza del servizio, a seconda del contesto.
          </li>
          <li>
            <strong>Sicurezza del sito e prevenzione abusi</strong> — legittimo interesse (art.
            6.1.f GDPR).
          </li>
          <li>
            <strong>Adempimenti di legge</strong> — obbligo legale (art. 6.1.c GDPR).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Conservazione dei dati">
        <p>
          I dati dell&apos;account sono conservati finché mantieni il profilo attivo. I dati
          relativi alle iscrizioni agli eventi sono conservati per il tempo necessario alla
          gestione dell&apos;evento e agli obblighi contabili/amministrativi. I log tecnici sono
          conservati per periodi limitati, salvo necessità di accertamento di reati.
        </p>
      </LegalSection>

      <LegalSection title="5. Comunicazione e destinatari">
        <p>
          I dati possono essere trattati da fornitori che operano come responsabili del
          trattamento (es. hosting, autenticazione OAuth con Google, mappe Google). Non vendiamo
          i tuoi dati personali a terzi.
        </p>
      </LegalSection>

      <LegalSection title="6. Trasferimenti extra UE">
        <p>
          Alcuni fornitori (ad esempio Google per il login o le mappe) possono trattare dati
          anche al di fuori dello Spazio Economico Europeo, nel rispetto delle garanzie previste
          dal GDPR (clausole contrattuali standard o decisioni di adeguatezza).
        </p>
      </LegalSection>

      <LegalSection title="7. Diritti dell'interessato">
        <p>
          Puoi esercitare in qualsiasi momento i diritti di accesso, rettifica, cancellazione,
          limitazione, opposizione e portabilità scrivendo a{" "}
          <a href={`mailto:${LEGAL.privacyEmail}`} className="text-emerald-600 hover:underline">
            {LEGAL.privacyEmail}
          </a>
          . Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati
          personali (
          <a
            href="https://www.garanteprivacy.it"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline"
          >
            www.garanteprivacy.it
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="8. Minori">
        <p>
          I servizi non sono destinati a minori di 16 anni senza il consenso di chi esercita la
          responsabilità genitoriale. La sessione kids, se attiva, richiede l&apos;iscrizione da
          parte di un adulto responsabile.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
