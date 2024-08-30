import express from 'express';
import { 
  // registerComment, 
  editComment, 
  deleteComment, 
  // viewCommentList 
} from '../controllers/commentController.js';

const router = express.Router();

router.delete('/:commentId', deleteComment); // 댓글 삭제 -> 완료
router.put('/:commentId', editComment); // 댓글 수정 -> 완료

export default router;
