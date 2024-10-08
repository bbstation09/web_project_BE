import { PrismaClient } from '@prisma/client';
import { GROUPS, POSTS, COMMENTS } from './mock.js';

const prisma = new PrismaClient();

// Badge types
const badges = [
  { id: 1, name: "7일 연속 게시글 등록" },
  { id: 2, name: "게시글 수 20개 이상 등록" },
  { id: 3, name: "그룹 생성 후 1년 달성" },
  { id: 4, name: "그룹 공감 1만 개 이상 받기" },
  { id: 5, name: "게시글 공감 1만 개 이상 받기" }
];

async function main() {
  // Delete existing data
  await prisma.groupBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.group.deleteMany();

  // Seed data
  await prisma.group.createMany({
    data: GROUPS,
    skipDuplicates: true,
  });

  await Promise.all(
    POSTS.map(async (post) => {
      await prisma.post.create({ data: post });
    })
  );

  await Promise.all(
    COMMENTS.map(async (comment) => {
      await prisma.comment.create({ data: comment });
    })
  );

  await prisma.badge.createMany({
    data: badges,
    skipDuplicates: true,
  });

  // Adjust sequences for each table
  await prisma.$executeRaw`
    SELECT setval(pg_get_serial_sequence('"Group"', 'id'), COALESCE(MAX(id), 1), false) FROM "Group";
  `;
  
  await prisma.$executeRaw`
    SELECT setval(pg_get_serial_sequence('"Post"', 'id'), COALESCE(MAX(id), 1), false) FROM "Post";
  `;
  
  await prisma.$executeRaw`
    SELECT setval(pg_get_serial_sequence('"Comment"', 'id'), COALESCE(MAX(id), 1), false) FROM "Comment";
  `;
  
  await prisma.$executeRaw`
    SELECT setval(pg_get_serial_sequence('"Badge"', 'id'), COALESCE(MAX(id), 1), false) FROM "Badge";
  `;
  
  await prisma.$executeRaw`
    SELECT setval(pg_get_serial_sequence('"GroupBadge"', 'id'), COALESCE(MAX(id), 1), false) FROM "GroupBadge";
  `;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
