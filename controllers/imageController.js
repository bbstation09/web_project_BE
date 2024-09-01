// 이미지 업로드 후 처리 함수
export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '이미지가 업로드되지 않았습니다.' }); // 이미지 파일이 없을 때 에러 처리
  }

  // 업로드된 이미지의 URL을 생성하여 클라이언트에 반환
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl }); // 업로드된 이미지의 URL을 반환
};
