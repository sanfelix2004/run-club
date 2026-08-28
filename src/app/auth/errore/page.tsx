import Link from "next/link";
import { SITE } from "@/lib/constants";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Configurazione Google non valida",
    description:
      "Le credenziali OAuth di Google non sono corrette (client ID o client secret). " +
      "Apri Google Cloud Console → Credenziali, verifica che ID e secret corrispondano allo stesso client OAuth, " +
      "e che il redirect URI sia esattamente http://localhost:43123/api/auth/callback/google. " +
      "Dopo aver aggiornato il file .env, riavvia il server.",
  },
  AccessDenied: {
    title: "Accesso negato",
    description:
      "Hai annullato l'accesso con Google oppure il tuo account non è autorizzato. " +
      "Se l'app è in modalità Test su Google Cloud, aggiungi la tua email tra gli utenti di prova.",
  },
  OAuthSignin: {
    title: "Errore avvio accesso Google",
    description:
      "Non è stato possibile avviare l'accesso con Google. Controlla le credenziali OAuth nel file .env.",
  },
  OAuthCallback: {
    title: "Errore callback Google",
    description:
      "Google ha risposto con un errore durante il rientro sul sito. " +
      "Di solito indica client secret errato o redirect URI non corrispondente in Google Cloud Console.",
  },
  OAuthAccountNotLinked: {
    title: "Account già registrato",
    description:
      "Questa email è già associata a un altro metodo di accesso. " +
      "Prova ad accedere con email e password oppure usa la stessa email dell'account esistente.",
  },
  Default: {
    title: "Errore di accesso",
    description:
      "Si è verificato un problema durante l'accesso. Riprova oppure usa email e password.",
  },
};

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AuthErrorPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const info = ERROR_MESSAGES[error ?? ""] ?? ERROR_MESSAGES.Default;

  return (
    <main className="flex min-h-screen items-center justify-center bg-emerald-50/40 px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-emerald-100 bg-white p-8 shadow-xl">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
          {SITE.name}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-forest">{info.title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-forest/70">{info.description}</p>

        {error === "Configuration" && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950">
            <strong>Per lo sviluppatore:</strong> nei log del server compare spesso{" "}
            <code className="rounded bg-amber-100 px-1">invalid_client</code> — rigenera il
            client secret in Google Cloud Console e aggiorna{" "}
            <code className="rounded bg-amber-100 px-1">AUTH_GOOGLE_SECRET</code> nel file{" "}
            <code className="rounded bg-amber-100 px-1">.env</code>.
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            Torna alla home
          </Link>
          <Link
            href="/?auth=login"
            className="inline-flex items-center justify-center rounded-full border border-emerald-100 px-4 py-2 text-sm font-medium text-forest hover:bg-emerald-50"
          >
            Accedi con email
          </Link>
        </div>
      </div>
    </main>
  );
}
