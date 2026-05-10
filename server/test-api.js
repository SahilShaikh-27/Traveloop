const http = require('http');

const data = JSON.stringify({ planningStyle: 'balanced' });

// We need a valid trip ID. Let's find one by querying the db directly.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const trips = await prisma.trip.findMany();
  if (trips.length === 0) return console.log("No trips in DB.");
  const id = trips[0].id;
  
  // Wait, the API requires Authentication! 
  // We can't hit it easily without a token. Let's just bypass it or test by reading the console.
  console.log("Found trip id:", id);
}
test();
