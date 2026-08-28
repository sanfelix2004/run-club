import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_EVENT_TITLE = "Meetup settimanale Run Club";

async function main() {
  const existing = await prisma.event.findFirst({
    where: { title: DEFAULT_EVENT_TITLE },
  });

  if (!existing) {
    const nextSaturday = new Date();
    nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7 || 7));
    nextSaturday.setHours(8, 0, 0, 0);

    await prisma.event.create({
      data: {
        title: DEFAULT_EVENT_TITLE,
        description: "Corsa di gruppo sul lungomare, tutti i livelli benvenuti.",
        dateTime: nextSaturday,
        locationName: "Piazza Vittorio Emanuele II, Giovinazzo",
        priceAmount: 5.0,
        currency: "EUR",
      },
    });

    console.log(`Evento di default creato: ${DEFAULT_EVENT_TITLE}`);
  } else {
    console.log("L'evento di default esiste già");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
