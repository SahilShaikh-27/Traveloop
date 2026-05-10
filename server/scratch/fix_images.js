const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixImagePaths() {
  const trips = await prisma.trip.findMany({
    where: {
      coverImage: {
        startsWith: 'http'
      }
    }
  });

  console.log(`Found ${trips.length} trips with absolute URLs.`);

  for (const trip of trips) {
    if (trip.coverImage.includes('/uploads/')) {
      const relativePath = '/uploads/' + trip.coverImage.split('/uploads/')[1];
      await prisma.trip.update({
        where: { id: trip.id },
        data: { coverImage: relativePath }
      });
      console.log(`Updated trip ${trip.id} to ${relativePath}`);
    }
  }

  const users = await prisma.user.findMany({
    where: {
      avatar: {
        startsWith: 'http'
      }
    }
  });

  console.log(`Found ${users.length} users with absolute URLs.`);

  for (const user of users) {
    if (user.avatar.includes('/uploads/')) {
      const relativePath = '/uploads/' + user.avatar.split('/uploads/')[1];
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: relativePath }
      });
      console.log(`Updated user ${user.id} to ${relativePath}`);
    }
  }

  await prisma.$disconnect();
}

fixImagePaths();
