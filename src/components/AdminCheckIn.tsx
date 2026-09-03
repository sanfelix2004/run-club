"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  RefreshCw,
  ScanLine,
  Undo2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalPortal } from "@/components/ModalPortal";
import {
  confirmCheckIn,
  getCheckInStats,
  getPresentAttendees,
  lookupRegistrationByQr,
  registerWalkIn,
  undoCheckIn,
  type CheckInStats,
  type PresentAttendee,
  type ScanResult,
} from "@/app/actions/checkin";
import { AdminNav } from "@/components/admin/AdminNav";
import { SITE, FEATURED_EVENT, MAX_EVENT_REGISTRATIONS } from "@/lib/constants";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";

const SCANNER_ID = "qr-reader";

type ModalState =
  | { type: "idle" }
  | { type: "confirming"; result: Extract<ScanResult, { success: true }> }
  | { type: "success"; result: Extract<ScanResult, { success: true }>; message: string }
  | { type: "already_used"; result: Extract<ScanResult, { success: true }> }
  | { type: "error"; message: string };

export function AdminCheckIn() {
  const [scanning, setScanning] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: "idle" });
  const [stats, setStats] = useState<CheckInStats>({
    eventId: null,
    eventTitle: "",
    totalRegistered: 0,
    checkedIn: 0,
    pending: 0,
    totalCollected: 0,
  });
  const [presentList, setPresentList] = useState<PresentAttendee[]>([]);
  const [undoingId, setUndoingId] = useState<string | null>(null);
  const [walkInForm, setWalkInForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    hasPaid: true,
  });
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string>("");
  const processingRef = useRef(false);

  const refreshDashboard = useCallback(async () => {
    const [nextStats, attendees] = await Promise.all([
      getCheckInStats(),
      getPresentAttendees(),
    ]);
    setStats(nextStats);
    setPresentList(attendees);
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const closeModal = useCallback(() => {
    setModal({ type: "idle" });
    lastScannedRef.current = "";
    processingRef.current = false;
  }, []);

  const processCheckIn = useCallback(
    async (result: Extract<ScanResult, { success: true }>) => {
      const alreadyIn =
        result.registration.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN;

      if (alreadyIn) {
        setModal({ type: "already_used", result });
        return;
      }

      setModal({ type: "confirming", result });

      const checkIn = await confirmCheckIn(result.registration.id);

      if (checkIn.success) {
        await refreshDashboard();
        setModal({
          type: "success",
          result: {
            ...result,
            registration: {
              ...result.registration,
              status: REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
              checkedInAt: new Date().toISOString(),
            },
          },
          message: checkIn.message,
        });
        setTimeout(closeModal, 2500);
      } else {
        setModal({ type: "error", message: checkIn.error });
      }
    },
    [closeModal, refreshDashboard],
  );

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        /* scanner may already be stopped */
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleScan = useCallback(
    async (decodedText: string) => {
      if (processingRef.current || decodedText === lastScannedRef.current) return;
      processingRef.current = true;
      lastScannedRef.current = decodedText;

      const result = await lookupRegistrationByQr(decodedText);

      if (result.success) {
        await processCheckIn(result);
      } else {
        setModal({ type: "error", message: result.error });
        toast.error(result.error);
      }
    },
    [processCheckIn],
  );

  const startScanner = useCallback(async () => {
    await stopScanner();
    closeModal();

    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScan,
        () => {},
      );
      setScanning(true);
    } catch {
      toast.error("Impossibile accedere alla fotocamera. Controlla i permessi.");
    }
  }, [closeModal, handleScan, stopScanner]);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  const handleManualLookup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get("token") as string;
    if (!token.trim()) return;
    await handleScan(token.trim());
  };

  const handleUndoCheckIn = useCallback(
    async (registrationId: string) => {
      setUndoingId(registrationId);
      const result = await undoCheckIn(registrationId);
      setUndoingId(null);

      if (result.success) {
        toast.success(result.message);
        await refreshDashboard();
        closeModal();
      } else {
        toast.error(result.error);
      }
    },
    [closeModal, refreshDashboard],
  );

  const handleWalkInSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWalkInSubmitting(true);

    const result = await registerWalkIn(walkInForm);
    setWalkInSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setWalkInForm({ firstName: "", lastName: "", phone: "", hasPaid: true });
      await refreshDashboard();
    } else {
      toast.error(result.error);
    }
  };

  const modalResult =
    modal.type === "confirming" ||
    modal.type === "success" ||
    modal.type === "already_used"
      ? modal.result
      : null;

  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-forest">Check-in organizzatore</h1>
            <p className="truncate text-xs text-forest/50">
              {stats.eventTitle || SITE.name}
            </p>
          </div>
          <AdminNav />
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 p-4 pb-8">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center shadow-sm">
            <Users className="mx-auto h-4 w-4 text-emerald-500" />
            <p className="mt-1 text-xl font-bold text-forest">
              {stats.totalRegistered}/{MAX_EVENT_REGISTRATIONS}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
              Iscritti
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
            <p className="mt-1 text-xl font-bold text-emerald-600">{stats.checkedIn}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
              Presenti
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center shadow-sm">
            <Banknote className="mx-auto h-4 w-4 text-emerald-500" />
            <p className="mt-1 text-xl font-bold text-emerald-600">
              €{stats.totalCollected.toFixed(0)}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
              Incassato
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold text-forest">Scanner QR</span>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={startScanner} aria-label="Riavvia scanner">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div id={SCANNER_ID} className="w-full [&>video]:w-full" />
          {!scanning && (
            <div className="flex items-center justify-center py-8 text-sm text-forest/50">
              Avvio fotocamera...
            </div>
          )}
        </div>

        <form onSubmit={handleManualLookup} className="flex gap-2">
          <Input
            name="token"
            placeholder="Codice QR manuale..."
            className="rounded-xl border-emerald-100 text-sm"
          />
          <Button type="submit" variant="outline" className="shrink-0 rounded-xl border-emerald-200">
            Cerca
          </Button>
        </form>

        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-emerald-50 px-4 py-3">
            <UserPlus className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-forest">Registrazione in loco</h2>
          </div>
          <form onSubmit={handleWalkInSubmit} className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Nome"
                value={walkInForm.firstName}
                onChange={(e) =>
                  setWalkInForm((prev) => ({ ...prev, firstName: e.target.value }))
                }
                required
                className="rounded-xl border-emerald-100 text-sm"
              />
              <Input
                placeholder="Cognome"
                value={walkInForm.lastName}
                onChange={(e) =>
                  setWalkInForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
                required
                className="rounded-xl border-emerald-100 text-sm"
              />
            </div>
            <Input
              type="tel"
              placeholder="Numero di telefono"
              value={walkInForm.phone}
              onChange={(e) =>
                setWalkInForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              required
              className="rounded-xl border-emerald-100 text-sm"
            />
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2.5 text-sm text-forest">
              <input
                type="checkbox"
                checked={walkInForm.hasPaid}
                onChange={(e) =>
                  setWalkInForm((prev) => ({ ...prev, hasPaid: e.target.checked }))
                }
                className="h-4 w-4 shrink-0 rounded border-emerald-200 text-emerald-500 focus:ring-emerald-400"
              />
              <span>Ha pagato (€{FEATURED_EVENT.priceAmount})</span>
            </label>
            <Button
              type="submit"
              disabled={walkInSubmitting}
              className="w-full rounded-xl bg-forest text-white hover:bg-forest/90"
            >
              {walkInSubmitting ? "Registrazione..." : walkInForm.hasPaid ? "Registra e segna presente" : "Registra (pagamento in sospeso)"}
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="border-b border-emerald-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-forest">
              Chi è presente ({presentList.length})
            </h2>
          </div>
          {presentList.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-forest/50">
              Nessun check-in ancora. Scansiona un QR valido.
            </p>
          ) : (
            <ul className="max-h-64 divide-y divide-emerald-50 overflow-y-auto">
              {presentList.map((person, index) => (
                <li key={person.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                    {presentList.length - index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-forest">
                      {person.firstName} {person.lastName}
                    </p>
                    <p className="text-xs text-forest/50">{person.paceCategory}</p>
                  </div>
                  <p className="shrink-0 text-xs text-forest/40">
                    {new Date(person.checkedInAt).toLocaleTimeString("it-IT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleUndoCheckIn(person.id)}
                    disabled={undoingId === person.id}
                    aria-label={`Annulla check-in di ${person.firstName} ${person.lastName}`}
                    className="shrink-0 text-forest/40 hover:bg-red-50 hover:text-red-600"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {modal.type !== "idle" && (
        <ModalPortal>
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-forest/70 p-4 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-3 top-3 rounded-full p-1.5 text-forest/40 hover:bg-emerald-50 hover:text-forest"
                aria-label="Chiudi"
              >
                <X className="h-5 w-5" />
              </button>

              {modal.type === "error" && (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-7 w-7 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-forest">QR non valido</h3>
                  <p className="mt-2 text-sm text-forest/60">{modal.message}</p>
                  <Button
                    onClick={closeModal}
                    className="mt-6 w-full rounded-full bg-forest text-white hover:bg-forest/90"
                  >
                    Chiudi
                  </Button>
                </div>
              )}

              {modal.type === "confirming" && modalResult && (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  </div>
                  <h3 className="text-lg font-bold text-forest">Registrazione in corso...</h3>
                  <p className="mt-2 text-sm text-forest/60">
                    {modalResult.registration.firstName} {modalResult.registration.lastName}
                  </p>
                </div>
              )}

              {modal.type === "success" && modalResult && (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-forest">Presente!</h3>
                  <p className="mt-2 text-xl font-semibold text-emerald-600">
                    {modalResult.registration.firstName} {modalResult.registration.lastName}
                  </p>
                  <p className="mt-1 text-sm text-forest/60">{modal.message}</p>
                  <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                    Totale presenti: {stats.checkedIn}
                  </p>
                </div>
              )}

              {modal.type === "already_used" && modalResult && (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                    <AlertTriangle className="h-7 w-7 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-forest">Già presente</h3>
                  <p className="mt-2 text-xl font-semibold text-amber-700">
                    {modalResult.registration.firstName} {modalResult.registration.lastName}
                  </p>
                  <p className="mt-2 text-sm text-forest/60">
                    Check-in già effettuato
                    {modalResult.registration.checkedInAt
                      ? ` alle ${new Date(modalResult.registration.checkedInAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`
                      : ""}
                    .
                  </p>
                  <div className="mt-6 space-y-2">
                    <Button
                      onClick={() => handleUndoCheckIn(modalResult.registration.id)}
                      disabled={undoingId === modalResult.registration.id}
                      variant="outline"
                      className="w-full rounded-full border-amber-200 text-amber-800 hover:bg-amber-50"
                    >
                      <Undo2 className="mr-2 h-4 w-4" />
                      Annulla check-in
                    </Button>
                    <Button
                      onClick={closeModal}
                      variant="ghost"
                      className="w-full rounded-full"
                    >
                      Chiudi
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
