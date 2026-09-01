import { AdminPinGate } from "@/components/admin/AdminPinGate";
import { EventsManager } from "@/components/admin/EventsManager";

export const metadata = {
  title: "Gestione Eventi — Sunset Run Giovinazzo",
  description: "Gestione eventi e meetup di Sunset Run Giovinazzo.",
};

export default function AdminEventsPage() {
  return (
    <AdminPinGate
      title="Gestione Eventi"
      subtitle="Sunset Run Giovinazzo"
    >
      <EventsManager />
    </AdminPinGate>
  );
}
