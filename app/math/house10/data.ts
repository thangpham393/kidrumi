// Kho nội dung cho trò "Ngôi nhà số 10" (Vườn Toán · 4–5 tuổi).
// Mỗi câu: ngôi nhà đã có sẵn `have` bạn ở trên; bé thêm bạn từ khay để tổng đủ
// TARGET (10) rồi bấm "Xong!". Đây là bài "làm bạn với số 10" (number bonds to 10):
// giúp bé thuộc các cặp cộng lại bằng 10 (9+1, 8+2, 7+3, …). Emoji "bạn" đều đã có
// ảnh Fluent 3D trong public/emoji nên mọi máy đều thấy giống nhau.

export const TARGET = 10; // ngôi nhà số 10 — tổng cần đạt
export const ROUNDS = 8; // số câu mỗi ván (khớp hàng 8 ngôi sao)
// have = số bạn CÓ SẴN trên kệ trên; need = 10 - have = số bạn thêm vào kệ dưới.
// Trải đều 1..9 (phủ đủ các cặp làm-bạn-với-10: 1+9, 2+8, … 9+1).
export const HAVE_MIN = 1;
export const HAVE_MAX = 9;

// Các "bạn" ở trong nhà — xoay vòng theo từng câu cho vui mắt. Mỗi câu chỉ dùng MỘT
// loại để bé dễ đếm; tất cả đều có ảnh Fluent 3D nên nhìn đồng bộ, không lệch tông.
export type Friend = { emoji: string; vi: string };
export const FRIENDS: Friend[] = [
  { emoji: "🧸", vi: "bạn gấu bông" },
  { emoji: "🐻", vi: "bạn gấu" },
  { emoji: "🐰", vi: "bạn thỏ" },
  { emoji: "🐱", vi: "bạn mèo" },
  { emoji: "🐶", vi: "bạn cún" },
  { emoji: "🐥", vi: "bạn gà con" },
  { emoji: "🐧", vi: "bạn chim cánh cụt" },
  { emoji: "🦊", vi: "bạn cáo" },
];

// Lời khen ngẫu nhiên khi bé làm đúng một câu.
export const PRAISES = [
  "Giỏi quá!",
  "Đúng rồi!",
  "Tuyệt vời!",
  "Bé giỏi lắm!",
  "Chính xác!",
  "Đủ 10 rồi!",
];
