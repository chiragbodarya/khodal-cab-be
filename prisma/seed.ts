import prisma from '../src/config/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Seeding database with dummy data...');

  // 1. Create Admin
  const adminEmail = 'dev.test@gmail.com';
  let admin = await prisma.admin.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    const hashedPassword = await bcrypt.hash('Qwer@123', 10);
    admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Dev Test Admin'
      }
    });
    console.log(`Created admin: ${adminEmail}`);
  } else {
    // Update password just to be sure
    const hashedPassword = await bcrypt.hash('Qwer@123', 10);
    admin = await prisma.admin.update({
      where: { email: adminEmail },
      data: { password: hashedPassword, name: 'Dev Test Admin' }
    });
    console.log(`Updated admin: ${adminEmail}`);
  }

  // 2. Create Vehicle
  const vehicle = await prisma.vehicle.create({
    data: {
      name: 'Toyota Innova Crysta',
      category: 'SUV',
      seatCapacity: 7,
      pricePerKm: 15,
      features: ['AC', 'Music System', 'Pushback Seats'],
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      isActive: true
    }
  });
  console.log('Created dummy vehicle');

  // 3. Create Tour Plan
  await prisma.tourPlan.create({
    data: {
      packageName: 'Golden Triangle Tour',
      packageDescription: 'Experience the rich heritage of India with our Golden Triangle Tour covering Delhi, Agra, and Jaipur.',
      days: 5,
      nights: 4,
      tripRoute: 'Delhi -> Agra -> Jaipur -> Delhi',
      highlights: ['Taj Mahal Visit', 'Amber Fort', 'India Gate'],
      pricePerPerson: 15000,
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      isActive: true
    }
  });
  console.log('Created dummy tour plan');

  // 4. Create Cab Plan
  await prisma.cabPlan.create({
    data: {
      packageName: 'Delhi to Manali Drop',
      packageDescription: 'Comfortable overnight journey from Delhi to Manali in a premium SUV.',
      days: 2,
      nights: 1,
      tripRoute: 'Delhi -> Chandigarh -> Manali',
      highlights: ['Night Travel', 'Comfortable Seats', 'Experienced Driver'],
      pricePerPerson: 8000,
      withDriver: true,
      driverFoodIncluded: true,
      image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80',
      vehicleId: vehicle.id,
      isActive: true
    }
  });
  console.log('Created dummy cab plan');

  // 5. Create Blog
  await prisma.blog.create({
    data: {
      title: 'Top 10 Places to Visit in Rajasthan',
      slug: 'top-10-places-to-visit-in-rajasthan',
      content: 'Rajasthan, the Land of Kings, is synonymous with heroism, royalty and honour. Here are the top 10 places you must visit... (dummy content)',
      adminId: admin.id,
      tags: ['Rajasthan', 'Travel', 'Heritage'],
      published: true,
      coverImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80'
    }
  });
  console.log('Created dummy blog');

  // 6. Create Gallery
  await prisma.gallery.createMany({
    data: [
      {
        title: 'Taj Mahal at Sunrise',
        imageUrl: 'https://images.unsplash.com/photo-1564507592209-45579d501d51?auto=format&fit=crop&w=800&q=80',
        category: 'monuments'
      },
      {
        title: 'Manali Snow Mountains',
        imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
        category: 'nature'
      }
    ]
  });
  console.log('Created dummy gallery items');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
