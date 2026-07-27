// Kho nội dung cho trò "Vật gì biến mất?" (Vườn Toán · 4–5 tuổi).
// Bé quan sát một nhóm đồ vật trong chốc lát, kệ được che lại, rồi tìm ra vật nào
// đã biến mất. Tất cả emoji dưới đây đều đã có ảnh Fluent 3D trong public/emoji nên
// mọi máy (Android/Windows/Mac) đều thấy giống nhau, không lệch tông.

export type GoneItem = { emoji: string; vi: string };

export const ITEMS: GoneItem[] = [
  { emoji: "🦆", vi: "con vịt" },
  { emoji: "🐸", vi: "con ếch" },
  { emoji: "🐰", vi: "con thỏ" },
  { emoji: "🐱", vi: "con mèo" },
  { emoji: "🐶", vi: "con chó" },
  { emoji: "🐻", vi: "con gấu" },
  { emoji: "🐢", vi: "con rùa" },
  { emoji: "🐟", vi: "con cá" },
  { emoji: "🐝", vi: "con ong" },
  { emoji: "🦋", vi: "con bướm" },
  { emoji: "🐞", vi: "con bọ rùa" },
  { emoji: "🐌", vi: "con ốc sên" },
  { emoji: "🐥", vi: "chú gà con" },
  { emoji: "🦉", vi: "con cú" },
  { emoji: "🐧", vi: "chim cánh cụt" },
  { emoji: "🦀", vi: "con cua" },
  { emoji: "🐙", vi: "con bạch tuộc" },
  { emoji: "🪁", vi: "cái diều" },
  { emoji: "🧸", vi: "gấu bông" },
  { emoji: "🎈", vi: "quả bóng bay" },
  { emoji: "🎁", vi: "hộp quà" },
  { emoji: "🚌", vi: "xe buýt" },
  { emoji: "🚗", vi: "ô tô" },
  { emoji: "🚀", vi: "tên lửa" },
  { emoji: "☂️", vi: "cái ô" },
  { emoji: "✏️", vi: "bút chì" },
  { emoji: "🎩", vi: "cái mũ" },
  { emoji: "🍎", vi: "quả táo" },
  { emoji: "🍓", vi: "quả dâu" },
  { emoji: "🍌", vi: "quả chuối" },
  { emoji: "🍊", vi: "quả cam" },
  { emoji: "🥝", vi: "quả kiwi" },
  { emoji: "🥕", vi: "củ cà rốt" },
  { emoji: "🍄", vi: "cây nấm" },
  { emoji: "🌸", vi: "bông hoa" },
  { emoji: "🌻", vi: "bông hướng dương" },
  { emoji: "🧁", vi: "bánh cupcake" },
  { emoji: "🍩", vi: "bánh donut" },
  { emoji: "⭐", vi: "ngôi sao" },
  { emoji: "🌙", vi: "mặt trăng" },
];

export const ROUNDS = 8; // số câu mỗi ván (khớp hàng 8 ngôi sao)

// Độ khó tăng dần theo câu: số vật hiện ra để nhớ + số lựa chọn đáp án.
// Câu đầu nhẹ nhàng (3 vật · 2 lựa chọn), về sau nhiều vật hơn để bé nhớ kỹ hơn.
export function levelFor(step: number): { count: number; options: number } {
  if (step < 3) return { count: 3, options: 2 };
  if (step < 6) return { count: 4, options: 3 };
  return { count: 5, options: 3 };
}

// Thời gian cho bé ngắm & ghi nhớ (mili-giây) trước khi màn che trượt vào.
export const MEMORIZE_MS = 5000;
// Thời gian màn che phủ kín kệ (sau khi trượt vào) trước khi trượt đi để lộ nhóm
// vật đã thiếu một món. Nên ≥ thời lượng trượt của .gone-curtain trong globals.css.
export const COVER_MS = 700;

// Lời khen ngẫu nhiên khi bé tìm đúng vật biến mất.
export const PRAISES = [
  "Giỏi quá!",
  "Đúng rồi!",
  "Tuyệt vời!",
  "Bé nhớ giỏi ghê!",
  "Chính xác!",
  "Trí nhớ tốt lắm!",
];
