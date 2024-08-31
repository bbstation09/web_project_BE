import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 모든 배지 가져오기
export const getAllBadges = async () => {
  try {
    return await prisma.badge.findMany();
  } catch (error) {
    console.error('배지 가져오기 실패:', error);
    throw error;
  }
};

// 그룹에 배지 부여
export const grantBadgeToGroup = async (groupId, badgeIds) => {
  try {
    const existingBadges = await prisma.groupBadge.findMany({
      where: { groupId },
      select: { badgeId: true },
    });

    const existingBadgeIds = existingBadges.map(b => b.badgeId);
    const newBadgeIds = badgeIds.filter(id => !existingBadgeIds.includes(id));

    // Check if the badges and group exist before creating new records
    const [group, badges] = await Promise.all([
      prisma.group.findUnique({ where: { id: groupId } }),
      prisma.badge.findMany({ where: { id: { in: newBadgeIds } } })
    ]);

    if (!group) throw new Error('Group not found');
    if (newBadgeIds.length > 0 && badges.length !== newBadgeIds.length) {
      throw new Error('One or more badges do not exist');
    }

    if (newBadgeIds.length > 0) {
      await prisma.groupBadge.createMany({
        data: newBadgeIds.map(badgeId => ({
          groupId,
          badgeId,
        })),
        skipDuplicates: true,
      });
      console.log(`그룹 ${groupId}에 배지 ${newBadgeIds} 부여 완료.`);
    }
  } catch (error) {
    console.error('배지 부여 실패:', error);
    throw error;
  }
};

// 특정 그룹에 대해 조건을 만족하는 배지 ID 목록 반환
export const getBadgeIdsForGroup = async (group) => {
  const badgeIds = [];
  const { createdAt, posts, likeCount } = group;

  // 7일 연속 게시물 작성
  const last7DaysPosts = posts.filter(post => (new Date() - new Date(post.createdAt)) / (1000 * 60 * 60 * 24) < 7);
  const uniqueDays = new Set(last7DaysPosts.map(post => post.createdAt.toISOString().split('T')[0]));
  if (uniqueDays.size >= 7) badgeIds.push(1);

  // 게시물 수 20개 이상
  if (posts.length >= 20) badgeIds.push(2);

  // 그룹 생성 후 1년 경과
  if ((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24 * 365) >= 1) badgeIds.push(3);

  // 10,000개 이상의 그룹 좋아요
  if (likeCount >= 10000) badgeIds.push(4);

  // 10,000개 이상의 게시물 좋아요
  const hasPopularPost = posts.some(post => post.likeCount >= 10000);
  if (hasPopularPost) badgeIds.push(5);

  return badgeIds;
};