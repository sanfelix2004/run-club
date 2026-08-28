"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateAthleteProfile,
  type AthleteProfile,
} from "@/app/actions/athlete-profile";
import { PACE_CATEGORIES } from "@/lib/registration-types";

type AthleteProfileFormProps = {
  initialProfile: AthleteProfile;
};

export function AthleteProfileForm({ initialProfile }: AthleteProfileFormProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const selectClass =
    "flex h-9 w-full rounded-xl border border-emerald-100 bg-transparent px-3 py-1 text-sm text-forest shadow-xs outline-none focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400/30";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const result = await updateAthleteProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      paceCategory: profile.paceCategory,
      medicalNotes: profile.medicalNotes ?? "",
    });

    setLoading(false);

    if (result.success) {
      setProfile(result.profile);
      toast.success("Profilo aggiornato!");
    } else {
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      toast.error(result.error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-forest">Il tuo profilo</h2>
          <p className="mt-1 text-sm text-forest/60">
            Aggiorna i tuoi dati: verranno usati per le prossime prenotazioni.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profile-firstName">Nome</Label>
          <Input
            id="profile-firstName"
            value={profile.firstName}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            required
            className="rounded-xl border-emerald-100"
          />
          {fieldErrors.firstName && (
            <p className="text-xs text-red-500">{fieldErrors.firstName[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-lastName">Cognome</Label>
          <Input
            id="profile-lastName"
            value={profile.lastName}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            required
            className="rounded-xl border-emerald-100"
          />
          {fieldErrors.lastName && (
            <p className="text-xs text-red-500">{fieldErrors.lastName[0]}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            value={profile.email}
            readOnly
            disabled
            className="rounded-xl border-emerald-100 bg-emerald-50/40"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-phone">Telefono</Label>
          <Input
            id="profile-phone"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            required
            placeholder="+39 333 123 4567"
            className="rounded-xl border-emerald-100"
          />
          {fieldErrors.phone && (
            <p className="text-xs text-red-500">{fieldErrors.phone[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-paceCategory">Fascia di passo</Label>
          <select
            id="profile-paceCategory"
            value={profile.paceCategory}
            onChange={(e) =>
              setProfile({
                ...profile,
                paceCategory: e.target.value as AthleteProfile["paceCategory"],
              })
            }
            required
            className={selectClass}
          >
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

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="profile-medicalNotes">
            Patologie e note mediche{" "}
            <span className="font-normal text-forest/40">(opzionale)</span>
          </Label>
          <textarea
            id="profile-medicalNotes"
            value={profile.medicalNotes ?? ""}
            onChange={(e) => setProfile({ ...profile, medicalNotes: e.target.value })}
            rows={4}
            placeholder="Es. asma, allergie, problemi cardiaci, infortuni recenti..."
            className="w-full resize-y rounded-xl border border-emerald-100 bg-transparent px-3 py-2 text-sm text-forest outline-none focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400/30"
          />
          {fieldErrors.medicalNotes && (
            <p className="text-xs text-red-500">{fieldErrors.medicalNotes[0]}</p>
          )}
          <p className="text-xs text-forest/50">
            Queste informazioni aiutano lo staff in caso di emergenza durante gli eventi.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="mt-6 rounded-full bg-emerald-500 px-6 text-white hover:bg-emerald-600"
      >
        {loading ? "Salvataggio..." : "Salva profilo"}
      </Button>
    </form>
  );
}
