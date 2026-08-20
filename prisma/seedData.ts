import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

const cabModels = [
  { name: "SEDAN", description: "Dzire, Etios or equivalent", capacity: "4+1 Seater" },
  { name: "ERTIGA", description: "Spacious MPV", capacity: "6+1 Seater" },
  { name: "INNOVA", description: "Premium comfort standard", capacity: "7+1 Seater" },
  { name: "INNOVA CRYSTA", description: "Luxury executive MPV", capacity: "7+1 Seater" }
];

const routes = [
  { fromLocation: "Surat", toLocation: "Mumbai", isSpecial: false },
  { fromLocation: "Mumbai", toLocation: "Surat", isSpecial: false },
  { fromLocation: "Surat", toLocation: "Ahmedabad", isSpecial: false },
  { fromLocation: "Ahmedabad", toLocation: "Surat", isSpecial: false },
  { fromLocation: "Ahmedabad", toLocation: "Surat ⇄ Mumbai", isSpecial: true }
];

const services = [
  { serviceName: "One way cab services", isActive: true },
  { serviceName: "Local city rentals", isActive: true },
  { serviceName: "Round trip bookings", isActive: true },
  { serviceName: "Airport pick & drop transport", isActive: true },
  { serviceName: "Outstation journeys", isActive: true },
  { serviceName: "Marriage & event airport service", isActive: true },
  { serviceName: "Corporate transport booking", isActive: true }
];

async function main() {
  console.log('Seeding CabModels...');
  for (const model of cabModels) {
    await prisma.cabModel.upsert({
      where: { name: model.name },
      update: {},
      create: model,
    });
  }

  console.log('Seeding Routes...');
  for (const route of routes) {
    // There is no unique constraint on Route, we can just create if it doesn't exist to avoid duplicates
    const existing = await prisma.route.findFirst({
      where: {
        fromLocation: route.fromLocation,
        toLocation: route.toLocation,
        isSpecial: route.isSpecial
      }
    });
    if (!existing) {
      await prisma.route.create({
        data: route,
      });
    }
  }

  console.log('Seeding Services...');
  for (const service of services) {
    await prisma.service.upsert({
      where: { serviceName: service.serviceName },
      update: {},
      create: service,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
