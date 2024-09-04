import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadImage } from '../controllers/imageController.js';

// Multer 설정: 이미지를 업로드할 경로와 파일명을 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // 이미지가 저장될 경로
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 업로드 파일명 설정
  }
});

const upload = multer({ storage });

const router = express.Router();

router.post('/', upload.single('image'), uploadImage); // /api/image 경로로 POST 요청이 들어왔을 때 uploadImage 함수 실행

export default router;
