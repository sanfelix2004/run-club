"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getEventAttendance,
  type EventAttendanceSummary,
  type EventAttendee,
} from "@/app/actions/event-attendance";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";

type EventAttendeesPanelProps = {
  eventId: string;
  open: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  [REGISTRATION_STATUSES.PENDING_PAYMENT]: "In attesa pagamento",
  [REGISTRATION_STATUSES.PAID_AND_CHECKED_IN]: "Presente — pagato",
  [REGISTRATION_STATUSES.CANCELLED]: "Annullato",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function exportCsv(attendees: EventAttendee[], eventTitle: string) {
  const headers = [
    "Nome",
    "Cognome",
    "Email",
    "Telefono",
    "Fascia di passo",
    "Stato",
    "Data iscrizione",
    "Check-in",
    "Codice QR",
    "Account collegato",
    "Contatto emergenza",
  ];

  const rows = attendees.map((a) => [
    a.firstName,
    a.lastName,
    a.email,
    a.phone,
    a.paceCategory,
    STATUS_LABELS[a.status] ?? a.status,
    formatDateTime(a.createdAt),
    a.checkedInAt ? formatDateTime(a.checkedInAt) : "",
    a.qrToken,
    a.userId ? "Sì" : "No",
    a.emergencyContact ?? "",
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `iscritti-${eventTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function RunnerDetail({ attendee }: { attendee: EventAttendee }) {
  const isPresent = attendee.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN;

  const fields = [
    { label: "Nome", value: attendee.firstName },
    { label: "Cognome", value: attendee.lastName },
    { label: "Email", value: attendee.email },
    { label: "Telefono", value: attendee.phone },
    { label: "Fascia di passo", value: attendee.paceCategory },
    {
      label: "Stato",
      value: STATUS_LABELS[attendee.status] ?? attendee.status,
    },
    { label: "Data iscrizione", value: formatDateTime(attendee.createdAt) },
    {
      label: "Check-in",
      value: attendee.checkedInAt ? formatDateTime(attendee.checkedInAt) : "—",
    },
    { label: "Codice QR", value: attendee.qrToken, mono: true },
    {
      label: "Account collegato",
      value: attendee.userId ? "Sì (utente registrato)" : "No",
    },
    ...(attendee.emergencyContact
      ? [{ label: "Contatto emergenza", value: attendee.emergencyContact }]
      : []),
  ];

  return (
    <div className="border-t border-emerald-50 bg-emerald-50/20 px-4 py-4">
      <dl className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-forest/40">
              {field.label}
            </dt>
            <dd
              className={`mt-0.5 text-sm text-forest ${"mono" in field && field.mono ? "break-all font-mono text-xs" : "font-medium"}`}
            >
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-3">
        {isPresent ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            QR scansionato — partecipante confermato
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
            <Clock className="h-3 w-3" />
            QR non ancora scansionato
          </span>
        )}
      </div>
    </div>
  );
}

export function EventAttendeesPanel({ eventId, open }: EventAttendeesPanelProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<EventAttendanceSummary | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSummary(null);
      setExpandedId(null);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 grid-cols-3 gap-3">
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

        {summary.attendees.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportCsv(summary.attendees, summary.eventTitle)}
            className="rounded-full border-emerald-200"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Esporta CSV
          </Button>
        )}
      </div>

      {summary.attendees.length === 0 ? (
        <p className="rounded-xl border border-dashed border-emerald-200 bg-white px-4 py-6 text-center text-sm text-forest/60">
          Nessuna iscrizione per questo evento.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white">
          <p className="border-b border-emerald-50 bg-emerald-50/50 px-4 py-2 text-xs text-forest/60">
            Clicca su un runner per vedere tutti i dati
          </p>
          <ul className="divide-y divide-emerald-50">
            {summary.attendees.map((attendee) => {
              const isPresent =
                attendee.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN;
              const isExpanded = expandedId === attendee.id;

              return (
                <li key={attendee.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId((current) =>
                        current === attendee.id ? null : attendee.id,
                      )
                    }
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-emerald-50/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-forest">
                        {attendee.firstName} {attendee.lastName}
                      </p>
                      <p className="truncate text-xs text-forest/50">
                        {attendee.email} · {attendee.phone}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {isPresent ? (
                        <span className="hidden rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 sm:inline">
                          Presente
                        </span>
                      ) : (
                        <span className="hidden rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 sm:inline">
                          In attesa
                        </span>
                      )}
                      <ChevronDown
                        className={`h-4 w-4 text-forest/40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>
                  {isExpanded && <RunnerDetail attendee={attendee} />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
