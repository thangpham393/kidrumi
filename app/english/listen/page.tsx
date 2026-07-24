"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { speak, stopSpeaking } from "@/components/speak";
import { ALL_WORDS, PROMPTS, type Word } from "./data";

const TOTAL = 5; // số câu mỗi lượt chơi (khớp hàng 5 ngôi sao)
const CHOICES = 2; // số hình để bé chọn — 2 hình lớn, rõ cho bé tiền tiểu học

type Round = { prompt: string; target: Word; options: Word[] };

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Dựng một câu: chọn từ đích + (CHOICES-1) hình gây nhiễu khác hẳn nó.
function buildRound(avoidEn?: string): Round {
  let target = pick(ALL_WORDS);
  while (target.en === avoidEn) target = pick(ALL_WORDS);

  const options: Word[] = [target];
  while (options.length < CHOICES) {
    const d = pick(ALL_WORDS);
    if (options.some((o) => o.en === d.en || o.emoji === d.emoji)) continue;
    options.push(d);
  }
  const prompt = pick(PROMPTS)(target.en);
  return { prompt, target, options: shuffle(options) };
}

export default function ListenTouchPage() {
  const { addStars } = useChild();
  const { showToast, toastEl } = useToast();

  // round = null ở lần render đầu (kể cả SSR) để tránh lệch hydration —
  // buildRound() dùng Math.random() nên chỉ được chạy ở client (trong effect).
  const [round, setRound] = useState<Round | null>(null);
  const [step, setStep] = useState(0); // câu thứ mấy (0..TOTAL)
  const [wrongEn, setWrongEn] = useState<string | null>(null); // hình vừa chọn sai
  const [lock, setLock] = useState(false); // khoá thao tác khi đang chuyển câu
  const [done, setDone] = useState(false);
  const advancing = useRef(false);

  // Đọc câu lệnh mỗi khi sang câu mới.
  const say = useCallback((r: Round | null) => {
    if (r) void speak(r.prompt);
  }, []);

  // Bắt đầu / chơi lại từ đầu.
  const start = useCallback(() => {
    const first = buildRound();
    setDone(false);
    setStep(0);
    setWrongEn(null);
    setLock(false);
    advancing.current = false;
    setRound(first);
    say(first);
  }, [say]);

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
    const r = buildRound(round?.target.en);
    setStep(nextStep);
    setWrongEn(null);
    setLock(false);
    advancing.current = false;
    setRound(r);
    say(r);
  }

  function choose(w: Word, e: React.MouseEvent) {
    if (!round || lock || advancing.current) return;

    if (w.en === round.target.en) {
      advancing.current = true;
      setLock(true);
      setWrongEn(null);
      playSuccess();
      confettiBurst(e.clientX, e.clientY);
      addStars(1);
      showToast(`Giỏi quá! ${round.target.emoji} là "${round.target.en}"`);
      setStep((s) => s + 1); // tô sáng ngôi sao ngay
      setTimeout(() => next(true), 1100);
    } else {
      // Sai: rung nhẹ, cho nghe lại, để bé thử tiếp — không trừ điểm.
      setWrongEn(w.en);
      playWrong();
      say(round);
      setTimeout(() => setWrongEn((cur) => (cur === w.en ? null : cur)), 500);
    }
  }

  const filled = done ? TOTAL : step;

  return (
    <main className="wrap lt-wrap">
      <div className="lt-top">
        <Link href="/english" className="pill">
          ← Tiếng Anh
        </Link>
        <h1 className="lt-title">
          <span aria-hidden>🔊</span> Listen &amp; Touch
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
            <span className="lt-prompt-text">{round.prompt}</span>
          </button>

          <div className={`lt-grid n${CHOICES}`}>
            {round.options.map((w) => (
              <button
                key={w.en}
                type="button"
                className={`lt-card ${wrongEn === w.en ? "wrong" : ""}`}
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
              <Link href="/english" className="btn-ghost">
                Về Tiếng Anh
              </Link>
            </div>
          </div>
        </div>
      )}

      {toastEl}
    </main>
  );
}
