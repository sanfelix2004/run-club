import { AdminPinGate } from "@/components/admin/AdminPinGate";
import { EventsManager } from "@/components/admin/EventsManager";

export const metadata = {
  title: "Back Office Eventi — Run Club Giovinazzo",
  description: "Gestione eventi e meetup del run club.",
};

export default function AdminEventsPage() {
  return (
    <AdminPinGate
      title="Back Office Eventi"
      subtitle="Run Club Giovinazzo"
    >
      <EventsManager />
    </AdminPinGate>
  );
}
