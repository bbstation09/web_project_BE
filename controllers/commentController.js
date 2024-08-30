import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


// 댓글 삭제
export const deleteComment = async (req, res) => {
  const { commentId } = req.params; 
  const { password } = req.body;

  // 비밀번호 확인
  if (!password) {
    return res.status(400).json({ message: '잘못된 요청입니다' });
  }

  try {
    // 댓글 조회
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    // 댓글이 존재하지 않는 경우
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
    }

    // 비밀번호 확인
    if (comment.password !== password) {
      return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    // 댓글 삭제
    await prisma.comment.delete({
      where: { id: parseInt(commentId) },
    });

    // 성공적인 응답 반환
    return res.status(200).json({ message: '답글 삭제 성공' });
  } catch (error) {
    // 서버 오류가 발생한 경우
    console.error('댓글 삭제 중 오류 발생:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다', details: error.message });
  }
};



// 댓글 수정
export const editComment = async (req, res) => {
  const { commentId } = req.params; 
  const { nickname, content, password } = req.body; 

  // 필수 필드 확인
  if (!nickname || !content || !password) {
    return res.status(400).json({ message: '잘못된 요청입니다' });
  }

  try {
    // 댓글 조회
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    // 댓글이 존재하지 않는 경우
    if (!comment) {
      return res.status(404).json({ message: '존재하지 않습니다' });
    }

    // 비밀번호 확인
    if (comment.password !== password) {
      return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    // 댓글 수정
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: {
        nickname,
        content,
      },
    });

    // 성공적인 응답 반환
    return res.status(200).json({
      id: updatedComment.id,
      nickname: updatedComment.nickname,
      content: updatedComment.content,
      createdAt: updatedComment.createdAt,
    });
  } catch (error) {
    // 서버 오류가 발생한 경우
    console.error('댓글 수정 중 오류 발생:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다', details: error.message });
  }
};


