// Kho chữ Hán cho trò "Bé học chữ Hán" — mỗi chữ đi qua 4 bước 认·学·练·写.
// Nội dung & tranh minh hoạ theo sách 直映识字 (học chữ bằng hình): bài 1 dạy các
// BỘ PHẬN CƠ THỂ. Chia mỗi đơn vị 5 chữ. Tranh cắt từ sách, nén WebP và lưu trên
// Supabase Storage (bucket công khai hanzi-illus), đặt tên <pinyin+thanh>.webp
// (vd ren2.webp, er3.webp — tránh trùng 耳/二). Xây URL qua HANZI_IMG bên dưới.
//
// Nguồn nét viết (bước 写): Hanzi Writer + Make Me a Hanzi (public/hanzi-data/<char>.json).
// Nghĩa + câu ví dụ tiếng Việt biên soạn thủ công cho trẻ.

export type HanziCard = {
  char: string; // chữ Hán
  pinyin: string; // pinyin có dấu thanh
  meaning: string; // nghĩa tiếng Việt (ngắn, cho bé)
  img: string; // URL ảnh minh hoạ trên Supabase Storage; lỗi tải → rớt về emoji
  emoji: string; // minh hoạ dự phòng
  word: string; // từ ghép ví dụ (词)
  wordPinyin: string; // pinyin của từ ghép
  wordMeaning: string; // nghĩa tiếng Việt của từ ghép
  sentence: string; // câu ví dụ ngắn (chứa chữ đang học)
  sentenceMeaning: string; // nghĩa tiếng Việt của câu
};

export type HanziUnit = {
  id: string; // slug dùng trong URL: /chinese/hanzi/<id>
  title: string; // "Chùm chữ 1"
  preview: string; // 5 chữ để xem trước
  emoji: string; // linh vật của đơn vị
  cards: HanziCard[];
};

// Ảnh minh hoạ lưu trên Supabase Storage (bucket công khai hanzi-illus), định dạng WebP.
// Base lấy từ NEXT_PUBLIC_SUPABASE_URL để không hardcode project. Lỗi tải → HanziIllus rớt về emoji.
const HANZI_IMG = (f: string) =>
  `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "")}/storage/v1/object/public/hanzi-illus/${f}`;

