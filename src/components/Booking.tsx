"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, Euro } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/FadeIn";
import { TicketPreview } from "@/components/TicketPreview";
import { registerForMeetup, type RegistrationResult } from "@/app/actions/registration";
import { PACE_CATEGORIES } from "@/lib/registration-types";
import type { RegistrationFormData } from "@/lib/validations/registration";

import type { PublicEvent } from "@/app/actions/events";

type BookingUser = {
  name: string;
  email: string;
} | null;

type BookingProps = {
  events: PublicEvent[];
  user?: BookingUser;
};

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function Booking({ events, user = null }: BookingProps) {
  const userNames = user?.name ? splitName(user.name) : { firstName: "", lastName: "" };
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? "");
  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? events[0] ?? null;
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [registration, setRegistration] = useState<
    Extract<RegistrationResult, { success: true }>["registration"] | null
  >(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data: RegistrationFormData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      emergencyName: formData.get("emergencyName") as string,
      emergencyPhone: formData.get("emergencyPhone") as string,
      paceCategory: formData.get("paceCategory") as RegistrationFormData["paceCategory"],
    };

    const eventId = formData.get("eventId") as string;

    const result = await registerForMeetup({ ...data, eventId });
    setLoading(false);

    if (result.success) {
      setRegistration(result.registration);
      toast.success("Prenotazione confermata! Scarica il PDF con il QR code.");
    } else {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      toast.error(result.error);
    }
  };

  const selectClass =
    "flex h-9 w-full rounded-xl border border-emerald-100 bg-transparent px-3 py-1 text-sm text-forest shadow-xs outline-none focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400/30";

  return (
    <section id="booking" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
              Iscrizione Meetup
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
              Registrati alla prossima corsa
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-forest/70">
              Compila il modulo per prenotare il tuo posto. Riceverai subito un
              PDF con l&apos;importo da pagare e un QR code valido come
              prenotazione. La quota di{" "}
              <strong className="text-forest">
                {selectedEvent?.priceAmount.toFixed(2).replace(".", ",") ?? "5,00"}€
              </strong>{" "}
              si paga in contanti o POS il giorno della corsa.
            </p>

            {selectedEvent && (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <p className="font-semibold text-forest">{selectedEvent.title}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-forest/60">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  {selectedEvent.date} · {selectedEvent.time}
                </p>
                <p className="mt-1 text-sm text-forest/60">{selectedEvent.locationName}</p>
                <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <Euro className="h-4 w-4" />
                  Quota: {selectedEvent.priceAmount.toFixed(2).replace(".", ",")}€ da saldare all&apos;arrivo
                </p>
              </div>
            )}

            <ul className="mt-8 space-y-4">
              {[
                "PDF con quota da pagare e QR prenotazione",
                "Pagamento sul posto (contanti/POS)",
                "Check-in rapido con scansione QR",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-forest/70">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              {registration ? (
                <TicketPreview
                  registration={registration}
                  onRegisterAnother={() => setRegistration(null)}
                />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 text-forest">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                    <span className="font-semibold">Modulo di iscrizione runner</span>
                  </div>

                  {events.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="eventId">Scegli evento</Label>
                      <select
                        id="eventId"
                        name="eventId"
                        required
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className={selectClass}
                      >
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.title} — {event.date} {event.time}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        defaultValue={userNames.firstName}
                        placeholder="Marco"
                        className="rounded-xl border-emerald-100"
                      />
                      {fieldErrors.firstName && (
                        <p className="text-xs text-red-500">{fieldErrors.firstName[0]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Cognome</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        defaultValue={userNames.lastName}
                        placeholder="Rossi"
                        className="rounded-xl border-emerald-100"
                      />
                      {fieldErrors.lastName && (
                        <p className="text-xs text-red-500">{fieldErrors.lastName[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      defaultValue={user?.email ?? ""}
                      readOnly={Boolean(user?.email)}
                      placeholder="marco@example.com"
                      className="rounded-xl border-emerald-100"
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-500">{fieldErrors.email[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Numero di telefono</Label>
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

                  <div className="rounded-xl border border-emerald-50 bg-emerald-50/50 p-4">
                    <p className="mb-3 text-sm font-medium text-forest">
                      Contatto di emergenza
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyName">Nome</Label>
                        <Input
                          id="emergencyName"
                          name="emergencyName"
                          required
                          placeholder="Laura Rossi"
                          className="rounded-xl border-emerald-100 bg-white"
                        />
                        {fieldErrors.emergencyName && (
                          <p className="text-xs text-red-500">{fieldErrors.emergencyName[0]}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Telefono</Label>
                        <Input
                          id="emergencyPhone"
                          name="emergencyPhone"
                          type="tel"
                          required
                          placeholder="+39 333 987 6543"
                          className="rounded-xl border-emerald-100 bg-white"
                        />
                        {fieldErrors.emergencyPhone && (
                          <p className="text-xs text-red-500">{fieldErrors.emergencyPhone[0]}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paceCategory">Fascia di passo</Label>
                    <select
                      id="paceCategory"
                      name="paceCategory"
                      required
                      className={selectClass}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Seleziona il tuo gruppo...
                      </option>
                      {PACE_CATEGORIES.map((pace) => (
                        <option key={pace} value={pace}>
                          {pace}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.paceCategory && (
                      <p className="text-xs text-red-500">{fieldErrors.paceCategory[0]}</p>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-forest/50">
                    Iscrivendoti accetti lo scarico di responsabilità e confermi
                    di essere in condizioni fisiche adeguate per partecipare.
                  </p>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-emerald-500 py-5 text-white hover:bg-emerald-600"
                  >
                    {loading ? "Registrazione in corso..." : "Iscriviti e genera il pass"}
                  </Button>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
