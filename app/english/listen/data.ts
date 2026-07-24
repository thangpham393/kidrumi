// Kho từ vựng cho trò "Nghe & chọn". Mỗi từ gồm emoji làm hình minh hoạ
// (luôn hiển thị được, không cần asset), từ tiếng Anh, và nghĩa tiếng Việt
// để khen/gợi ý. Nhóm theo chủ đề để chọn "hình gây nhiễu" hợp lý.

export type Word = {
  en: string; // từ tiếng Anh (dùng cho câu lệnh + đọc)
  vi: string; // nghĩa tiếng Việt (khen ngợi/gợi ý)
  emoji: string;
};

export type Group = { key: string; label: string; words: Word[] };

export const GROUPS: Group[] = [
  {
    key: "animals",
    label: "Con vật",
    words: [
      { en: "turtle", vi: "con rùa", emoji: "🐢" },
      { en: "cat", vi: "con mèo", emoji: "🐱" },
      { en: "dog", vi: "con chó", emoji: "🐶" },
      { en: "rabbit", vi: "con thỏ", emoji: "🐰" },
      { en: "bear", vi: "con gấu", emoji: "🐻" },
      { en: "frog", vi: "con ếch", emoji: "🐸" },
      { en: "fish", vi: "con cá", emoji: "🐟" },
      { en: "bird", vi: "con chim", emoji: "🐦" },
      { en: "duck", vi: "con vịt", emoji: "🦆" },
      { en: "pig", vi: "con lợn", emoji: "🐷" },
      { en: "cow", vi: "con bò", emoji: "🐮" },
      { en: "lion", vi: "con sư tử", emoji: "🦁" },
      { en: "elephant", vi: "con voi", emoji: "🐘" },
      { en: "monkey", vi: "con khỉ", emoji: "🐵" },
      { en: "horse", vi: "con ngựa", emoji: "🐴" },
    ],
  },
  {
    key: "food",
    label: "Đồ ăn",
    words: [
      { en: "apple", vi: "quả táo", emoji: "🍎" },
      { en: "banana", vi: "quả chuối", emoji: "🍌" },
      { en: "orange", vi: "quả cam", emoji: "🍊" },
      { en: "grapes", vi: "chùm nho", emoji: "🍇" },
      { en: "strawberry", vi: "quả dâu", emoji: "🍓" },
      { en: "watermelon", vi: "quả dưa hấu", emoji: "🍉" },
      { en: "carrot", vi: "củ cà rốt", emoji: "🥕" },
      { en: "bread", vi: "ổ bánh mì", emoji: "🍞" },
      { en: "milk", vi: "hộp sữa", emoji: "🥛" },
      { en: "cake", vi: "bánh kem", emoji: "🍰" },
      { en: "egg", vi: "quả trứng", emoji: "🥚" },
      { en: "cheese", vi: "phô mai", emoji: "🧀" },
    ],
  },
  {
    key: "toys",
    label: "Đồ chơi & đồ vật",
    words: [
      { en: "ball", vi: "quả bóng", emoji: "⚽" },
      { en: "car", vi: "ô tô", emoji: "🚗" },
      { en: "book", vi: "quyển sách", emoji: "📚" },
      { en: "balloon", vi: "quả bóng bay", emoji: "🎈" },
      { en: "kite", vi: "con diều", emoji: "🪁" },
      { en: "teddy bear", vi: "gấu bông", emoji: "🧸" },
      { en: "drum", vi: "cái trống", emoji: "🥁" },
      { en: "clock", vi: "đồng hồ", emoji: "⏰" },
      { en: "umbrella", vi: "cái ô", emoji: "☂️" },
      { en: "hat", vi: "cái mũ", emoji: "🎩" },
      { en: "key", vi: "chìa khoá", emoji: "🔑" },
      { en: "gift", vi: "hộp quà", emoji: "🎁" },
    ],
  },
  {
    key: "nature",
    label: "Thiên nhiên",
    words: [
      { en: "sun", vi: "mặt trời", emoji: "☀️" },
      { en: "star", vi: "ngôi sao", emoji: "⭐" },
      { en: "moon", vi: "mặt trăng", emoji: "🌙" },
      { en: "tree", vi: "cái cây", emoji: "🌳" },
      { en: "flower", vi: "bông hoa", emoji: "🌸" },
      { en: "rainbow", vi: "cầu vồng", emoji: "🌈" },
      { en: "cloud", vi: "đám mây", emoji: "☁️" },
      { en: "leaf", vi: "chiếc lá", emoji: "🍃" },
    ],
  },
  {
    key: "vehicles",
    label: "Phương tiện",
    words: [
      { en: "bus", vi: "xe buýt", emoji: "🚌" },
      { en: "train", vi: "tàu hoả", emoji: "🚆" },
      { en: "plane", vi: "máy bay", emoji: "✈️" },
      { en: "boat", vi: "con thuyền", emoji: "⛵" },
      { en: "bike", vi: "xe đạp", emoji: "🚲" },
      { en: "rocket", vi: "tên lửa", emoji: "🚀" },
      { en: "truck", vi: "xe tải", emoji: "🚚" },
      { en: "helicopter", vi: "trực thăng", emoji: "🚁" },
    ],
  },
];

// Câu lệnh cho bé — dùng mạo từ "a/an" đúng nguyên âm cho tự nhiên.
export const PROMPTS = [
  (w: string) => `Touch the ${w}.`,
  (w: string) => `Find the ${w}.`,
  (w: string) => `Where is the ${w}?`,
  (w: string) => `Show me the ${w}.`,
];

// Toàn bộ từ, phẳng — tiện chọn hình gây nhiễu khác chủ đề.
export const ALL_WORDS: Word[] = GROUPS.flatMap((g) => g.words);
