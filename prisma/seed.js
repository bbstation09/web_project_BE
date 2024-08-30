import { PrismaClient } from '@prisma/client';
import {
  GROUPS,
  POSTS,
  BADGES,
  COMMENTS,
  GROUPBADGES,
  // GROUPLIKES,
  // POSTLIKES
} from './mock.js';

const prisma = new PrismaClient();

async function main() {

  // 기존 데이터 삭제
  await prisma.comment.deleteMany();
  // await prisma.postLike.deleteMany();
  // await prisma.groupLike.deleteMany();
  await prisma.groupBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.post.deleteMany();
  await prisma.group.deleteMany();

  // 그룹 데이터 시딩
  await prisma.group.createMany({
    data: GROUPS,
    skipDuplicates: true,
  });

  // 추억(게시물) 데이터 시딩
  await Promise.all(
    POSTS.map(async (post) => {
      await prisma.post.create({ data: post });
    })
  );

  // 뱃지 데이터 시딩
  await prisma.badge.createMany({
    data: BADGES,
    skipDuplicates: true,
  });

  // 댓글 데이터 시딩
  await Promise.all(
    COMMENTS.map(async (comment) => {
      await prisma.comment.create({ data: comment });
    })
  );

  // 그룹 뱃지 연결 시딩
  await prisma.groupBadge.createMany({
    data: GROUPBADGES,
    skipDuplicates: true,
  });

  // // 그룹 좋아요 시딩
  // await prisma.groupLike.createMany({
  //   data: GROUPLIKES,
  //   skipDuplicates: true,
  // });

  // // 추억(게시물) 좋아요 시딩
  // await prisma.postLike.createMany({
  //   data: POSTLIKES,
  //   skipDuplicates: true,
  // });
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
