import { AdminPinGate } from "@/components/admin/AdminPinGate";
import { EventsManager } from "@/components/admin/EventsManager";

export const metadata = {
  title: "Gestione Eventi — Giovinazzo Sunset Run",
  description: "Gestione eventi e meetup del run club.",
};

export default function AdminEventsPage() {
  return (
    <AdminPinGate
      title="Gestione Eventi"
      subtitle="Giovinazzo Sunset Run"
    >
      <EventsManager />
    </AdminPinGate>
  );
}
