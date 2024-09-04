import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


// 게시물 수정 
export const editPost = async (req, res) => {
    const { postId } = req.params; // URL 파라미터에서 postId를 가져옴

    const {
      nickname,
      title,
      content,
      postPassword,
      imageUrl,
      tags,
      location,
      moment,
      isPublic
    } = req.body; // 요청 바디에서 게시글 정보를 가져옴
  
    try {
      // 게시글 존재 여부 확인
      const existingPost = await prisma.post.findUnique({
        where: { id: Number(postId) }
      });
  
      if (!existingPost) {
        return res.status(404).json({ message: "존재하지 않습니다" }); // 게시글이 존재하지 않으면 404 응답
      }
  
      // 비밀번호 검증
      if (existingPost.password !== postPassword) {
        return res.status(403).json({ message: "비밀번호가 틀렸습니다" }); // 비밀번호가 틀리면 403 응답
      }
  
      // 게시글 수정
      const updatedPost = await prisma.post.update({
        where: { id: Number(postId) },
        data: {
          nickname,
          title,
          content,
          imageUrl,
          tags: tags.join(','), // 배열을 문자열로 변환하여 저장
          location,
          moment: new Date(moment), // 날짜 형식 변환
          isPublic: Boolean(isPublic)
        }
      });
  
      // 수정된 게시글 정보 응답
      res.status(200).json({
        id: updatedPost.id,
        groupId: updatedPost.groupId,
        nickname: updatedPost.nickname,
        title: updatedPost.title,
        content: updatedPost.content,
        imageUrl: updatedPost.imageUrl,
        tags: updatedPost.tags.split(','), // 저장된 문자열을 배열로 변환하여 반환
        location: updatedPost.location,
        moment: updatedPost.moment.toISOString().split('T')[0], // ISO 문자열에서 날짜 부분만 반환
        isPublic: updatedPost.isPublic,
        likeCount: updatedPost.likeCount,
        commentCount: updatedPost.commentCount,
        createdAt: updatedPost.createdAt
      });
  
    } catch (error) {
      console.error('게시글 수정 중 오류 발생:', error);
      res.status(500).json({ error: '게시글 수정 중 오류 발생', details: error.message }); // 서버 오류 처리
    }
  };


  
// 게시물 삭제
export const deletePost = async (req, res) => {
    const { postId } = req.params; // URL 파라미터에서 postId를 가져옴
    const { postPassword } = req.body; // 요청 바디에서 게시글 비밀번호를 가져옴
  
    try {
      // 게시글 존재 여부 확인
      const existingPost = await prisma.post.findUnique({
        where: { id: Number(postId) },
      });
  
      if (!existingPost) {
        return res.status(404).json({ message: "존재하지 않습니다" }); // 게시글이 존재하지 않으면 404 응답
      }
  
      // 비밀번호 검증
      if (existingPost.password !== postPassword) {
        return res.status(403).json({ message: "비밀번호가 틀렸습니다" }); // 비밀번호가 틀리면 403 응답
      }
  
      // 게시글 삭제
      await prisma.post.delete({
        where: { id: Number(postId) },
      });
  
      // 성공적으로 삭제되었음을 응답
      res.status(200).json({ message: "게시글이 성공적으로 삭제되었습니다" });
  
    } catch (error) {
      console.error('게시글 삭제 중 오류 발생:', error);
      res.status(500).json({ error: '게시글 삭제 중 오류 발생', details: error.message }); // 서버 오류 처리
    }
  };



// 게시글 조회 권한 확인
export const checkPostPermissions = async (req, res) => {
    const { postId } = req.params; // URL 매개변수에서 postId 가져오기
    const { password } = req.body; // 요청 본문에서 비밀번호 가져오기

    try {
        // 주어진 postId로 게시글 조회
        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId) },
        });

        // 게시글이 존재하지 않는 경우
        if (!post) {
            return res.status(404).json({ message: "존재하지 않습니다" });
        }

        // 입력된 비밀번호와 게시글의 비밀번호 비교
        if (post.password === password) {
            // 비밀번호가 일치하는 경우
            return res.status(200).json({ message: "비밀번호가 확인되었습니다" });
        } else {
            // 비밀번호가 일치하지 않는 경우
            return res.status(401).json({ message: "비밀번호가 틀렸습니다" });
        }
    } catch (error) {
        // 서버 오류가 발생한 경우
        console.error("게시글 비밀번호 확인 중 오류 발생:", error);
        return res.status(500).json({ message: "서버 오류가 발생했습니다", details: error.message });
    }
};



