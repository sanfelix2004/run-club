"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Loader2,
  MessageCircle,
  QrCode,
  UserX,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  cancelRegistrationAdmin,
  getEventAttendance,
  restoreRegistrationAdmin,
  updateRegistrationAdmin,
  type EventAttendanceSummary,
  type EventAttendee,
} from "@/app/actions/event-attendance";
import { prepareWhatsAppConfirmationTest } from "@/app/actions/participation";
import {
  PACE_CATEGORIES,
  PARTICIPATION_STATUS_LABELS,
  PARTICIPATION_STATUSES,
  REGISTRATION_STATUSES,
  type PaceCategory,
  type RegistrationStatus,
} from "@/lib/registration-types";
import { buildQrPayload } from "@/lib/qr";
import { MAX_EVENT_REGISTRATIONS } from "@/lib/constants";
import { buildCommunityInviteWhatsAppUrl } from "@/lib/whatsapp-links";
import { SITE } from "@/lib/constants";

const COMMUNITY_LINK_STORAGE_KEY = "sunset_run_whatsapp_community_url";

type EventAttendeesPanelProps = {
  eventId: string;
  open: boolean;
};

type Filter = "active" | "cancelled" | "all";

const STATUS_LABELS: Record<string, string> = {
  [REGISTRATION_STATUSES.PENDING_PAYMENT]: "Iscritto — da pagare",
  [REGISTRATION_STATUSES.PAID]: "Pagato",
  [REGISTRATION_STATUSES.PAID_AND_CHECKED_IN]: "Presente alla corsa",
  [REGISTRATION_STATUSES.CANCELLED]: "Annullato / non viene",
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
    "Patologie / note mediche",
    "Stato",
    "Conferma partecipazione",
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
    a.medicalNotes ?? "",
    STATUS_LABELS[a.status] ?? a.status,
    PARTICIPATION_STATUS_LABELS[a.participationStatus] ?? a.participationStatus,
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

function AdminRegistrationDetail({
  attendee,
  onUpdated,
}: {
  attendee: EventAttendee;
  onUpdated: () => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    paceCategory: PaceCategory;
    medicalNotes: string;
    status: RegistrationStatus;
  }>({
    firstName: attendee.firstName,
    lastName: attendee.lastName,
    email: attendee.email,
    phone: attendee.phone,
    paceCategory: attendee.paceCategory as PaceCategory,
    medicalNotes: attendee.medicalNotes ?? "",
    status: attendee.status as RegistrationStatus,
  });

  useEffect(() => {
    setForm({
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      email: attendee.email,
      phone: attendee.phone,
      paceCategory: attendee.paceCategory as PaceCategory,
      medicalNotes: attendee.medicalNotes ?? "",
      status: attendee.status as RegistrationStatus,
    });
  }, [attendee]);

  useEffect(() => {
    QRCode.toDataURL(buildQrPayload(attendee.qrToken), {
      width: 200,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#0A2A5C", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, [attendee.qrToken]);

  const isCancelled = attendee.status === REGISTRATION_STATUSES.CANCELLED;
  const isPresent = attendee.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN;
  const isPaid = attendee.status === REGISTRATION_STATUSES.PAID;

  const handleSave = async () => {
    setSaving(true);
    const result = await updateRegistrationAdmin(attendee.id, form);
    setSaving(false);

    if (result.success) {
      toast.success("Prenotazione aggiornata");
      onUpdated();
    } else {
      toast.error(result.error);
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        `Segnare ${attendee.firstName} ${attendee.lastName} come annullato?\n\nIl QR non sarà più valido per il check-in.`,
      )
    ) {
      return;
    }

    setSaving(true);
    const result = await cancelRegistrationAdmin(attendee.id);
    setSaving(false);

    if (result.success) {
      toast.success("Iscrizione annullata");
      onUpdated();
    } else {
      toast.error(result.error);
    }
  };

  const handleRestore = async () => {
    setSaving(true);
    const result = await restoreRegistrationAdmin(attendee.id);
    setSaving(false);

    if (result.success) {
      toast.success("Iscrizione ripristinata");
      onUpdated();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="border-t border-emerald-50 bg-emerald-50/20 px-4 py-4">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`first-${attendee.id}`}>Nome</Label>
              <Input
                id={`first-${attendee.id}`}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="rounded-xl border-emerald-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`last-${attendee.id}`}>Cognome</Label>
              <Input
                id={`last-${attendee.id}`}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="rounded-xl border-emerald-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`email-${attendee.id}`}>Email</Label>
              <Input
                id={`email-${attendee.id}`}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl border-emerald-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`phone-${attendee.id}`}>Telefono</Label>
              <Input
                id={`phone-${attendee.id}`}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-xl border-emerald-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`pace-${attendee.id}`}>Fascia di passo</Label>
              <select
                id={`pace-${attendee.id}`}
                value={form.paceCategory}
                onChange={(e) =>
                  setForm({ ...form, paceCategory: e.target.value as PaceCategory })
                }
                className="h-9 w-full rounded-xl border border-emerald-100 bg-white px-3 text-sm text-forest"
              >
                {PACE_CATEGORIES.map((pace) => (
                  <option key={pace} value={pace}>
                    {pace}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`status-${attendee.id}`}>Stato prenotazione</Label>
              <select
                id={`status-${attendee.id}`}
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as RegistrationStatus })
                }
                className="h-9 w-full rounded-xl border border-emerald-100 bg-white px-3 text-sm text-forest"
              >
                <option value={REGISTRATION_STATUSES.PENDING_PAYMENT}>
                  Iscritto — da pagare
                </option>
                <option value={REGISTRATION_STATUSES.PAID}>Pagato</option>
                <option value={REGISTRATION_STATUSES.PAID_AND_CHECKED_IN}>
                  Presente alla corsa
                </option>
                <option value={REGISTRATION_STATUSES.CANCELLED}>
                  Annullato / non viene
                </option>
              </select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`notes-${attendee.id}`}>Note mediche</Label>
              <Input
                id={`notes-${attendee.id}`}
                value={form.medicalNotes}
                onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })}
                placeholder="Facoltative"
                className="rounded-xl border-emerald-100"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-forest/50">
            <span>Iscritto il {formatDateTime(attendee.createdAt)}</span>
            {attendee.checkedInAt && (
              <span>· Check-in {formatDateTime(attendee.checkedInAt)}</span>
            )}
            <span>
              · Conferma:{" "}
              <strong className="text-forest">
                {PARTICIPATION_STATUS_LABELS[attendee.participationStatus]}
              </strong>
              {attendee.participationRespondedAt
                ? ` (${formatDateTime(attendee.participationRespondedAt)})`
                : ""}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={saving}
              onClick={handleSave}
              className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {saving ? "Salvataggio..." : "Salva modifiche"}
            </Button>
            {!isCancelled ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={handleCancel}
                className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
              >
                <UserX className="mr-1.5 h-3.5 w-3.5" />
                Annulla iscrizione
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={handleRestore}
                className="rounded-full border-emerald-200"
              >
                Ripristina iscrizione
              </Button>
            )}
            <a
              href={`/api/ticket/${attendee.qrToken}`}
              download
              className="inline-flex h-8 items-center rounded-full border border-emerald-200 px-3 text-xs font-medium text-forest hover:bg-emerald-50"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Scarica PDF
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-xl border border-emerald-100 bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest/50">
            QR prenotazione
          </p>
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt={`QR di ${attendee.firstName} ${attendee.lastName}`}
              width={160}
              height={160}
              className="rounded-lg border border-emerald-100"
              unoptimized
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50">
              <QrCode className="h-8 w-8 animate-pulse text-emerald-300" />
            </div>
          )}
          <p className="mt-2 break-all text-center font-mono text-[10px] text-forest/40">
            {attendee.qrToken.slice(0, 12)}…
          </p>
          {isCancelled ? (
            <span className="mt-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
              QR non valido — annullato
            </span>
          ) : isPresent ? (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              Presente alla corsa
            </span>
          ) : isPaid ? (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
              <CheckCircle2 className="h-3 w-3" />
              Pagato
            </span>
          ) : (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              <Clock className="h-3 w-3" />
              Da pagare — QR valido
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function EventAttendeesPanel({ eventId, open }: EventAttendeesPanelProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<EventAttendanceSummary | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("active");
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [communityUrl, setCommunityUrl] = useState("");
  const [inviteQueue, setInviteQueue] = useState<EventAttendee[]>([]);
  const [inviteIndex, setInviteIndex] = useState(0);
  const [inviteActive, setInviteActive] = useState(false);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    const data = await getEventAttendance(eventId);
    setSummary(data);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    if (!open) {
      setSummary(null);
      setExpandedId(null);
      setFilter("active");
      setInviteActive(false);
      setInviteQueue([]);
      setInviteIndex(0);
      return;
    }

    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem(COMMUNITY_LINK_STORAGE_KEY) ?? ""
        : "";
    setCommunityUrl(saved);
    loadSummary();
  }, [eventId, open, loadSummary]);

  const handleWhatsAppTest = async () => {
    setWhatsappLoading(true);
    const result = await prepareWhatsAppConfirmationTest("3288826170");
    setWhatsappLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    await loadSummary();
    toast.success(`Messaggio pronto per ${result.registrationName}. Apro WhatsApp...`);
    window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const openInviteForIndex = (queue: EventAttendee[], index: number, url: string) => {
    const person = queue[index];
    if (!person) return;
    const waUrl = buildCommunityInviteWhatsAppUrl({
      phone: person.phone,
      firstName: person.firstName,
      communityUrl: url,
      siteName: SITE.name,
    });
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const startCommunityInvites = () => {
    const url = communityUrl.trim();
    if (!url || (!url.includes("chat.whatsapp.com") && !url.includes("whatsapp.com"))) {
      toast.error("Incolla prima il link invito della community WhatsApp.");
      return;
    }

    window.localStorage.setItem(COMMUNITY_LINK_STORAGE_KEY, url);

    const active = (summary?.attendees ?? []).filter(
      (a) => a.status !== REGISTRATION_STATUSES.CANCELLED,
    );
    if (active.length === 0) {
      toast.error("Nessun iscritto attivo da invitare.");
      return;
    }

    setInviteQueue(active);
    setInviteIndex(0);
    setInviteActive(true);
    openInviteForIndex(active, 0, url);
    toast.success(`Invito 1/${active.length}: apri WhatsApp e premi Invia, poi "Prossimo".`);
  };

  const goNextInvite = () => {
    const url = communityUrl.trim();
    const next = inviteIndex + 1;
    if (next >= inviteQueue.length) {
      setInviteActive(false);
      toast.success("Fatto: hai aperto tutte le chat di invito.");
      return;
    }
    setInviteIndex(next);
    openInviteForIndex(inviteQueue, next, url);
    toast.message(`Invito ${next + 1}/${inviteQueue.length}`);
  };

  if (!open) return null;

  if (loading && !summary) {
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

  const filteredAttendees = summary.attendees.filter((attendee) => {
    if (filter === "cancelled") {
      return attendee.status === REGISTRATION_STATUSES.CANCELLED;
    }
    if (filter === "active") {
      return attendee.status !== REGISTRATION_STATUSES.CANCELLED;
    }
    return true;
  });

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-emerald-50 bg-emerald-50/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
            <Users className="mx-auto h-4 w-4 text-emerald-500" />
            <p className="mt-1 text-xl font-bold text-forest">
              {summary.totalRegistered}/{MAX_EVENT_REGISTRATIONS}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
              Iscritti attivi
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
            <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
            <p className="mt-1 text-xl font-bold text-emerald-600">{summary.checkedIn}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
              Presenti corsa
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
            <Clock className="mx-auto h-4 w-4 text-amber-500" />
            <p className="mt-1 text-xl font-bold text-amber-600">{summary.pending}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
              In attesa
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
            <UserX className="mx-auto h-4 w-4 text-red-400" />
            <p className="mt-1 text-xl font-bold text-red-500">{summary.cancelled}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
              Annullati
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={whatsappLoading}
            onClick={handleWhatsAppTest}
            className="rounded-full border-emerald-200"
          >
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
            {whatsappLoading ? "Preparazione..." : "WhatsApp prova (328...)"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={startCommunityInvites}
            className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Users className="mr-1.5 h-3.5 w-3.5" />
            Invita tutti in community
          </Button>
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
      </div>

      <div className="space-y-2 rounded-xl border border-emerald-100 bg-white p-3">
        <Label htmlFor="community-invite-url" className="text-xs text-forest/60">
          Link invito community WhatsApp
        </Label>
        <Input
          id="community-invite-url"
          value={communityUrl}
          onChange={(e) => setCommunityUrl(e.target.value)}
          placeholder="https://chat.whatsapp.com/...."
          className="rounded-xl border-emerald-100 text-sm"
        />
        <p className="text-[11px] text-forest/45">
          Incolla il link della community, poi clicca &quot;Invita tutti&quot;. Si apre una chat alla
          volta: premi Invia su WhatsApp e poi Prossimo.
        </p>
      </div>

      {inviteActive && inviteQueue[inviteIndex] && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
          <p className="text-sm font-semibold text-sky-900">
            Invito {inviteIndex + 1}/{inviteQueue.length}
          </p>
          <p className="mt-1 text-sm text-sky-800">
            {inviteQueue[inviteIndex].firstName} {inviteQueue[inviteIndex].lastName} ·{" "}
            {inviteQueue[inviteIndex].phone}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={goNextInvite}
              className="rounded-full bg-sky-600 text-white hover:bg-sky-700"
            >
              {inviteIndex + 1 >= inviteQueue.length ? "Fine" : "Prossimo"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                openInviteForIndex(inviteQueue, inviteIndex, communityUrl.trim())
              }
              className="rounded-full border-sky-200"
            >
              Riapri chat
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setInviteActive(false);
                toast.message("Inviti interrotti.");
              }}
            >
              Stop
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-center">
          <p className="text-lg font-bold text-emerald-600">{summary.participationYes}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
            Confermati sì
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-center">
          <p className="text-lg font-bold text-red-500">{summary.participationNo}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
            Non partecipano
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-center">
          <p className="text-lg font-bold text-amber-600">{summary.participationPending}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
            Conferma in attesa
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["active", "Attivi"],
            ["cancelled", "Annullati"],
            ["all", "Tutti"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === value
                ? "bg-emerald-500 text-white"
                : "bg-white text-forest/60 hover:bg-emerald-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredAttendees.length === 0 ? (
        <p className="rounded-xl border border-dashed border-emerald-200 bg-white px-4 py-6 text-center text-sm text-forest/60">
          Nessuna iscrizione in questa lista.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white">
          <p className="border-b border-emerald-50 bg-emerald-50/50 px-4 py-2 text-xs text-forest/60">
            Clicca su un iscritto per modificare la prenotazione e vedere il QR code
          </p>
          <ul className="divide-y divide-emerald-50">
            {filteredAttendees.map((attendee) => {
              const isPresent =
                attendee.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN;
              const isCancelled = attendee.status === REGISTRATION_STATUSES.CANCELLED;
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
                      <p
                        className={`font-medium ${isCancelled ? "text-forest/40 line-through" : "text-forest"}`}
                      >
                        {attendee.firstName} {attendee.lastName}
                      </p>
                      <p className="truncate text-xs text-forest/50">
                        {attendee.email} · {attendee.phone}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!isCancelled &&
                        attendee.participationStatus === PARTICIPATION_STATUSES.YES && (
                          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                            Partecipa
                          </span>
                        )}
                      {!isCancelled &&
                        attendee.participationStatus === PARTICIPATION_STATUSES.NO && (
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700">
                            Non partecipa
                          </span>
                        )}
                      {!isCancelled &&
                        attendee.participationStatus === PARTICIPATION_STATUSES.PENDING && (
                          <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 sm:inline">
                            Conferma ?
                          </span>
                        )}
                      {isCancelled ? (
                        <span className="hidden rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 sm:inline">
                          Annullato
                        </span>
                      ) : isPresent ? (
                        <span className="hidden rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 sm:inline">
                          In corsa
                        </span>
                      ) : attendee.status === REGISTRATION_STATUSES.PAID ? (
                        <span className="hidden rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700 sm:inline">
                          Pagato
                        </span>
                      ) : (
                        <span className="hidden rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 sm:inline">
                          Da pagare
                        </span>
                      )}
                      <ChevronDown
                        className={`h-4 w-4 text-forest/40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>
                  {isExpanded && (
                    <AdminRegistrationDetail attendee={attendee} onUpdated={loadSummary} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
