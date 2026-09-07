"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { submitParticipationConfirmation } from "@/app/actions/participation";
import {
  PARTICIPATION_STATUSES,
  type ParticipationStatus,
} from "@/lib/registration-types";
import { SITE } from "@/lib/constants";

type ConfirmationFormProps = {
  token: string;
  firstName: string;
  lastName: string;
  eventTitle: string;
  eventDateLabel: string;
  initialStatus: ParticipationStatus;
};

export function ConfirmationForm({
  token,
  firstName,
  lastName,
  eventTitle,
  eventDateLabel,
  initialStatus,
}: ConfirmationFormProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState<"YES" | "NO" | null>(null);

  const alreadyAnswered = status !== PARTICIPATION_STATUSES.PENDING;

  const handleAnswer = async (answer: "YES" | "NO") => {
    setLoading(answer);
    const result = await submitParticipationConfirmation(token, answer);
    setLoading(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setStatus(result.participationStatus);
    toast.success(
      answer === "YES" ? "Partecipazione confermata. Grazie!" : "Ok, abbiamo registrato che non vieni.",
    );
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
        Conferma partecipazione
      </p>
      <h1 className="mt-2 text-2xl font-bold text-forest">{SITE.name}</h1>
      <p className="mt-4 text-sm text-forest/70">
        Ciao <span className="font-semibold text-forest">{firstName} {lastName}</span>,
      </p>
      <p className="mt-2 text-sm leading-relaxed text-forest/70">
        Confermi la partecipazione a <span className="font-medium text-forest">{eventTitle}</span>
        {" "}({eventDateLabel})?
      </p>

      {alreadyAnswered ? (
        <div
          className={`mt-8 rounded-2xl px-4 py-5 text-center ${
            status === PARTICIPATION_STATUSES.YES
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-900"
          }`}
        >
          {status === PARTICIPATION_STATUSES.YES ? (
            <>
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <p className="mt-3 text-lg font-semibold">Sì, partecipo</p>
              <p className="mt-1 text-sm opacity-80">Risposta salvata. Ci vediamo all&apos;evento!</p>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-10 w-10 text-amber-500" />
              <p className="mt-3 text-lg font-semibold">No, non partecipo</p>
              <p className="mt-1 text-sm opacity-80">Risposta salvata. Grazie per avercelo fatto sapere.</p>
            </>
          )}
          <p className="mt-4 text-xs opacity-70">Puoi cambiare risposta quando vuoi da questo stesso link.</p>
          <div className="mt-5 flex gap-2">
            <Button
              type="button"
              disabled={loading !== null}
              onClick={() => handleAnswer("YES")}
              className="flex-1 rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {loading === "YES" ? "..." : "Cambia in Sì"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading !== null}
              onClick={() => handleAnswer("NO")}
              className="flex-1 rounded-full border-amber-200"
            >
              {loading === "NO" ? "..." : "Cambia in No"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          <p className="text-center text-sm font-medium text-forest">Partecipi?</p>
          <Button
            type="button"
            disabled={loading !== null}
            onClick={() => handleAnswer("YES")}
            className="w-full rounded-full bg-emerald-500 py-6 text-base font-semibold text-white hover:bg-emerald-600"
          >
            {loading === "YES" ? "Salvataggio..." : "Sì, partecipo"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading !== null}
            onClick={() => handleAnswer("NO")}
            className="w-full rounded-full border-emerald-200 py-6 text-base font-semibold"
          >
            {loading === "NO" ? "Salvataggio..." : "No, non partecipo"}
          </Button>
        </div>
      )}
    </div>
  );
}
