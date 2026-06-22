const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean existing data
  await prisma.adminRefreshToken.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.travelPlan.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log('Existing data cleaned.');

  // 2. Create Admin
  const adminEmail = 'admin@travelcompany.com';
  const adminPassword = 'adminpassword123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  const admin = await prisma.admin.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Super Admin'
    }
  });

  console.log(`Admin user created: ${admin.email}`);
  console.log(`Credentials: Email: ${adminEmail} | Password: ${adminPassword}`);

  // 3. Create Vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      name: 'Volvo Multi-Axle Luxury Sleeper (AC)',
      type: 'Bus',
      capacity: 30,
      features: ['AC', 'WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Reading Light'],
      licensePlate: 'DL-1PA-1234',
      images: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'ACTIVE'
    }
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      name: 'Scania Premium Multi-Axle Seater (AC)',
      type: 'Bus',
      capacity: 45,
      features: ['AC', 'Charging Point', 'Water Bottle', 'Pushback Seats'],
      licensePlate: 'MH-02CB-5678',
      images: [
        'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'ACTIVE'
    }
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      name: 'Force Traveller Deluxe',
      type: 'Mini Bus',
      capacity: 17,
      features: ['AC', 'Music System', 'Ample Luggage Space'],
      licensePlate: 'HR-55X-9012',
      images: [
        'https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'ACTIVE'
    }
  });

  console.log('Vehicles seeded.');

  // 4. Create Travel Plans
  await prisma.travelPlan.create({
    data: {
      title: 'Vibrant Manali Weekend Retreat',
      destination: 'Manali',
      origin: 'Delhi',
      description: 'Escape the heat of the plains and explore the snowy trails, Solang Valley, and mall road in Manali.',
      duration: '3 Days / 2 Nights',
      price: 2999.00,
      departureTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      itinerary: [
        { day: 1, title: 'Overnight Journey & Manali Arrival', details: 'Board the luxury Volvo bus from Delhi in the evening. Reach Manali next morning and check-in to the hotel. Spend the afternoon visiting local sights like Hadimba Temple and Mall Road.' },
        { day: 2, title: 'Solang Valley Adventure', details: 'Full-day excursion to Solang Valley for paragliding, zorbing, and beautiful panoramic mountain views. Return to hotel for bonfire and dinner.' },
        { day: 3, title: 'Jogini Waterfall Trek & Departure', details: 'Short trek to Jogini Waterfall in the morning. Visit the Vashisht hot springs. Board the evening bus back to Delhi.' }
      ],
      highlights: ['Luxury Volvo AC Sleeper journey', 'Excursion to Solang Valley', 'Bonfire and local music night', 'Guided Hadimba Temple tour'],
      images: [
        'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1596760411132-0544db4bc2bc?auto=format&fit=crop&w=800&q=80'
      ],
      vehicleId: vehicle1.id,
      status: 'ACTIVE'
    }
  });

  await prisma.travelPlan.create({
    data: {
      title: 'Golden beaches of Goa Road Trip',
      destination: 'Goa',
      origin: 'Mumbai',
      description: 'Experience the scenic Western Ghats route and unwind on the sandy beaches of North and South Goa.',
      duration: '4 Days / 3 Nights',
      price: 4999.00,
      departureTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      itinerary: [
        { day: 1, title: 'Goa Bound Journey & Resort Check-in', details: 'Depart from Mumbai. Arrive in Goa, check in at the beach resort. Relax by the pool or take a stroll on Calangute beach.' },
        { day: 2, title: 'North Goa Sightseeing & Water Sports', details: 'Explore Aguada Fort, Anjuna Beach, and Vagator Beach. Participate in optional water sports activities like parasailing.' },
        { day: 3, title: 'Heritage Churches of Old Goa & Spice Plantation Tour', details: 'Visit Basilica of Bom Jesus and Se Cathedral. Enjoy an authentic Goan lunch at a local spice plantation.' },
        { day: 4, title: 'Local Shopping & Return Journey', details: 'Spend the morning shopping at local flea markets. Return to Mumbai by premium sleeper bus.' }
      ],
      highlights: ['Comfortable Scania bus transport', 'Stay near the beach', 'Fort Aguada visit', 'Spice plantation tour with lunch'],
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'
      ],
      vehicleId: vehicle2.id,
      status: 'ACTIVE'
    }
  });

  console.log('Travel plans seeded.');

  // 5. Create Blogs
  await prisma.blog.create({
    data: {
      title: '10 Hidden Gems in Himachal Pradesh You Must Visit in 2026',
      slug: 'hidden-gems-himachal-pradesh-2026',
      content: '<p>Himachal Pradesh is home to some of the most spectacular mountain landscapes in the world. While places like Shimla and Manali attract millions of tourists, there are several pristine, offbeat destinations that offer tranquility away from the crowds.</p><h2>1. Jibhi</h2><p>Jibhi is a scenic hamlet in the Banjar Valley. With fresh pine forests, beautiful wooden cottages, and freshwater streams, Jibhi feels like a fairytale village.</p><h2>2. Bir Billing</h2><p>Known as the paragliding capital of India, Bir is a serene village with Tibetan monasteries and organic cafes. The landing site offers unforgettable sunset views.</p><h2>3. Kalpa</h2><p>Located in Kinnaur district, Kalpa offers dramatic views of the Kinner Kailash range. The apples grown here are considered among the best in the world.</p>',
      summary: 'Explore 10 pristine, offbeat travel destinations in Himachal Pradesh to escape the crowds in 2026. Discover Jibhi, Bir Billing, Kalpa, and more.',
      coverImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
      tags: ['Himachal Pradesh', 'Offbeat Travel', 'India Travel', 'Mountain Destinations'],
      published: true,
      publishedAt: new Date(),
      adminId: admin.id
    }
  });

  await prisma.blog.create({
    data: {
      title: 'The Ultimate Guide to Packing for a Long-Distance Bus Journey',
      slug: 'ultimate-packing-guide-long-distance-bus',
      content: '<p>Long-distance bus travel is affordable, convenient, and allows you to enjoy scenic landscapes. However, to ensure a comfortable trip, careful packing is essential. Here is your checklist for the ultimate road trip comfort.</p><h2>1. Comfort Essentials</h2><p>Always bring a neck pillow, a light blanket or shawl (as AC can get cold), and comfortable slip-on shoes.</p><h2>2. Entertainment & Tech</h2><p>Keep a fully charged power bank, noise-canceling headphones, and pre-downloaded movies or offline playlists.</p><h2>3. Hygiene & Snacks</h2><p>Pack hand sanitizer, wet wipes, a water bottle, and light, non-greasy snacks like nuts or energy bars.</p>',
      summary: 'Prepare for your next long-distance bus trip with our essential packing guide. Learn what comfort, tech, and hygiene items to pack for a smooth ride.',
      coverImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      tags: ['Travel Tips', 'Bus Travel', 'Packing Guide', 'Road Trips'],
      published: true,
      publishedAt: new Date(),
      adminId: admin.id
    }
  });

  console.log('Blogs seeded.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
