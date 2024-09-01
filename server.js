import express from 'express';
import groupRoutes from './routes/groupRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';  // 'url' 모듈에서 fileURLToPath를 가져옴

import cors from 'cors';

const app = express();

// 안되면 지워
app.use(cors({ origin: 'https://project-zogakzip-fe.vercel.app' }));

app.use(express.json());

app.use('/api/groups', groupRoutes); // 그룹

app.use('/api/posts', postRoutes); // 게시물(추억)

app.use('/api/comments', commentRoutes); // 댓글

// ES 모듈에서 __dirname과 __filename을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use('/api/image', imageRoutes); // 이미지

// 'uploads' 디렉토리의 파일을 정적 파일로 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));