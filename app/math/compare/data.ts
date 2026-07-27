// Kho nội dung cho trò "Cái nào hơn?" (Vườn Toán · 3 tuổi).
// Hai kiểu so sánh:
//   • KÍCH THƯỚC (SIZE_GROUPS): cùng một vật, hiện hai cỡ khác nhau rõ rệt; bé chạm
//     vào cái to/cao/dài hơn (hoặc nhỏ/thấp/ngắn hơn). Mỗi nhóm dùng cặp tính từ hợp
//     với hình dạng vật: cao/thấp cho vật đứng, dài/ngắn cho vật thuôn, to/nhỏ cho vật tròn.
//   • SỐ LƯỢNG (COUNT_ITEMS): hai cụm cùng loại vật với số lượng khác nhau; bé chạm
//     vào bên nhiều hơn (hoặc ít hơn).
// Emoji hiển thị bằng ảnh Fluent 3D (qua <Emoji>) — mọi máy thấy giống nhau; các
// emoji dưới đây đều đã có ảnh trong public/emoji.

export type CompareItem = { emoji: string; vi: string };

export type SizeGroup = {
  key: string;
  more: string; // tính từ "hơn về lượng lớn" (cao / dài / to)
  less: string; // tính từ ngược lại (thấp / ngắn / nhỏ)
  base: boolean; // canh đáy (true) cho vật đứng/thuôn, hay canh giữa (false) cho vật tròn
  items: CompareItem[];
};

export const SIZE_GROUPS: SizeGroup[] = [
  {
    key: "tall",
    more: "cao",
    less: "thấp",
    base: true,
    items: [
      { emoji: "🕯️", vi: "cây nến" },
      { emoji: "🦒", vi: "con hươu cao cổ" },
      { emoji: "🚀", vi: "tên lửa" },
      { emoji: "🌵", vi: "cây xương rồng" },
      { emoji: "🌻", vi: "bông hoa hướng dương" },
      { emoji: "🌲", vi: "cây thông" },
      { emoji: "🎄", vi: "cây thông Noel" },
      { emoji: "🏢", vi: "toà nhà" },
    ],
  },
  {
    key: "long",
    more: "dài",
    less: "ngắn",
    base: false,
    items: [
      { emoji: "✏️", vi: "cây bút chì" },
      { emoji: "🐍", vi: "con rắn" },
      { emoji: "📏", vi: "cái thước" },
      { emoji: "🥕", vi: "củ cà rốt" },
      { emoji: "🌭", vi: "cái xúc xích" },
      { emoji: "🚂", vi: "đoàn tàu" },
      { emoji: "🥖", vi: "ổ bánh mì" },
    ],
  },
  {
    key: "big",
    more: "to",
    less: "nhỏ",
    base: false,
    items: [
      { emoji: "⚽", vi: "quả bóng" },
      { emoji: "🎈", vi: "quả bóng bay" },
      { emoji: "🍎", vi: "quả táo" },
      { emoji: "🍉", vi: "quả dưa hấu" },
      { emoji: "🐘", vi: "con voi" },
      { emoji: "🐻", vi: "con gấu" },
      { emoji: "🍕", vi: "miếng pizza" },
      { emoji: "🎁", vi: "hộp quà" },
      { emoji: "⭐", vi: "ngôi sao" },
      { emoji: "❤️", vi: "trái tim" },
    ],
  },
];

// Vật đếm được để so nhiều/ít — emoji nhỏ, xếp cụm gọn trong ô.
export const COUNT_ITEMS: CompareItem[] = [
  { emoji: "🍎", vi: "quả táo" },
  { emoji: "🍓", vi: "quả dâu" },
  { emoji: "🍬", vi: "cái kẹo" },
  { emoji: "🍪", vi: "cái bánh quy" },
  { emoji: "🌟", vi: "ngôi sao" },
  { emoji: "🐟", vi: "con cá" },
  { emoji: "🐥", vi: "chú gà con" },
  { emoji: "🌸", vi: "bông hoa" },
  { emoji: "🐞", vi: "con bọ rùa" },
  { emoji: "🎈", vi: "quả bóng bay" },
  { emoji: "🎀", vi: "chiếc nơ" },
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
