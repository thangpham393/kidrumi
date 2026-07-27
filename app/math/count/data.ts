// Kho nội dung cho trò "Đếm cùng bé" (Vườn Toán · 4–5 tuổi).
// Mỗi câu hiện một cụm vật cùng loại trong khay; bé đếm rồi chạm vào CHỮ SỐ đúng
// (4 lựa chọn). Mỗi vật kèm lượng từ tiếng Việt đúng (con / quả / cái / bông / chiếc…)
// để câu "Có mấy …?" đọc tự nhiên. Tất cả emoji dưới đây đều đã có ảnh Fluent 3D
// trong public/emoji nên mọi máy (Android/Windows/Mac) đều thấy giống nhau.

export type CountThing = { emoji: string; vi: string };

export const THINGS: CountThing[] = [
  { emoji: "🐝", vi: "con ong" },
  { emoji: "🐟", vi: "con cá" },
  { emoji: "🐥", vi: "chú gà con" },
  { emoji: "🐞", vi: "con bọ rùa" },
  { emoji: "🦋", vi: "con bướm" },
  { emoji: "🐢", vi: "con rùa" },
  { emoji: "🐰", vi: "con thỏ" },
  { emoji: "🐸", vi: "con ếch" },
  { emoji: "🦆", vi: "con vịt" },
  { emoji: "🐌", vi: "con ốc sên" },
  { emoji: "🍎", vi: "quả táo" },
  { emoji: "🍓", vi: "quả dâu" },
  { emoji: "🍌", vi: "quả chuối" },
  { emoji: "🍊", vi: "quả cam" },
  { emoji: "🍒", vi: "quả anh đào" },
  { emoji: "🍄", vi: "cây nấm" },
  { emoji: "🌸", vi: "bông hoa" },
  { emoji: "🌻", vi: "bông hướng dương" },
  { emoji: "⭐", vi: "ngôi sao" },
  { emoji: "🎈", vi: "quả bóng bay" },
  { emoji: "🍬", vi: "cái kẹo" },
  { emoji: "🍪", vi: "cái bánh quy" },
  { emoji: "🎁", vi: "hộp quà" },
  { emoji: "🚗", vi: "chiếc ô tô" },
];

export const ROUNDS = 8; // số câu mỗi ván (khớp hàng 8 ngôi sao)
export const MIN_COUNT = 1; // ít nhất 1 vật
export const MAX_COUNT = 9; // nhiều nhất 9 vật — vừa tầm đếm của bé 4–5 tuổi

// Lời khen ngẫu nhiên khi bé chọn đúng.
export const PRAISES = [
  "Giỏi quá!",
  "Đúng rồi!",
  "Tuyệt vời!",
  "Bé giỏi lắm!",
  "Chính xác!",
  "Đếm giỏi ghê!",
];
