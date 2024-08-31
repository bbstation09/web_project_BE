// import { PrismaClient } from '@prisma/client';
// import { differenceInDays, eachDayOfInterval, isSameDay } from 'date-fns';

// const prisma = new PrismaClient();

// // 그룹의 배지 조건을 확인하여 부여할 배지 ID를 반환하는 함수
// export const getBadgeIdsForGroup = async (group) => {
//     const badgeIds = [];

//     // 1. 7일 연속 게시물 작성 배지 조건 확인
//     const last7DaysPosts = group.posts.filter(post => 
//         differenceInDays(new Date(), post.createdAt) < 7
//     );
//     const last7Days = eachDayOfInterval({
//         start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
//         end: new Date()
//     });
//     const hasConsecutive7DaysPosts = last7Days.every(day =>
//         last7DaysPosts.some(post => isSameDay(day, post.createdAt))
//     );

//     if (hasConsecutive7DaysPosts) {
//         badgeIds.push(1); // 7일 연속 게시물 작성 배지
//     }

//     // 2. 게시물 수 20개 이상 작성 배지 조건 확인
//     if (group.posts.length >= 20) {
//         badgeIds.push(2); // 게시물 수 20개 이상 작성 배지
//     }

//     // 3. 그룹 생성 후 1년 경과 배지 조건 확인
//     const isOneYearOld = differenceInDays(new Date(), group.createdAt) >= 365;
//     if (isOneYearOld) {
//         badgeIds.push(3); // 그룹 생성 후 1년 경과 배지
//     }

//     // 4. 10,000개 이상의 그룹 좋아요 수 배지 조건 확인
//     if (group.likeCount >= 10000) {
//         badgeIds.push(4); // 10,000개 이상의 그룹 좋아요 수 배지
//     }

//     // 5. 게시물 하나의 좋아요 수가 10,000개 이상 배지 조건 확인
//     const hasPopularPost = group.posts.some(post => post.likeCount >= 10000);
//     if (hasPopularPost) {
//         badgeIds.push(5); // 게시물 좋아요 수 10,000개 이상 배지
//     }

//     return badgeIds;
// };

// // 그룹에 배지를 부여하는 함수
// export const grantBadgeToGroup = async (groupId, badgeIds) => {
//     if (badgeIds.length === 0) return;

//     // 기존에 부여된 배지와 중복되지 않도록 필터링
//     const existingBadges = await prisma.groupBadge.findMany({
//         where: { groupId },
//         select: { badgeId: true }
//     });

//     const existingBadgeIds = new Set(existingBadges.map(b => b.badgeId));
//     const newBadgeIds = badgeIds.filter(id => !existingBadgeIds.has(id));

//     if (newBadgeIds.length > 0) {
//         // 새로운 배지 데이터 생성
//         await prisma.groupBadge.createMany({
//             data: newBadgeIds.map(id => ({ groupId, badgeId: id })),
//             skipDuplicates: true
//         });
//     }
// };



import { PrismaClient } from '@prisma/client';
import { differenceInDays, eachDayOfInterval, isSameDay } from 'date-fns';

const prisma = new PrismaClient();

// 그룹의 배지 조건을 확인하여 부여할 배지 ID를 반환하는 함수
export const getBadgeIdsForGroup = async (group) => {
  const badgeIds = [];

  // 1. 7일 연속 게시물 작성 배지 조건 확인
  const last7DaysPosts = group.posts.filter(post => 
    differenceInDays(new Date(), post.createdAt) < 7
  );
  const last7Days = eachDayOfInterval({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const hasConsecutive7DaysPosts = last7Days.every(day =>
    last7DaysPosts.some(post => isSameDay(day, post.createdAt))
  );

  if (hasConsecutive7DaysPosts) {
    badgeIds.push(1); // 7일 연속 게시물 작성 배지
  }

  // 2. 게시물 수 20개 이상 작성 배지 조건 확인
  if (group.posts.length >= 20) {
    badgeIds.push(2); // 게시물 수 20개 이상 작성 배지
  }

  // 3. 그룹 생성 후 1년 경과 배지 조건 확인
  const isOneYearOld = differenceInDays(new Date(), group.createdAt) >= 365;
  if (isOneYearOld) {
    badgeIds.push(3); // 그룹 생성 후 1년 경과 배지
  }

  // 4. 10,000개 이상의 그룹 좋아요 수 배지 조건 확인
  if (group.likeCount >= 10000) {
    badgeIds.push(4); // 10,000개 이상의 그룹 좋아요 수 배지
  }

  // 5. 게시물 하나의 좋아요 수가 10,000개 이상 배지 조건 확인
  const hasPopularPost = group.posts.some(post => post.likeCount >= 10000);
  if (hasPopularPost) {
    badgeIds.push(5); // 게시물 좋아요 수 10,000개 이상 배지
  }

  return badgeIds;
};

// 그룹에 배지를 부여하는 함수
export const grantBadgeToGroup = async (groupId, badgeIds) => {
  if (badgeIds.length === 0) return;

  // 기존에 부여된 배지와 중복되지 않도록 필터링
  const existingBadges = await prisma.groupBadge.findMany({
    where: { groupId },
    select: { badgeId: true }
  });

  const existingBadgeIds = new Set(existingBadges.map(b => b.badgeId));
  const newBadgeIds = badgeIds.filter(id => !existingBadgeIds.has(id));

  if (newBadgeIds.length > 0) {
    // 모든 배지 ID가 배지 테이블에 존재하는지 확인
    const validBadgeIds = await prisma.badge.findMany({
      where: {
        id: { in: newBadgeIds }
      },
      select: { id: true }
    }).then(badges => badges.map(b => b.id));

    // 유효한 배지 ID에 대해서만 그룹 배지 생성
    const badgeDataToInsert = newBadgeIds
      .filter(id => validBadgeIds.includes(id))
      .map(id => ({ groupId, badgeId: id }));

    if (badgeDataToInsert.length > 0) {
      await prisma.groupBadge.createMany({
        data: badgeDataToInsert,
        skipDuplicates: true
      });
    }
  }
};

