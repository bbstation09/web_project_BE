import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function adjustSequences() {
  // Adjust sequence for Group table
  await prisma.$executeRaw`
    SELECT setval(pg_get_serial_sequence('"Group"', 'id'), COALESCE(MAX(id), 1), false) FROM "Group";
  `;
  
  // Adjust sequence for Post table
  await prisma.$executeRaw`
    SELECT setval(pg_get_serial_sequence('"Post"', 'id'), COALESCE(MAX(id), 1), false) FROM "Post";
  `;
  
  // Adjust sequence for Comment table
  await prisma.$executeRaw`
    SELECT setval(pg_get_serial_sequence('"Comment"', 'id'), COALESCE(MAX(id), 1), false) FROM "Comment";
  `;
}

adjustSequences()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
