// import { PrismaClient } from '@prisma/client'; // Prisma 클라이언트 가져오기
// import { differenceInDays, eachDayOfInterval, isSameDay } from 'date-fns'; // 날짜 유틸리티 함수 가져오기

// const prisma = new PrismaClient(); // PrismaClient 인스턴스 생성

// // 그룹의 배지를 자동으로 확인하고 부여하는 함수
// export const checkAndAwardBadges = async (groupId) => {
//     try {
//         // ID로 그룹을 찾아서, 해당 그룹의 게시물 및 기존 배지를 포함하여 조회
//         const group = await prisma.group.findUnique({
//             where: { id: groupId },
//             include: {
//                 posts: true,
//                 groupBadges: true,
//             },
//         });

//         if (!group) {
//             console.log('그룹을 찾을 수 없습니다.');
//             return;
//         }

//         const { createdAt, posts, groupBadges, likeCount } = group; // 그룹 세부 사항 구조 분해 할당

//         const newBadges = []; // 새로운 배지를 저장할 배열

//         // 1. 7일 연속 게시물 작성 뱃지
//         const last7DaysPosts = posts.filter(post => differenceInDays(new Date(), post.createdAt) < 7);
//         const last7Days = eachDayOfInterval({ start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() });

//         const hasConsecutive7DaysPosts = last7Days.every(day =>
//             last7DaysPosts.some(post => isSameDay(day, post.createdAt))
//         );

//         if (hasConsecutive7DaysPosts && !groupBadges.some(badge => badge.badgeId === 1)) {
//             newBadges.push(1);
//         }

//         // 2. "20개 이상의 게시물 작성" 배지
//         if (posts.length >= 20 && !groupBadges.some(badge => badge.badgeId === 2)) {
//             newBadges.push(2);
//         }

//         // 3. "그룹 생성 후 1년 경과" 배지
//         const isOneYearOld = differenceInDays(new Date(), createdAt) >= 365;

//         if (isOneYearOld && !groupBadges.some(badge => badge.badgeId === 3)) {
//             newBadges.push(3);
//         }

//         // 4. "10,000개 이상의 그룹 좋아요 수" 배지
//         if (likeCount >= 10000 && !groupBadges.some(badge => badge.badgeId === 4)) {
//             newBadges.push(4);
//         }

//         // 5. "게시물 하나의 좋아요 수가 10,000개 이상" 배지
//         const hasPopularPost = posts.some(post => post.likeCount >= 10000);

//         if (hasPopularPost && !groupBadges.some(badge => badge.badgeId === 5)) {
//             newBadges.push(5);
//         }

//         // 새로운 배지가 있을 경우, 데이터베이스에 저장하고 그룹의 배지 개수를 업데이트
//         if (newBadges.length > 0) {
//             await prisma.groupBadge.createMany({
//                 data: newBadges.map(badgeId => ({
//                     groupId: group.id,
//                     badgeId,
//                 })),
//             });

//             await prisma.group.update({
//                 where: { id: group.id },
//                 data: { badgeCount: group.badgeCount + newBadges.length },
//             });

//             console.log('새로운 배지를 부여했습니다:', newBadges);
//         } else {
//             // console.log('새로 부여할 배지가 없습니다.');
//         }
//     } catch (error) {
//         console.error('배지 부여 과정에서 오류 발생:', error);
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
        // 새로운 배지 데이터 생성
        await prisma.groupBadge.createMany({
            data: newBadgeIds.map(id => ({ groupId, badgeId: id })),
            skipDuplicates: true
        });
    }
};

