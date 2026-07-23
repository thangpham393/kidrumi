// Dữ liệu thư viện Shadowing.
// SCAFFOLD: transcript do người soạn (không cần khớp 100% audio để cơ chế highlight chạy —
// highlight bám theo mốc thời gian `t` của trình phát YouTube). Thay `youtubeId` bằng ID
// video thật khi có; các mốc `t` (giây) chỉ cần < thời lượng video là được.

// Video nạp tự động qua `scripts/import-shadowing.mjs` được ghi vào file JSON này
// và gộp vào `videos` bên dưới. File có thể là mảng rỗng khi chưa import gì.
import generatedVideos from "./videos.generated.json";

export type Lang = "en" | "zh";
// Độ khó: de/mid/hard (thang tự đánh giá) + l1… (thang riêng của bộ Little Fox: Level 1, 2…).
export type Level = "de" | "mid" | "hard" | "l1" | "l2" | "kelly" | "ft1" | "ft2";

// Một câu trong transcript. `t` = mốc bắt đầu (giây). `tr` = bản dịch tiếng Việt.
// `words` = từ/cụm từ đáng chú ý; `ph` là phiên âm (IPA cho tiếng Anh, pinyin cho tiếng Trung).
// `py` (chỉ tiếng Trung) = pinyin từng chữ Hán, cách nhau bằng dấu cách, ĐÚNG THỨ TỰ &
// SỐ LƯỢNG với các chữ Hán trong `text` — để render ruby (phiên âm trên đầu chữ).
export type Word = { w: string; ph?: string; mean: string };
export type Segment = { t: number; text: string; tr: string; words?: Word[]; py?: string };

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
export const levelLabel: Record<Level, string> = {
  de: "Dễ",
  mid: "Trung bình",
  hard: "Khó",
  l1: "Early Learning 1",
  l2: "Early Learning 2",
  kelly: "Kelly's Class",
  ft1: "Folktales 1",
  ft2: "Folktales 2",
};
// Lớp CSS phủ màu badge độ khó. l1 xanh dương (blue), l2 tím (brand) cho khác thang de/mid/hard.
// kelly (Little Fox Mrs. Kelly's Class) dùng hồng (pink) cho khác các thang khác.
export const levelCls: Record<Level, string> = { de: "", mid: "mid", hard: "hard", l1: "l1", l2: "l2", kelly: "kelly", ft1: "ft1", ft2: "ft2" };
// Thứ tự ưu tiên khi hiện pill lọc độ khó.
const levelOrder: Level[] = ["de", "mid", "hard", "l1", "l2", "kelly", "ft1", "ft2"];

// Video soạn tay (scaffold ban đầu). Video nạp tự động nằm trong videos.generated.json.
const seedVideos: Video[] = [];

// Danh sách cuối = video soạn tay + video nạp tự động. JSON không giữ được kiểu
// literal (Lang/Level) nên ép kiểu qua unknown.
export const videos: Video[] = [
  ...seedVideos,
  ...(generatedVideos as unknown as Video[]),
];

// Nguồn (source) tự suy ra từ danh sách video thực tế: thêm video nguồn mới qua
// script import là nó tự xuất hiện trong bộ lọc, không cần sửa tay ở đây.
export const sourcesByLang: Record<Lang, string[]> = {
  en: deriveSources("en"),
  zh: deriveSources("zh"),
};

function deriveSources(lang: Lang): string[] {
  const list: string[] = [];
  for (const v of videos) {
    if (v.lang === lang && !list.includes(v.source)) list.push(v.source);
  }
  return ["Tất cả", ...list];
}

// Độ khó cũng suy ra từ video thực tế: EN dùng de/mid/hard, ZH có thêm "Level 1"
// của Little Fox. Video nhập mới có độ khó nào là tự xuất hiện trong bộ lọc.
export const levelsByLang: Record<Lang, Level[]> = {
  en: deriveLevels("en"),
  zh: deriveLevels("zh"),
};

function deriveLevels(lang: Lang): Level[] {
  const present = new Set<Level>();
  for (const v of videos) if (v.lang === lang) present.add(v.level);
  return levelOrder.filter((lv) => present.has(lv));
}

// Độ khó theo NGUỒN đang chọn: chọn "Little Fox" chỉ hiện độ khó có trong Little Fox,
// "Tất cả" hiện mọi độ khó của ngôn ngữ đó — tránh việc chọn nguồn + độ khó lệch nhau
// ra danh sách rỗng.
export function levelsFor(lang: Lang, source: string): Level[] {
  const present = new Set<Level>();
  for (const v of videos) {
    if (v.lang === lang && (source === "Tất cả" || v.source === source)) present.add(v.level);
  }
  return levelOrder.filter((lv) => present.has(lv));
}

export function videosByLang(lang: Lang): Video[] {
  return videos.filter((v) => v.lang === lang);
}

// Tab ngôn ngữ mở đầu: ưu tiên EN nếu có video, không thì ZH — tránh mở vào tab rỗng.
export const defaultLang: Lang = videos.some((v) => v.lang === "en") ? "en" : "zh";

export function getVideo(id: string): Video | undefined {
  return videos.find((v) => v.id === id);
}

// "mm:ss" từ số giây — dùng cho nhãn mốc thời gian trong transcript.
export function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
