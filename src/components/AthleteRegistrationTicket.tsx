"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AthleteRegistration } from "@/app/actions/athlete-area";
import { EVENT_TIMEZONE, SITE } from "@/lib/constants";
import { buildQrPayload } from "@/lib/qr";
import { REGISTRATION_STATUSES } from "@/lib/registration-types";

type AthleteRegistrationTicketProps = {
  registration: AthleteRegistration;
};

export function AthleteRegistrationTicket({ registration }: AthleteRegistrationTicketProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  const isCheckedIn = registration.status === REGISTRATION_STATUSES.PAID_AND_CHECKED_IN;
  const downloadUrl = `/api/ticket/${registration.qrToken}`;

  useEffect(() => {
    QRCode.toDataURL(buildQrPayload(registration.qrToken), {
      width: 220,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#0A2A5C", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, [registration.qrToken]);

  const eventDate = new Date(registration.event.dateTime);
  const formattedDate = eventDate.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: EVENT_TIMEZONE,
  });
  const formattedTime = eventDate.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: EVENT_TIMEZONE,
  });

  return (
    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Il tuo biglietto
          </p>
          <p className="mt-1 font-semibold text-forest">
            {registration.firstName} {registration.lastName}
          </p>
          <p className="text-sm text-forest/60">Gruppo: {registration.paceCategory}</p>
          <p className="mt-2 text-sm text-forest/70">
            {formattedDate} · ore {formattedTime}
          </p>
          <p className="text-sm text-forest/70">{registration.event.locationName}</p>
          <p className="mt-3 rounded-lg bg-emerald-500 px-3 py-2 text-center text-sm font-bold text-white">
            Quota da saldare all&apos;arrivo:{" "}
            {registration.event.priceAmount.toFixed(2).replace(".", ",")}€
          </p>
        </div>

        <div className="flex flex-col items-center">
          {qrDataUrl ? (
            <Image
              src={qrDataUrl}
              alt="QR code del biglietto"
              width={140}
              height={140}
              className="rounded-lg border border-emerald-100 bg-white"
              unoptimized
            />
          ) : (
            <div className="flex h-[140px] w-[140px] items-center justify-center rounded-lg border border-emerald-100 bg-white">
              <QrCode className="h-8 w-8 animate-pulse text-emerald-300" />
            </div>
          )}
          <p className="mt-2 text-center text-xs text-forest/50">
            Mostra questo QR al check-in
          </p>
        </div>
      </div>

      {isCheckedIn ? (
        <p className="mt-3 text-center text-xs font-medium text-emerald-700">
          Check-in già effettuato — conserva il biglietto come ricevuta.
        </p>
      ) : (
        <p className="mt-3 text-center text-xs text-forest/50">
          {SITE.insuranceNote}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <a
          href={downloadUrl}
          download
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          <Download className="h-4 w-4" />
          Scarica PDF con QR
        </a>
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-full border-emerald-200"
          onClick={() => window.open(downloadUrl, "_blank", "noopener,noreferrer")}
        >
          Apri PDF
        </Button>
      </div>
    </div>
  );
}
