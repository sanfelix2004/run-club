"use client";

import { useEffect, useState } from "react";
import { Calendar, Euro, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TicketPreview } from "@/components/TicketPreview";
import { registerForMeetup, type RegistrationResult } from "@/app/actions/registration";
import type { PublicEvent } from "@/app/actions/events";
import { ModalPortal } from "@/components/ModalPortal";
import { PACE_CATEGORIES } from "@/lib/registration-types";
import type { RegistrationFormData } from "@/lib/validations/registration";

type BookingUser = {
  name: string;
  email: string;
} | null;

type EventRegistrationSheetProps = {
  event: PublicEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: BookingUser;
};

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function EventRegistrationSheet({
  event,
  open,
  onOpenChange,
  user = null,
}: EventRegistrationSheetProps) {
  const userNames = user?.name ? splitName(user.name) : { firstName: "", lastName: "" };
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [registration, setRegistration] = useState<
    Extract<RegistrationResult, { success: true }>["registration"] | null
  >(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!open) {
      setRegistration(null);
      setFieldErrors({});
      setFormKey((k) => k + 1);
    }
  }, [open, event?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !registration) onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange, registration]);

  if (!open || !event) return null;

  const selectClass =
    "flex h-9 w-full rounded-xl border border-emerald-100 bg-transparent px-3 py-1 text-sm text-forest shadow-xs outline-none focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400/30";

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

    const result = await registerForMeetup({ ...data, eventId: event.id });
    setLoading(false);

    if (result.success) {
      setRegistration(result.registration);
      toast.success("Prenotazione confermata! Scarica il PDF con il QR code.");
    } else {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      toast.error(result.error);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[200] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-4">
        <button
          type="button"
          className="fixed inset-0 z-0 bg-forest/70 backdrop-blur-md"
          aria-label="Chiudi"
          onClick={() => !registration && onOpenChange(false)}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-registration-title"
          className="relative z-[1] my-auto flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-emerald-100 bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-lg sm:rounded-3xl"
        >
        <div className="shrink-0 border-b border-emerald-50 bg-gradient-to-r from-forest to-emerald-700 px-5 py-4 text-white sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-medium uppercase tracking-widest opacity-80">
                Iscrizione evento
              </p>
              <h2 id="event-registration-title" className="mt-1 text-lg font-bold leading-tight">
                {event.title}
              </h2>
              <div className="mt-2 space-y-1 text-sm opacity-90">
                <p className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {event.date} · {event.time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{event.locationName}</span>
                </p>
                <p className="flex items-center gap-2 font-semibold">
                  <Euro className="h-3.5 w-3.5 shrink-0" />
                  {event.priceAmount.toFixed(2).replace(".", ",")}€ da saldare all&apos;arrivo
                </p>
              </div>
            </div>
            {!registration && (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="shrink-0 rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Chiudi"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {registration ? (
            <TicketPreview
              registration={registration}
              onRegisterAnother={() => onOpenChange(false)}
              closeLabel="Chiudi"
            />
          ) : (
            <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-forest/60">
                Compila i dati per prenotare il tuo posto. Riceverai subito il PDF con QR code.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sheet-firstName">Nome</Label>
                  <Input
                    id="sheet-firstName"
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
                  <Label htmlFor="sheet-lastName">Cognome</Label>
                  <Input
                    id="sheet-lastName"
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
                <Label htmlFor="sheet-email">Email</Label>
                <Input
                  id="sheet-email"
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
                <Label htmlFor="sheet-phone">Numero di telefono</Label>
                <Input
                  id="sheet-phone"
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
                <p className="mb-3 text-sm font-medium text-forest">Contatto di emergenza</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sheet-emergencyName">Nome</Label>
                    <Input
                      id="sheet-emergencyName"
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
                    <Label htmlFor="sheet-emergencyPhone">Telefono</Label>
                    <Input
                      id="sheet-emergencyPhone"
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
                <Label htmlFor="sheet-paceCategory">Fascia di passo</Label>
                <select
                  id="sheet-paceCategory"
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
                Iscrivendoti accetti lo scarico di responsabilità e confermi di essere in
                condizioni fisiche adeguate per partecipare.
              </p>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-emerald-500 py-5 text-white hover:bg-emerald-600"
              >
                {loading ? "Registrazione in corso..." : "Conferma iscrizione"}
              </Button>
            </form>
          )}
        </div>
        </div>
      </div>
    </ModalPortal>
  );
}
