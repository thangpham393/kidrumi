"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { speak, stopSpeaking } from "@/components/speak";
import {
  COLORS,
  PRAISES,
  ROUNDS,
  SHAPES,
  TARGET_MAX,
  TARGET_MIN,
  TILES,
  type Shape,
  type ShapeKey,
} from "./data";

// "Tìm hình trốn" — mỗi câu hiện một cụm hình (vẽ SVG, màu random) trộn lẫn; câu
// lệnh "Tìm tất cả hình …". Bé chạm ĐỦ mọi hình đúng loại đang trốn trong cụm.
//   Chạm đúng = hiện dấu ✓ + pháo giấy; đủ hết = 1 ngôi sao + khen, qua câu mới.
//   Chạm sai = rung nhẹ, nghe lại câu lệnh, KHÔNG trừ điểm.
// Đúng đủ ROUNDS câu → mở lượt mừng. Dùng chung khung .lt-* của trò "Hình gì đây?".

type Tile = { shape: Shape; color: string };
type Round = {
  target: Shape;
  tiles: Tile[];
  targetCount: number; // số hình "trốn" cần tìm
  prompt: string; // "Tìm tất cả hình sáu cạnh"
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (lo: number, hi: number) =>
  lo + Math.floor(Math.random() * (hi - lo + 1));

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(avoid?: ShapeKey): Round {
  const target = pick(SHAPES.filter((s) => s.key !== avoid));
  const targetCount = randInt(TARGET_MIN, TARGET_MAX);

  // Hình nhiễu: khác loại đáp án và không phải hình "gần giống" đáp án (tránh
  // tròn↔bầu dục, vuông↔chữ nhật khiến bé 3 tuổi khó phân biệt).
  const pool = shuffle(
    SHAPES.filter((s) => s.key !== target.key && s.key !== target.near),
  );
  const shapes: Shape[] = Array.from({ length: targetCount }, () => target);
  let p = 0;
  while (shapes.length < TILES) {
    shapes.push(pool[p % pool.length]);
    p++;
  }

  const cols = shuffle(COLORS);
  const tiles = shuffle(shapes).map((shape, i) => ({
    shape,
    color: cols[i % cols.length],
  }));
  return {
    target,
    tiles,
    targetCount,
    prompt: `Tìm tất cả ${target.phrase}`,
  };
}

// ---- Vẽ hình bằng SVG (viewBox 0 0 100 100, chừa lề để không chạm mép) ----
const STAR_PTS =
  "50,5 60.6,35.4 92.8,36.1 67.1,55.6 76.5,86.4 50,68 23.5,86.4 32.9,55.6 7.2,36.1 39.4,35.4";
const HEART_D =
  "M50 88 C 14 62, 8 34, 30 22 C 42 15, 50 24, 50 30 C 50 24, 58 15, 70 22 C 92 34, 86 62, 50 88 Z";
const HEX_PTS = "20,6 80,6 98,50 80,94 20,94 2,50"; // sáu cạnh, cạnh trên phẳng

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
    case "hexagon":
      el = <polygon points={HEX_PTS} style={fill} />;
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

// Dấu ✓ trắng phủ lên hình khi bé tìm đúng.
function CheckMark() {
  return (
    <svg className="find-check" viewBox="0 0 100 100" aria-hidden>
      <path
        d="M22 52 L42 72 L78 30"
        fill="none"
        stroke="#fff"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FindShapePage() {
  const { addStars } = useChild();
  const { showToast, toastEl } = useToast();

  // round = null ở render đầu (kể cả SSR) để tránh lệch hydration — buildRound()
  // dùng Math.random() nên chỉ chạy ở client (trong effect khởi tạo).
  const [round, setRound] = useState<Round | null>(null);
  const [step, setStep] = useState(0); // câu thứ mấy (0..ROUNDS)
  const [found, setFound] = useState<number[]>([]); // ô đúng đã tìm được
  const [wrong, setWrong] = useState<number | null>(null); // ô vừa chạm sai (rung)
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
    setFound([]);
    setWrong(null);
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
    const r = buildRound(round?.target.key);
    setStep(nextStep);
    setFound([]);
    setWrong(null);
    setLock(false);
    advancing.current = false;
    setRound(r);
    say(r);
  }, [step, round, say]);

  function tap(i: number, e: React.MouseEvent) {
    if (!round || lock || advancing.current) return;
    const isTarget = round.tiles[i].shape.key === round.target.key;

    if (!isTarget) {
      // Sai: rung nhẹ, cho nghe lại, thử tiếp — không trừ điểm.
      setWrong(i);
      playWrong();
      say(round);
      setTimeout(() => setWrong((cur) => (cur === i ? null : cur)), 500);
      return;
    }
    if (found.includes(i)) return; // đã tìm rồi

    const nowFound = [...found, i];
    setFound(nowFound);
    setWrong(null);
    playSuccess();
    confettiBurst(e.clientX, e.clientY);

    if (nowFound.length >= round.targetCount) {
      // Tìm đủ hết → 1 ngôi sao + khen, qua câu mới.
      advancing.current = true;
      setLock(true);
      addStars(1);
      showToast(`${pick(PRAISES)} Bé tìm đủ ${round.target.phrase} rồi 🎉`);
      setStep((s) => s + 1); // tô sáng ngôi sao ngay
      setTimeout(next, 1100);
    }
  }

  const filled = done ? ROUNDS : step;
  const foundCount = found.length;

  return (
    <main className="wrap lt-wrap">
      <div className="lt-top">
        <Link href="/math" className="pill">
          ← Trò chơi
        </Link>
        <h1 className="lt-title">
          <span aria-hidden>🔍</span> Tìm hình trốn
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

      <div className="lt-stars" aria-label={`Đã xong ${filled} trên ${ROUNDS}`}>
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

          <div
            className="find-count"
            aria-label={`Đã tìm ${foundCount} trên ${round.targetCount}`}
          >
            <span className="find-count-ic" aria-hidden>
              <ShapeSvg shape={round.target} color="var(--brand)" />
            </span>
            <span className="find-dots" aria-hidden>
              {Array.from({ length: round.targetCount }, (_, i) => (
                <span key={i} className={`find-dot ${i < foundCount ? "on" : ""}`} />
              ))}
            </span>
          </div>

          <div className="find-board">
            <div className="find-grid">
              {round.tiles.map((t, i) => {
                const isFound = found.includes(i);
                return (
                  <button
                    key={`${t.shape.key}-${i}`}
                    type="button"
                    className={`find-tile ${wrong === i ? "wrong" : ""} ${
                      isFound ? "found" : ""
                    }`}
                    onClick={(e) => tap(i, e)}
                    disabled={isFound || lock}
                    aria-label={
                      isFound ? `${t.shape.phrase} — đã tìm` : t.shape.phrase
                    }
                    aria-pressed={isFound}
                  >
                    <ShapeSvg shape={t.shape} color={t.color} />
                    {isFound && <CheckMark />}
                  </button>
                );
              })}
            </div>
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
              Bé đã tìm hết hình trốn qua cả {ROUNDS} câu. Giỏi quá đi! Được{" "}
              {ROUNDS} ngôi sao ⭐
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
