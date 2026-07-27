// Cấu hình lộ trình Nghe & chọn cho tiếng Anh: chuẩn hoá kho từ (data.ts) sang LtWord
// rồi dựng roadmap. Dùng chung cho trang lộ trình và trang từng chặng ([lesson]).

import { GROUPS, PROMPTS as EN_PROMPTS } from "./data";
import { buildRoadmap, type NormTopic } from "@/components/listen/roadmap";
import type { LtWord } from "@/components/listen/types";

const topics: NormTopic[] = GROUPS.map((g) => ({
  key: g.key,
  words: g.words.map(
    (w): LtWord => ({ key: w.en, term: w.en, vi: w.vi, emoji: w.emoji }),
  ),
}));

export const ROADMAP = buildRoadmap(topics);
export const PROMPTS = EN_PROMPTS;
export const LANG = "en";
export const VARIANT: string | undefined = undefined;
export const BASE_PATH = "/english/listen";
export const BACK_HREF = "/english";
export const BACK_LABEL = "Tiếng Anh";
export const EYEBROW = "GÓC TIẾNG ANH";
export const TITLE = "Lộ trình Nghe & chọn";
