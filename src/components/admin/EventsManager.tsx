"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createEvent,
  deleteEvent,
  getAllEventsAdmin,
  updateEvent,
  type PublicEvent,
} from "@/app/actions/events";
import type { EventFormData } from "@/lib/validations/event";

const emptyForm: EventFormData = {
  title: "",
  dateTime: "",
  locationName: "Piazza Vittorio Emanuele II, Giovinazzo",
  priceAmount: 5,
  currency: "EUR",
  description: "",
};

function toLocalDatetimeValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventsManager() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormData>(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const loadEvents = async () => {
    const data = await getAllEventsAdmin();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (event: PublicEvent) => {
    setForm({
      title: event.title,
      dateTime: toLocalDatetimeValue(event.dateTime),
      locationName: event.locationName,
      priceAmount: event.priceAmount,
      currency: event.currency,
      description: event.description ?? "",
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const result = editingId
      ? await updateEvent(editingId, form)
      : await createEvent(form);

    setSaving(false);

    if (result.success) {
      toast.success(editingId ? "Evento aggiornato" : "Evento creato");
      resetForm();
      loadEvents();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Eliminare "${title}"?`)) return;
    const result = await deleteEvent(id);
    if (result.success) {
      toast.success("Evento eliminato");
      loadEvents();
    } else {
      toast.error(result.error ?? "Errore");
    }
  };

  const isPast = (dateTime: string) => new Date(dateTime) < new Date();

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-forest/60">
            {events.length} eventi totali
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/checkin"
            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-forest transition-colors hover:bg-emerald-50"
          >
            Check-in QR
          </Link>
          <Button
            onClick={startCreate}
            className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuovo evento
          </Button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-forest">
            {editingId ? "Modifica evento" : "Nuovo evento"}
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Titolo</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Meetup settimanale del Run Club"
                required
                className="rounded-xl border-emerald-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTime">Data e ora</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                value={form.dateTime}
                onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                required
                className="rounded-xl border-emerald-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceAmount">Quota (€)</Label>
              <Input
                id="priceAmount"
                type="number"
                step="0.01"
                min="0"
                value={form.priceAmount}
                onChange={(e) =>
                  setForm({ ...form, priceAmount: Number(e.target.value) })
                }
                required
                className="rounded-xl border-emerald-100"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="locationName">Luogo ritrovo</Label>
              <Input
                id="locationName"
                value={form.locationName}
                onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                required
                className="rounded-xl border-emerald-100"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Descrizione (opzionale)</Label>
              <Input
                id="description"
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Corsa sul lungomare, tutti i livelli..."
                className="rounded-xl border-emerald-100"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {saving ? "Salvataggio..." : editingId ? "Salva modifiche" : "Crea evento"}
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={resetForm}>
              Annulla
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-center text-forest/50">Caricamento eventi...</p>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 p-12 text-center">
          <p className="text-forest/60">Nessun evento. Creane uno!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <article
              key={event.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm ${
                isPast(event.dateTime) ? "border-forest/10 opacity-60" : "border-emerald-100"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-forest">{event.title}</h3>
                    {isPast(event.dateTime) ? (
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs text-forest/50">
                        Passato
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        In programma
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="mt-1 text-sm text-forest/60">{event.description}</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-forest/70">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-emerald-500" />
                      {event.date} · {event.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      {event.locationName}
                    </span>
                    <span className="font-medium text-emerald-600">
                      €{event.priceAmount.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-emerald-500" />
                      {event.registrationCount} iscritti
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => startEdit(event)}
                    aria-label="Modifica"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(event.id, event.title)}
                    aria-label="Elimina"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
