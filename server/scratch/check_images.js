const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTrips() {
  const trips = await prisma.trip.findMany({
    take: 5,
    select: { title: true, coverImage: true }
  });
  console.log('Trips:', JSON.stringify(trips, null, 2));
  
  const users = await prisma.user.findMany({
    take: 5,
    select: { name: true, avatar: true }
  });
  console.log('Users:', JSON.stringify(users, null, 2));

  await prisma.$disconnect();
}

checkTrips();
