import express from 'express';
import { 
  editPost,
  deletePost, 
  viewPostDetails,
  checkPostPermissions,
  likePost,
  checkPostVisibility,
  registerComment,
  viewCommentList 
} from '../controllers/postController.js';

const router = express.Router();

router.put('/:postId', editPost); // 게시글 수정 -> 완료
router.delete('/:postId', deletePost); // 게시글 삭제 -> 완료 
router.get('/:postId', viewPostDetails); // 게시글 상세 정보 조회 -> 완료
router.post('/:postId/verify-password',checkPostPermissions) // 게시글 조회 권한 확인 -> 완료
router.post('/:postId/like', likePost) // 게시글 공감하기 -> 완료
router.get('/:postId/is-public',checkPostVisibility) // 게시글 공개 여부 확인 -> 완료


router.post('/:postId/comments', registerComment); // 댓글 등록 -> 완료
router.get('/:postId/comments', viewCommentList); // 댓글 목록 조회 -> 완료

export default router;

