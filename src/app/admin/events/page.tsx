import { AdminPinGate } from "@/components/admin/AdminPinGate";
import { EventsManager } from "@/components/admin/EventsManager";

export const metadata = {
  title: "Iscritti — Sunset Run Giovinazzo",
  description: "Gestione iscritti, eventi e messaggi WhatsApp.",
};

export default function AdminEventsPage() {
  return (
    <AdminPinGate
      title="Iscritti e eventi"
      subtitle="Prenotazioni, conferme e WhatsApp"
    >
      <EventsManager />
    </AdminPinGate>
  );
}
