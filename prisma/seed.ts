import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.event.findFirst({
    where: { title: "Weekly Run Club Meetup" },
  });

  if (!existing) {
    const nextSaturday = new Date();
    nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7 || 7));
    nextSaturday.setHours(8, 0, 0, 0);

    await prisma.event.create({
      data: {
        title: "Weekly Run Club Meetup",
        dateTime: nextSaturday,
        locationName: "Piazza Vittorio Emanuele II, Giovinazzo",
        priceAmount: 5.0,
        currency: "EUR",
      },
    });

    console.log("Seeded default event: Weekly Run Club Meetup");
  } else {
    console.log("Default event already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
