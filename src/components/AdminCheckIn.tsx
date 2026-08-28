"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  AlertTriangle,
  Banknote,
  Calendar,
  CheckCircle2,
  LogOut,
  MapPin,
  QrCode,
  RefreshCw,
  ScanLine,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  confirmCheckIn,
  getCheckInStats,
  lookupRegistrationByQr,
  type CheckInStats,
  type ScanResult,
} from "@/app/actions/checkin";
import { AdminNav } from "@/components/admin/AdminNav";
import {
  logoutAdmin,
  verifyAdminPin,
} from "@/app/actions/admin-auth";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";

const SCANNER_ID = "qr-reader";

export function AdminCheckIn() {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<Extract<ScanResult, { success: true }> | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [stats, setStats] = useState<CheckInStats>({
    totalRegistered: 0,
    checkedIn: 0,
    pending: 0,
    totalCollected: 0,
  });
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string>("");

  const refreshStats = useCallback(async () => {
    const data = await getCheckInStats();
    setStats(data);
  }, []);

  useEffect(() => {
    if (authed) refreshStats();
  }, [authed, refreshStats]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinLoading(true);
    const result = await verifyAdminPin(pin);
    setPinLoading(false);
    if (result.success) {
      setAuthed(true);
      toast.success("Accesso organizzatore confermato");
    } else {
      toast.error("PIN non valido");
    }
  };

  const handleLogout = async () => {
    await stopScanner();
    await logoutAdmin();
    setAuthed(false);
    setPin("");
    setScanResult(null);
    setScanError(null);
  };

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
      if (decodedText === lastScannedRef.current) return;
      lastScannedRef.current = decodedText;

      const result = await lookupRegistrationByQr(decodedText);

      if (result.success) {
        setScanResult(result);
        setScanError(null);

        if (result.registration.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN) {
          toast.warning("Biglietto già utilizzato!");
        } else {
          toast.success(`Trovato: ${result.registration.firstName} ${result.registration.lastName}`);
        }
      } else {
        setScanResult(null);
        setScanError(result.error);
        toast.error(result.error);
      }

      setTimeout(() => {
        lastScannedRef.current = "";
      }, 3000);
    },
    [],
  );

  const startScanner = useCallback(async () => {
    await stopScanner();
    setScanResult(null);
    setScanError(null);

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
  }, [handleScan, stopScanner]);

  useEffect(() => {
    if (authed) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [authed, startScanner, stopScanner]);

  const handleCheckIn = async () => {
    if (!scanResult) return;
    setCheckInLoading(true);

    const result = await confirmCheckIn(scanResult.registration.id);
    setCheckInLoading(false);

    if (result.success) {
      toast.success(result.message);
      setScanResult({
        ...scanResult,
        registration: {
          ...scanResult.registration,
          status: REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
          checkedInAt: new Date().toISOString(),
        },
      });
      refreshStats();
    } else {
      toast.error(result.error);
      setScanError(result.error);
    }
  };

  const handleManualLookup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get("token") as string;
    if (!token.trim()) return;
    await handleScan(token.trim());
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFBF7] p-4">
        <div className="w-full max-w-sm rounded-2xl border border-emerald-100 bg-white p-8 shadow-lg">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-forest text-white">
            <QrCode className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-forest">Check-in Organizzatore</h1>
          <p className="mt-2 text-sm text-forest/60">
            Inserisci il PIN staff per accedere allo scanner QR.
          </p>
          <form onSubmit={handlePinSubmit} className="mt-6 space-y-4">
            <Input
              type="password"
              placeholder="PIN organizzatore"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="rounded-xl border-emerald-100 text-center text-lg tracking-widest"
              autoFocus
            />
            <Button
              type="submit"
              disabled={pinLoading || !pin}
              className="w-full rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {pinLoading ? "Verifica..." : "Accedi"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-forest/40">
            PIN predefinito: runclub2026
          </p>
        </div>
      </div>
    );
  }

  const isAlreadyCheckedIn =
    scanResult?.registration.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN;

  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-forest">Check-in organizzatore</h1>
            <p className="text-xs text-forest/50">Giovinazzo Sunset Run</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <AdminNav />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              aria-label="Esci"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 p-4 pb-8">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center shadow-sm">
            <Users className="mx-auto h-4 w-4 text-emerald-500" />
            <p className="mt-1 text-xl font-bold text-forest">{stats.totalRegistered}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-forest/50">
              Iscritti
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
            <p className="mt-1 text-xl font-bold text-forest">{stats.checkedIn}</p>
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
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={startScanner}
              aria-label="Riavvia scanner"
            >
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
            placeholder="Inserisci token manualmente..."
            className="rounded-xl border-emerald-100 text-sm"
          />
          <Button type="submit" variant="outline" className="shrink-0 rounded-xl border-emerald-200">
            Cerca
          </Button>
        </form>

        {scanError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold text-red-700">Biglietto non valido</p>
              <p className="mt-1 text-sm text-red-600">{scanError}</p>
            </div>
          </div>
        )}

        {scanResult && (
          <div
            className={`rounded-2xl border p-5 shadow-sm ${
              isAlreadyCheckedIn
                ? "border-amber-200 bg-amber-50"
                : "border-emerald-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                  Atleta trovato
                </p>
                <p className="mt-1 text-xl font-bold text-forest">
                  {scanResult.registration.firstName} {scanResult.registration.lastName}
                </p>
                <p className="mt-1 text-sm text-forest/60">
                  Gruppo: {scanResult.registration.paceCategory}
                </p>
                <p className="mt-2 text-sm font-medium text-forest">
                  {scanResult.event.title}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-forest/60">
                  <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                  {new Date(scanResult.event.dateTime).toLocaleString("it-IT", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-forest/60">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  {scanResult.event.locationName}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isAlreadyCheckedIn
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {isAlreadyCheckedIn ? "GIÀ UTILIZZATO" : "IN ATTESA PAGAMENTO"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-forest/40">Email</p>
                <p className="truncate font-medium text-forest">{scanResult.registration.email}</p>
              </div>
              <div>
                <p className="text-forest/40">Telefono</p>
                <p className="font-medium text-forest">{scanResult.registration.phone}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-center">
              <p className="text-sm font-bold text-emerald-700">
                Quota: €{scanResult.event.priceAmount.toFixed(2).replace(".", ",")}
              </p>
            </div>

            {!isAlreadyCheckedIn && (
              <Button
                onClick={handleCheckIn}
                disabled={checkInLoading}
                className="mt-4 w-full rounded-full bg-emerald-500 py-5 text-white hover:bg-emerald-600"
              >
                {checkInLoading
                  ? "Conferma in corso..."
                  : `Conferma Presenza e Incassa ${scanResult.event.priceAmount.toFixed(2).replace(".", ",")}€`}
              </Button>
            )}

            {isAlreadyCheckedIn && scanResult.registration.checkedInAt && (
              <p className="mt-4 text-center text-sm text-amber-600">
                Check-in effettuato il{" "}
                {new Date(scanResult.registration.checkedInAt).toLocaleString("it-IT")}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
