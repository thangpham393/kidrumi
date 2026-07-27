// Một từ vựng chung cho trò "Nghe & chọn" (dùng cho Anh, Trung…):
//   term  = phần điền vào câu lệnh + đọc (English word / hanzi)
//   hint  = chú thích nhỏ dưới câu lệnh (vd pinyin) — không bắt buộc
//   vi    = nghĩa tiếng Việt (khen ngợi / aria-label)
//   emoji = hình minh hoạ (Fluent 3D qua <Emoji/>)
export type LtWord = {
  key: string; // định danh duy nhất trong một ngôn ngữ
  term: string;
  hint?: string;
  vi: string;
  emoji: string;
};
