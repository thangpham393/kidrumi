// Dựng "lộ trình" (roadmap) cho trò Nghe & chọn từ kho từ theo chủ đề.
// Mỗi chủ đề = 1 dải (band) gồm 4 chặng: Làm quen → Phân biệt → Nghe mẫu → Cầu vượt,
// khó dần bằng số hình để chọn (2 → 3 → 4 → 4 + trộn chủ đề trước).
// Cứ sau 2 chủ đề chèn 1 dải "Ôn tập nhanh" (2 chặng) ôn lại từ đã học.
// Mở khoá tuyến tính: xong chặng trước mới mở chặng sau. Mỗi chặng 10 câu.

import type { LtWord } from "./types";
import { TOPIC_ORDER } from "./topics";

export type NormTopic = { key: string; words: LtWord[] };

export type Lesson = {
  id: string; // định danh duy nhất, ổn định (dùng trong URL + localStorage)
  topicKey: string;
  icon: string; // emoji chủ đề
  color: string; // biến màu chủ đạo cho đốt (var(--brand) / var(--amber)…)
  topicLabel: string; // nhãn ngắn chủ đề (vd "Con vật")
  stage: string; // tên chặng (vd "Phân biệt")
  blurb: string; // mô tả ngắn khi mở
  choices: number; // số hình để bé chọn (2..4)
  total: number; // số câu
  showLabel: boolean; // hiện chữ dưới hình (chặng Làm quen)
  words: LtWord[]; // kho từ đích
  distractors: LtWord[]; // kho hình gây nhiễu (⊇ words)
};

export type Band = {
  key: string;
  kind: "topic" | "review";
  icon: string;
  label: string; // nhãn dải
  eyebrow: string; // nhãn nhỏ phía trên (CHỦ ĐỀ / ÔN TẬP NHANH)
  color: string;
  lessons: Lesson[];
};

export type Roadmap = { bands: Band[]; lessons: Lesson[] };

const TOTAL = 10; // 10 câu mỗi chặng

// Cấu hình 4 chặng trong một chủ đề (số hình chọn tăng dần).
const STAGES = [
  { slug: "lam-quen", name: "Làm quen", choices: 2, showLabel: true, blurb: "Nghe từ rồi chạm đúng hình — có kèm chữ để bé nhớ mặt từ." },
  { slug: "phan-biet", name: "Phân biệt", choices: 3, showLabel: false, blurb: "Ba hình để chọn — nghe kỹ rồi chạm đúng nhé!" },
  { slug: "nghe-mau", name: "Nghe mẫu", choices: 4, showLabel: false, blurb: "Bốn hình để chọn — bé đã quen rồi, cố lên!" },
  { slug: "cau-vuot", name: "Cầu vượt", choices: 4, showLabel: false, blurb: "Chặng khó: trộn thêm từ chủ đề trước. Vượt qua để mở chủ đề mới!" },
];

// Trộn nhẹ để pool nhiễu không cố định thứ tự (không dùng random — build tĩnh, tránh
// lệch hydration; chỉ đảo theo chỉ số cho đa dạng).
function merge(...pools: LtWord[][]): LtWord[] {
  const seen = new Set<string>();
  const out: LtWord[] = [];
  for (const p of pools) {
    for (const w of p) {
      if (seen.has(w.key)) continue;
      seen.add(w.key);
      out.push(w);
    }
  }
  return out;
}

/**
 * Dựng lộ trình từ danh sách chủ đề đã chuẩn hoá (mỗi chủ đề kèm LtWord[]).
 * Thứ tự chủ đề lấy theo TOPIC_ORDER; bỏ qua chủ đề không có từ.
 */
export function buildRoadmap(topics: NormTopic[]): Roadmap {
  const byKey = new Map(topics.map((t) => [t.key, t.words]));
  const ordered = TOPIC_ORDER.filter((t) => (byKey.get(t.key)?.length ?? 0) >= 4);

  const bands: Band[] = [];
  const flat: Lesson[] = [];
  let prevWords: LtWord[] = []; // từ của chủ đề ngay trước (trộn cho "Cầu vượt")
  let blockWords: LtWord[] = []; // từ tích luỹ trong khối 2 chủ đề (cho ôn tập)
  let reviewIdx = 0;

  ordered.forEach((meta, i) => {
    const words = byKey.get(meta.key) ?? [];
    const lessons: Lesson[] = STAGES.map((s) => {
      const isBoss = s.slug === "cau-vuot";
      const distractors = isBoss ? merge(words, prevWords) : words;
      const lesson: Lesson = {
        id: `${meta.key}-${s.slug}`,
        topicKey: meta.key,
        icon: meta.icon,
        color: "var(--brand)",
        topicLabel: meta.label,
        stage: s.name,
        blurb: s.blurb,
        choices: s.choices,
        total: TOTAL,
        showLabel: s.showLabel,
        words,
        distractors,
      };
      flat.push(lesson);
      return lesson;
    });
    bands.push({
      key: meta.key,
      kind: "topic",
      icon: meta.icon,
      label: meta.label,
      eyebrow: "CHỦ ĐỀ",
      color: "var(--brand)",
      lessons,
    });

    prevWords = words;
    blockWords = merge(blockWords, words);

    // Sau mỗi 2 chủ đề (hoặc ở chủ đề cuối) → chèn 1 dải ôn tập.
    const isLast = i === ordered.length - 1;
    if ((i % 2 === 1 || isLast) && blockWords.length >= 4) {
      reviewIdx += 1;
      const pool = blockWords;
      const rl: Lesson[] = [
        {
          id: `review-${reviewIdx}-nho-tu`,
          topicKey: `review-${reviewIdx}`,
          icon: "🧠",
          color: "var(--amber)",
          topicLabel: "Ôn tập",
          stage: "Nhớ từ",
          blurb: "Ôn lại các từ vừa học — ba hình để chọn.",
          choices: 3,
          total: TOTAL,
          showLabel: false,
          words: pool,
          distractors: pool,
        },
        {
          id: `review-${reviewIdx}-thu-thach`,
          topicKey: `review-${reviewIdx}`,
          icon: "🏆",
          color: "var(--amber)",
          topicLabel: "Ôn tập",
          stage: "Thử thách",
          blurb: "Thử thách trí nhớ — bốn hình để chọn. Cố lên nhé!",
          choices: 4,
          total: TOTAL,
          showLabel: false,
          words: pool,
          distractors: pool,
        },
      ];
      rl.forEach((l) => flat.push(l));
      bands.push({
        key: `review-${reviewIdx}`,
        kind: "review",
        icon: "🌟",
        label: "Ôn tập nhanh",
        eyebrow: "CHẶNG THƯỞNG",
        color: "var(--amber)",
        lessons: rl,
      });
      blockWords = []; // mở khối mới
    }
  });

  return { bands, lessons: flat };
}

// Tìm chặng theo id (dùng ở trang [lesson]).
export function findLesson(rm: Roadmap, id: string): Lesson | undefined {
  return rm.lessons.find((l) => l.id === id);
}
