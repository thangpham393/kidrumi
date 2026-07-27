// Kho nội dung cho trò "Tìm hình trốn" (Vườn Toán · 3 tuổi).
// Mỗi câu hiện một cụm hình (vẽ bằng SVG, màu random) trộn lẫn nhau; câu lệnh
// "Tìm tất cả hình …". Bé phải tìm ĐỦ mọi hình đúng loại đang "trốn" trong cụm.
//   • Màu mỗi hình random khác nhau để bé nhận DẠNG hình, không "học vẹt" theo màu.
//   • `near` = hình dễ nhầm (tròn↔bầu dục, vuông↔chữ nhật) → không dùng làm hình
//     gây nhiễu cùng câu cho khỏi làm khó bé 3 tuổi.

export type ShapeKey =
  | "circle"
  | "square"
  | "triangle"
  | "rectangle"
  | "star"
  | "heart"
  | "diamond"
  | "hexagon"
  | "oval";

export type Shape = {
  key: ShapeKey;
  phrase: string; // "hình sáu cạnh" — ghép vào "Tìm tất cả …" và lời khen
  near?: ShapeKey; // hình dễ nhầm, không dùng làm hình nhiễu cùng câu
};

// Bộ hình cho bé mẫu giáo. Có cả hình sáu cạnh để bé làm quen dần.
export const SHAPES: Shape[] = [
  { key: "circle", phrase: "hình tròn", near: "oval" },
  { key: "square", phrase: "hình vuông", near: "rectangle" },
  { key: "triangle", phrase: "hình tam giác" },
  { key: "rectangle", phrase: "hình chữ nhật", near: "square" },
  { key: "star", phrase: "hình ngôi sao" },
  { key: "heart", phrase: "hình trái tim" },
  { key: "diamond", phrase: "hình thoi" },
  { key: "hexagon", phrase: "hình sáu cạnh" },
  { key: "oval", phrase: "hình bầu dục", near: "circle" },
];

// Màu tô — token ngữ nghĩa của design-system, tươi và rõ khối. Mỗi câu bốc đủ
// màu KHÁC nhau gán cho từng hình.
export const COLORS: string[] = [
  "var(--pink)",
  "var(--amber)",
  "var(--brand)",
  "var(--green)",
  "var(--blue)",
  "var(--red)",
];

export const ROUNDS = 7; // số câu mỗi ván (khớp hàng 7 ngôi sao)
export const TILES = 6; // số hình mỗi câu
export const TARGET_MIN = 2; // ít nhất 2 hình "trốn" mỗi câu
export const TARGET_MAX = 3; // nhiều nhất 3 hình "trốn" mỗi câu

// Lời khen ngẫu nhiên khi bé tìm đủ hình.
export const PRAISES = [
  "Giỏi quá!",
  "Đúng rồi!",
  "Tuyệt vời!",
  "Bé giỏi lắm!",
  "Chính xác!",
];
