"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Calendar, Download, MapPin, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RegistrationResult } from "@/app/actions/registration";
import { buildQrPayload } from "@/lib/qr";

type TicketPreviewProps = {
  registration: Extract<RegistrationResult, { success: true }>["registration"];
  onRegisterAnother: () => void;
  closeLabel?: string;
};

export function TicketPreview({
  registration,
  onRegisterAnother,
  closeLabel = "Nuova iscrizione",
}: TicketPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const eventDate = new Date(registration.event.dateTime);
  const formattedDate = eventDate.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    QRCode.toDataURL(buildQrPayload(registration.qrToken), {
      width: 280,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#064E3B", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, [registration.qrToken]);

  const downloadUrl = `/api/ticket/${registration.qrToken}`;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border-2 border-emerald-200 bg-white shadow-lg">
        <div className="bg-forest px-6 py-4 text-white">
          <p className="text-xs font-medium uppercase tracking-widest opacity-80">
            Run Club Giovinazzo
          </p>
          <h3 className="mt-1 text-lg font-bold">{registration.event.title}</h3>
          <p className="text-xs opacity-70">Prenotazione confermata</p>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                Atleta
              </p>
              <p className="mt-1 text-2xl font-bold text-forest">
                {registration.firstName} {registration.lastName}
              </p>
              <p className="mt-2 text-sm text-forest/60">
                Gruppo: <span className="font-medium text-forest">{registration.paceCategory}</span>
              </p>

              <div className="mt-5 space-y-2 text-sm text-forest/70">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  {formattedDate} · {formattedTime}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  {registration.event.locationName}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              {qrDataUrl ? (
                <Image
                  src={qrDataUrl}
                  alt="QR code del biglietto"
                  width={140}
                  height={140}
                  className="rounded-lg border border-emerald-100"
                  unoptimized
                />
              ) : (
                <div className="flex h-[140px] w-[140px] items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50">
                  <QrCode className="h-8 w-8 animate-pulse text-emerald-300" />
                </div>
              )}
              <p className="mt-2 text-center text-xs text-forest/40">
                QR prenotazione · mostra al check-in
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-emerald-500 px-4 py-3 text-center">
            <p className="text-sm font-bold text-white">
              QUOTA DA SALDARE ALL&apos;ARRIVO:{" "}
              {registration.event.priceAmount.toFixed(2).replace(".", ",")}€
            </p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-forest/50">
            La prenotazione è confermata per questo evento. Scarica il PDF e
            presenta il QR (stampato o su smartphone) al punto di ritrovo.
            La quota va saldata in contanti o POS. Partecipi sotto la tua
            responsabilità — consulta un medico se hai dubbi sulla salute.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={downloadUrl}
          download
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 py-5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Download className="h-4 w-4" />
          Scarica PDF prenotazione
        </a>
        <Button
          variant="outline"
          className="flex-1 rounded-full border-emerald-200 py-5"
          onClick={onRegisterAnother}
        >
          {closeLabel}
        </Button>
      </div>

      <p className="text-center text-sm text-forest/50">
        Puoi rivedere tutte le tue iscrizioni in{" "}
        <a href="/area-atleta" className="font-medium text-emerald-600 hover:underline">
          Area Atleta
        </a>
        .
      </p>
    </div>
  );
}
