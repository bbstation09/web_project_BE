import { PrismaClient } from '@prisma/client';
import {
  GROUPS,
  POSTS,
  // BADGES,
  COMMENTS,
  GROUPBADGES,
  // GROUPLIKES,
  // POSTLIKES
} from './mock.js';

const prisma = new PrismaClient();


// 뱃지의 종류
const badges = [
  { name: "7일 연속 게시글 등록" },
  { name: "게시글 수 20개 이상 등록" },
  { name: "그룹 생성 후 1년 달성" },
  { name: "그룹 공감 1만 개 이상 받기" },
  { name: "게시글 공감 1만 개 이상 받기" }
];


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
  // await prisma.badge.createMany({
  //   data: BADGES,
  //   skipDuplicates: true,
  // });


  // 뱃지 데이터 시딩 : 뱃지 데이터가 데이터베이스에 있는지 확인하고 없으면 추가
  // 뱃지 중복 생성 없이 뱃지 데이터를 데이터베이스에 추가 가능
  await Promise.all(
    badges.map(async (badge) => {
      await prisma.badge.upsert({
        where: { name: badge.name },
        update: {},
        create: badge,
      });
    })
  );


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
