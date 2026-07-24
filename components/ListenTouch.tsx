"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { speak, stopSpeaking } from "@/components/speak";

// Một từ vựng chung cho trò "Nghe & chọn" (dùng được cho Anh, Trung…):
//   term  = phần điền vào câu lệnh + đọc (English word / hanzi)
//   hint  = chú thích nhỏ dưới câu lệnh (vd pinyin) — không bắt buộc
//   vi    = nghĩa tiếng Việt (khen ngợi / aria-label)
//   emoji = hình minh hoạ
export type LtWord = {
  key: string; // định danh duy nhất
  term: string;
  hint?: string;
  vi: string;
  emoji: string;
};

type Props = {
  words: LtWord[];
  prompts: ((term: string) => string)[]; // các mẫu câu lệnh
  lang: string; // mã đọc TTS: "en" | "zh"…
  title: string; // tiêu đề hiển thị (vd "Listen & Touch")
  backHref: string; // link quay lại (vd "/english")
  backLabel: string; // nhãn nút quay lại (vd "Tiếng Anh")
};

const TOTAL = 5; // số câu mỗi lượt chơi (khớp hàng 5 ngôi sao)
const CHOICES = 2; // số hình để bé chọn — 2 hình lớn, rõ cho bé tiền tiểu học

type Round = { prompt: string; target: LtWord; options: LtWord[] };

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ListenTouch({
  words,
  prompts,
  lang,
  title,
  backHref,
  backLabel,
}: Props) {
  const { addStars } = useChild();
  const { showToast, toastEl } = useToast();

  // Dựng một câu: chọn từ đích + (CHOICES-1) hình gây nhiễu khác hẳn nó.
  const buildRound = useCallback(
    (avoidKey?: string): Round => {
      let target = pick(words);
      while (target.key === avoidKey) target = pick(words);

      const options: LtWord[] = [target];
      while (options.length < CHOICES) {
        const d = pick(words);
        if (options.some((o) => o.key === d.key || o.emoji === d.emoji)) continue;
        options.push(d);
      }
      const prompt = pick(prompts)(target.term);
      return { prompt, target, options: shuffle(options) };
    },
    [words, prompts],
  );

  // round = null ở lần render đầu (kể cả SSR) để tránh lệch hydration —
  // buildRound() dùng Math.random() nên chỉ được chạy ở client (trong effect).
  const [round, setRound] = useState<Round | null>(null);
  const [step, setStep] = useState(0); // câu thứ mấy (0..TOTAL)
  const [wrongKey, setWrongKey] = useState<string | null>(null); // hình vừa chọn sai
  const [lock, setLock] = useState(false); // khoá thao tác khi đang chuyển câu
  const [done, setDone] = useState(false);
  const advancing = useRef(false);

  // Đọc câu lệnh mỗi khi sang câu mới.
  const say = useCallback(
    (r: Round | null) => {
      if (r) void speak(r.prompt, lang);
    },
    [lang],
  );

  // Bắt đầu / chơi lại từ đầu.
  const start = useCallback(() => {
    const first = buildRound();
    setDone(false);
    setStep(0);
    setWrongKey(null);
    setLock(false);
    advancing.current = false;
    setRound(first);
    say(first);
  }, [buildRound, say]);

  // Khởi tạo câu đầu ở client (tránh random khi SSR) + dừng đọc khi rời trang.
  // Trình duyệt có thể chặn tự phát tới khi bé chạm — luôn có nút 🔊 để nghe lại.
  useEffect(() => {
    // Cố ý setState sau khi mount: câu đầu phải sinh ở client để khớp hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    start();
    return () => stopSpeaking();
  }, [start]);

  function next(afterCorrect: boolean) {
    const nextStep = step + (afterCorrect ? 1 : 0);
    if (nextStep >= TOTAL) {
      setStep(TOTAL);
      setDone(true);
      setRound(null);
      confettiBurst();
      playSuccess();
      stopSpeaking();
      return;
    }
    const r = buildRound(round?.target.key);
    setStep(nextStep);
    setWrongKey(null);
    setLock(false);
    advancing.current = false;
    setRound(r);
    say(r);
  }

  function choose(w: LtWord, e: React.MouseEvent) {
    if (!round || lock || advancing.current) return;

    if (w.key === round.target.key) {
      advancing.current = true;
      setLock(true);
      setWrongKey(null);
      playSuccess();
      confettiBurst(e.clientX, e.clientY);
      addStars(1);
      showToast(
        `Giỏi quá! ${round.target.emoji} là "${round.target.term}"` +
          (round.target.hint ? ` (${round.target.hint})` : ""),
      );
      setStep((s) => s + 1); // tô sáng ngôi sao ngay
      setTimeout(() => next(true), 1100);
    } else {
      // Sai: rung nhẹ, cho nghe lại, để bé thử tiếp — không trừ điểm.
      setWrongKey(w.key);
      playWrong();
      say(round);
      setTimeout(() => setWrongKey((cur) => (cur === w.key ? null : cur)), 500);
    }
  }

  const filled = done ? TOTAL : step;

  return (
    <main className="wrap lt-wrap">
      <div className="lt-top">
        <Link href={backHref} className="pill">
          ← {backLabel}
        </Link>
        <h1 className="lt-title">
          <span aria-hidden>🔊</span> {title}
        </h1>
        <button
          type="button"
          className="lt-replay"
          onClick={() => say(round)}
          disabled={!round}
          aria-label="Nghe lại"
          title="Nghe lại"
        >
          🔊
        </button>
      </div>

      <div className="lt-stars" aria-label={`Đã đúng ${filled} trên ${TOTAL}`}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <span key={i} className={`lt-star ${i < filled ? "on" : ""}`} aria-hidden>
            {i < filled ? "⭐" : "☆"}
          </span>
        ))}
      </div>

      {round && (
        <>
          <button
            type="button"
            className="lt-prompt"
            onClick={() => say(round)}
            aria-label={`Nghe lại: ${round.prompt}`}
          >
            <span className="lt-prompt-ic" aria-hidden>
              🔊
            </span>
            <span className="lt-prompt-body">
              <span className="lt-prompt-text">{round.prompt}</span>
              {round.target.hint && (
                <span className="lt-prompt-hint">{round.target.hint}</span>
              )}
            </span>
          </button>

          <div className={`lt-grid n${CHOICES}`}>
            {round.options.map((w) => (
              <button
                key={w.key}
                type="button"
                className={`lt-card ${wrongKey === w.key ? "wrong" : ""}`}
                onClick={(e) => choose(w, e)}
                disabled={lock}
                aria-label={w.vi}
              >
                <span className="lt-emoji" aria-hidden>
                  {w.emoji}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {done && (
        <div className="modal-back" role="dialog" aria-modal="true">
          <div className="modal result-modal lt-result">
            <div className="lt-result-emoji" aria-hidden>
              🎉
            </div>
            <h2>Tuyệt vời!</h2>
            <p>
              Bé nghe và chọn đúng cả {TOTAL} câu rồi. Giỏi quá đi! Được {TOTAL} ngôi
              sao ⭐
            </p>
            <div className="lt-result-actions">
              <button type="button" className="btn" onClick={start}>
                Chơi lại →
              </button>
              <Link href={backHref} className="btn-ghost">
                Về {backLabel}
              </Link>
            </div>
          </div>
        </div>
      )}

      {toastEl}
    </main>
  );
}
