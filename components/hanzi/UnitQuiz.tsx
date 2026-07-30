"use client";

// Thử thách "Luyện tập tổng hợp" cho 5 chữ vừa học trong một chùm chữ.
// 3 dạng bài xoay vòng, kiểm tra bé đã nhớ MẶT CHỮ chưa:
//   • listen   — nghe phát âm, chọn chữ đúng (4 ô chữ)
//   • img2char — nhìn hình minh hoạ, chọn chữ đúng (4 ô chữ)
//   • char2img — nhìn chữ, chọn hình minh hoạ đúng (4 ô tranh)  ← ngược lại
//
// Bé phải chọn đúng mới qua câu; chọn sai thì rung + cho thử lại (đếm là 1 lỗi).
// Điểm = số câu đúng ngay lần đầu. Xong: sao vàng theo thành tích + confetti.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChild } from "@/components/ChildContext";
import { speak } from "@/components/speak";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { useRecordActivity } from "@/lib/missions";
import HanziIllus from "@/components/hanzi/HanziIllus";
import { useQuizProgress } from "@/components/hanzi/quizProgress";
import type { HanziCard, HanziUnit } from "@/app/chinese/hanzi/data";

type QType = "listen" | "img2char" | "char2img";
type Question = { card: HanziCard; type: QType; options: HanziCard[] };

