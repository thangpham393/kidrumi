"use client";

import { useEffect } from "react";
import { speak } from "@/components/speak";
import type { HanziCard } from "@/app/chinese/hanzi/data";

// Bước 认 — gặp mặt chữ: chữ lớn trong 田字格, pinyin, nghe đọc.
export default function StepRecognize({
  card,
  done,
  onDone,
}: {
  card: HanziCard;
  done: boolean;
  onDone: () => void;
}) {
  const say = () => speak(card.char, "zh");

  // Đọc chữ ngay khi mở bước này cho bé nghe.
  useEffect(() => {
    const t = setTimeout(say, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.char]);

  return (
    <div className="hz-step hz-step-recognize">
      <button className="hz-tian hz-tian-lg" onClick={say} aria-label={`Nghe đọc ${card.char}`}>
        <span className="hz-tian-char">{card.char}</span>
      </button>

      <button className="hz-pinyin" onClick={say} aria-label="Nghe pinyin">
        <span aria-hidden>🔊</span> {card.pinyin}
      </button>
      <p className="hz-mean">{card.meaning}</p>

      <button className="btn hz-step-cta" onClick={onDone}>
        {done ? "Đã nhận biết ✓" : "Bé nhớ rồi →"}
      </button>
    </div>
  );
}
