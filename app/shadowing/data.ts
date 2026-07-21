// Dữ liệu thư viện Shadowing.
// SCAFFOLD: transcript do người soạn (không cần khớp 100% audio để cơ chế highlight chạy —
// highlight bám theo mốc thời gian `t` của trình phát YouTube). Thay `youtubeId` bằng ID
// video thật khi có; các mốc `t` (giây) chỉ cần < thời lượng video là được.

export type Lang = "en" | "zh";
export type Level = "de" | "mid" | "hard";

// Một câu trong transcript. `t` = mốc bắt đầu (giây). `tr` = bản dịch tiếng Việt.
// `words` = từ/cụm từ đáng chú ý; `ph` là phiên âm (IPA cho tiếng Anh, pinyin cho tiếng Trung).
export type Word = { w: string; ph?: string; mean: string };
export type Segment = { t: number; text: string; tr: string; words?: Word[] };

export type Video = {
  id: string; // slug dùng cho URL /shadowing/[id]
  lang: Lang;
  title: string;
  source: string;
  level: Level;
  dur: string;
  emoji: string;
  youtubeId: string;
  segments: Segment[];
};

export const langLabel: Record<Lang, string> = { en: "English", zh: "Chinese" };
export const levelLabel: Record<Level, string> = { de: "Dễ", mid: "Trung bình", hard: "Khó" };
export const levelCls: Record<Level, string> = { de: "", mid: "mid", hard: "hard" };

export const sourcesByLang: Record<Lang, string[]> = {
  en: ["Tất cả", "Bluey", "Early Learning", "Little Fox", "The Fable Cottage"],
  zh: ["Tất cả", "Little Fox 中文", "Miao Miao", "Super Simple 中文"],
};

