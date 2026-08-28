"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  Ticket,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AthleteProfileForm } from "@/components/AthleteProfileForm";
import { useAuthUI } from "@/components/AuthUIProvider";
import type { AthleteDashboard } from "@/app/actions/athlete-area";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  [REGISTRATION_STATUSES.PENDING_PAYMENT]: {
    label: "Prenotato",
    className: "bg-sky-100 text-sky-700",
  },
  [REGISTRATION_STATUSES.PAID_AND_CHECKED_IN]: {
    label: "Partecipato",
    className: "bg-emerald-100 text-emerald-700",
  },
  [REGISTRATION_STATUSES.CANCELLED]: {
    label: "Annullato",
    className: "bg-red-100 text-red-700",
  },
};

type AthleteAreaProps = {
  initialDashboard: AthleteDashboard | null;
};

export function AthleteArea({ initialDashboard }: AthleteAreaProps) {
  const { data: session, status } = useSession();
  const { openLogin, openRegister } = useAuthUI();

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-lg">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
            <User className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-forest">Area Atleta</h1>
          <p className="mt-2 text-sm text-forest/60">
            Accedi o registrati per vedere i tuoi dati e lo storico eventi.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              onClick={openLogin}
              className="w-full rounded-full bg-emerald-500 py-5 text-white hover:bg-emerald-600"
            >
              Accedi
            </Button>
            <Button
              variant="outline"
              onClick={openRegister}
              className="w-full rounded-full border-emerald-200 py-5"
            >
              Registrati
            </Button>
          </div>
          <p className="mt-6 text-sm text-forest/50">
            Non sei ancora iscritto a un evento?{" "}
            <Link href="/#events" className="font-medium text-emerald-600 hover:underline">
              Prenota ora
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const dashboard = initialDashboard;
  if (!dashboard) return null;

  const { profile, stats, registrations } = dashboard;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
          Area Atleta
        </p>
        <h1 className="mt-2 text-3xl font-bold text-forest">
          Ciao, {session.user.name?.split(" ")[0] ?? profile.firstName}!
        </h1>
        <p className="mt-1 text-forest/60">{session.user.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <Ticket className="h-5 w-5 text-emerald-500" />
          <p className="mt-3 text-3xl font-bold text-forest">{stats.totalRegistrations}</p>
          <p className="text-sm text-forest/50">Eventi prenotati</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <p className="mt-3 text-3xl font-bold text-forest">{stats.eventsAttended}</p>
          <p className="text-sm text-forest/50">Eventi a cui hai partecipato</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <Clock className="h-5 w-5 text-emerald-500" />
          <p className="mt-3 text-3xl font-bold text-forest">{stats.upcomingEvents}</p>
          <p className="text-sm text-forest/50">Prossime prenotazioni</p>
        </div>
      </div>

      <AthleteProfileForm initialProfile={profile} />

      <div>
        <h2 className="text-lg font-semibold text-forest">Storico eventi</h2>
        {registrations.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center text-sm text-forest/60">
            Non hai ancora prenotato nessun evento.{" "}
            <Link href="/#events" className="font-medium text-emerald-600 hover:underline">
              Prenota il tuo primo evento
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {registrations.map((registration) => {
              const eventDate = new Date(registration.event.dateTime);
              const status = STATUS_LABELS[registration.status] ?? {
                label: registration.status,
                className: "bg-gray-100 text-gray-700",
              };
              const isUpcoming = eventDate >= new Date();

              return (
                <li
                  key={registration.id}
                  className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-forest">
                          {registration.event.title}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-sm text-forest/60">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-emerald-500" />
                          {eventDate.toLocaleDateString("it-IT", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {" · "}
                          {eventDate.toLocaleTimeString("it-IT", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-emerald-500" />
                          {registration.event.locationName}
                        </p>
                        {registration.checkedInAt && (
                          <p className="text-xs text-emerald-600">
                            Check-in:{" "}
                            {new Date(registration.checkedInAt).toLocaleString("it-IT")}
                          </p>
                        )}
                      </div>
                    </div>

                    {isUpcoming &&
                      registration.status === REGISTRATION_STATUSES.PENDING_PAYMENT && (
                        <a
                          href={`/api/ticket/${registration.qrToken}`}
                          download
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                        >
                          <Download className="h-4 w-4" />
                          Scarica PDF
                        </a>
                      )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="text-center">
        <Link
          href="/#events"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          Prenota un nuovo evento →
        </Link>
      </div>
    </div>
  );
}