const TYPES: QType[] = ["listen", "img2char", "char2img"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sinh bộ câu hỏi cân bằng: mỗi chữ xuất hiện, các dạng bài xoay vòng đều nhau.
function buildQuestions(cards: HanziCard[]): Question[] {
  const total = Math.min(8, cards.length * 2); // 4–5 chữ → 8 câu, vừa sức bé
  const order = shuffle(cards.map((_, i) => i));
  const typeOrder = shuffle(TYPES);
  const qs: Question[] = [];
  for (let i = 0; i < total; i++) {
    const card = cards[order[i % order.length]];
    const type = typeOrder[i % TYPES.length];
    const distractors = shuffle(cards.filter((c) => c.char !== card.char)).slice(0, 3);
    qs.push({ card, type, options: shuffle([card, ...distractors]) });
  }
  return qs;
}

const ASK: Record<QType, string> = {
  listen: "Nghe rồi chọn chữ đúng nhé! 👂",
  img2char: "Hình này là chữ nào? 🖼️",
  char2img: "Chữ này là hình nào? 🔎",
};

export default function UnitQuiz({ unit }: { unit: HanziUnit }) {
  const { child, addStars } = useChild();
  const record = useRecordActivity();
  const { save } = useQuizProgress(child?.id ?? null);

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0); // số câu đúng ngay lần đầu (để hiển thị)
  const scoreRef = useRef(0); // bản đồng bộ ngay để chốt điểm câu cuối không bị trễ state
  const [firstTry, setFirstTry] = useState(true); // câu hiện tại chưa sai lần nào?
  const [picked, setPicked] = useState<string | null>(null); // chữ vừa chọn (đúng)
  const [wrong, setWrong] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const start = useCallback(() => {
    setQuestions(buildQuestions(unit.cards));
    setIdx(0);
    setCorrect(0);
    scoreRef.current = 0;
    setFirstTry(true);
    setPicked(null);
    setWrong(null);
    setFinished(false);
  }, [unit.cards]);

  // Tạo câu hỏi sau khi mount (Math.random → tránh lệch hydration).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    start();
  }, [start]);

  const q = questions?.[idx] ?? null;

  // Đọc phát âm cho câu dạng "nghe" mỗi khi sang câu mới.
  useEffect(() => {
    if (q?.type === "listen") speak(q.card.char, "zh");
  }, [q]);

  const finish = useCallback(
    (finalCorrect: number, total: number) => {
      setFinished(true);
      playSuccess();
      setTimeout(() => confettiBurst(), 150);
      const firstTime = save(unit.id, finalCorrect, total);
      record("hanzi", `quiz-${unit.id}`);
      if (firstTime) addStars(3); // thưởng cả lượt, chỉ lần đầu để không farm sao
    },
    [save, unit.id, record, addStars],
  );

  const next = useCallback(() => {
    const total = questions?.length ?? 0;
    if (idx + 1 >= total) {
      finish(scoreRef.current, total); // ref → gồm cả điểm câu vừa trả lời
      return;
    }
    setIdx((i) => i + 1);
    setFirstTry(true);
    setPicked(null);
    setWrong(null);
  }, [idx, questions, finish]);

  const pick = useCallback(
    (choice: HanziCard, e: React.MouseEvent) => {
      if (!q || picked) return;
      if (choice.char === q.card.char) {
        setPicked(choice.char);
        playSuccess();
        confettiBurst(e.clientX, e.clientY);
        if (firstTry) {
          scoreRef.current += 1;
          setCorrect((c) => c + 1);
        }
        setTimeout(next, 850);
      } else {
        setWrong(choice.char);
        setFirstTry(false);
        playWrong();
        setTimeout(() => setWrong(null), 500);
      }
    },
    [q, picked, firstTry, next],
  );

  if (!q && !finished) {
    return <div className="hzq-loading" aria-hidden />;
  }

  // ---- Màn kết quả ----
  if (finished) {
    const total = questions?.length ?? 0;
    const stars = correct >= total ? 3 : correct >= Math.ceil(total * 0.6) ? 2 : 1;
    const perfect = correct >= total;
    return (
      <div className="hzq-result lt-result">
        <div className="hzq-result-stars" aria-label={`${stars} trên 3 sao`}>
          {[0, 1, 2].map((s) => (
            <span key={s} className={`hzq-rstar ${s < stars ? "on" : ""}`}>★</span>
          ))}
        </div>
        <div className="lt-result-emoji" aria-hidden>{perfect ? "🏆" : "🎉"}</div>
        <h2>{perfect ? "Xuất sắc!" : "Giỏi quá!"}</h2>
        <p>
          Bé trả lời đúng <b>{correct}/{total}</b> câu.{" "}
          {perfect ? "Nhớ hết mặt chữ luôn rồi! 🌟" : "Chơi lại để nhớ kỹ hơn nhé!"}
        </p>
        <div className="lt-result-actions">
          <button className="btn btn-block" onClick={start}>Chơi lại 🔁</button>
          <Link href={`/chinese/hanzi/${unit.id}`} className="btn-ghost">
            ← Về danh sách chữ
          </Link>
        </div>
      </div>
    );
  }

  const total = questions?.length ?? 0;
  const charOptions = q!.type === "char2img" ? false : true;

  return (
    <>
      {/* Thanh tiến độ: 1 chấm cho mỗi câu */}
      <div className="hzq-dots" aria-label={`Câu ${idx + 1} trên ${total}`}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`hzq-dot ${i < idx ? "done" : ""} ${i === idx ? "now" : ""}`} />
        ))}
      </div>

      <div className="hzq-stage">
        {/* Đề bài */}
        {q!.type === "listen" && (
          <button
            className="hzq-listen"
            onClick={() => speak(q!.card.char, "zh")}
            aria-label="Nghe lại"
          >
            <span className="hzq-listen-ic" aria-hidden>🔊</span>
            <span className="hzq-listen-hint">Bấm để nghe lại</span>
          </button>
        )}
        {q!.type === "img2char" && (
          <div className="hzq-illus-box">
            <HanziIllus src={q!.card.img} emoji={q!.card.emoji} className="hzq-illus" alt={q!.card.meaning} />
          </div>
        )}
        {q!.type === "char2img" && (
          <button
            className="hz-tian hzq-tian"
            onClick={() => speak(q!.card.char, "zh")}
            aria-label={`Nghe chữ ${q!.card.char}`}
          >
            <span className="hz-tian-char">{q!.card.char}</span>
          </button>
        )}

        <p className="hzq-ask">{ASK[q!.type]}</p>

        {/* Lựa chọn */}
        {charOptions ? (
          <div className="hz-practice-opts">
            {q!.options.map((opt, i) => (
              <button
                key={`${opt.char}-${i}`}
                className={`hz-opt lt-zh-font ${picked === opt.char ? "right" : ""} ${wrong === opt.char ? "wrong" : ""}`}
                onClick={(e) => pick(opt, e)}
                disabled={!!picked}
              >
                {opt.char}
              </button>
            ))}
          </div>
        ) : (
          <div className="hzq-imgopts">
            {q!.options.map((opt, i) => (
              <button
                key={`${opt.char}-${i}`}
                className={`hzq-imgopt ${picked === opt.char ? "right" : ""} ${wrong === opt.char ? "wrong" : ""}`}
                onClick={(e) => pick(opt, e)}
                disabled={!!picked}
                aria-label={opt.meaning}
              >
                <HanziIllus src={opt.img} emoji={opt.emoji} className="hzq-imgopt-illus" alt={opt.meaning} />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
