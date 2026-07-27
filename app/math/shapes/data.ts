// Kho nội dung cho trò "Hình gì đây?" (Vườn Toán · 3 tuổi).
// Bé nghe câu lệnh "Chạm vào hình …" rồi chạm đúng 1 trong 3 hình.
//   • Mỗi hình vẽ bằng SVG (nét mượt, tô màu bất kỳ) — xem <ShapeSvg> trong page.tsx.
//   • Màu mỗi câu được random khác nhau để bé nhận DẠNG hình, không "học vẹt" theo màu.
//   • `near` = hình dễ nhầm (tròn↔bầu dục, vuông↔chữ nhật) → tránh xếp chung một câu
//     cho khỏi làm khó bé 3 tuổi.

export type ShapeKey =
  | "circle"
  | "square"
  | "triangle"
  | "rectangle"
  | "star"
  | "heart"
  | "diamond"
  | "oval";

export type Shape = {
  key: ShapeKey;
  phrase: string; // "hình tròn" — dùng trong câu lệnh và lời khen
  near?: ShapeKey; // hình dễ nhầm, tránh xếp cùng một câu
};

// Bộ hình cơ bản cho bé mẫu giáo. Ba hình đầu là cốt lõi (tròn/vuông/tam giác),
// còn lại thêm để tăng độ phong phú khi chơi lại.
export const SHAPES: Shape[] = [
  { key: "circle", phrase: "hình tròn", near: "oval" },
  { key: "square", phrase: "hình vuông", near: "rectangle" },
  { key: "triangle", phrase: "hình tam giác" },
  { key: "rectangle", phrase: "hình chữ nhật", near: "square" },
  { key: "star", phrase: "hình ngôi sao" },
  { key: "heart", phrase: "hình trái tim" },
  { key: "diamond", phrase: "hình thoi" },
  { key: "oval", phrase: "hình bầu dục", near: "circle" },
];

// Màu tô cho mỗi hình — dùng token ngữ nghĩa của design-system, tươi và rõ khối.
// Mỗi câu bốc 3 màu KHÁC nhau gán cho 3 thẻ.
export const COLORS: string[] = [
  "var(--pink)",
  "var(--amber)",
  "var(--brand)",
  "var(--green)",
  "var(--blue)",
  "var(--red)",
];

export const ROUNDS = 6; // số câu mỗi ván (khớp hàng 6 ngôi sao)

// Lời khen ngẫu nhiên khi bé chọn đúng.
export const PRAISES = [
  "Giỏi quá!",
  "Đúng rồi!",
  "Tuyệt vời!",
  "Bé giỏi lắm!",
  "Chính xác!",
];
