// Cấu hình lộ trình Nghe & chọn cho tiếng Trung: chuẩn hoá kho từ (data.ts) sang
// LtWord (kèm pinyin ở hint) rồi dựng roadmap. Dùng chung cho trang lộ trình + chặng.

import { GROUPS, PROMPTS as ZH_PROMPTS } from "./data";
import { buildRoadmap, type NormTopic } from "@/components/listen/roadmap";
import type { LtWord } from "@/components/listen/types";

const topics: NormTopic[] = GROUPS.map((g) => ({
  key: g.key,
  words: g.words.map(
    (w): LtWord => ({
      key: w.hanzi,
      term: w.hanzi,
      hint: w.pinyin,
      vi: w.vi,
      emoji: w.emoji,
    }),
  ),
}));

export const ROADMAP = buildRoadmap(topics);
export const PROMPTS = ZH_PROMPTS;
export const LANG = "zh";
export const VARIANT: string | undefined = "zh";
export const BASE_PATH = "/chinese/listen";
export const BACK_HREF = "/chinese";
export const BACK_LABEL = "Tiếng Trung";
export const EYEBROW = "GÓC TIẾNG TRUNG";
export const TITLE = "Lộ trình Nghe & chọn";
