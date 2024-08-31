import { PrismaClient } from '@prisma/client';
// import { checkAndAwardBadges } from './badgeController.js'; // 배지 부여 기능 가져오기
import { getBadgeIdsForGroup, grantBadgeToGroup } from './badgeController.js';
const prisma = new PrismaClient();

// 그룹 등록
export const registerGroup = async (req, res) => {
    try {
        const { name, imageUrl, introduction, isPublic, password } = req.body;
        const newGroup = await prisma.group.create({
            data: {
                name,
                imageUrl,
                introduction,
                isPublic,
                password,
                createdAt: new Date(),
            },
        });
        res.status(201).json(newGroup);
    } catch (error) {
        res.status(400).json({ message: "잘못된 요청입니다", details: error.message });
    }
};


// 그룹 정보 수정
export const editGroup = async (req, res) => {
    try {
       // URL에서 groupId 추출 후 정수로 변환
      const groupId = parseInt(req.params.groupId, 10);

      if (isNaN(groupId)) return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다' });
        
      // 요청 본문에서 수정할 데이터 추출
      const { password, name, imageUrl, introduction, isPublic } = req.body;
  
      // groupId가 제공되지 않은 경우
      if (!groupId) {
        return res.status(400).json({ error: '그룹 ID가 필요합니다' });
      }
  
      // 그룹 ID로 그룹 찾기
      const group = await prisma.group.findUnique({ where: { id: groupId } });
  
      // 그룹이 존재하지 않는 경우
      if (!group) {
        return res.status(404).json({ error: '그룹을 찾을 수 없습니다' });
      }
  
      // 제공된 비밀번호 검증
      if (group.password !== password) {
        return res.status(403).json({ error: '잘못된 비밀번호입니다' });
      }
  
      // 그룹 정보를 업데이트
      const updatedGroup = await prisma.group.update({
        where: { id: groupId },
        data: { 
          name, 
          imageUrl, 
          introduction, 
          isPublic,
        },
      });
  
      // 업데이트된 그룹 정보 반환
      res.status(200).json({ message: '그룹이 성공적으로 수정되었습니다', group: updatedGroup });
    } catch (error) {
      // 예기치 않은 오류 처리
      res.status(500).json({ error: '그룹 수정 중 오류 발생', details: error.message });
    }
  };


// 그룹 삭제
export const deleteGroup = async (req, res) => {
    try {
       // URL에서 groupId 추출 후 정수로 변환
      const groupId = parseInt(req.params.groupId, 10);
      
      if (isNaN(groupId)) return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다' });

      // 요청 본문에서 비밀번호 추출
      const { password } = req.body;
  
      // groupId가 제공되지 않은 경우
      if (!groupId) {
        return res.status(400).json({ error: '그룹 ID가 필요합니다' });
      }
  
      // 그룹 ID로 그룹 찾기
      const group = await prisma.group.findUnique({ where: { id: groupId } });
  
      // 그룹이 존재하지 않는 경우
      if (!group) {
        return res.status(404).json({ error: '그룹을 찾을 수 없습니다' });
      }
  
      // 제공된 비밀번호 검증
      if (group.password !== password) {
        return res.status(403).json({ error: '잘못된 비밀번호입니다' });
      }
  
      // 그룹 삭제
      await prisma.group.delete({ where: { id: groupId } });
      res.status(200).json({ message: '그룹이 성공적으로 삭제되었습니다' });
    } catch (error) {
      // 예기치 않은 오류 처리
      res.status(500).json({ error: '그룹 삭제 중 오류 발생', details: error.message });
    }
  };



// // 그룹 목록 조회 : 원래 코드
// export const viewGroupList = async (req, res) => {
//     try {
//         // 기본 화면 : 최신 순으로 그룹 목록 출력
//         const { page = 1, pageSize = 20, sortBy = 'latest', keyword, isPublic } = req.query;

//         // 필터 객체 생성
//         const where = {};
//         if (isPublic) {
//             where.isPublic = isPublic === 'true'; // 'isPublic'을 boolean으로 변환
//         }
//         if (keyword) {
//             where.name = { contains: keyword, mode: 'insensitive' }; // 대소문자 구분 없는 검색
//         }

//         // 'sortBy' 매개변수에 따라 정렬 기준 설정
//         const orderBy =
//             sortBy === 'latest' ? { createdAt: 'desc' } :
//             sortBy === 'mostLiked' ? { likeCount: 'desc' } :
//             sortBy === 'mostPosted' ? { postCount: 'desc' } :
//             sortBy === 'mostBadge' ? { badgeCount: 'desc' } :
//             { createdAt: 'desc' }; // 기본값은 'latest'


