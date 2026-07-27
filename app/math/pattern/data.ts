// Kho nội dung cho trò "Tiếp nối dãy" (Vườn Toán · 3 tuổi).
// Bé nhìn một dãy vật lặp theo quy luật, rồi chọn vật ĐÚNG cho ô "?" ở cuối dãy.
//   • Quy luật (PATTERNS) mô tả bằng mảng chỉ số một "đơn vị" lặp lại, ví dụ:
//       AB   = [0,1]     → 🍎🍓🍎🍓🍎 ?    (đáp án 🍓)
//       ABC  = [0,1,2]   → 🍎🍓🍌🍎🍓 ?    (đáp án 🍌)
//       AAB  = [0,0,1]   → 🍎🍎🍓🍎🍎 ?    (đáp án 🍓)
//       ABB  = [0,1,1]   → 🍎🍓🍓🍎🍓 ?    (đáp án 🍓)
//     Quy luật KHÓ hơn (đơn vị 4 nhịp, hiện 1 chu kỳ đủ + nhịp đầu chu kỳ sau):
//       AABB = [0,0,1,1] → 🍎🍎🍓🍓🍎🍎 ?  (đáp án 🍓)
//       ABCD = [0,1,2,3] → 🍎🍓🍌🐟🍎🍓 ?  (đáp án 🍌)
//     Số chỉ số khác nhau trong đơn vị = số vật cần chọn từ POOL (2 hoặc 3).
// Emoji hiển thị bằng ảnh Fluent 3D (qua <Emoji>) — mọi máy thấy giống nhau; toàn
// bộ emoji dưới đây đều đã có ảnh trong public/emoji.

export type PatItem = { emoji: string; vi: string };

// Bộ vật dễ nhận, rõ khác nhau — chọn ngẫu nhiên cho mỗi câu.
export const POOL: PatItem[] = [
  { emoji: "⚽", vi: "quả bóng" },
  { emoji: "🧸", vi: "gấu bông" },
  { emoji: "🐱", vi: "con mèo" },
  { emoji: "🍎", vi: "quả táo" },
  { emoji: "🍓", vi: "quả dâu" },
  { emoji: "🍌", vi: "quả chuối" },
  { emoji: "🐟", vi: "con cá" },
  { emoji: "🐥", vi: "chú gà con" },
  { emoji: "🌸", vi: "bông hoa" },
  { emoji: "🌟", vi: "ngôi sao" },
  { emoji: "🎈", vi: "quả bóng bay" },
  { emoji: "🚗", vi: "chiếc ô tô" },
  { emoji: "🐢", vi: "con rùa" },
  { emoji: "🦋", vi: "con bướm" },
  { emoji: "🍪", vi: "cái bánh quy" },
  { emoji: "🎀", vi: "chiếc nơ" },
  { emoji: "🐰", vi: "con thỏ" },
  { emoji: "🐸", vi: "con ếch" },
  { emoji: "🌈", vi: "cầu vồng" },
  { emoji: "🐧", vi: "chim cánh cụt" },
];

// Quy luật lặp: `unit` là mảng chỉ số vật của một đơn vị; `weight` để câu dễ (AB)
// xuất hiện nhiều hơn câu khó. `symbols` = số vật khác nhau (max chỉ số + 1).
export type Pattern = { key: string; unit: number[]; weight: number };

export const PATTERNS: Pattern[] = [
  { key: "AB", unit: [0, 1], weight: 4 },
  { key: "ABC", unit: [0, 1, 2], weight: 2 },
  { key: "AAB", unit: [0, 0, 1], weight: 1 },
  { key: "ABB", unit: [0, 1, 1], weight: 1 },
  // Khó hơn — đơn vị 4 nhịp, ít gặp hơn để đỡ nản.
  { key: "AABB", unit: [0, 0, 1, 1], weight: 1 },
  { key: "ABCD", unit: [0, 1, 2, 3], weight: 1 },
];

export const ROUNDS = 5; // số câu mỗi ván (khớp hàng 5 ngôi sao)

// Lời khen ngẫu nhiên khi bé chọn đúng.
export const PRAISES = [
  "Giỏi quá!",
  "Đúng rồi!",
  "Tuyệt vời!",
  "Bé giỏi lắm!",
  "Chính xác!",
];
