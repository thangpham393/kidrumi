"use client";

import HanziIllus from "@/components/hanzi/HanziIllus";
import { speak } from "@/components/speak";
import type { HanziCard } from "@/app/chinese/hanzi/data";

// Bước 学 — học nghĩa: chữ + hình minh hoạ + từ ghép + câu ví dụ (bấm để nghe).
export default function StepLearn({
  card,
  done,
  onDone,
}: {
  card: HanziCard;
  done: boolean;
  onDone: () => void;
}) {
  return (
    <div className="hz-step hz-step-learn">
      <div className="hz-learn-top">
        <button
          className="hz-tian"
          onClick={() => speak(card.char, "zh")}
          aria-label={`Nghe đọc ${card.char}`}
        >
          <span className="hz-tian-char">{card.char}</span>
        </button>
        <div className="hz-learn-illus-box">
          <HanziIllus src={card.img} emoji={card.emoji} className="hz-learn-emoji" alt={card.meaning} />
        </div>
      </div>
      <div className="hz-learn-caption">
        <span className="hz-learn-pinyin">{card.pinyin}</span>
        <span className="hz-learn-mean">{card.meaning}</span>
      </div>

      <button
        className="hz-word"
        onClick={() => speak(card.word, "zh")}
        aria-label={`Nghe từ ${card.word}`}
      >
        <span className="hz-word-txt">
          <b>{card.word}</b>
          <i>{card.wordPinyin}</i>
          <em>{card.wordMeaning}</em>
        </span>
        <span aria-hidden className="hz-word-spk">🔊</span>
      </button>

      <button
        className="hz-sentence"
        onClick={() => speak(card.sentence, "zh")}
        aria-label="Nghe câu ví dụ"
      >
        <span className="hz-sentence-zh">{card.sentence}</span>
        <span className="hz-sentence-vi">{card.sentenceMeaning}</span>
        <span aria-hidden className="hz-word-spk sm">🔊</span>
      </button>

      <button className="btn hz-step-cta" onClick={onDone}>
        {done ? "Đã học ✓" : "Học xong →"}
      </button>
    </div>
  );
}
