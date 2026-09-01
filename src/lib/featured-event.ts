import { prisma } from "@/lib/db";
import { FEATURED_EVENT } from "@/lib/constants";

export async function ensureFeaturedEvent() {
  const dateTime = new Date(FEATURED_EVENT.dateTimeIso);

  await prisma.event.upsert({
    where: { id: FEATURED_EVENT.id },
    create: {
      id: FEATURED_EVENT.id,
      title: FEATURED_EVENT.title,
      description: FEATURED_EVENT.description,
      dateTime,
      locationName: FEATURED_EVENT.locationName,
      priceAmount: FEATURED_EVENT.priceAmount,
      currency: FEATURED_EVENT.currency,
    },
    update: {
      title: FEATURED_EVENT.title,
      description: FEATURED_EVENT.description,
      dateTime,
      locationName: FEATURED_EVENT.locationName,
      priceAmount: FEATURED_EVENT.priceAmount,
      currency: FEATURED_EVENT.currency,
    },
  });
}
