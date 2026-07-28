// Kho chữ Hán cho trò "Bé học chữ Hán" — mỗi chữ đi qua 4 bước 认·学·练·写.
// Nội dung & tranh minh hoạ theo sách 直映识字 (học chữ bằng hình): bài 1 dạy các
// BỘ PHẬN CƠ THỂ. Chia mỗi đơn vị 5 chữ. Tranh cắt từ sách, lưu ở
// public/illustrations/hanzi/<pinyin+thanh>.png (vd ren2.png, er3.png — tránh trùng 耳/二).
//
// Nguồn nét viết (bước 写): Hanzi Writer + Make Me a Hanzi (public/hanzi-data/<char>.json).
// Nghĩa + câu ví dụ tiếng Việt biên soạn thủ công cho trẻ.

export type HanziCard = {
  char: string; // chữ Hán
  pinyin: string; // pinyin có dấu thanh
  meaning: string; // nghĩa tiếng Việt (ngắn, cho bé)
  img: string; // ảnh minh hoạ (public/illustrations/hanzi/…); lỗi tải → rớt về emoji
  emoji: string; // minh hoạ dự phòng
  word: string; // từ ghép ví dụ (词)
  wordPinyin: string; // pinyin của từ ghép
  wordMeaning: string; // nghĩa tiếng Việt của từ ghép
  sentence: string; // câu ví dụ ngắn (chứa chữ đang học)
  sentenceMeaning: string; // nghĩa tiếng Việt của câu
};

export type HanziUnit = {
  id: string; // slug dùng trong URL: /chinese/hanzi/<id>
  title: string; // "Đơn vị 1"
  preview: string; // 5 chữ để xem trước
  emoji: string; // linh vật của đơn vị
  cards: HanziCard[];
};

export const UNITS: HanziUnit[] = [
  {
    id: "u1",
    title: "Đơn vị 1",
    preview: "人头目眉鼻",
    emoji: "🧒",
    cards: [
      { char: "人", pinyin: "rén", meaning: "người", img: "/illustrations/hanzi/ren2.png", emoji: "🧒", word: "大人", wordPinyin: "dà rén", wordMeaning: "người lớn", sentence: "他是好人。", sentenceMeaning: "Anh ấy là người tốt." },
      { char: "头", pinyin: "tóu", meaning: "cái đầu", img: "/illustrations/hanzi/tou2.png", emoji: "🧑", word: "头发", wordPinyin: "tóu fa", wordMeaning: "tóc", sentence: "我摸摸头。", sentenceMeaning: "Mình xoa xoa đầu." },
      { char: "目", pinyin: "mù", meaning: "con mắt", img: "/illustrations/hanzi/mu4.png", emoji: "👁️", word: "目光", wordPinyin: "mù guāng", wordMeaning: "ánh mắt", sentence: "用目看东西。", sentenceMeaning: "Dùng mắt nhìn đồ vật." },
      { char: "眉", pinyin: "méi", meaning: "lông mày", img: "/illustrations/hanzi/mei2.png", emoji: "🧑", word: "眉毛", wordPinyin: "méi mao", wordMeaning: "lông mày", sentence: "眉毛在眼睛上。", sentenceMeaning: "Lông mày ở trên mắt." },
      { char: "鼻", pinyin: "bí", meaning: "cái mũi", img: "/illustrations/hanzi/bi2.png", emoji: "👃", word: "鼻子", wordPinyin: "bí zi", wordMeaning: "cái mũi", sentence: "大象鼻子长。", sentenceMeaning: "Mũi voi dài." },
    ],
  },
  {
    id: "u2",
    title: "Đơn vị 2",
    preview: "耳口牙舌心",
    emoji: "👂",
    cards: [
      { char: "耳", pinyin: "ěr", meaning: "cái tai", img: "/illustrations/hanzi/er3.png", emoji: "👂", word: "耳朵", wordPinyin: "ěr duo", wordMeaning: "cái tai", sentence: "兔子耳朵长。", sentenceMeaning: "Tai thỏ dài." },
      { char: "口", pinyin: "kǒu", meaning: "cái miệng", img: "/illustrations/hanzi/kou3.png", emoji: "👄", word: "口水", wordPinyin: "kǒu shuǐ", wordMeaning: "nước miếng", sentence: "张开口。", sentenceMeaning: "Há miệng ra nào." },
      { char: "牙", pinyin: "yá", meaning: "cái răng", img: "/illustrations/hanzi/ya2.png", emoji: "🦷", word: "牙齿", wordPinyin: "yá chǐ", wordMeaning: "răng", sentence: "我要刷牙。", sentenceMeaning: "Mình đi đánh răng." },
      { char: "舌", pinyin: "shé", meaning: "cái lưỡi", img: "/illustrations/hanzi/she2.png", emoji: "👅", word: "舌头", wordPinyin: "shé tou", wordMeaning: "cái lưỡi", sentence: "舌头尝味道。", sentenceMeaning: "Lưỡi nếm vị ngon." },
      { char: "心", pinyin: "xīn", meaning: "trái tim", img: "/illustrations/hanzi/xin1.png", emoji: "❤️", word: "开心", wordPinyin: "kāi xīn", wordMeaning: "vui vẻ", sentence: "我很开心。", sentenceMeaning: "Mình rất vui." },
    ],
  },
];

export const STEPS = ["认", "学", "练", "写"] as const;
export type Step = (typeof STEPS)[number];

export const STEP_LABEL: Record<Step, string> = {
  认: "Nhận mặt chữ",
  学: "Học nghĩa",
  练: "Luyện chọn",
  写: "Tập viết",
};

export function findUnit(id: string): HanziUnit | undefined {
  return UNITS.find((u) => u.id === id);
}
