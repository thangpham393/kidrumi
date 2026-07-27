// Kho nội dung cho trò "Phân loại hình" (Vườn Toán · 4–5 tuổi).
// Mỗi lượt bốc 2 LOẠI hình khác nhau (2 rổ); khay có nhiều hình thuộc 2 loại đó,
// mỗi hình tô MỘT màu ngẫu nhiên khác nhau. Bé kéo/chạm mỗi hình vào ĐÚNG rổ theo
// DẠNG hình (bỏ qua màu). Phân loại đúng HẾT một lượt = 1 ngôi sao.
//   • Hình vẽ bằng SVG (xem <ShapeSvg> trong page.tsx) nên mọi máy thấy giống nhau.
//   • Cùng một loại nhưng KHÁC màu → bé phải nhận dạng theo hình, không "học vẹt" màu.
//   • `near` = hình dễ nhầm (tròn↔bầu dục, vuông↔chữ nhật) → không xếp chung một lượt.
// Thêm loại hình mới: thêm vào mảng SHAPES + vẽ nhánh tương ứng trong <ShapeSvg>.

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
  phrase: string; // "hình vuông" — dùng trong câu lệnh và lời khen
  label: string; // "Hình vuông" — tên rổ hiển thị trên thẻ
  near?: ShapeKey; // hình dễ nhầm, tránh xếp chung một lượt
};

// Bộ hình cho bé 4–5 tuổi. Ba hình đầu là cốt lõi, còn lại tăng độ phong phú.
export const SHAPES: Shape[] = [
  { key: "circle", phrase: "hình tròn", label: "Hình tròn", near: "oval" },
  { key: "square", phrase: "hình vuông", label: "Hình vuông", near: "rectangle" },
  { key: "triangle", phrase: "hình tam giác", label: "Hình tam giác" },
  { key: "star", phrase: "hình ngôi sao", label: "Hình ngôi sao" },
  { key: "heart", phrase: "hình trái tim", label: "Hình trái tim" },
  { key: "diamond", phrase: "hình thoi", label: "Hình thoi" },
  { key: "hexagon", phrase: "hình sáu cạnh", label: "Hình sáu cạnh" },
  { key: "rectangle", phrase: "hình chữ nhật", label: "Hình chữ nhật", near: "square" },
  { key: "oval", phrase: "hình bầu dục", label: "Hình bầu dục", near: "circle" },
];

// Màu tô cho mỗi hình — token ngữ nghĩa của design-system, tươi và rõ khối. Trong
// một lượt, mỗi hình cùng loại được bốc MỘT màu khác nhau.
export const COLORS: string[] = [
  "var(--pink)",
  "var(--amber)",
  "var(--brand)",
  "var(--green)",
  "var(--blue)",
  "var(--red)",
];

export const ROUNDS = 6; // số lượt mỗi ván (khớp hàng 6 ngôi sao)
export const PER_CAT = 3; // số hình mỗi rổ trong một lượt (khay có PER_CAT × 2 hình)

// Lời khen ngẫu nhiên khi bé bỏ đúng một hình.
export const PRAISES = [
  "Giỏi quá!",
  "Đúng rồi!",
  "Tuyệt vời!",
  "Bé giỏi lắm!",
  "Chính xác!",
];
