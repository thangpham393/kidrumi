"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { speak, stopSpeaking } from "@/components/speak";
import { COLORS, PRAISES, ROUNDS, SHAPES, type Shape, type ShapeKey } from "./data";

// "Hình gì đây?" — mỗi câu hiện 3 hình (vẽ bằng SVG, màu random) và câu lệnh
// "Chạm vào hình …". Bé chạm đúng hình được gọi tên.
//   Chọn đúng = 1 ngôi sao (pháo giấy + khen), thẻ sáng xanh rồi qua câu mới.
//   Chọn sai = rung nhẹ, nghe lại câu lệnh, KHÔNG trừ điểm.
// Đúng đủ ROUNDS câu → mở lượt mừng. Dùng chung khung .lt-* của trò "Nghe & chọn".

type Choice = { shape: Shape; color: string };
type Round = {
  answer: Shape;
  choices: Choice[];
  target: number; // vị trí đáp án trong choices
  prompt: string; // "Chạm vào hình tam giác"
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(avoid?: ShapeKey): Round {
  const answer = pick(SHAPES.filter((s) => s.key !== avoid));

  // Chọn 2 hình phụ: khác đáp án, và tránh hình dễ nhầm với những hình đã chọn.
  const chosen: Shape[] = [answer];
  const isNear = (a: Shape, b: Shape) => a.near === b.key || b.near === a.key;
  for (const s of shuffle(SHAPES)) {
    if (chosen.length >= 3) break;
    if (chosen.some((c) => c.key === s.key || isNear(c, s))) continue;
    chosen.push(s);
  }
  // Dự phòng (hiếm khi cần): bù cho đủ 3 nếu ràng buộc "gần giống" chặn hết.
  if (chosen.length < 3) {
    for (const s of shuffle(SHAPES)) {
      if (chosen.length >= 3) break;
      if (!chosen.some((c) => c.key === s.key)) chosen.push(s);
    }
  }

  const cols = shuffle(COLORS).slice(0, 3);
  const shuffled = shuffle(chosen).map((shape, i) => ({ shape, color: cols[i] }));
  return {
    answer,
    choices: shuffled,
    target: shuffled.findIndex((c) => c.shape.key === answer.key),
    prompt: `Chạm vào ${answer.phrase}`,
  };
}

// ---- Vẽ hình bằng SVG (viewBox 0 0 100 100, đủ lề để không chạm mép thẻ) ----
const STAR_PTS =
  "50,5 60.6,35.4 92.8,36.1 67.1,55.6 76.5,86.4 50,68 23.5,86.4 32.9,55.6 7.2,36.1 39.4,35.4";
const HEART_D =
  "M50 88 C 14 62, 8 34, 30 22 C 42 15, 50 24, 50 30 C 50 24, 58 15, 70 22 C 92 34, 86 62, 50 88 Z";

function ShapeSvg({ shape, color }: { shape: Shape; color: string }) {
  const fill = { fill: color } as CSSProperties;
  let el: React.ReactNode;
  switch (shape.key) {
    case "circle":
      el = <circle cx="50" cy="50" r="42" style={fill} />;
      break;
    case "oval":
      el = <ellipse cx="50" cy="50" rx="46" ry="30" style={fill} />;
      break;
    case "square":
      el = <rect x="12" y="12" width="76" height="76" rx="7" style={fill} />;
      break;
    case "rectangle":
      el = <rect x="6" y="26" width="88" height="48" rx="7" style={fill} />;
      break;
    case "triangle":
      el = <polygon points="50,10 88,84 12,84" style={fill} />;
      break;
    case "diamond":
      el = <polygon points="50,6 90,50 50,94 10,50" style={fill} />;
      break;
    case "star":
      el = <polygon points={STAR_PTS} style={fill} />;
      break;
    case "heart":
      el = <path d={HEART_D} style={fill} />;
      break;
  }
  return (
    <svg className="shp-svg" viewBox="0 0 100 100" role="img" aria-label={shape.phrase}>
      {el}
    </svg>
  );
}

export default function ShapesPage() {
  const { addStars } = useChild();
  const { showToast, toastEl } = useToast();

  // round = null ở render đầu (kể cả SSR) để tránh lệch hydration — buildRound()
  // dùng Math.random() nên chỉ chạy ở client (trong effect khởi tạo).
  const [round, setRound] = useState<Round | null>(null);
  const [step, setStep] = useState(0); // câu thứ mấy (0..ROUNDS)
  const [wrong, setWrong] = useState<number | null>(null); // ô vừa chọn sai (rung)
  const [correct, setCorrect] = useState<number | null>(null); // ô đúng (sáng xanh)
  const [lock, setLock] = useState(false); // khoá khi đang chuyển câu
  const [done, setDone] = useState(false);
  const advancing = useRef(false);

  const say = useCallback((r: Round | null) => {
    if (r) void speak(r.prompt, "vi");
  }, []);

  const start = useCallback(() => {
    const first = buildRound();
    setDone(false);
    setStep(0);
    setWrong(null);
    setCorrect(null);
    setLock(false);
    advancing.current = false;
    setRound(first);
    say(first);
  }, [say]);

  // Khởi tạo ở client (tránh random khi SSR); dừng đọc khi rời trang.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    start();
    return () => stopSpeaking();
  }, [start]);

  const next = useCallback(() => {
    const nextStep = step + 1;
    if (nextStep >= ROUNDS) {
      setStep(ROUNDS);
      setDone(true);
      setRound(null);
      confettiBurst();
      playSuccess();
      stopSpeaking();
      return;
    }
    const r = buildRound(round?.answer.key);
    setStep(nextStep);
    setWrong(null);
    setCorrect(null);
    setLock(false);
    advancing.current = false;
    setRound(r);
    say(r);
  }, [step, round, say]);

  function choose(i: number, e: React.MouseEvent) {
    if (!round || lock || advancing.current) return;

    if (i === round.target) {
      advancing.current = true;
      setLock(true);
      setWrong(null);
      setCorrect(i);
      playSuccess();
      confettiBurst(e.clientX, e.clientY);
      addStars(1);
      showToast(`${pick(PRAISES)} Đây là ${round.answer.phrase} 🎉`);
      setStep((s) => s + 1); // tô sáng ngôi sao ngay
      setTimeout(next, 1100);
    } else {
      // Sai: rung nhẹ, cho nghe lại, thử tiếp — không trừ điểm.
      setWrong(i);
      playWrong();
      say(round);
      setTimeout(() => setWrong((cur) => (cur === i ? null : cur)), 500);
    }
  }

  const filled = done ? ROUNDS : step;

  return (
    <main className="wrap lt-wrap">
      <div className="lt-top">
        <Link href="/math" className="pill">
          ← Trò chơi
        </Link>
        <h1 className="lt-title">
          <span aria-hidden>🔷</span> Hình gì đây?
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

      <div className="lt-stars" aria-label={`Đã đúng ${filled} trên ${ROUNDS}`}>
        {Array.from({ length: ROUNDS }, (_, i) => (
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
            </span>
          </button>

          <div className="lt-grid n3 shp-grid">
            {round.choices.map((c, i) => (
              <button
                key={`${c.shape.key}-${i}`}
                type="button"
                className={`lt-card ${wrong === i ? "wrong" : ""} ${correct === i ? "correct" : ""}`}
                onClick={(e) => choose(i, e)}
                disabled={lock}
                aria-label={c.shape.phrase}
              >
                <ShapeSvg shape={c.shape} color={c.color} />
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
              Bé nhận đúng cả {ROUNDS} hình rồi. Giỏi quá đi! Được {ROUNDS} ngôi sao ⭐
            </p>
            <div className="lt-result-actions">
              <button type="button" className="btn" onClick={start}>
                Chơi lại →
              </button>
              <Link href="/math" className="btn-ghost">
                Về Vườn Toán
              </Link>
            </div>
          </div>
        </div>
      )}

      {toastEl}
    </main>
  );
}
