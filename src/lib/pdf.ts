import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { readFile } from "fs/promises";
import path from "path";
import { buildQrPayload } from "@/lib/qr";
import { SITE } from "@/lib/constants";

/** Brand colors from Sunset Run Giovinazzo logo */
const NAVY = { r: 10, g: 42, b: 92 }; // #0A2A5C
const ORANGE = { r: 255, g: 107, b: 0 }; // #FF6B00

export type TicketData = {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  locationName: string;
  firstName: string;
  lastName: string;
  paceCategory: string;
  qrToken: string;
  priceAmount: number;
  currency: string;
};

export async function generateTicketPdf(data: TicketData): Promise<Uint8Array> {
  const doc = new jsPDF({ unit: "mm", format: "a5", orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;

  const qrDataUrl = await QRCode.toDataURL(buildQrPayload(data.qrToken), {
    width: 400,
    margin: 1,
    errorCorrectionLevel: "H",
    color: { dark: "#0A2A5C", light: "#FFFFFF" },
  });

  // Header bar — navy
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.rect(0, 0, pageWidth, 30, "F");

  // Orange accent strip under header
  doc.setFillColor(ORANGE.r, ORANGE.g, ORANGE.b);
  doc.rect(0, 30, pageWidth, 2.5, "F");

  // Try to embed logo mark on the right of the header
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const logoBytes = await readFile(logoPath);
    const logoBase64 = Buffer.from(logoBytes).toString("base64");
    doc.addImage(`data:image/png;base64,${logoBase64}`, "PNG", pageWidth - margin - 28, 3, 26, 24);
  } catch {
    /* logo optional */
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("SUNSET RUN", margin, 10);
  doc.setTextColor(ORANGE.r, ORANGE.g, ORANGE.b);
  doc.text("GIOVINAZZO", margin, 15);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(data.eventTitle.toUpperCase(), margin, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("PRENOTAZIONE CONFERMATA", margin, 27);

  let y = 42;
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ATLETA", margin, y);
  y += 6;
  doc.setFontSize(16);
  doc.text(`${data.firstName} ${data.lastName}`, margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Gruppo di passo: ${data.paceCategory}`, margin, y);

  y += 12;
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
  doc.setFont("helvetica", "bold");
  doc.text("RITROVO", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text(`Data: ${data.eventDate}`, margin, y);
  y += 5;
  doc.text(`Orario: ${data.eventTime}`, margin, y);
  y += 5;
  doc.text(`Luogo: ${data.locationName}`, margin, y);

  const qrSize = 42;
  const qrX = pageWidth - margin - qrSize;
  const qrY = 40;
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text("QR valido come prenotazione per questo evento", qrX + qrSize / 2, qrY + qrSize + 4, {
    align: "center",
  });

  y += 14;
  // Orange payment banner
  doc.setFillColor(ORANGE.r, ORANGE.g, ORANGE.b);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(
    `QUOTA DA SALDARE ALL'ARRIVO: ${data.priceAmount.toFixed(2).replace(".", ",")}€`,
    pageWidth / 2,
    y + 10,
    { align: "center" },
  );

  y += 24;
  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("NOTE DI SICUREZZA", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  doc.setFontSize(7);
  const disclaimer = [
    "• Questo documento conferma la tua prenotazione per l'evento indicato.",
    "• Presenta il QR (stampato o digitale) al punto di ritrovo per il check-in.",
    "• La quota di partecipazione va saldata in contanti o POS all'arrivo.",
    `• ${SITE.insuranceNote}`,
    `• Contatti: ${SITE.phone} · ${SITE.instagramHandle}`,
  ];
  disclaimer.forEach((line) => {
    doc.text(line, margin, y);
    y += 4;
  });

  doc.setFontSize(6);
  doc.setTextColor(160, 160, 160);
  doc.text(
    `Codice: ${data.qrToken.slice(0, 8).toUpperCase()}  ·  ${SITE.name}`,
    margin,
    doc.internal.pageSize.getHeight() - 6,
  );

  return new Uint8Array(doc.output("arraybuffer"));
}

export function formatEventDate(date: Date): { date: string; time: string } {
  return {
    date: date.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
