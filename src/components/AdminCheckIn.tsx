"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Flag,
  RefreshCw,
  ScanLine,
  Search,
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
  getPaidAttendees,
  getPresentAttendees,
  lookupRegistrationByQr,
  markAllPaidAsRacePresent,
  markRacePresent,
  registerWalkIn,
  undoCheckIn,
  undoRacePresent,
  type CheckInStats,
  type PaidAttendee,
  type PresentAttendee,
  type ScanResult,
} from "@/app/actions/checkin";
import { FEATURED_EVENT, MAX_EVENT_REGISTRATIONS, EVENT_TIMEZONE } from "@/lib/constants";
import {
  isPaidStatus,
  isRacePresentStatus,
  REGISTRATION_STATUSES,
} from "@/lib/registration-types";

const SCANNER_ID = "qr-reader";

function isEventDayToday(): boolean {
  const eventDate = new Date(FEATURED_EVENT.dateTimeIso).toLocaleDateString("en-CA", {
    timeZone: EVENT_TIMEZONE,
  });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: EVENT_TIMEZONE });
  return eventDate === today;
}

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
    paidCount: 0,
    racePresentCount: 0,
    pendingPayment: 0,
    totalCollected: 0,
  });
  const [paidList, setPaidList] = useState<PaidAttendee[]>([]);
  const [presentList, setPresentList] = useState<PresentAttendee[]>([]);
  const [undoingId, setUndoingId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    hasPaid: true,
  });
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);
  const [raceDayMode, setRaceDayMode] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string>("");
  const processingRef = useRef(false);

  useEffect(() => {
    setRaceDayMode(isEventDayToday());
  }, []);

  const refreshDashboard = useCallback(async () => {
    const [nextStats, paid, present] = await Promise.all([
      getCheckInStats(),
      getPaidAttendees(),
      getPresentAttendees(),
    ]);
    setStats(nextStats);
    setPaidList(paid);
    setPresentList(present);
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
      if (raceDayMode) {
        if (isRacePresentStatus(result.registration.status)) {
          setModal({ type: "already_used", result });
          return;
        }
      } else if (isPaidStatus(result.registration.status)) {
        setModal({ type: "already_used", result });
        return;
      }

      setModal({ type: "confirming", result });

      const checkIn = await confirmCheckIn(result.registration.id, { raceDay: raceDayMode });

      if (checkIn.success) {
        await refreshDashboard();
        const nowIso = new Date().toISOString();
        setModal({
          type: "success",
          result: {
            ...result,
            registration: {
              ...result.registration,
              status: raceDayMode
                ? REGISTRATION_STATUSES.PAID_AND_CHECKED_IN
                : REGISTRATION_STATUSES.PAID,
              paidAt: result.registration.paidAt ?? nowIso,
              checkedInAt: raceDayMode ? nowIso : result.registration.checkedInAt,
            },
          },
          message: checkIn.message,
        });
        setTimeout(closeModal, 2500);
      } else {
        setModal({ type: "error", message: checkIn.error });
      }
    },
    [closeModal, raceDayMode, refreshDashboard],
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

  const handleUndoPayment = useCallback(
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

  const handleMarkRacePresent = async (registrationId: string) => {
    setMarkingId(registrationId);
    const result = await markRacePresent(registrationId);
    setMarkingId(null);
    if (result.success) {
      toast.success(result.message);
      await refreshDashboard();
    } else {
      toast.error(result.error);
    }
  };

  const handleMarkAllRacePresent = async () => {
    if (
      !window.confirm(
        `Segnare tutti i ${paidList.length} pagati come presenti alla corsa?`,
      )
    ) {
      return;
    }
    setMarkingAll(true);
    const result = await markAllPaidAsRacePresent();
    setMarkingAll(false);
    if (result.success) {
      toast.success(result.message);
      await refreshDashboard();
    } else {
      toast.error(result.error);
    }
  };

  const handleUndoRacePresent = async (registrationId: string) => {
    setUndoingId(registrationId);
    const result = await undoRacePresent(registrationId);
    setUndoingId(null);
    if (result.success) {
      toast.success(result.message);
      await refreshDashboard();
    } else {
      toast.error(result.error);
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWalkInSubmitting(true);

    const result = await registerWalkIn({ ...walkInForm, raceDay: raceDayMode });
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

  const searchNeedle = listSearch.trim().toLowerCase();
  const matchesSearch = (firstName: string, lastName: string) => {
    if (!searchNeedle) return true;
    return `${firstName} ${lastName}`.toLowerCase().includes(searchNeedle);
  };
  const filteredPaid = paidList.filter((p) => matchesSearch(p.firstName, p.lastName));
  const filteredPresent = presentList.filter((p) =>
    matchesSearch(p.firstName, p.lastName),
  );

  return (
    <div>
      <main className="mx-auto max-w-lg space-y-4 p-4 pb-12">
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-forest">Come usarlo</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-forest/65">
            <li>
              <strong className="text-forest">Prima della corsa</strong> — modalità
              &quot;Solo pagamento&quot;: scansiona i QR e registra chi ha pagato.
            </li>
            <li>
              <strong className="text-forest">Giorno della corsa</strong> — modalità
              &quot;Paga + presente&quot;: un solo scan serve per chi arriva sul posto.
            </li>
            <li>
              Senza QR? Usa <strong className="text-forest">Registrazione in loco</strong>{" "}
              sotto.
            </li>
          </ol>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-emerald-100 bg-white p-2 shadow-sm">
          <button
            type="button"
            onClick={() => setRaceDayMode(false)}
            className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              !raceDayMode
                ? "bg-forest text-white"
                : "bg-transparent text-forest/60 hover:bg-emerald-50"
            }`}
          >
            Solo pagamento
          </button>
          <button
            type="button"
            onClick={() => setRaceDayMode(true)}
            className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              raceDayMode
                ? "bg-emerald-600 text-white"
                : "bg-transparent text-forest/60 hover:bg-emerald-50"
            }`}
          >
            Paga + presente
          </button>
        </div>
        <p className="text-center text-xs text-forest/50">
          {raceDayMode
            ? "Giorno corsa: se non ha pagato → paga e presente; se ha già pagato → solo presente."
            : "Oggi: lo scanner registra solo il pagamento. La presenza si segna dopo."}
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            <Banknote className="mx-auto h-4 w-4 text-emerald-500" />
            <p className="mt-1 text-xl font-bold text-emerald-600">{stats.paidCount}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
              Pagati
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center shadow-sm">
            <Flag className="mx-auto h-4 w-4 text-emerald-500" />
            <p className="mt-1 text-xl font-bold text-emerald-600">{stats.racePresentCount}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
              In corsa
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
            <p className="mt-1 text-xl font-bold text-emerald-600">
              €{stats.totalCollected.toFixed(0)}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
              Incassato
            </p>
          </div>
        </div>

        {stats.eventTitle && (
          <p className="text-center text-xs text-forest/45">
            Evento attivo: <span className="font-medium text-forest/70">{stats.eventTitle}</span>
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold text-forest">
                {raceDayMode ? "Scanner QR — paga e/o presente" : "Scanner QR — pagamento"}
              </span>
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
            placeholder="Codice QR manuale (se lo scanner non legge)..."
            className="rounded-xl border-emerald-100 text-sm"
          />
          <Button type="submit" variant="outline" className="shrink-0 rounded-xl border-emerald-200">
            Cerca
          </Button>
        </form>

        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-emerald-50 px-4 py-3">
            <UserPlus className="h-4 w-4 text-emerald-500" />
            <div>
              <h2 className="text-sm font-semibold text-forest">Registrazione in loco</h2>
              <p className="text-[11px] text-forest/45">Per chi arriva senza iscrizione online</p>
            </div>
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
              {walkInSubmitting
                ? "Registrazione..."
                : walkInForm.hasPaid
                  ? raceDayMode
                    ? "Registra, paga e segna presente"
                    : "Registra come pagato"
                  : "Registra (pagamento in sospeso)"}
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Flag className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-forest">Tutti i pagati → in corsa</h2>
              <p className="mt-1 text-xs text-forest/60">
                Il giorno della partenza: un tap per segnare tutti i pagati come presenti.
              </p>
              <Button
                type="button"
                disabled={markingAll || paidList.length === 0}
                onClick={handleMarkAllRacePresent}
                className="mt-3 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {markingAll
                  ? "Salvataggio..."
                  : `Segna ${paidList.length} pagati come presenti`}
              </Button>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/35" />
          <Input
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            placeholder="Cerca per nome nelle liste..."
            className="rounded-xl border-emerald-100 pl-9 text-sm"
          />
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="border-b border-emerald-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-forest">
              Pagati — da segnare in corsa ({filteredPaid.length}
              {searchNeedle ? ` / ${paidList.length}` : ""})
            </h2>
          </div>
          {paidList.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-forest/50">
              Nessun pagamento ancora. Scansiona i QR.
            </p>
          ) : filteredPaid.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-forest/50">
              Nessun risultato per &quot;{listSearch}&quot;.
            </p>
          ) : (
            <ul className="max-h-64 divide-y divide-emerald-50 overflow-y-auto">
              {filteredPaid.map((person) => (
                <li key={person.id} className="flex items-center gap-2 px-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-forest">
                      {person.firstName} {person.lastName}
                    </p>
                    <p className="text-xs text-forest/50">
                      Pagato alle{" "}
                      {new Date(person.paidAt).toLocaleTimeString("it-IT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleMarkRacePresent(person.id)}
                    disabled={markingId === person.id}
                    className="shrink-0 rounded-full bg-emerald-500 px-3 text-xs text-white hover:bg-emerald-600"
                  >
                    {markingId === person.id ? "..." : "In corsa"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleUndoPayment(person.id)}
                    disabled={undoingId === person.id}
                    aria-label={`Annulla pagamento di ${person.firstName}`}
                    className="shrink-0 text-forest/40 hover:bg-red-50 hover:text-red-600"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="border-b border-emerald-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-forest">
              Presenti alla corsa ({filteredPresent.length}
              {searchNeedle ? ` / ${presentList.length}` : ""})
            </h2>
          </div>
          {presentList.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-forest/50">
              Ancora nessuno in corsa. Usa lo scanner o il bottone verde sopra.
            </p>
          ) : filteredPresent.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-forest/50">
              Nessun risultato per &quot;{listSearch}&quot;.
            </p>
          ) : (
            <ul className="max-h-64 divide-y divide-emerald-50 overflow-y-auto">
              {filteredPresent.map((person, index) => (
                <li key={person.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                    {filteredPresent.length - index}
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
                    onClick={() => handleUndoRacePresent(person.id)}
                    disabled={undoingId === person.id}
                    aria-label={`Annulla presenza di ${person.firstName}`}
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
                  <h3 className="text-lg font-bold text-forest">
                    {raceDayMode ? "Registrazione in corso..." : "Registrazione pagamento..."}
                  </h3>
                  <p className="mt-2 text-sm text-forest/60">
                    {modalResult.registration.firstName} {modalResult.registration.lastName}
                  </p>
                </div>
              )}

              {modal.type === "success" && modalResult && (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
                    {raceDayMode ? <Flag className="h-8 w-8" /> : <Banknote className="h-8 w-8" />}
                  </div>
                  <h3 className="text-lg font-bold text-forest">
                    {raceDayMode ? "Presente!" : "Pagato!"}
                  </h3>
                  <p className="mt-2 text-xl font-semibold text-emerald-600">
                    {modalResult.registration.firstName} {modalResult.registration.lastName}
                  </p>
                  <p className="mt-1 text-sm text-forest/60">{modal.message}</p>
                  <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                    {raceDayMode
                      ? `Presenti in corsa: ${stats.racePresentCount}`
                      : `Totale pagati: ${stats.paidCount}`}
                  </p>
                </div>
              )}

              {modal.type === "already_used" && modalResult && (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                    <AlertTriangle className="h-7 w-7 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-forest">
                    {modalResult.registration.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN
                      ? "Già presente in corsa"
                      : "Già pagato"}
                  </h3>
                  <p className="mt-2 text-xl font-semibold text-amber-700">
                    {modalResult.registration.firstName} {modalResult.registration.lastName}
                  </p>
                  <p className="mt-2 text-sm text-forest/60">
                    {modalResult.registration.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN
                      ? "Questa persona è già segnata come presente alla corsa."
                      : raceDayMode
                        ? "Già pagato: passa a «Paga + presente» se non è ancora in corsa, oppure chiudi."
                        : "Pagamento già registrato. Il giorno della corsa usa «Paga + presente» o il bottone presenza."}
                  </p>
                  <div className="mt-6 space-y-2">
                    <Button
                      onClick={() => handleUndoPayment(modalResult.registration.id)}
                      disabled={undoingId === modalResult.registration.id}
                      variant="outline"
                      className="w-full rounded-full border-amber-200 text-amber-800 hover:bg-amber-50"
                    >
                      <Undo2 className="mr-2 h-4 w-4" />
                      Annulla pagamento
                    </Button>
                    <Button onClick={closeModal} variant="ghost" className="w-full rounded-full">
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
