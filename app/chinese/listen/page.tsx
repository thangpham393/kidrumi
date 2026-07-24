"use client";

import ListenTouch, { type LtWord } from "@/components/ListenTouch";
import { ALL_WORDS, PROMPTS } from "./data";

const words: LtWord[] = ALL_WORDS.map((w) => ({
  key: w.hanzi,
  term: w.hanzi,
  hint: w.pinyin, // pinyin hiện nhỏ dưới câu lệnh
  vi: w.vi,
  emoji: w.emoji,
}));

export default function ChineseListenPage() {
  return (
    <ListenTouch
      words={words}
      prompts={PROMPTS}
      lang="zh"
      title="听一听 · 点一点"
      backHref="/chinese"
      backLabel="Tiếng Trung"
    />
  );
}