//         // 페이지네이션 설정
//         const skip = (parseInt(page) - 1) * parseInt(pageSize);
//         const take = parseInt(pageSize);

//         // 그룹 목록 조회 (페이지네이션 및 정렬 적용)
//         const groups = await prisma.group.findMany({
//             where,
//             orderBy,
//             skip,
//             take,
//             include: {
//                 groupBadges: true,
//                 posts: true,
//                 // groupLikes: true,
//             }
//         });

//         // 그룹별로 배지 확인 및 부여
//         // for (const group of groups) {
//         //     await checkAndAwardBadges(group.id);
//         // }

//         // 전체 아이템 수를 이용한 페이지 계산
//         const totalItemCount = await prisma.group.count({ where });
//         const totalPages = Math.ceil(totalItemCount / pageSize);

//         // 페이지네이션 및 정렬된 그룹 목록 응답
//         res.status(200).json({
//             currentPage: parseInt(page),
//             totalPages,
//             totalItemCount,
//             data: groups.map(group => ({
//                 id: group.id,
//                 name: group.name,
//                 imageUrl: group.imageUrl,
//                 isPublic: group.isPublic,
//                 likeCount: group.likeCount,
//                 badgeCount: group.badgeCount,
//                 postCount: group.postCount,
//                 createdAt: group.createdAt,
//                 introduction: group.introduction
//             }))
//         });
//     } catch (error) {
//         res.status(500).json({ error: '그룹 목록 조회 중 오류 발생', details: error.message });
//     }
// };



// 그룹 목록 조회
export const viewGroupList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, sortBy = 'latest', keyword, isPublic } = req.query;

    // 필터 객체 생성
    const where = {};
    if (isPublic) {
      where.isPublic = isPublic === 'true';
    }
    if (keyword) {
      where.name = { contains: keyword, mode: 'insensitive' };
    }

    // 정렬 기준 설정
    const orderBy =
      sortBy === 'latest' ? { createdAt: 'desc' } :
      sortBy === 'mostLiked' ? { likeCount: 'desc' } :
      sortBy === 'mostPosted' ? { postCount: 'desc' } :
      sortBy === 'mostBadge' ? { groupBadges: { _count: 'desc' } } :
      { createdAt: 'desc' };

    // 페이지네이션 설정
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    // 그룹 목록 조회 (페이지네이션 및 정렬 적용)


    // 그룹의 배지 조건 확인 및 부여
    const badgeIds = await getBadgeIdsForGroup(group);
    await grantBadgeToGroup(groupId, badgeIds);
    
    // 업데이트된 그룹 정보 반환
    const groups = await prisma.group.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        groupBadges: true,
        posts: true,
      }
    });


    // 전체 아이템 수를 이용한 페이지 계산
    const totalItemCount = await prisma.group.count({ where });
    const totalPages = Math.ceil(totalItemCount / pageSize);

    // 페이지네이션 및 정렬된 그룹 목록 응답
    res.status(200).json({
      currentPage: parseInt(page),
      totalPages,
      totalItemCount,
      data: groups.map(group => ({
        id: group.id,
        name: group.name,
        imageUrl: group.imageUrl,
        isPublic: group.isPublic,
        likeCount: group.likeCount,
        badgeCount: group.groupBadges.length, // groupBadges의 길이를 badgeCount로 사용
        postCount: group.postCount,
        createdAt: group.createdAt,
        introduction: group.introduction
      }))
    });
  } catch (error) {
    res.status(500).json({ error: '그룹 목록 조회 중 오류 발생', details: error.message });
  }
};