// 해당 추억 게시물의 상세 페이지로 이동
export const viewPostDetails = async (req, res) => {
    const { postId } = req.params; // URL 매개변수에서 postId 가져오기

    try {
      // 주어진 postId로 게시글 조회
      const post = await prisma.post.findUnique({
        where: { id: parseInt(postId) },
        include: { 
          // 게시물에 달린 댓글과 그룹 공감 수
          comments: true, 
        }
      });
  
      // 게시글이 존재하지 않는 경우
      if (!post) {
        return res.status(404).json({ message: '존재하지 않는 게시글입니다' });
      }
  
      // 게시글 상세 정보 응답
      return res.status(200).json({
        id: post.id,
        groupId: post.groupId,
        nickname: post.nickname,
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl,
        tags: post.tags ? post.tags.split(',') : [], // 문자열로 저장된 태그를 배열로 변환
        location: post.location,
        moment: post.moment,
        isPublic: post.isPublic,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        createdAt: post.createdAt,
        comments: post.comments
      });
    } catch (error) {
      // 서버 오류가 발생한 경우
      console.error('게시글 상세 정보 조회 중 오류 발생:', error);
      return res.status(500).json({ message: '서버 오류가 발생했습니다', details: error.message });
    }
  };



// 게시물 공감 하기
export const likePost = async (req, res) => {
    const { postId } = req.params; // URL 매개변수에서 postId 가져오기

    try {
      // 주어진 postId로 게시글 조회
      const post = await prisma.post.findUnique({
        where: { id: parseInt(postId) },
      });
  
      // 게시글이 존재하지 않는 경우
      if (!post) {
        return res.status(404).json({ message: '존재하지 않습니다' });
      }
  
      // 게시글의 likeCount 증가 및 그룹의 likeCount도 증가
      const updatedPost = await prisma.post.update({
        where: { id: parseInt(postId) },
        data: { likeCount: post.likeCount + 1 },
      });
  
  
      return res.status(200).json({ message: '게시글에 좋아요를 눌렀습니다' });
    } catch (error) {
      // 서버 오류가 발생한 경우
      console.error('게시글 좋아요 중 오류 발생:', error);
      return res.status(500).json({ message: '서버 오류가 발생했습니다', details: error.message });
    }
  };



// 게시글의 공개 여부 확인
export const checkPostVisibility = async (req, res) => {
    const { postId } = req.params; // URL 매개변수에서 postId 가져오기

    try {
      // 주어진 postId로 게시글 조회
      const post = await prisma.post.findUnique({
        where: { id: parseInt(postId) },
        select: { isPublic: true } // 공개 여부만 선택적으로 조회
      });
  
      // 게시글이 존재하지 않는 경우
      if (!post) {
        return res.status(404).json({ message: '존재하지 않습니다' });
      }
  
      // 공개 여부 응답
      return res.status(200).json({ isPublic: post.isPublic });
    } catch (error) {
      // 서버 오류가 발생한 경우
      console.error('게시글 공개 여부 확인 중 오류 발생:', error);
      return res.status(500).json({ message: '서버 오류가 발생했습니다', details: error.message });
    }
  };



// 댓글 등록
export const registerComment = async (req, res) => {
  const { postId } = req.params; // URL 매개변수에서 postId 가져오기
  const { nickname, content, password } = req.body; // 요청 본문에서 댓글 정보 가져오기

  // 요청 본문에서 필수 필드 검증
  if (!nickname || !content || !password) {
    return res.status(400).json({ message: '잘못된 요청입니다' });
  }

  try {
    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }

    // 댓글 등록
    const newComment = await prisma.comment.create({
      data: {
        postId: parseInt(postId),
        nickname,
        content,
        password,
      },
    });

    // 성공적인 응답 반환
    return res.status(200).json({
      id: newComment.id,
      nickname: newComment.nickname,
      content: newComment.content,
      createdAt: newComment.createdAt,
    });
  } catch (error) {
    // 서버 오류가 발생한 경우
    console.error('댓글 등록 중 오류 발생:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다', details: error.message });
  }
};



// 댓글 목록 조회
export const viewCommentList = async (req, res) => {
  const { postId } = req.params; // URL 매개변수에서 postId 가져오기
  const { page = 1, pageSize = 10 } = req.query; // 페이지와 페이지 크기 쿼리 파라미터 가져오기

  // 페이지와 페이지 크기 검증
  if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
    return res.status(400).json({ message: '잘못된 요청입니다' });
  }

  try {
    // 게시글 존재 여부 확인
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }

    // 댓글 총 개수 조회
    const totalItemCount = await prisma.comment.count({
      where: { postId: parseInt(postId) },
    });

    // 댓글 목록 조회
    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId) },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' }, // 최신 댓글부터 정렬
    });

    // 총 페이지 수 계산
    const totalPages = Math.ceil(totalItemCount / pageSize);

    // 성공적인 응답 반환
    return res.status(200).json({
      currentPage: parseInt(page),
      totalPages,
      totalItemCount,
      data: comments.map(comment => ({
        id: comment.id,
        nickname: comment.nickname,
        content: comment.content,
        createdAt: comment.createdAt,
      })),
    });
  } catch (error) {
    // 서버 오류가 발생한 경우
    console.error('댓글 목록 조회 중 오류 발생:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다', details: error.message });
  }
};
