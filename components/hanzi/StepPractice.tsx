"use client";

import { useEffect, useState } from "react";
import HanziIllus from "@/components/hanzi/HanziIllus";
import { speak } from "@/components/speak";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { UNITS, type HanziCard } from "@/app/chinese/hanzi/data";

const POOL = UNITS.flatMap((u) => u.cards.map((c) => c.char));

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Bước 练 — luyện chọn: hiện hình + pinyin, bé chọn đúng chữ trong 4 ô.
export default function StepPractice({
  card,
  done,
  onDone,
}: {
  card: HanziCard;
  done: boolean;
  onDone: () => void;
}) {
  // Tạo lựa chọn sau khi mount (dùng Math.random → tránh lệch hydration).
  const [options, setOptions] = useState<string[] | null>(null);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);

  useEffect(() => {
    const distractors = shuffle(POOL.filter((c) => c !== card.char)).slice(0, 3);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptions(shuffle([card.char, ...distractors]));
    setSolved(false);
    setWrong(null);
    speak(card.char, "zh");
  }, [card.char]);

  const pick = (choice: string, e: React.MouseEvent) => {
    if (solved) return;
    if (choice === card.char) {
      setSolved(true);
      playSuccess();
      confettiBurst(e.clientX, e.clientY);
      onDone();
    } else {
      setWrong(choice);
      playWrong();
      setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <div className="hz-step hz-step-practice">
      <button
        className="hz-practice-prompt"
        onClick={() => speak(card.char, "zh")}
        aria-label="Nghe lại"
      >
        <span className="hz-practice-illus">
          <HanziIllus src={card.img} emoji={card.emoji} className="hz-practice-emoji" alt={card.meaning} />
        </span>
        <span className="hz-practice-pinyin">{card.pinyin}</span>
      </button>

      <p className="hz-practice-ask">Chữ nào đúng nào? 🤔</p>

      <div className="hz-practice-opts">
        {(options ?? [card.char]).map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            className={`hz-opt lt-zh-font ${solved && opt === card.char ? "right" : ""} ${wrong === opt ? "wrong" : ""}`}
            onClick={(e) => pick(opt, e)}
            disabled={solved}
          >
            {opt}
          </button>
        ))}
      </div>

      {(solved || done) && <p className="hz-practice-ok">Giỏi quá! ⭐</p>}
    </div>
  );
}
