// Cấu hình trò "Xếp theo thứ tự" (Vườn Toán · 4–5 tuổi).
// Mỗi câu bốc một KIỂU so sánh rồi hiện vài hình có cỡ khác nhau; bé kéo/chạm để xếp
// vào các ô theo đúng thứ tự. Ba kiểu:
//   • cao–thấp  (tall): các thanh ĐỨNG, xếp theo chiều cao.
//   • ngắn–dài  (long): các thanh NGANG, xếp theo chiều dài.
//   • nhỏ–to    (big):  các hình TRÒN, xếp theo độ lớn.
// Hình là khối clay thuần CSS (không dùng emoji) nên mọi máy hiển thị giống nhau —
// không cần tải thêm ảnh.

export const ROUNDS = 7; // số câu mỗi ván (khớp hàng 7 ngôi sao)

// Số hình theo tiến trình từng câu: khó dần 3 → 4 → 5 (sẽ bị chặn theo maxN của kiểu).
export const SIZES = [3, 3, 4, 4, 4, 5, 5];

export type Dir = "asc" | "desc"; // asc = nhỏ→lớn, desc = lớn→nhỏ

// Cấu hình từng kiểu: cặp từ mô tả (nhỏ/lớn) cho câu lệnh + nhãn hai đầu, mũi tên
// hướng xếp, và maxN (số hình tối đa để không tràn ngang — hình tròn rộng nên ít hơn).
export const KINDS = {
  tall: { vLow: "thấp", vHigh: "cao", low: "Thấp", high: "Cao", arrow: "→", maxN: 5 },
  long: { vLow: "ngắn", vHigh: "dài", low: "Ngắn", high: "Dài", arrow: "↓", maxN: 5 },
  big: { vLow: "nhỏ", vHigh: "to", low: "Nhỏ", high: "To", arrow: "→", maxN: 3 },
} as const;

export type OrderKind = keyof typeof KINDS;
export const KIND_KEYS = Object.keys(KINDS) as OrderKind[];

export const promptFor = (kind: OrderKind, dir: Dir) => {
  const k = KINDS[kind];
  return dir === "asc" ? `Xếp từ ${k.vLow} đến ${k.vHigh}` : `Xếp từ ${k.vHigh} đến ${k.vLow}`;
};
// Nhãn hai đầu thanh hướng dẫn theo chiều xếp: [đầu, cuối].
export const endsFor = (kind: OrderKind, dir: Dir): [string, string] => {
  const k = KINDS[kind];
  return dir === "asc" ? [k.low, k.high] : [k.high, k.low];
};

// Bảng màu clay: đỉnh sáng + đáy đậm (sắc thái tạo mới có chủ đích cho khối tròn trịa).
// Màu gán ngẫu nhiên, KHÔNG gắn với cỡ (để bé nhìn cỡ chứ không đoán theo màu).
export type BarColor = { key: string; top: string; bottom: string };
export const BAR_COLORS: BarColor[] = [
  { key: "green", top: "#8fd6a6", bottom: "#5aa87c" },
  { key: "brand", top: "#a89bf7", bottom: "#6f5fe0" },
  { key: "red", top: "#f7a08c", bottom: "#e56b52" },
  { key: "blue", top: "#84c4f2", bottom: "#4f97d8" },
  { key: "amber", top: "#f6cf7c", bottom: "#eaa93a" },
  { key: "pink", top: "#f3a7c9", bottom: "#e072a0" },
];

// Lời khen ngẫu nhiên khi bé đặt đúng một hình.
export const PRAISES = [
  "Giỏi quá!",
  "Đúng rồi!",
  "Tuyệt vời!",
  "Bé giỏi lắm!",
  "Chính xác!",
];