// 그룹 상세 정보 조회 및 배지 부여
export const viewGroupDetails = async (req, res) => {
  try {
      const groupId = parseInt(req.params.groupId, 10);

      if (isNaN(groupId)) {
          return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다' });
      }

      const group = await prisma.group.findUnique({
          where: { id: groupId },
          include: {
              groupBadges: {
                  include: {
                      badge: true
                  }
              },
              posts: true
          }
      });

      if (!group) {
          return res.status(404).json({ error: '그룹을 찾을 수 없습니다' });
      }

      // 그룹의 배지 조건 확인 및 부여
      const badgeIds = await getBadgeIdsForGroup(group);
      await grantBadgeToGroup(groupId, badgeIds);

      // 업데이트된 그룹 정보 반환
      const updatedGroup = await prisma.group.findUnique({
          where: { id: groupId },
          include: {
              groupBadges: {
                  include: {
                      badge: true
                  }
              },
              posts: true
          }
      });

      res.status(200).json({
          id: updatedGroup.id,
          name: updatedGroup.name,
          imageUrl: updatedGroup.imageUrl,
          isPublic: updatedGroup.isPublic,
          likeCount: updatedGroup.likeCount,
          badges: updatedGroup.groupBadges.map(b => b.badge.name), // 배지 이름으로 반환
          postCount: updatedGroup.posts.length,
          createdAt: updatedGroup.createdAt,
          introduction: updatedGroup.introduction
      });
  } catch (error) {
      res.status(500).json({ error: '그룹 세부 정보 조회 중 오류 발생', details: error.message });
  }
};



// 그룹 조회 권한 확인
export const checkGroupPermissions = async (req, res) => {
    try {
       // URL에서 groupId 추출 후 정수로 변환
      const groupId = parseInt(req.params.groupId, 10);
      
      if (isNaN(groupId)) return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다' });
      
      // 요청 본문에서 비밀번호 추출
      const { password } = req.body;
  
      // groupId가 제공되지 않은 경우
      if (!groupId) {
        return res.status(400).json({ message: '그룹 ID가 필요합니다' });
      }
  
      // 비밀번호가 제공되지 않은 경우
      if (!password) {
        return res.status(400).json({ message: '비밀번호가 필요합니다' });
      }
  
      // 그룹 ID로 그룹 찾기
      const group = await prisma.group.findUnique({ where: { id: groupId } });
  
      // 그룹이 존재하지 않는 경우
      if (!group) {
        return res.status(404).json({ message: '그룹을 찾을 수 없습니다' });
      }
  
      // 비밀번호 확인
      if (group.password !== password) {
        return res.status(401).json({ message: '비밀번호가 틀립니다' });
      }
  
      // 비밀번호가 맞으면 성공 메시지 반환
      res.status(200).json({ message: '비밀번호가 확인되었습니다' });
    } catch (error) {
      // 예기치 않은 오류 처리
      res.status(500).json({ message: '비밀번호 확인 중 오류 발생', details: error.message });
    }
  };


// 해당 그룹의 공개 여부 확인
export const checkGroupVisibility = async (req, res) => {
    try {
        // URL에서 groupId 추출 후 정수로 변환
        const groupId = parseInt(req.params.groupId, 10);
  
        // 유효하지 않은 그룹 ID의 경우
        if (isNaN(groupId)) {
            return res.status(400).json({ error: '유효하지 않은 그룹 ID입니다' });
        }
  
        // 그룹 정보 조회
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: { id: true, isPublic: true } // 필요한 필드만 선택
        });
  
        // 그룹이 존재하지 않는 경우
        if (!group) {
            return res.status(404).json({ error: '그룹을 찾을 수 없습니다' });
        }
  
        // 그룹 공개 여부 응답
        res.status(200).json(group);
    } catch (error) {
        // 예기치 않은 오류 처리
        res.status(500).json({ error: '그룹 공개 여부 조회 중 오류 발생', details: error.message });
    }
  };


// 그룹에 공감하기
export const likeGroup = async (req, res) => {
    try {
        // URL에서 groupId 추출 후 정수로 변환
        const groupId = parseInt(req.params.groupId, 10);

        // 유효하지 않은 그룹 ID의 경우
        if (isNaN(groupId)) {
            return res.status(400).json({ message: '유효하지 않은 그룹 ID입니다' });
        }

        // 그룹 정보 조회
        const group = await prisma.group.findUnique({
            where: { id: groupId }
        });

        // 그룹이 존재하지 않는 경우
        if (!group) {
            return res.status(404).json({ message: '존재하지 않는 그룹입니다' });
        }

        // 공감 추가 (중복 공감 허용)
        await prisma.groupLike.create({
            data: {
                groupId: groupId,
                // `count` 필드를 설정하는 부분 추가
                count: 1  // `count`를 1로 설정하여 새 공감을 기록합니다
            }
        });

        // 그룹의 likeCount 업데이트
        await prisma.group.update({
            where: { id: groupId },
            data: {
                likeCount: {
                    increment: 1
                }
            }
        });

        // 공감 성공 응답
        res.status(200).json({ message: '그룹 공감하기 성공' });
    } catch (error) {
        // 예기치 않은 오류 처리
        res.status(500).json({ message: '그룹 공감하기 중 오류 발생', details: error.message });
    }
};

