import { AdminPinGate } from "@/components/admin/AdminPinGate";
import { AdminCheckIn } from "@/components/AdminCheckIn";

export const metadata = {
  title: "QR & Cassa — Sunset Run Giovinazzo",
  description: "Scanner QR per pagamenti e presenza alla corsa.",
};

export default function AdminCheckInPage() {
  return (
    <AdminPinGate
      title="QR & Cassa"
      subtitle="Pagamenti e presenza alla corsa"
    >
      <AdminCheckIn />
    </AdminPinGate>
  );
}
