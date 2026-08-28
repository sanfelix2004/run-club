import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateTicketPdf, formatEventDate } from "@/lib/pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const registration = await prisma.registration.findUnique({
    where: { qrToken: token },
    include: { event: true },
  });

  if (!registration) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const { date, time } = formatEventDate(registration.event.dateTime);

  const pdfBytes = await generateTicketPdf({
    eventTitle: registration.event.title,
    eventDate: date,
    eventTime: time,
    locationName: registration.event.locationName,
    firstName: registration.firstName,
    lastName: registration.lastName,
    paceCategory: registration.paceCategory,
    qrToken: registration.qrToken,
    priceAmount: registration.event.priceAmount,
    currency: registration.event.currency,
  });

  const filename = `pass-${registration.firstName}-${registration.lastName}.pdf`.toLowerCase();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