// 게시물 등록
export const registerPost = async (req, res) => {
  try {
    const { groupId } = req.params; // URL 파라미터에서 groupId를 가져옴
    const { nickname, title, content, postPassword, groupPassword, imageUrl, tags, location, moment, isPublic } = req.body; // 요청 본문에서 데이터 가져오기

    // 필수 데이터가 모두 존재하는지 확인
    if (!nickname || !title || !content || !postPassword || !groupPassword) {
      return res.status(400).json({ message: '잘못된 요청입니다. 필수 데이터가 누락되었습니다.' });
    }

    // 그룹 존재 여부 확인 및 비밀번호 검증
    const group = await prisma.group.findUnique({
      where: { id: Number(groupId) }
    });

    if (!group) {
      return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });
    }

    if (group.password !== groupPassword) {
      return res.status(403).json({ message: '그룹 비밀번호가 일치하지 않습니다.' });
    }

    // 게시글 생성
    const newPost = await prisma.post.create({
      data: {
        groupId: Number(groupId),
        nickname,
        title,
        content,
        password: postPassword, // postPassword는 post 모델의 password 필드로 저장
        imageUrl,
        tags: tags.join(','), // 배열을 문자열로 변환하여 저장
        location,
        moment: new Date(moment),
        isPublic: Boolean(isPublic), // 문자열로 받을 경우 불리언으로 변환
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date(),
      }
    });

    // 그룹의 게시물 수 증가
    await prisma.group.update({
      where: { id: Number(groupId) },
      data: {
        postCount: group.postCount + 1
      }
    });

    // 성공 응답 반환
    res.status(200).json({
      id: newPost.id,
      groupId: newPost.groupId,
      nickname: newPost.nickname,
      title: newPost.title,
      content: newPost.content,
      imageUrl: newPost.imageUrl,
      tags: newPost.tags.split(','), // 저장된 문자열을 배열로 변환하여 반환
      location: newPost.location,
      moment: newPost.moment.toISOString().split('T')[0], // ISO 문자열에서 날짜 부분만 반환
      isPublic: newPost.isPublic,
      likeCount: newPost.likeCount,
      commentCount: newPost.commentCount,
      createdAt: newPost.createdAt
    });

  } catch (error) {
    console.error('게시글 등록 중 오류 발생:', error);
    res.status(500).json({ error: '게시글 등록 중 오류 발생', details: error.message });
  }
};

// 게시글 목록 조회 함수
export const viewPostList = async (req, res) => {
  try {
    const { groupId } = req.params; // URL 파라미터에서 groupId를 가져옴
    const { page = 1, pageSize = 20, sortBy = 'latest', keyword, isPublic } = req.query; // 쿼리 파라미터에서 필터 및 페이징 옵션 가져옴

    // 필터링 객체 초기화
    const where = { groupId: Number(groupId) };

    // 공개 여부 필터 적용
    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true'; // 문자열을 불리언으로 변환하여 필터링에 적용
    }

    // 검색어 필터 적용
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
        { tags: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // 정렬 기준 설정
    const orderBy =
      sortBy === 'latest' ? { createdAt: 'desc' } :
      sortBy === 'mostCommented' ? { commentCount: 'desc' } :
      sortBy === 'mostLiked' ? { likeCount: 'desc' } :
      { createdAt: 'desc' }; // 기본값은 'latest'

    // 페이지네이션 설정
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    // 게시글 목록 조회
    const posts = await prisma.post.findMany({
      where,
      orderBy,
      skip,
      take,
    });

    // 전체 아이템 수를 계산하여 총 페이지 수 계산
    const totalItemCount = await prisma.post.count({ where });
    const totalPages = Math.ceil(totalItemCount / pageSize);

    // 조회 결과 응답
    res.status(200).json({
      currentPage: parseInt(page),
      totalPages,
      totalItemCount,
      data: posts.map(post => ({
        id: post.id,
        nickname: post.nickname,
        title: post.title,
        imageUrl: post.imageUrl,
        tags: post.tags.split(','), // 저장된 문자열을 배열로 변환하여 반환
        location: post.location,
        moment: post.moment.toISOString().split('T')[0], // ISO 문자열에서 날짜 부분만 반환
        isPublic: post.isPublic,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        createdAt: post.createdAt,
      }))
    });
  } catch (error) {
    console.error('게시글 목록 조회 중 오류 발생:', error);
    res.status(500).json({ error: '게시글 목록 조회 중 오류 발생', details: error.message });
  }
};
