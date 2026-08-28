"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  LogOut,
  MapPin,
  Ticket,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAthleteDashboard,
  loginAthleteArea,
  logoutAthleteArea,
  type AthleteDashboard,
} from "@/app/actions/athlete-area";
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
  const [dashboard, setDashboard] = useState<AthleteDashboard | null>(initialDashboard);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await loginAthleteArea({
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
    });

    setLoading(false);

    if (result.success) {
      const data = await getAthleteDashboard();
      setDashboard(data);
      toast.success("Accesso effettuato");
    } else {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      toast.error(result.error);
    }
  };

  const handleLogout = async () => {
    await logoutAthleteArea();
    setDashboard(null);
    toast.success("Sei uscito dall'area atleta");
  };

  if (!dashboard) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-lg">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
            <User className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-forest">Area Atleta</h1>
          <p className="mt-2 text-sm text-forest/60">
            Accedi con email e telefono usati in iscrizione per vedere i tuoi dati
            e lo storico eventi.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="marco@example.com"
                className="rounded-xl border-emerald-100"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500">{fieldErrors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="+39 333 123 4567"
                className="rounded-xl border-emerald-100"
              />
              {fieldErrors.phone && (
                <p className="text-xs text-red-500">{fieldErrors.phone[0]}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-500 py-5 text-white hover:bg-emerald-600"
            >
              {loading ? "Accesso..." : "Accedi"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-forest/50">
            Non sei ancora iscritto?{" "}
            <Link href="/#booking" className="font-medium text-emerald-600 hover:underline">
              Prenota un evento
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const { profile, stats, registrations } = dashboard;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
            Area Atleta
          </p>
          <h1 className="mt-2 text-3xl font-bold text-forest">
            Ciao, {profile.firstName}!
          </h1>
          <p className="mt-1 text-forest/60">
            {profile.firstName} {profile.lastName} · {profile.email}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="shrink-0 rounded-full border-emerald-200"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Esci
        </Button>
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

      <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-forest">I tuoi dati</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-forest/40">
              Telefono
            </dt>
            <dd className="mt-1 font-medium text-forest">{profile.phone}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-forest/40">
              Gruppo di passo
            </dt>
            <dd className="mt-1 font-medium text-forest">{profile.paceCategory}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-forest/40">
              Contatto di emergenza
            </dt>
            <dd className="mt-1 font-medium text-forest">{profile.emergencyContact}</dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-forest">Storico eventi</h2>
        <p className="mt-1 text-sm text-forest/60">
          Tutte le tue iscrizioni, dalla più recente.
        </p>

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
                      <h3 className="font-semibold text-forest">{registration.event.title}</h3>
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
      </div>

      <div className="text-center">
        <Link
          href="/#booking"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          Prenota un nuovo evento →
        </Link>
      </div>
    </div>
  );
}
