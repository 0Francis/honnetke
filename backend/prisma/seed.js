const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash passwords
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Admin (already created per notes, but seed for consistency)
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@honnetke.com' },
    update: {},
    create: {
      fullName: 'System Admin',
      email: 'admin@honnetke.com',
      passwordHash,
      phoneNumber: '+254700000000',
      status: 'active',
    },
  });

  // Students
  const student1 = await prisma.student.upsert({
    where: { email: 'jane@student.com' },
    update: {},
    create: {
      fullName: 'Jane Doe',
      email: 'jane@student.com',
      passwordHash,
      phoneNumber: '+254711111111',
      status: 'active',
    },
  });

  const student2 = await prisma.student.upsert({
    where: { email: 'john@student.com' },
    update: {},
    create: {
      fullName: 'John Kamau',
      email: 'john@student.com',
      passwordHash,
      phoneNumber: '+254722222222',
      status: 'active',
    },
  });

  // Landlords
  const landlord1 = await prisma.landlord.upsert({
    where: { email: 'mwangi@landlord.com' },
    update: {},
    create: {
      fullName: 'Peter Mwangi',
      email: 'mwangi@landlord.com',
      passwordHash,
      phoneNumber: '+254733333333',
      status: 'active',
    },
  });

  const landlord2 = await prisma.landlord.upsert({
    where: { email: 'akinyi@landlord.com' },
    update: {},
    create: {
      fullName: 'Mary Akinyi',
      email: 'akinyi@landlord.com',
      passwordHash,
      phoneNumber: '+254744444444',
      status: 'active',
    },
  });

  // Agents
  const agent1 = await prisma.agent.upsert({
    where: { email: 'otieno@agent.com' },
    update: {},
    create: {
      fullName: 'James Otieno',
      email: 'otieno@agent.com',
      passwordHash,
      phoneNumber: '+254755555555',
      status: 'active',
    },
  });

  // Listings
  const listing1 = await prisma.listing.create({
    data: {
      landlordId: landlord1.landlordId,
      title: 'Sunny Bedsitter near USIU',
      description: 'Modern bedsitter with natural light, WiFi, and water included.',
      propertyType: 'bedsitter',
      price: 8000,
      genderPreference: 'mixed',
      roomType: 'single',
      amenities: ['WiFi', 'Water', 'Security'],
      county: 'Nairobi',
      area: 'Ruaka',
      nearestCampus: 'USIU',
      address: 'Ruaka Plaza, House 12',
      status: 'active',
      approvedBy: admin.adminId,
      approvedAt: new Date(),
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      landlordId: landlord1.landlordId,
      title: 'Spacious 1-Bedroom in Kasarani',
      description: 'Large 1-bedroom with separate kitchen and balcony.',
      propertyType: '1-bedroom',
      price: 15000,
      genderPreference: 'female',
      roomType: 'ensuite',
      amenities: ['WiFi', 'Water', 'Parking', 'Security'],
      county: 'Nairobi',
      area: 'Kasarani',
      nearestCampus: 'KU',
      address: 'Kasarani Gardens, Apt 4B',
      status: 'active',
      approvedBy: admin.adminId,
      approvedAt: new Date(),
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      landlordId: landlord2.landlordId,
      title: 'Cozy Shared Room near Daystar',
      description: 'Shared room with 2 beds, perfect for students on a budget.',
      propertyType: 'hostel',
      price: 4500,
      genderPreference: 'male',
      roomType: 'shared',
      amenities: ['WiFi', 'Water', 'Security'],
      county: 'Nairobi',
      area: 'Athi River',
      nearestCampus: 'Daystar',
      address: 'Athi River Hostels, Block C',
      status: 'active',
      approvedBy: admin.adminId,
      approvedAt: new Date(),
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
      agentId: agent1.agentId,
      title: 'Luxury Studio near Strathmore',
      description: 'Premium studio with modern finishes and gym access.',
      propertyType: 'studio',
      price: 25000,
      genderPreference: 'mixed',
      roomType: 'ensuite',
      amenities: ['WiFi', 'Water', 'Gym', 'Parking', 'Security', 'Laundry'],
      county: 'Nairobi',
      area: 'Madaraka',
      nearestCampus: 'Strathmore',
      address: 'Madaraka Estate, Suite 5',
      status: 'pending',
    },
  });

  // Listing Images
  await prisma.listingImage.createMany({
    data: [
      { listingId: listing1.listingId, imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/listing1-1.jpg', isPrimary: true },
      { listingId: listing1.listingId, imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/listing1-2.jpg', isPrimary: false },
      { listingId: listing2.listingId, imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/listing2-1.jpg', isPrimary: true },
      { listingId: listing3.listingId, imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/listing3-1.jpg', isPrimary: true },
      { listingId: listing4.listingId, imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/listing4-1.jpg', isPrimary: true },
    ],
  });

  // Favourites
  await prisma.favourite.create({
    data: {
      studentId: student1.studentId,
      listingId: listing1.listingId,
    },
  });

  await prisma.favourite.create({
    data: {
      studentId: student1.studentId,
      listingId: listing2.listingId,
    },
  });

  // Bookings
  const booking1 = await prisma.booking.create({
    data: {
      studentId: student1.studentId,
      listingId: listing1.listingId,
      status: 'pending',
      requestNote: 'I need the room by 1st of next month.',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      studentId: student2.studentId,
      listingId: listing3.listingId,
      status: 'confirmed',
      requestNote: 'Can I view the room this weekend?',
      providerResponse: 'Yes, you can visit on Saturday at 10am.',
    },
  });

  // Reports
  await prisma.report.create({
    data: {
      studentId: student2.studentId,
      listingId: listing4.listingId,
      reason: 'Listing images do not match the actual property. The photos are stolen from another site.',
      status: 'pending',
    },
  });

  // Warnings
  await prisma.warning.create({
    data: {
      issuedBy: admin.adminId,
      studentId: student2.studentId,
      reason: 'Abusive language in booking request.',
    },
  });

  // Notifications
  await prisma.notification.create({
    data: {
      studentId: student1.studentId,
      bookingId: booking1.bookingId,
      message: 'Your booking request for "Sunny Bedsitter near USIU" is pending.',
      type: 'booking_update',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      landlordId: landlord1.landlordId,
      bookingId: booking1.bookingId,
      message: 'New booking request from Jane Doe.',
      type: 'booking_update',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      adminId: admin.adminId,
      message: 'New listing submitted for review: "Luxury Studio near Strathmore".',
      type: 'listing_review',
      isRead: false,
    },
  });

  // Analytics (weekly view counts)
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  await prisma.analytics.create({
    data: {
      listingId: listing1.listingId,
      weekStart: weekAgo,
      viewCount: 45,
    },
  });

  await prisma.analytics.create({
    data: {
      listingId: listing2.listingId,
      weekStart: weekAgo,
      viewCount: 32,
    },
  });

  // Traffic Logs (daily visits)
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setUTCHours(0, 0, 0, 0);

    await prisma.trafficLog.upsert({
      where: { date },
      update: {},
      create: {
        date,
        visitCount: Math.floor(Math.random() * 200) + 50,
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
