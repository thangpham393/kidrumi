// Kho chủ đề & vật phẩm cho trò "Phân loại vào rổ" (Vườn Toán · 3 tuổi).
// Mỗi lượt bốc ngẫu nhiên 2 chủ đề (2 rổ) rồi lấy vài vật mỗi chủ đề cho bé
// kéo/chạm vào ĐÚNG rổ. Phân loại đúng HẾT một lượt = 1 ngôi sao.
// Emoji hiển thị bằng ảnh Fluent 3D (qua <Emoji>) nên mọi máy thấy giống nhau —
// các emoji dưới đây đều đã có sẵn ảnh trong public/emoji.
// Thêm chủ đề/vật mới: chỉ cần thêm vào mảng bên dưới, không phải sửa code trò.

export type SortThing = { emoji: string; vi: string };

export type SortCategory = {
  key: string;
  label: string; // tên rổ (hiển thị + khen + câu nhắc)
  hint: [string, string]; // 2 emoji đại diện trên thẻ tiêu đề rổ
  tone: string; // màu nhấn (viền thẻ + quầng rổ) — mỗi chủ đề một màu riêng
  soft: string; // nền mềm của quầng rổ
  things: SortThing[];
};

export const CATEGORIES: SortCategory[] = [
  {
    key: "produce",
    label: "Rau quả",
    hint: ["🍎", "🥕"],
    tone: "var(--amber)",
    soft: "var(--amber-soft)",
    things: [
      { emoji: "🍎", vi: "quả táo" },
      { emoji: "🍌", vi: "quả chuối" },
      { emoji: "🍊", vi: "quả cam" },
      { emoji: "🍇", vi: "chùm nho" },
      { emoji: "🍓", vi: "quả dâu" },
      { emoji: "🍉", vi: "quả dưa hấu" },
      { emoji: "🍐", vi: "quả lê" },
      { emoji: "🍑", vi: "quả đào" },
      { emoji: "🍍", vi: "quả dứa" },
      { emoji: "🍅", vi: "quả cà chua" },
      { emoji: "🥕", vi: "củ cà rốt" },
      { emoji: "🌽", vi: "bắp ngô" },
      { emoji: "🥦", vi: "bông súp lơ" },
      { emoji: "🥬", vi: "cây rau cải" },
      { emoji: "🥒", vi: "quả dưa chuột" },
      { emoji: "🫐", vi: "quả việt quất" },
    ],
  },
  {
    key: "toy",
    label: "Đồ chơi",
    hint: ["🧸", "🪁"],
    tone: "var(--brand)",
    soft: "var(--brand-soft)",
    things: [
      { emoji: "🧸", vi: "gấu bông" },
      { emoji: "🪁", vi: "con diều" },
      { emoji: "🎈", vi: "bóng bay" },
      { emoji: "⚽", vi: "quả bóng" },
      { emoji: "🏀", vi: "bóng rổ" },
      { emoji: "🎁", vi: "hộp quà" },
      { emoji: "🥁", vi: "cái trống" },
      { emoji: "🎨", vi: "hộp màu vẽ" },
      { emoji: "🎸", vi: "cây đàn" },
      { emoji: "🧩", vi: "miếng ghép hình" },
      { emoji: "🪀", vi: "con quay yo-yo" },
      { emoji: "🪆", vi: "búp bê gỗ" },
      { emoji: "🎠", vi: "ngựa gỗ" },
    ],
  },
  {
    key: "animal",
    label: "Con vật",
    hint: ["🐶", "🐱"],
    tone: "var(--green)",
    soft: "var(--green-soft)",
    things: [
      { emoji: "🐶", vi: "con chó" },
      { emoji: "🐱", vi: "con mèo" },
      { emoji: "🐰", vi: "con thỏ" },
      { emoji: "🐻", vi: "con gấu" },
      { emoji: "🐸", vi: "con ếch" },
      { emoji: "🐷", vi: "con lợn" },
      { emoji: "🐮", vi: "con bò" },
      { emoji: "🦁", vi: "con sư tử" },
      { emoji: "🐘", vi: "con voi" },
      { emoji: "🐵", vi: "con khỉ" },
      { emoji: "🐴", vi: "con ngựa" },
      { emoji: "🐯", vi: "con hổ" },
      { emoji: "🐼", vi: "gấu trúc" },
      { emoji: "🐔", vi: "con gà" },
      { emoji: "🐧", vi: "chim cánh cụt" },
      { emoji: "🦉", vi: "con cú" },
      { emoji: "🦋", vi: "con bướm" },
      { emoji: "🐢", vi: "con rùa" },
      { emoji: "🦊", vi: "con cáo" },
      { emoji: "🐨", vi: "gấu koala" },
      { emoji: "🦒", vi: "hươu cao cổ" },
    ],
  },
  {
    key: "vehicle",
    label: "Xe cộ",
    hint: ["🚗", "✈️"],
    tone: "var(--blue)",
    soft: "var(--blue-soft)",
    things: [
      { emoji: "🚗", vi: "ô tô" },
      { emoji: "🚌", vi: "xe buýt" },
      { emoji: "🚕", vi: "xe taxi" },
      { emoji: "🚑", vi: "xe cứu thương" },
      { emoji: "🚒", vi: "xe cứu hoả" },
      { emoji: "🚓", vi: "xe cảnh sát" },
      { emoji: "🚚", vi: "xe tải" },
      { emoji: "🚜", vi: "máy kéo" },
      { emoji: "🚲", vi: "xe đạp" },
      { emoji: "✈️", vi: "máy bay" },
      { emoji: "⛵", vi: "con thuyền" },
      { emoji: "🚀", vi: "tên lửa" },
      { emoji: "🚁", vi: "trực thăng" },
      { emoji: "🚆", vi: "tàu hoả" },
      { emoji: "🚂", vi: "đầu tàu" },
    ],
  },
  {
    key: "clothes",
    label: "Quần áo",
    hint: ["👕", "👟"],
    tone: "var(--pink)",
    soft: "var(--pink-soft)",
    things: [
      { emoji: "👕", vi: "áo thun" },
      { emoji: "👖", vi: "cái quần" },
      { emoji: "👗", vi: "cái váy" },
      { emoji: "👟", vi: "đôi giày" },
      { emoji: "🥾", vi: "đôi ủng" },
      { emoji: "🧦", vi: "đôi tất" },
      { emoji: "🧢", vi: "mũ lưỡi trai" },
      { emoji: "🧤", vi: "găng tay" },
      { emoji: "🧥", vi: "áo khoác" },
      { emoji: "🧣", vi: "khăn quàng" },
    ],
  },
  {
    key: "snack",
    label: "Đồ ăn",
    hint: ["🍕", "🍰"],
    tone: "var(--red)",
    soft: "var(--red-soft)",
    things: [
      { emoji: "🍕", vi: "miếng pizza" },
      { emoji: "🍔", vi: "bánh hamburger" },
      { emoji: "🌭", vi: "bánh xúc xích" },
      { emoji: "🍟", vi: "khoai tây chiên" },
      { emoji: "🍿", vi: "bỏng ngô" },
      { emoji: "🍦", vi: "que kem" },
      { emoji: "🍪", vi: "bánh quy" },
      { emoji: "🍩", vi: "bánh vòng" },
      { emoji: "🍬", vi: "cái kẹo" },
      { emoji: "🍰", vi: "bánh kem" },
    ],
  },
];

export const ROUNDS = 5; // số lượt mỗi ván (khớp hàng 5 ngôi sao)
export const PER_CAT = 3; // số vật mỗi rổ trong một lượt

// Lời khen ngẫu nhiên khi bé bỏ đúng một vật.
export const PRAISES = [
  "Giỏi quá!",
  "Đúng rồi!",
  "Tuyệt vời!",
  "Bé giỏi lắm!",
  "Chính xác!",
];