export const UNITS: HanziUnit[] = [
  {
    id: "u1",
    title: "Chùm chữ 1",
    preview: "人头目眉鼻",
    emoji: "🧒",
    cards: [
      { char: "人", pinyin: "rén", meaning: "người", img: HANZI_IMG("ren2.webp"), emoji: "🧒", word: "大人", wordPinyin: "dà rén", wordMeaning: "người lớn", sentence: "他是好人。", sentenceMeaning: "Anh ấy là người tốt." },
      { char: "头", pinyin: "tóu", meaning: "cái đầu", img: HANZI_IMG("tou2.webp"), emoji: "🧑", word: "头发", wordPinyin: "tóu fa", wordMeaning: "tóc", sentence: "我摸摸头。", sentenceMeaning: "Mình xoa xoa đầu." },
      { char: "目", pinyin: "mù", meaning: "con mắt", img: HANZI_IMG("mu4.webp"), emoji: "👁️", word: "目光", wordPinyin: "mù guāng", wordMeaning: "ánh mắt", sentence: "用目看东西。", sentenceMeaning: "Dùng mắt nhìn đồ vật." },
      { char: "眉", pinyin: "méi", meaning: "lông mày", img: HANZI_IMG("mei2.webp"), emoji: "🧑", word: "眉毛", wordPinyin: "méi mao", wordMeaning: "lông mày", sentence: "眉毛在眼睛上。", sentenceMeaning: "Lông mày ở trên mắt." },
      { char: "鼻", pinyin: "bí", meaning: "cái mũi", img: HANZI_IMG("bi2.webp"), emoji: "👃", word: "鼻子", wordPinyin: "bí zi", wordMeaning: "cái mũi", sentence: "大象鼻子长。", sentenceMeaning: "Mũi voi dài." },
    ],
  },
  {
    id: "u2",
    title: "Chùm chữ 2",
    preview: "耳口牙舌心",
    emoji: "👂",
    cards: [
      { char: "耳", pinyin: "ěr", meaning: "cái tai", img: HANZI_IMG("er3.webp"), emoji: "👂", word: "耳朵", wordPinyin: "ěr duo", wordMeaning: "cái tai", sentence: "兔子耳朵长。", sentenceMeaning: "Tai thỏ dài." },
      { char: "口", pinyin: "kǒu", meaning: "cái miệng", img: HANZI_IMG("kou3.webp"), emoji: "👄", word: "口水", wordPinyin: "kǒu shuǐ", wordMeaning: "nước miếng", sentence: "张开口。", sentenceMeaning: "Há miệng ra nào." },
      { char: "牙", pinyin: "yá", meaning: "cái răng", img: HANZI_IMG("ya2.webp"), emoji: "🦷", word: "牙齿", wordPinyin: "yá chǐ", wordMeaning: "răng", sentence: "我要刷牙。", sentenceMeaning: "Mình đi đánh răng." },
      { char: "舌", pinyin: "shé", meaning: "cái lưỡi", img: HANZI_IMG("she2.webp"), emoji: "👅", word: "舌头", wordPinyin: "shé tou", wordMeaning: "cái lưỡi", sentence: "舌头尝味道。", sentenceMeaning: "Lưỡi nếm vị ngon." },
      { char: "心", pinyin: "xīn", meaning: "trái tim", img: HANZI_IMG("xin1.webp"), emoji: "❤️", word: "开心", wordPinyin: "kāi xīn", wordMeaning: "vui vẻ", sentence: "我很开心。", sentenceMeaning: "Mình rất vui." },
    ],
  },
  {
    id: "u3",
    title: "Chùm chữ 3",
    preview: "手足身一二",
    emoji: "✋",
    cards: [
      { char: "手", pinyin: "shǒu", meaning: "bàn tay", img: HANZI_IMG("shou3.webp"), emoji: "✋", word: "手指", wordPinyin: "shǒu zhǐ", wordMeaning: "ngón tay", sentence: "我用手拿东西。", sentenceMeaning: "Mình cầm đồ bằng tay." },
      { char: "足", pinyin: "zú", meaning: "bàn chân", img: HANZI_IMG("zu2.webp"), emoji: "🦶", word: "足球", wordPinyin: "zú qiú", wordMeaning: "bóng đá", sentence: "我们踢足球。", sentenceMeaning: "Chúng mình đá bóng." },
      { char: "身", pinyin: "shēn", meaning: "cơ thể", img: HANZI_IMG("shen1.webp"), emoji: "🧍", word: "身体", wordPinyin: "shēn tǐ", wordMeaning: "cơ thể", sentence: "我的身体很好。", sentenceMeaning: "Cơ thể mình rất khỏe." },
      { char: "一", pinyin: "yī", meaning: "số một", img: HANZI_IMG("yi1.webp"), emoji: "1️⃣", word: "一起", wordPinyin: "yì qǐ", wordMeaning: "cùng nhau", sentence: "我们一起玩。", sentenceMeaning: "Chúng mình cùng chơi." },
      { char: "二", pinyin: "èr", meaning: "số hai", img: HANZI_IMG("er4.webp"), emoji: "2️⃣", word: "二月", wordPinyin: "èr yuè", wordMeaning: "tháng hai", sentence: "一加一是二。", sentenceMeaning: "Một cộng một là hai." },
    ],
  },
  {
    id: "u4",
    title: "Chùm chữ 4",
    preview: "三四五六七",
    emoji: "3️⃣",
    cards: [
      { char: "三", pinyin: "sān", meaning: "số ba", img: HANZI_IMG("san1.webp"), emoji: "3️⃣", word: "三月", wordPinyin: "sān yuè", wordMeaning: "tháng ba", sentence: "我有三个苹果。", sentenceMeaning: "Mình có ba quả táo." },
      { char: "四", pinyin: "sì", meaning: "số bốn", img: HANZI_IMG("si4.webp"), emoji: "4️⃣", word: "四季", wordPinyin: "sì jì", wordMeaning: "bốn mùa", sentence: "一年有四季。", sentenceMeaning: "Một năm có bốn mùa." },
      { char: "五", pinyin: "wǔ", meaning: "số năm", img: HANZI_IMG("wu3.webp"), emoji: "5️⃣", word: "五月", wordPinyin: "wǔ yuè", wordMeaning: "tháng năm", sentence: "我有五个手指。", sentenceMeaning: "Mình có năm ngón tay." },
      { char: "六", pinyin: "liù", meaning: "số sáu", img: HANZI_IMG("liu4.webp"), emoji: "6️⃣", word: "六月", wordPinyin: "liù yuè", wordMeaning: "tháng sáu", sentence: "桌上有六本书。", sentenceMeaning: "Trên bàn có sáu quyển sách." },
      { char: "七", pinyin: "qī", meaning: "số bảy", img: HANZI_IMG("qi1.webp"), emoji: "7️⃣", word: "七月", wordPinyin: "qī yuè", wordMeaning: "tháng bảy", sentence: "一周有七天。", sentenceMeaning: "Một tuần có bảy ngày." },
    ],
  },
  {
    id: "u5",
    title: "Chùm chữ 5",
    preview: "八九十马牛",
    emoji: "8️⃣",
    cards: [
      { char: "八", pinyin: "bā", meaning: "số tám", img: HANZI_IMG("ba1.webp"), emoji: "8️⃣", word: "八月", wordPinyin: "bā yuè", wordMeaning: "tháng tám", sentence: "我有八颗糖。", sentenceMeaning: "Mình có tám viên kẹo." },
      { char: "九", pinyin: "jiǔ", meaning: "số chín", img: HANZI_IMG("jiu3.webp"), emoji: "9️⃣", word: "九月", wordPinyin: "jiǔ yuè", wordMeaning: "tháng chín", sentence: "我数到九。", sentenceMeaning: "Mình đếm đến chín." },
      { char: "十", pinyin: "shí", meaning: "số mười", img: HANZI_IMG("shi2.webp"), emoji: "🔟", word: "十月", wordPinyin: "shí yuè", wordMeaning: "tháng mười", sentence: "我有十个手指。", sentenceMeaning: "Mình có mười ngón tay." },
      { char: "马", pinyin: "mǎ", meaning: "con ngựa", img: HANZI_IMG("ma3.webp"), emoji: "🐴", word: "小马", wordPinyin: "xiǎo mǎ", wordMeaning: "ngựa con", sentence: "小马跑得快。", sentenceMeaning: "Ngựa con chạy nhanh." },
      { char: "牛", pinyin: "niú", meaning: "con trâu", img: HANZI_IMG("niu2.webp"), emoji: "🐮", word: "牛奶", wordPinyin: "niú nǎi", wordMeaning: "sữa bò", sentence: "我喝牛奶。", sentenceMeaning: "Mình uống sữa bò." },
    ],
  },
  {
    id: "u6",
    title: "Chùm chữ 6",
    preview: "羊鱼虫鸟天",
    emoji: "🐟",
    cards: [
      { char: "羊", pinyin: "yáng", meaning: "con dê", img: HANZI_IMG("yang2.webp"), emoji: "🐐", word: "山羊", wordPinyin: "shān yáng", wordMeaning: "con dê", sentence: "小羊爱吃草。", sentenceMeaning: "Dê con thích ăn cỏ." },
      { char: "鱼", pinyin: "yú", meaning: "con cá", img: HANZI_IMG("yu2.webp"), emoji: "🐟", word: "金鱼", wordPinyin: "jīn yú", wordMeaning: "cá vàng", sentence: "小鱼在水里游。", sentenceMeaning: "Cá con bơi trong nước." },
      { char: "虫", pinyin: "chóng", meaning: "con sâu", img: HANZI_IMG("chong2.webp"), emoji: "🐛", word: "昆虫", wordPinyin: "kūn chóng", wordMeaning: "côn trùng", sentence: "小虫在爬。", sentenceMeaning: "Con sâu đang bò." },
      { char: "鸟", pinyin: "niǎo", meaning: "con chim", img: HANZI_IMG("niao3.webp"), emoji: "🐦", word: "小鸟", wordPinyin: "xiǎo niǎo", wordMeaning: "chim nhỏ", sentence: "小鸟在天上飞。", sentenceMeaning: "Chim non bay trên trời." },
      { char: "天", pinyin: "tiān", meaning: "bầu trời", img: HANZI_IMG("tian1.webp"), emoji: "🌤️", word: "天空", wordPinyin: "tiān kōng", wordMeaning: "bầu trời", sentence: "天空很蓝。", sentenceMeaning: "Bầu trời rất xanh." },
    ],
  },
  {
    id: "u7",
    title: "Chùm chữ 7",
    preview: "日月云风雨",
    emoji: "☀️",
    cards: [
      { char: "日", pinyin: "rì", meaning: "mặt trời", img: HANZI_IMG("ri4.webp"), emoji: "☀️", word: "生日", wordPinyin: "shēng rì", wordMeaning: "sinh nhật", sentence: "今天是我生日。", sentenceMeaning: "Hôm nay là sinh nhật mình." },
      { char: "月", pinyin: "yuè", meaning: "mặt trăng", img: HANZI_IMG("yue4.webp"), emoji: "🌙", word: "月亮", wordPinyin: "yuè liàng", wordMeaning: "mặt trăng", sentence: "月亮弯弯的。", sentenceMeaning: "Mặt trăng cong cong." },
      { char: "云", pinyin: "yún", meaning: "đám mây", img: HANZI_IMG("yun2.webp"), emoji: "☁️", word: "白云", wordPinyin: "bái yún", wordMeaning: "mây trắng", sentence: "天上有白云。", sentenceMeaning: "Trên trời có mây trắng." },
      { char: "风", pinyin: "fēng", meaning: "gió", img: HANZI_IMG("feng1.webp"), emoji: "🌬️", word: "大风", wordPinyin: "dà fēng", wordMeaning: "gió lớn", sentence: "今天风很大。", sentenceMeaning: "Hôm nay gió lớn lắm." },
      { char: "雨", pinyin: "yǔ", meaning: "mưa", img: HANZI_IMG("yu3.webp"), emoji: "🌧️", word: "下雨", wordPinyin: "xià yǔ", wordMeaning: "trời mưa", sentence: "天下雨了。", sentenceMeaning: "Trời mưa rồi." },
    ],
  },
  {
    id: "u8",
    title: "Chùm chữ 8",
    preview: "雪雷电田木",
    emoji: "❄️",
    cards: [
      { char: "雪", pinyin: "xuě", meaning: "tuyết", img: HANZI_IMG("xue3.webp"), emoji: "❄️", word: "下雪", wordPinyin: "xià xuě", wordMeaning: "tuyết rơi", sentence: "冬天会下雪。", sentenceMeaning: "Mùa đông trời rơi tuyết." },
      { char: "雷", pinyin: "léi", meaning: "sấm", img: HANZI_IMG("lei2.webp"), emoji: "⛈️", word: "打雷", wordPinyin: "dǎ léi", wordMeaning: "sấm nổ", sentence: "天上打雷了。", sentenceMeaning: "Trên trời có sấm rồi." },
      { char: "电", pinyin: "diàn", meaning: "điện, chớp", img: HANZI_IMG("dian4.webp"), emoji: "⚡", word: "电灯", wordPinyin: "diàn dēng", wordMeaning: "đèn điện", sentence: "电灯很亮。", sentenceMeaning: "Đèn điện sáng thật." },
      { char: "田", pinyin: "tián", meaning: "ruộng", img: HANZI_IMG("tian2.webp"), emoji: "🌾", word: "田地", wordPinyin: "tián dì", wordMeaning: "đồng ruộng", sentence: "田里有水。", sentenceMeaning: "Trong ruộng có nước." },
      { char: "木", pinyin: "mù", meaning: "gỗ, cây", img: HANZI_IMG("mu4wood.webp"), emoji: "🪵", word: "木头", wordPinyin: "mù tou", wordMeaning: "khúc gỗ", sentence: "这是木头。", sentenceMeaning: "Đây là khúc gỗ." },
    ],
  },
  {
    id: "u9",
    title: "Chùm chữ 9",
    preview: "米果瓜禾苗",
    emoji: "🍎",
    cards: [
      { char: "米", pinyin: "mǐ", meaning: "gạo", img: HANZI_IMG("mi3.webp"), emoji: "🌾", word: "大米", wordPinyin: "dà mǐ", wordMeaning: "gạo", sentence: "我吃大米。", sentenceMeaning: "Mình ăn cơm gạo." },
      { char: "果", pinyin: "guǒ", meaning: "trái cây", img: HANZI_IMG("guo3.webp"), emoji: "🍎", word: "水果", wordPinyin: "shuǐ guǒ", wordMeaning: "hoa quả", sentence: "我爱吃水果。", sentenceMeaning: "Mình thích ăn hoa quả." },
      { char: "瓜", pinyin: "guā", meaning: "quả dưa", img: HANZI_IMG("gua1.webp"), emoji: "🍉", word: "西瓜", wordPinyin: "xī guā", wordMeaning: "dưa hấu", sentence: "西瓜真甜。", sentenceMeaning: "Dưa hấu ngọt ghê." },
      { char: "禾", pinyin: "hé", meaning: "cây lúa", img: HANZI_IMG("he2.webp"), emoji: "🌾", word: "禾苗", wordPinyin: "hé miáo", wordMeaning: "mạ lúa non", sentence: "禾苗很绿。", sentenceMeaning: "Mạ lúa xanh mướt." },
      { char: "苗", pinyin: "miáo", meaning: "mầm non", img: HANZI_IMG("miao2.webp"), emoji: "🌱", word: "树苗", wordPinyin: "shù miáo", wordMeaning: "cây non", sentence: "树苗长高了。", sentenceMeaning: "Cây non lớn cao rồi." },
    ],
  },
  {
    id: "u10",
    title: "Chùm chữ 10",
    preview: "森林石亭花",
    emoji: "🌲",
    cards: [
      { char: "森", pinyin: "sēn", meaning: "rừng rậm", img: HANZI_IMG("sen1.webp"), emoji: "🌲", word: "森林", wordPinyin: "sēn lín", wordMeaning: "rừng", sentence: "森林里有小鸟。", sentenceMeaning: "Trong rừng có chú chim nhỏ." },
      { char: "林", pinyin: "lín", meaning: "rừng cây", img: HANZI_IMG("lin2.webp"), emoji: "🌳", word: "树林", wordPinyin: "shù lín", wordMeaning: "rừng cây", sentence: "树林很大。", sentenceMeaning: "Rừng cây rộng lắm." },
      { char: "石", pinyin: "shí", meaning: "hòn đá", img: HANZI_IMG("shi2rock.webp"), emoji: "🪨", word: "石头", wordPinyin: "shí tou", wordMeaning: "hòn đá", sentence: "石头很硬。", sentenceMeaning: "Hòn đá cứng ghê." },
      { char: "亭", pinyin: "tíng", meaning: "cái đình", img: HANZI_IMG("ting2.webp"), emoji: "⛩️", word: "凉亭", wordPinyin: "liáng tíng", wordMeaning: "đình mát", sentence: "凉亭里有人。", sentenceMeaning: "Trong đình mát có người." },
      { char: "花", pinyin: "huā", meaning: "bông hoa", img: HANZI_IMG("hua1.webp"), emoji: "🌸", word: "花朵", wordPinyin: "huā duǒ", wordMeaning: "đóa hoa", sentence: "花朵很香。", sentenceMeaning: "Bông hoa thơm ghê." },
    ],
  },
  {
    id: "u11",
    title: "Chùm chữ 11",
    preview: "草山叶竹水",
    emoji: "⛰️",
    cards: [
      { char: "草", pinyin: "cǎo", meaning: "cỏ", img: HANZI_IMG("cao3.webp"), emoji: "🌿", word: "小草", wordPinyin: "xiǎo cǎo", wordMeaning: "cỏ non", sentence: "小草绿绿的。", sentenceMeaning: "Cỏ non xanh xanh." },
      { char: "山", pinyin: "shān", meaning: "núi", img: HANZI_IMG("shan1.webp"), emoji: "⛰️", word: "高山", wordPinyin: "gāo shān", wordMeaning: "núi cao", sentence: "山很高。", sentenceMeaning: "Núi cao thật." },
      { char: "叶", pinyin: "yè", meaning: "chiếc lá", img: HANZI_IMG("ye4.webp"), emoji: "🍃", word: "树叶", wordPinyin: "shù yè", wordMeaning: "lá cây", sentence: "树叶绿了。", sentenceMeaning: "Lá cây xanh rồi." },
      { char: "竹", pinyin: "zhú", meaning: "cây tre", img: HANZI_IMG("zhu2.webp"), emoji: "🎋", word: "竹子", wordPinyin: "zhú zi", wordMeaning: "cây tre", sentence: "熊猫爱竹子。", sentenceMeaning: "Gấu trúc thích cây tre." },
      { char: "水", pinyin: "shuǐ", meaning: "nước", img: HANZI_IMG("shui3.webp"), emoji: "💧", word: "喝水", wordPinyin: "hē shuǐ", wordMeaning: "uống nước", sentence: "我要喝水。", sentenceMeaning: "Mình muốn uống nước." },
    ],
  },
  {
    id: "u12",
    title: "Chùm chữ 12",
    preview: "土方圆尖大",
    emoji: "🟤",
    cards: [
      { char: "土", pinyin: "tǔ", meaning: "đất", img: HANZI_IMG("tu3.webp"), emoji: "🟤", word: "泥土", wordPinyin: "ní tǔ", wordMeaning: "đất bùn", sentence: "泥土黑黑的。", sentenceMeaning: "Đất đen đen." },
      { char: "方", pinyin: "fāng", meaning: "hình vuông", img: HANZI_IMG("fang1.webp"), emoji: "⬜", word: "方块", wordPinyin: "fāng kuài", wordMeaning: "khối vuông", sentence: "桌子是方的。", sentenceMeaning: "Cái bàn hình vuông." },
      { char: "圆", pinyin: "yuán", meaning: "hình tròn", img: HANZI_IMG("yuan2.webp"), emoji: "⭕", word: "圆圈", wordPinyin: "yuán quān", wordMeaning: "vòng tròn", sentence: "月亮圆圆的。", sentenceMeaning: "Mặt trăng tròn tròn." },
      { char: "尖", pinyin: "jiān", meaning: "nhọn hoắt", img: HANZI_IMG("jian1.webp"), emoji: "🔺", word: "笔尖", wordPinyin: "bǐ jiān", wordMeaning: "đầu bút", sentence: "铅笔很尖。", sentenceMeaning: "Bút chì rất nhọn." },
      { char: "大", pinyin: "dà", meaning: "to lớn", img: HANZI_IMG("da4.webp"), emoji: "🐘", word: "大象", wordPinyin: "dà xiàng", wordMeaning: "con voi", sentence: "大象很大。", sentenceMeaning: "Con voi rất to." },
    ],
  },
  {
    id: "u13",
    title: "Chùm chữ 13",
    preview: "小高长弓刀",
    emoji: "🐭",
    cards: [
      { char: "小", pinyin: "xiǎo", meaning: "nhỏ bé", img: HANZI_IMG("xiao3.webp"), emoji: "🐭", word: "小猫", wordPinyin: "xiǎo māo", wordMeaning: "mèo con", sentence: "小猫很小。", sentenceMeaning: "Mèo con nhỏ xíu." },
      { char: "高", pinyin: "gāo", meaning: "cao", img: HANZI_IMG("gao1.webp"), emoji: "🗼", word: "高山", wordPinyin: "gāo shān", wordMeaning: "núi cao", sentence: "大树很高。", sentenceMeaning: "Cây rất cao." },
      { char: "长", pinyin: "cháng", meaning: "dài", img: HANZI_IMG("chang2.webp"), emoji: "🦒", word: "长颈鹿", wordPinyin: "cháng jǐng lù", wordMeaning: "hươu cao cổ", sentence: "长颈鹿脖子长。", sentenceMeaning: "Hươu cao cổ có cổ dài." },
      { char: "弓", pinyin: "gōng", meaning: "cây cung", img: HANZI_IMG("gong1.webp"), emoji: "🏹", word: "弓箭", wordPinyin: "gōng jiàn", wordMeaning: "cung tên", sentence: "我有一把弓。", sentenceMeaning: "Mình có một cây cung." },
      { char: "刀", pinyin: "dāo", meaning: "con dao", img: HANZI_IMG("dao1.webp"), emoji: "🔪", word: "小刀", wordPinyin: "xiǎo dāo", wordMeaning: "dao nhỏ", sentence: "妈妈用刀切菜。", sentenceMeaning: "Mẹ dùng dao cắt rau." },
    ],
  },
  {
    id: "u14",
    title: "Chùm chữ 14",
    preview: "勺面豆气分",
    emoji: "🍜",
    cards: [
      { char: "勺", pinyin: "sháo", meaning: "cái thìa", img: HANZI_IMG("shao2.webp"), emoji: "🥄", word: "勺子", wordPinyin: "sháo zi", wordMeaning: "cái thìa", sentence: "我用勺子吃饭。", sentenceMeaning: "Mình dùng thìa ăn cơm." },
      { char: "面", pinyin: "miàn", meaning: "sợi mì", img: HANZI_IMG("mian4.webp"), emoji: "🍜", word: "面条", wordPinyin: "miàn tiáo", wordMeaning: "sợi mì", sentence: "我爱吃面。", sentenceMeaning: "Mình thích ăn mì." },
      { char: "豆", pinyin: "dòu", meaning: "hạt đậu", img: HANZI_IMG("dou4.webp"), emoji: "🫘", word: "豆子", wordPinyin: "dòu zi", wordMeaning: "hạt đậu", sentence: "豆子圆圆的。", sentenceMeaning: "Hạt đậu tròn tròn." },
      { char: "气", pinyin: "qì", meaning: "không khí", img: HANZI_IMG("qi4.webp"), emoji: "💨", word: "空气", wordPinyin: "kōng qì", wordMeaning: "không khí", sentence: "天气很好。", sentenceMeaning: "Thời tiết đẹp quá." },
      { char: "分", pinyin: "fēn", meaning: "chia ra", img: HANZI_IMG("fen1.webp"), emoji: "✂️", word: "分开", wordPinyin: "fēn kāi", wordMeaning: "tách ra", sentence: "我们分西瓜。", sentenceMeaning: "Chúng mình chia dưa hấu." },
    ],
  },
  {
    id: "u15",
    title: "Chùm chữ 15",
    preview: "半点出入里",
    emoji: "🌗",
    cards: [
      { char: "半", pinyin: "bàn", meaning: "một nửa", img: HANZI_IMG("ban4.webp"), emoji: "🌗", word: "一半", wordPinyin: "yí bàn", wordMeaning: "một nửa", sentence: "我吃了一半。", sentenceMeaning: "Mình ăn hết một nửa." },
      { char: "点", pinyin: "diǎn", meaning: "dấu chấm", img: HANZI_IMG("dian3.webp"), emoji: "⚫", word: "一点", wordPinyin: "yì diǎn", wordMeaning: "một chút", sentence: "我喝一点水。", sentenceMeaning: "Mình uống một chút nước." },
      { char: "出", pinyin: "chū", meaning: "đi ra", img: HANZI_IMG("chu1.webp"), emoji: "🌅", word: "出去", wordPinyin: "chū qù", wordMeaning: "đi ra ngoài", sentence: "太阳出来了。", sentenceMeaning: "Mặt trời mọc lên rồi." },
      { char: "入", pinyin: "rù", meaning: "đi vào", img: HANZI_IMG("ru4.webp"), emoji: "🚪", word: "入口", wordPinyin: "rù kǒu", wordMeaning: "lối vào", sentence: "小鱼游入水里。", sentenceMeaning: "Cá con bơi vào trong nước." },
      { char: "里", pinyin: "lǐ", meaning: "bên trong", img: HANZI_IMG("li3.webp"), emoji: "📦", word: "里面", wordPinyin: "lǐ miàn", wordMeaning: "bên trong", sentence: "铅笔在盒子里。", sentenceMeaning: "Bút chì ở trong hộp." },
    ],
  },
  {
    id: "u16",
    title: "Chùm chữ 16",
    preview: "外开关多少",
    emoji: "🌳",
    cards: [
      { char: "外", pinyin: "wài", meaning: "bên ngoài", img: HANZI_IMG("wai4.webp"), emoji: "🌳", word: "外面", wordPinyin: "wài miàn", wordMeaning: "bên ngoài", sentence: "外面在下雨。", sentenceMeaning: "Bên ngoài đang mưa." },
      { char: "开", pinyin: "kāi", meaning: "mở ra", img: HANZI_IMG("kai1.webp"), emoji: "🔓", word: "打开", wordPinyin: "dǎ kāi", wordMeaning: "mở ra", sentence: "我打开窗户。", sentenceMeaning: "Mình mở cửa sổ." },
      { char: "关", pinyin: "guān", meaning: "đóng lại", img: HANZI_IMG("guan1.webp"), emoji: "🔒", word: "关门", wordPinyin: "guān mén", wordMeaning: "đóng cửa", sentence: "请关门。", sentenceMeaning: "Hãy đóng cửa lại." },
      { char: "多", pinyin: "duō", meaning: "nhiều", img: HANZI_IMG("duo1.webp"), emoji: "🌟", word: "很多", wordPinyin: "hěn duō", wordMeaning: "rất nhiều", sentence: "天上星星很多。", sentenceMeaning: "Trên trời có nhiều ngôi sao." },
      { char: "少", pinyin: "shǎo", meaning: "ít", img: HANZI_IMG("shao3.webp"), emoji: "🤏", word: "多少", wordPinyin: "duō shǎo", wordMeaning: "bao nhiêu", sentence: "水很少。", sentenceMeaning: "Nước rất ít." },
    ],
  },
  {
    id: "u17",
    title: "Chùm chữ 17",
    preview: "上下弯直来",
    emoji: "📏",
    cards: [
      { char: "上", pinyin: "shàng", meaning: "phía trên", img: HANZI_IMG("shang4.webp"), emoji: "⬆️", word: "早上", wordPinyin: "zǎo shang", wordMeaning: "buổi sáng", sentence: "鸟在天上。", sentenceMeaning: "Chim ở trên trời." },
      { char: "下", pinyin: "xià", meaning: "phía dưới", img: HANZI_IMG("xia4.webp"), emoji: "⬇️", word: "下雨", wordPinyin: "xià yǔ", wordMeaning: "trời mưa", sentence: "猫在下面。", sentenceMeaning: "Mèo ở phía dưới." },
      { char: "弯", pinyin: "wān", meaning: "cong, uốn cong", img: HANZI_IMG("wan1.webp"), emoji: "〰️", word: "弯曲", wordPinyin: "wān qū", wordMeaning: "cong queo", sentence: "月亮弯弯。", sentenceMeaning: "Trăng cong cong." },
      { char: "直", pinyin: "zhí", meaning: "thẳng", img: HANZI_IMG("zhi2.webp"), emoji: "📏", word: "直线", wordPinyin: "zhí xiàn", wordMeaning: "đường thẳng", sentence: "路很直。", sentenceMeaning: "Con đường rất thẳng." },
      { char: "来", pinyin: "lái", meaning: "lại đây, đến", img: HANZI_IMG("lai2.webp"), emoji: "👋", word: "回来", wordPinyin: "huí lái", wordMeaning: "trở về", sentence: "你来吧。", sentenceMeaning: "Bé lại đây nào." },
    ],
  },
  {
    id: "u18",
    title: "Chùm chữ 18",
    preview: "去吃喝吐立",
    emoji: "👅",
    cards: [
      { char: "去", pinyin: "qù", meaning: "đi", img: HANZI_IMG("qu4.webp"), emoji: "🚶", word: "出去", wordPinyin: "chū qù", wordMeaning: "đi ra ngoài", sentence: "我们去玩。", sentenceMeaning: "Chúng mình đi chơi." },
      { char: "吃", pinyin: "chī", meaning: "ăn", img: HANZI_IMG("chi1.webp"), emoji: "😋", word: "吃饭", wordPinyin: "chī fàn", wordMeaning: "ăn cơm", sentence: "我要吃饭。", sentenceMeaning: "Mình muốn ăn cơm." },
      { char: "喝", pinyin: "hē", meaning: "uống", img: HANZI_IMG("he1.webp"), emoji: "🥤", word: "喝水", wordPinyin: "hē shuǐ", wordMeaning: "uống nước", sentence: "我喝水。", sentenceMeaning: "Mình uống nước." },
      { char: "吐", pinyin: "tǔ", meaning: "nhổ ra", img: HANZI_IMG("tu3spit.webp"), emoji: "👅", word: "吐气", wordPinyin: "tǔ qì", wordMeaning: "nhả hơi ra", sentence: "鱼会吐泡泡。", sentenceMeaning: "Con cá nhả bong bóng." },
      { char: "立", pinyin: "lì", meaning: "đứng", img: HANZI_IMG("li4.webp"), emoji: "🧍", word: "站立", wordPinyin: "zhàn lì", wordMeaning: "đứng thẳng", sentence: "我们立正。", sentenceMeaning: "Chúng mình đứng nghiêm." },
    ],
  },
  {
    id: "u19",
    title: "Chùm chữ 19",
    preview: "坐走飞看问",
    emoji: "🕊️",
    cards: [
      { char: "坐", pinyin: "zuò", meaning: "ngồi", img: HANZI_IMG("zuo4.webp"), emoji: "🪑", word: "坐下", wordPinyin: "zuò xià", wordMeaning: "ngồi xuống", sentence: "请坐下。", sentenceMeaning: "Mời ngồi xuống nào." },
      { char: "走", pinyin: "zǒu", meaning: "đi bộ", img: HANZI_IMG("zou3.webp"), emoji: "👣", word: "走路", wordPinyin: "zǒu lù", wordMeaning: "đi bộ", sentence: "我会走路。", sentenceMeaning: "Mình biết đi rồi." },
      { char: "飞", pinyin: "fēi", meaning: "bay", img: HANZI_IMG("fei1.webp"), emoji: "🕊️", word: "飞机", wordPinyin: "fēi jī", wordMeaning: "máy bay", sentence: "小鸟会飞。", sentenceMeaning: "Chim nhỏ biết bay." },
      { char: "看", pinyin: "kàn", meaning: "nhìn, xem", img: HANZI_IMG("kan4.webp"), emoji: "👀", word: "看见", wordPinyin: "kàn jiàn", wordMeaning: "nhìn thấy", sentence: "我看书。", sentenceMeaning: "Mình xem sách." },
      { char: "问", pinyin: "wèn", meaning: "hỏi", img: HANZI_IMG("wen4.webp"), emoji: "❓", word: "问题", wordPinyin: "wèn tí", wordMeaning: "câu hỏi", sentence: "我问老师。", sentenceMeaning: "Mình hỏi cô giáo." },
    ],
  },
  {
    id: "u20",
    title: "Chùm chữ 20",
    preview: "哭笑车门井",
    emoji: "🚗",
    cards: [
      { char: "哭", pinyin: "kū", meaning: "khóc", img: HANZI_IMG("ku1.webp"), emoji: "😭", word: "哭泣", wordPinyin: "kū qì", wordMeaning: "khóc", sentence: "弟弟在哭。", sentenceMeaning: "Em trai đang khóc." },
      { char: "笑", pinyin: "xiào", meaning: "cười", img: HANZI_IMG("xiao4.webp"), emoji: "😄", word: "微笑", wordPinyin: "wēi xiào", wordMeaning: "mỉm cười", sentence: "妹妹笑了。", sentenceMeaning: "Em gái cười rồi." },
      { char: "车", pinyin: "chē", meaning: "xe", img: HANZI_IMG("che1.webp"), emoji: "🚗", word: "汽车", wordPinyin: "qì chē", wordMeaning: "ô tô", sentence: "我坐车。", sentenceMeaning: "Mình đi xe." },
      { char: "门", pinyin: "mén", meaning: "cửa", img: HANZI_IMG("men2.webp"), emoji: "🚪", word: "大门", wordPinyin: "dà mén", wordMeaning: "cổng lớn", sentence: "请开门。", sentenceMeaning: "Mời mở cửa nào." },
      { char: "井", pinyin: "jǐng", meaning: "giếng nước", img: HANZI_IMG("jing3.webp"), emoji: "🪣", word: "水井", wordPinyin: "shuǐ jǐng", wordMeaning: "giếng nước", sentence: "井里有水。", sentenceMeaning: "Trong giếng có nước." },
    ],
  },
  {
    id: "u21",
    title: "Chùm chữ 21",
    preview: "伞包布皮书",
    emoji: "☂️",
    cards: [
      { char: "伞", pinyin: "sǎn", meaning: "cái ô, cái dù", img: HANZI_IMG("san3.webp"), emoji: "☂️", word: "雨伞", wordPinyin: "yǔ sǎn", wordMeaning: "cái ô che mưa", sentence: "下雨打伞。", sentenceMeaning: "Trời mưa thì che ô." },
      { char: "包", pinyin: "bāo", meaning: "cái cặp, túi", img: HANZI_IMG("bao1.webp"), emoji: "🎒", word: "书包", wordPinyin: "shū bāo", wordMeaning: "cặp sách", sentence: "我背书包。", sentenceMeaning: "Mình đeo cặp sách." },
      { char: "布", pinyin: "bù", meaning: "tấm vải", img: HANZI_IMG("bu4.webp"), emoji: "🧵", word: "花布", wordPinyin: "huā bù", wordMeaning: "vải hoa", sentence: "妈妈买布。", sentenceMeaning: "Mẹ mua vải." },
      { char: "皮", pinyin: "pí", meaning: "vỏ, da", img: HANZI_IMG("pi2.webp"), emoji: "🍌", word: "皮球", wordPinyin: "pí qiú", wordMeaning: "quả bóng", sentence: "香蕉皮很滑。", sentenceMeaning: "Vỏ chuối rất trơn." },
      { char: "书", pinyin: "shū", meaning: "quyển sách", img: HANZI_IMG("shu1.webp"), emoji: "📖", word: "书包", wordPinyin: "shū bāo", wordMeaning: "cặp sách", sentence: "我爱看书。", sentenceMeaning: "Mình thích đọc sách." },
    ],
  },
  {
    id: "u22",
    title: "Chùm chữ 22",
    preview: "画灯光衣裙",
    emoji: "🎨",
    cards: [
      { char: "画", pinyin: "huà", meaning: "bức tranh, vẽ", img: HANZI_IMG("hua4.webp"), emoji: "🎨", word: "画画", wordPinyin: "huà huà", wordMeaning: "vẽ tranh", sentence: "我会画画。", sentenceMeaning: "Mình biết vẽ tranh." },
      { char: "灯", pinyin: "dēng", meaning: "cái đèn", img: HANZI_IMG("deng1.webp"), emoji: "💡", word: "台灯", wordPinyin: "tái dēng", wordMeaning: "đèn bàn", sentence: "灯亮了。", sentenceMeaning: "Đèn sáng rồi." },
      { char: "光", pinyin: "guāng", meaning: "ánh sáng", img: HANZI_IMG("guang1.webp"), emoji: "✨", word: "阳光", wordPinyin: "yáng guāng", wordMeaning: "ánh nắng", sentence: "阳光很亮。", sentenceMeaning: "Ánh nắng rất sáng." },
      { char: "衣", pinyin: "yī", meaning: "cái áo", img: HANZI_IMG("yi1robe.webp"), emoji: "👕", word: "衣服", wordPinyin: "yī fu", wordMeaning: "quần áo", sentence: "我穿衣服。", sentenceMeaning: "Mình mặc quần áo." },
      { char: "裙", pinyin: "qún", meaning: "cái váy", img: HANZI_IMG("qun2.webp"), emoji: "👗", word: "裙子", wordPinyin: "qún zi", wordMeaning: "cái váy", sentence: "妹妹穿裙子。", sentenceMeaning: "Em gái mặc váy." },
    ],
  },
  {
    id: "u23",
    title: "Chùm chữ 23",
    preview: "袜裤鞋帽毛",
    emoji: "🧦",
    cards: [
      { char: "袜", pinyin: "wà", meaning: "đôi tất", img: HANZI_IMG("wa4.webp"), emoji: "🧦", word: "袜子", wordPinyin: "wà zi", wordMeaning: "đôi tất", sentence: "我穿袜子。", sentenceMeaning: "Mình đi tất." },
      { char: "裤", pinyin: "kù", meaning: "cái quần", img: HANZI_IMG("ku4.webp"), emoji: "👖", word: "裤子", wordPinyin: "kù zi", wordMeaning: "cái quần", sentence: "弟弟穿裤子。", sentenceMeaning: "Em trai mặc quần." },
      { char: "鞋", pinyin: "xié", meaning: "đôi giày", img: HANZI_IMG("xie2.webp"), emoji: "👟", word: "鞋子", wordPinyin: "xié zi", wordMeaning: "đôi giày", sentence: "我穿鞋子。", sentenceMeaning: "Mình đi giày." },
      { char: "帽", pinyin: "mào", meaning: "cái mũ", img: HANZI_IMG("mao4.webp"), emoji: "🧢", word: "帽子", wordPinyin: "mào zi", wordMeaning: "cái mũ", sentence: "我戴帽子。", sentenceMeaning: "Mình đội mũ." },
      { char: "毛", pinyin: "máo", meaning: "lông", img: HANZI_IMG("mao2.webp"), emoji: "🪶", word: "羽毛", wordPinyin: "yǔ máo", wordMeaning: "lông vũ", sentence: "小鸟有羽毛。", sentenceMeaning: "Chim nhỏ có lông vũ." },
    ],
  },
  {
    id: "u24",
    title: "Chùm chữ 24",
    preview: "巾工厂灭火",
    emoji: "🧣",
    cards: [
      { char: "巾", pinyin: "jīn", meaning: "cái khăn", img: HANZI_IMG("jin1.webp"), emoji: "🧣", word: "毛巾", wordPinyin: "máo jīn", wordMeaning: "khăn mặt", sentence: "我用毛巾。", sentenceMeaning: "Mình dùng khăn." },
      { char: "工", pinyin: "gōng", meaning: "thợ, làm việc", img: HANZI_IMG("gong1work.webp"), emoji: "🔧", word: "工人", wordPinyin: "gōng rén", wordMeaning: "công nhân", sentence: "工人很忙。", sentenceMeaning: "Chú công nhân rất bận." },
      { char: "厂", pinyin: "chǎng", meaning: "nhà máy", img: HANZI_IMG("chang3.webp"), emoji: "🏭", word: "工厂", wordPinyin: "gōng chǎng", wordMeaning: "nhà máy", sentence: "工厂很大。", sentenceMeaning: "Nhà máy rất to." },
      { char: "灭", pinyin: "miè", meaning: "dập tắt", img: HANZI_IMG("mie4.webp"), emoji: "🧯", word: "灭火", wordPinyin: "miè huǒ", wordMeaning: "dập lửa", sentence: "水能灭火。", sentenceMeaning: "Nước dập được lửa." },
      { char: "火", pinyin: "huǒ", meaning: "ngọn lửa", img: HANZI_IMG("huo3.webp"), emoji: "🔥", word: "火车", wordPinyin: "huǒ chē", wordMeaning: "tàu hỏa", sentence: "火很热。", sentenceMeaning: "Lửa rất nóng." },
    ],
  },
  {
    id: "u25",
    title: "Chùm chữ 25",
    preview: "灰尘家爷奶",
    emoji: "🌫️",
    cards: [
      { char: "灰", pinyin: "huī", meaning: "tro, màu xám", img: HANZI_IMG("hui1.webp"), emoji: "🌫️", word: "灰色", wordPinyin: "huī sè", wordMeaning: "màu xám", sentence: "天灰灰的。", sentenceMeaning: "Trời xám xám." },
      { char: "尘", pinyin: "chén", meaning: "bụi bặm", img: HANZI_IMG("chen2.webp"), emoji: "💨", word: "灰尘", wordPinyin: "huī chén", wordMeaning: "bụi bặm", sentence: "桌子上有灰尘。", sentenceMeaning: "Trên bàn có bụi." },
      { char: "家", pinyin: "jiā", meaning: "ngôi nhà", img: HANZI_IMG("jia1.webp"), emoji: "🏠", word: "回家", wordPinyin: "huí jiā", wordMeaning: "về nhà", sentence: "我爱我的家。", sentenceMeaning: "Mình yêu ngôi nhà của mình." },
      { char: "爷", pinyin: "yé", meaning: "ông nội", img: HANZI_IMG("ye2.webp"), emoji: "👴", word: "爷爷", wordPinyin: "yé ye", wordMeaning: "ông nội", sentence: "爷爷笑了。", sentenceMeaning: "Ông cười rồi." },
      { char: "奶", pinyin: "nǎi", meaning: "bà nội", img: HANZI_IMG("nai3.webp"), emoji: "👵", word: "奶奶", wordPinyin: "nǎi nai", wordMeaning: "bà nội", sentence: "奶奶爱我。", sentenceMeaning: "Bà yêu mình." },
    ],
  },
  {
    id: "u26",
    title: "Chùm chữ 26",
    preview: "妈爸哥弟姐",
    emoji: "👩",
    cards: [
      { char: "妈", pinyin: "mā", meaning: "mẹ", img: HANZI_IMG("ma1.webp"), emoji: "👩", word: "妈妈", wordPinyin: "mā ma", wordMeaning: "mẹ", sentence: "我爱妈妈。", sentenceMeaning: "Bé yêu mẹ." },
      { char: "爸", pinyin: "bà", meaning: "bố", img: HANZI_IMG("ba4.webp"), emoji: "👨", word: "爸爸", wordPinyin: "bà ba", wordMeaning: "bố", sentence: "爸爸很高。", sentenceMeaning: "Bố rất cao." },
      { char: "哥", pinyin: "gē", meaning: "anh trai", img: HANZI_IMG("ge1.webp"), emoji: "👦", word: "哥哥", wordPinyin: "gē ge", wordMeaning: "anh trai", sentence: "哥哥爱我。", sentenceMeaning: "Anh yêu bé." },
      { char: "弟", pinyin: "dì", meaning: "em trai", img: HANZI_IMG("di4.webp"), emoji: "👶", word: "弟弟", wordPinyin: "dì di", wordMeaning: "em trai", sentence: "弟弟很小。", sentenceMeaning: "Em trai còn nhỏ xíu." },
      { char: "姐", pinyin: "jiě", meaning: "chị gái", img: HANZI_IMG("jie3.webp"), emoji: "👧", word: "姐姐", wordPinyin: "jiě jie", wordMeaning: "chị gái", sentence: "姐姐真好。", sentenceMeaning: "Chị thật tốt bụng." },
    ],
  },
  {
    id: "u27",
    title: "Chùm chữ 27",
    preview: "妹我你男女",
    emoji: "👧",
    cards: [
      { char: "妹", pinyin: "mèi", meaning: "em gái", img: HANZI_IMG("mei4.webp"), emoji: "👧", word: "妹妹", wordPinyin: "mèi mei", wordMeaning: "em gái", sentence: "妹妹笑了。", sentenceMeaning: "Em gái cười rồi." },
      { char: "我", pinyin: "wǒ", meaning: "mình, tôi", img: HANZI_IMG("wo3.webp"), emoji: "🙋", word: "我们", wordPinyin: "wǒ men", wordMeaning: "chúng mình", sentence: "我很开心。", sentenceMeaning: "Mình rất vui." },
      { char: "你", pinyin: "nǐ", meaning: "bạn", img: HANZI_IMG("ni3.webp"), emoji: "🫵", word: "你好", wordPinyin: "nǐ hǎo", wordMeaning: "xin chào", sentence: "你真好。", sentenceMeaning: "Bạn thật tốt." },
      { char: "男", pinyin: "nán", meaning: "con trai", img: HANZI_IMG("nan2.webp"), emoji: "👦", word: "男孩", wordPinyin: "nán hái", wordMeaning: "bé trai", sentence: "他是男孩。", sentenceMeaning: "Bạn ấy là bé trai." },
      { char: "女", pinyin: "nǚ", meaning: "con gái", img: HANZI_IMG("nv3.webp"), emoji: "👧", word: "女孩", wordPinyin: "nǚ hái", wordMeaning: "bé gái", sentence: "她是女孩。", sentenceMeaning: "Bạn ấy là bé gái." },
    ],
  },
  {
    id: "u28",
    title: "Chùm chữ 28",
    preview: "前后左右东",
    emoji: "🧭",
    cards: [
      { char: "前", pinyin: "qián", meaning: "phía trước", img: HANZI_IMG("qian2.webp"), emoji: "🔜", word: "前面", wordPinyin: "qián miàn", wordMeaning: "phía trước", sentence: "前面有花。", sentenceMeaning: "Phía trước có hoa." },
      { char: "后", pinyin: "hòu", meaning: "phía sau", img: HANZI_IMG("hou4.webp"), emoji: "🔙", word: "后面", wordPinyin: "hòu miàn", wordMeaning: "phía sau", sentence: "后面有猫。", sentenceMeaning: "Phía sau có chú mèo." },
      { char: "左", pinyin: "zuǒ", meaning: "bên trái", img: HANZI_IMG("zuo3.webp"), emoji: "👈", word: "左手", wordPinyin: "zuǒ shǒu", wordMeaning: "tay trái", sentence: "我用左手。", sentenceMeaning: "Bé dùng tay trái." },
      { char: "右", pinyin: "yòu", meaning: "bên phải", img: HANZI_IMG("you4.webp"), emoji: "👉", word: "右手", wordPinyin: "yòu shǒu", wordMeaning: "tay phải", sentence: "我用右手。", sentenceMeaning: "Bé dùng tay phải." },
      { char: "东", pinyin: "dōng", meaning: "phương đông", img: HANZI_IMG("dong1.webp"), emoji: "🌅", word: "东边", wordPinyin: "dōng biān", wordMeaning: "phía đông", sentence: "太阳在东边。", sentenceMeaning: "Mặt trời ở phía đông." },
    ],
  },
  {
    id: "u29",
    title: "Chùm chữ 29",
    preview: "西南北中",
    emoji: "🎯",
    cards: [
      { char: "西", pinyin: "xī", meaning: "phương tây", img: HANZI_IMG("xi1.webp"), emoji: "🌇", word: "西边", wordPinyin: "xī biān", wordMeaning: "phía tây", sentence: "太阳在西边。", sentenceMeaning: "Mặt trời ở phía tây." },
      { char: "南", pinyin: "nán", meaning: "phương nam", img: HANZI_IMG("nan2south.webp"), emoji: "🏝️", word: "南方", wordPinyin: "nán fāng", wordMeaning: "phương nam", sentence: "南方很热。", sentenceMeaning: "Phương nam rất nóng." },
      { char: "北", pinyin: "běi", meaning: "phương bắc", img: HANZI_IMG("bei3.webp"), emoji: "🧭", word: "北方", wordPinyin: "běi fāng", wordMeaning: "phương bắc", sentence: "北方很冷。", sentenceMeaning: "Phương bắc rất lạnh." },
      { char: "中", pinyin: "zhōng", meaning: "ở giữa", img: HANZI_IMG("zhong1.webp"), emoji: "🎯", word: "中间", wordPinyin: "zhōng jiān", wordMeaning: "ở giữa", sentence: "我坐中间。", sentenceMeaning: "Bé ngồi ở giữa." },
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
