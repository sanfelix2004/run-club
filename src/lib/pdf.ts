import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { buildQrPayload } from "@/lib/qr";

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
    color: { dark: "#064E3B", light: "#FFFFFF" },
  });

  doc.setFillColor(6, 78, 59);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("RUN CLUB GIOVINAZZO", margin, 10);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(data.eventTitle.toUpperCase(), margin, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("PRENOTAZIONE CONFERMATA", margin, 24);

  let y = 36;
  doc.setTextColor(6, 78, 59);
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
  doc.setTextColor(6, 78, 59);
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
  const qrY = 34;
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text("QR valido come prenotazione per questo evento", qrX + qrSize / 2, qrY + qrSize + 4, {
    align: "center",
  });

  y += 14;
  doc.setFillColor(16, 185, 129);
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
  doc.setTextColor(6, 78, 59);
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
    "• Partecipi sotto la tua responsabilità. Consulta un medico prima di correre se hai dubbi sulla salute.",
    "• In caso di emergenza, il contatto indicato in registrazione verrà avvisato.",
  ];
  disclaimer.forEach((line) => {
    doc.text(line, margin, y);
    y += 4;
  });

  doc.setFontSize(6);
  doc.setTextColor(160, 160, 160);
  doc.text(`Codice: ${data.qrToken.slice(0, 8).toUpperCase()}`, margin, doc.internal.pageSize.getHeight() - 6);

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
