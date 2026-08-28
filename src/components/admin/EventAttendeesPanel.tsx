"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, Users } from "lucide-react";
import {
  getEventAttendance,
  type EventAttendanceSummary,
} from "@/app/actions/event-attendance";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";

type EventAttendeesPanelProps = {
  eventId: string;
  open: boolean;
};

export function EventAttendeesPanel({ eventId, open }: EventAttendeesPanelProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<EventAttendanceSummary | null>(null);

  useEffect(() => {
    if (!open) {
      setSummary(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getEventAttendance(eventId).then((data) => {
      if (!cancelled) {
        setSummary(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [eventId, open]);

  if (!open) return null;

  if (loading) {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-50 bg-emerald-50/40 py-8 text-sm text-forest/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        Caricamento iscritti...
      </div>
    );
  }

  if (!summary) {
    return (
      <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
        Impossibile caricare gli iscritti.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-emerald-50 bg-emerald-50/30 p-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
          <Users className="mx-auto h-4 w-4 text-emerald-500" />
          <p className="mt-1 text-xl font-bold text-forest">{summary.totalRegistered}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
            Iscritti
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
          <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
          <p className="mt-1 text-xl font-bold text-emerald-600">{summary.checkedIn}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
            Presenti (QR)
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
          <Clock className="mx-auto h-4 w-4 text-amber-500" />
          <p className="mt-1 text-xl font-bold text-amber-600">{summary.pending}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
            In attesa
          </p>
        </div>
      </div>

      {summary.attendees.length === 0 ? (
        <p className="rounded-xl border border-dashed border-emerald-200 bg-white px-4 py-6 text-center text-sm text-forest/60">
          Nessuna iscrizione per questo evento.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white">
          <div className="hidden grid-cols-[1.4fr_1fr_0.8fr] gap-3 border-b border-emerald-50 bg-emerald-50/50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-forest/50 sm:grid">
            <span>Nome</span>
            <span>Gruppo</span>
            <span className="text-right">Stato</span>
          </div>
          <ul className="divide-y divide-emerald-50">
            {summary.attendees.map((attendee) => {
              const isPresent =
                attendee.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN;

              return (
                <li
                  key={attendee.id}
                  className="grid gap-2 px-4 py-3 sm:grid-cols-[1.4fr_1fr_0.8fr] sm:items-center sm:gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-forest">
                      {attendee.firstName} {attendee.lastName}
                    </p>
                    <p className="truncate text-xs text-forest/50">{attendee.email}</p>
                  </div>
                  <p className="text-sm text-forest/70">{attendee.paceCategory}</p>
                  <div className="sm:text-right">
                    {isPresent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Presente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                        <Clock className="h-3 w-3" />
                        Non arrivato
                      </span>
                    )}
                    {isPresent && attendee.checkedInAt && (
                      <p className="mt-1 text-[10px] text-forest/40">
                        {new Date(attendee.checkedInAt).toLocaleString("it-IT", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