export const videos: Video[] = [
  // ---------------- English ----------------
  {
    id: "feelings-emotions",
    lang: "en",
    title: "Early Learning Stories | Feelings and Emotions 😄😠😢 | Stories for Kindergarten",
    source: "Little Fox",
    level: "de",
    dur: "7:17",
    emoji: "😄",
    youtubeId: "ZSX6jNby7eo",
    segments: [
      { t: 2, text: "little fox.", tr: "con cáo nhỏ." },
      { t: 7, text: "teddy's day.", tr: "Ngày của Teddy." },
      { t: 13, text: "Teddy is happy.", tr: "Teddy đang vui.", words: [{ w: "happy", ph: "ˈhæpi", mean: "vui vẻ" }] },
      { t: 27, text: "Teddy is angry.", tr: "Teddy đang giận.", words: [{ w: "angry", ph: "ˈæŋɡri", mean: "giận dữ" }] },
      { t: 40, text: "Teddy is sad.", tr: "Teddy đang buồn.", words: [{ w: "sad", ph: "sæd", mean: "buồn" }] },
      { t: 51, text: "Teddy is thirsty.", tr: "Teddy đang khát.", words: [{ w: "thirsty", ph: "ˈθɜːrsti", mean: "khát nước" }] },
      { t: 54, text: "I want water.", tr: "Tôi muốn nước.", words: [{ w: "want", ph: "wɑːnt", mean: "muốn" }] },
      { t: 68, text: "Teddy is tired.", tr: "Teddy đang mệt.", words: [{ w: "tired", ph: "ˈtaɪərd", mean: "mệt mỏi" }] },
      { t: 76, text: "Teddy is hungry.", tr: "Teddy đang đói.", words: [{ w: "hungry", ph: "ˈhʌŋɡri", mean: "đói" }] },
      { t: 93, text: "Teddy is sleepy.", tr: "Teddy đang buồn ngủ.", words: [{ w: "sleepy", ph: "ˈsliːpi", mean: "buồn ngủ" }] },
      { t: 100, text: "Night.", tr: "Đêm." },
      { t: 105, text: "Sad, sadder, saddest.", tr: "Buồn, buồn hơn, buồn nhất." },
      { t: 114, text: "Timmy is sad.", tr: "Timmy đang buồn.", words: [{ w: "sad", ph: "sæd", mean: "buồn" }] },
      { t: 125, text: "Aunt Tara is sadder.", tr: "Dì Tara còn buồn hơn.", words: [{ w: "sadder", ph: "ˈsædər", mean: "buồn hơn" }] },
      { t: 138, text: "Grandpa is the saddest.", tr: "Ông là người buồn nhất.", words: [{ w: "saddest", ph: "ˈsædɪst", mean: "buồn nhất" }] },
      { t: 150, text: "Don't cry. Be happy!", tr: "Đừng khóc. Hãy vui lên nhé!", words: [{ w: "cry", ph: "kraɪ", mean: "khóc" }] },
      { t: 165, text: "Now everyone is happy.", tr: "Bây giờ ai cũng vui.", words: [{ w: "everyone", ph: "ˈevriwʌn", mean: "mọi người" }] },
      { t: 178, text: "The end.", tr: "Hết rồi." },
    ],
  },
  {
    id: "teddys-day",
    lang: "en",
    title: "Teddy's Day | Early Learning | Phonics | Little Fox | Bedtime Stories",
    source: "Little Fox",
    level: "de",
    dur: "1:07",
    emoji: "🧸",
    youtubeId: "MvbnocOuOTw",
    segments: [
      { t: 1, text: "This is Teddy.", tr: "Đây là Teddy.", words: [{ w: "this", ph: "ðɪs", mean: "cái này / đây" }] },
      { t: 8, text: "Teddy wakes up.", tr: "Teddy thức dậy.", words: [{ w: "wake up", ph: "weɪk ʌp", mean: "thức dậy" }] },
      { t: 16, text: "Teddy eats breakfast.", tr: "Teddy ăn sáng.", words: [{ w: "breakfast", ph: "ˈbrekfəst", mean: "bữa sáng" }] },
      { t: 26, text: "Teddy plays outside.", tr: "Teddy chơi bên ngoài.", words: [{ w: "play", ph: "pleɪ", mean: "chơi" }] },
      { t: 38, text: "Teddy takes a bath.", tr: "Teddy đi tắm.", words: [{ w: "bath", ph: "bæθ", mean: "tắm" }] },
      { t: 50, text: "Teddy goes to bed.", tr: "Teddy đi ngủ.", words: [{ w: "bed", ph: "bed", mean: "giường" }] },
      { t: 60, text: "Good night, Teddy!", tr: "Chúc ngủ ngon, Teddy!", words: [{ w: "night", ph: "naɪt", mean: "đêm / buổi tối" }] },
    ],
  },
  {
    id: "shapes-colors",
    lang: "en",
    title: "Learn Shapes and Colors | Stories for Kindergarten | Basic Concepts",
    source: "Little Fox",
    level: "de",
    dur: "12:00",
    emoji: "🔺",
    youtubeId: "x5g6kcp-zEQ",
    segments: [
      { t: 3, text: "Let's learn colors!", tr: "Cùng học màu sắc nào!", words: [{ w: "color", ph: "ˈkʌlər", mean: "màu sắc" }] },
      { t: 12, text: "This is red.", tr: "Đây là màu đỏ.", words: [{ w: "red", ph: "red", mean: "màu đỏ" }] },
      { t: 22, text: "This is blue.", tr: "Đây là màu xanh dương.", words: [{ w: "blue", ph: "bluː", mean: "màu xanh dương" }] },
      { t: 33, text: "This is yellow.", tr: "Đây là màu vàng.", words: [{ w: "yellow", ph: "ˈjeloʊ", mean: "màu vàng" }] },
      { t: 45, text: "Now let's learn shapes.", tr: "Bây giờ học hình khối nào.", words: [{ w: "shape", ph: "ʃeɪp", mean: "hình dạng" }] },
      { t: 56, text: "A circle is round.", tr: "Hình tròn thì tròn.", words: [{ w: "circle", ph: "ˈsɜːrkl", mean: "hình tròn" }] },
      { t: 70, text: "A square has four sides.", tr: "Hình vuông có bốn cạnh.", words: [{ w: "square", ph: "skwer", mean: "hình vuông" }] },
      { t: 85, text: "Great job!", tr: "Giỏi lắm!", words: [{ w: "great", ph: "ɡreɪt", mean: "tuyệt vời" }] },
    ],
  },
  {
    id: "dinosaurs",
    lang: "en",
    title: "Dinosaurs | Early Learning | Phonics | Little Fox | Bedtime Stories",
    source: "Little Fox",
    level: "de",
    dur: "1:20",
    emoji: "🦕",
    youtubeId: "oDSlU0QRUcQ",
    segments: [
      { t: 2, text: "Look at the dinosaurs!", tr: "Nhìn những chú khủng long kìa!", words: [{ w: "dinosaur", ph: "ˈdaɪnəsɔːr", mean: "khủng long" }] },
      { t: 12, text: "This one is big.", tr: "Con này thì to.", words: [{ w: "big", ph: "bɪɡ", mean: "to lớn" }] },
      { t: 22, text: "This one is small.", tr: "Con này thì nhỏ.", words: [{ w: "small", ph: "smɔːl", mean: "nhỏ" }] },
      { t: 35, text: "The dinosaur can run.", tr: "Chú khủng long biết chạy.", words: [{ w: "run", ph: "rʌn", mean: "chạy" }] },
      { t: 50, text: "The dinosaur says roar!", tr: "Chú khủng long gầm gừ!", words: [{ w: "roar", ph: "rɔːr", mean: "gầm" }] },
      { t: 65, text: "Bye bye, dinosaurs!", tr: "Tạm biệt các bạn khủng long!" },
    ],
  },
  {
    id: "bluey-magic-xylophone",
    lang: "en",
    title: "Sharing is Caring | Magic Xylophone | Bluey",
    source: "Bluey",
    level: "hard",
    dur: "2:14",
    emoji: "🎹",
    youtubeId: "P1nydF443xM",
    segments: [
      { t: 2, text: "Bluey has a magic xylophone.", tr: "Bluey có một cái đàn phím thần kỳ.", words: [{ w: "magic", ph: "ˈmædʒɪk", mean: "thần kỳ" }] },
      { t: 14, text: "It can freeze people!", tr: "Nó có thể làm người khác đứng hình!", words: [{ w: "freeze", ph: "friːz", mean: "đóng băng / đứng hình" }] },
      { t: 28, text: "Bingo wants to play too.", tr: "Bingo cũng muốn chơi.", words: [{ w: "too", ph: "tuː", mean: "cũng vậy" }] },
      { t: 45, text: "We should share.", tr: "Chúng ta nên chia sẻ.", words: [{ w: "share", ph: "ʃer", mean: "chia sẻ" }] },
      { t: 62, text: "Sharing is caring.", tr: "Chia sẻ là yêu thương.", words: [{ w: "caring", ph: "ˈkerɪŋ", mean: "quan tâm, yêu thương" }] },
      { t: 80, text: "Now they are happy.", tr: "Giờ thì cả hai đều vui." },
    ],
  },
  {
    id: "gingerbread-man",
    lang: "en",
    title: "The Gingerbread Man | Fairy Tales | The Fable Cottage",
    source: "The Fable Cottage",
    level: "mid",
    dur: "5:40",
    emoji: "🍪",
    youtubeId: "jwyrYzys8YE",
    segments: [
      { t: 3, text: "Once upon a time...", tr: "Ngày xửa ngày xưa...", words: [{ w: "once", ph: "wʌns", mean: "một lần / thuở xưa" }] },
      { t: 15, text: "An old woman baked a cookie.", tr: "Một bà lão nướng một cái bánh.", words: [{ w: "baked", ph: "beɪkt", mean: "đã nướng" }] },
      { t: 30, text: "Run, run, as fast as you can!", tr: "Chạy đi, chạy nhanh hết sức nào!", words: [{ w: "fast", ph: "fæst", mean: "nhanh" }] },
      { t: 48, text: "You can't catch me!", tr: "Bạn không bắt được tôi đâu!", words: [{ w: "catch", ph: "kætʃ", mean: "bắt / tóm" }] },
      { t: 70, text: "The fox was clever.", tr: "Chú cáo rất tinh ranh.", words: [{ w: "clever", ph: "ˈklevər", mean: "thông minh, ranh mãnh" }] },
      { t: 95, text: "And that is the end.", tr: "Và câu chuyện kết thúc." },
    ],
  },

  // ---------------- Chinese ----------------
  {
    id: "zh-greetings",
    lang: "zh",
    title: "你好！日常问候 | 幼儿中文 | Little Fox 中文",
    source: "Little Fox 中文",
    level: "de",
    dur: "3:20",
    emoji: "👋",
    youtubeId: "VcY79hw8D9E",
    segments: [
      { t: 2, text: "你好！", tr: "Xin chào!", words: [{ w: "你好", ph: "nǐ hǎo", mean: "xin chào" }] },
      { t: 8, text: "我叫小明。", tr: "Mình tên là Tiểu Minh.", words: [{ w: "我叫", ph: "wǒ jiào", mean: "mình tên là" }] },
      { t: 16, text: "你叫什么名字？", tr: "Bạn tên là gì?", words: [{ w: "名字", ph: "míngzi", mean: "tên" }] },
      { t: 26, text: "很高兴认识你。", tr: "Rất vui được gặp bạn.", words: [{ w: "高兴", ph: "gāoxìng", mean: "vui mừng" }] },
      { t: 38, text: "早上好！", tr: "Chào buổi sáng!", words: [{ w: "早上", ph: "zǎoshang", mean: "buổi sáng" }] },
      { t: 48, text: "晚安。", tr: "Chúc ngủ ngon.", words: [{ w: "晚安", ph: "wǎn'ān", mean: "chúc ngủ ngon" }] },
      { t: 58, text: "谢谢你。", tr: "Cảm ơn bạn.", words: [{ w: "谢谢", ph: "xièxie", mean: "cảm ơn" }] },
      { t: 68, text: "再见！", tr: "Tạm biệt!", words: [{ w: "再见", ph: "zàijiàn", mean: "tạm biệt" }] },
    ],
  },
  {
    id: "zh-numbers",
    lang: "zh",
    title: "一起数数字 1 到 10 | 幼儿中文 | Miao Miao",
    source: "Miao Miao",
    level: "de",
    dur: "2:45",
    emoji: "🔢",
    youtubeId: "qzHRQEuGuPE",
    segments: [
      { t: 2, text: "我们一起数数。", tr: "Chúng ta cùng đếm số nào.", words: [{ w: "数数", ph: "shǔ shù", mean: "đếm số" }] },
      { t: 10, text: "一、二、三。", tr: "Một, hai, ba.", words: [{ w: "一", ph: "yī", mean: "một" }] },
      { t: 20, text: "四、五、六。", tr: "Bốn, năm, sáu.", words: [{ w: "五", ph: "wǔ", mean: "năm" }] },
      { t: 30, text: "七、八、九、十。", tr: "Bảy, tám, chín, mười.", words: [{ w: "十", ph: "shí", mean: "mười" }] },
      { t: 42, text: "你真棒！", tr: "Bé giỏi quá!", words: [{ w: "真棒", ph: "zhēn bàng", mean: "giỏi lắm" }] },
      { t: 52, text: "再数一次。", tr: "Đếm lại một lần nữa nào.", words: [{ w: "一次", ph: "yí cì", mean: "một lần" }] },
    ],
  },
  {
    id: "zh-colors",
    lang: "zh",
    title: "认识颜色 | 红黄蓝绿 | Super Simple 中文",
    source: "Little Fox 中文",
    level: "de",
    dur: "2:10",
    emoji: "🌈",
    youtubeId: "KUyWkXSL3MQ",
    segments: [
      { t: 2, text: "这是什么颜色？", tr: "Đây là màu gì?", words: [{ w: "颜色", ph: "yánsè", mean: "màu sắc" }] },
      { t: 12, text: "这是红色。", tr: "Đây là màu đỏ.", words: [{ w: "红色", ph: "hóngsè", mean: "màu đỏ" }] },
      { t: 22, text: "这是黄色。", tr: "Đây là màu vàng.", words: [{ w: "黄色", ph: "huángsè", mean: "màu vàng" }] },
      { t: 32, text: "这是蓝色。", tr: "Đây là màu xanh dương.", words: [{ w: "蓝色", ph: "lánsè", mean: "màu xanh dương" }] },
      { t: 42, text: "这是绿色。", tr: "Đây là màu xanh lá.", words: [{ w: "绿色", ph: "lǜsè", mean: "màu xanh lá" }] },
    ],
  },
  {
    id: "zh-family",
    lang: "zh",
    title: "我的家人 | 爸爸妈妈 | Little Fox 中文",
    source: "Little Fox 中文",
    level: "mid",
    dur: "3:05",
    emoji: "👨‍👩‍👧",
    youtubeId: "iPvYsKAgsM0",
    segments: [
      { t: 2, text: "这是我的家。", tr: "Đây là gia đình của mình.", words: [{ w: "家", ph: "jiā", mean: "nhà, gia đình" }] },
      { t: 12, text: "这是我的爸爸。", tr: "Đây là bố của mình.", words: [{ w: "爸爸", ph: "bàba", mean: "bố" }] },
      { t: 22, text: "这是我的妈妈。", tr: "Đây là mẹ của mình.", words: [{ w: "妈妈", ph: "māma", mean: "mẹ" }] },
      { t: 34, text: "我爱我的家人。", tr: "Mình yêu gia đình của mình.", words: [{ w: "爱", ph: "ài", mean: "yêu" }] },
      { t: 46, text: "我们很快乐。", tr: "Chúng mình rất hạnh phúc.", words: [{ w: "快乐", ph: "kuàilè", mean: "vui vẻ, hạnh phúc" }] },
    ],
  },
];

export function videosByLang(lang: Lang): Video[] {
  return videos.filter((v) => v.lang === lang);
}

export function getVideo(id: string): Video | undefined {
  return videos.find((v) => v.id === id);
}

// "mm:ss" từ số giây — dùng cho nhãn mốc thời gian trong transcript.
export function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
