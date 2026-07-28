"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { useRecordActivity } from "@/lib/missions";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { speak, stopSpeaking } from "@/components/speak";
import Emoji from "@/components/Emoji";
import {
  COUNT_ITEMS,
  PRAISES,
  ROUNDS,
  SIZE_GROUPS,
  type CompareItem,
} from "./data";

// "Cái nào hơn?" — mỗi câu hiện HAI ô để bé so sánh rồi chạm vào ô đúng:
//   • Kiểu kích thước: cùng một vật ở hai cỡ khác nhau → chọn cái to/cao/dài hơn
//     (hoặc nhỏ/thấp/ngắn hơn).
//   • Kiểu số lượng: hai cụm vật khác số lượng → chọn bên nhiều hơn (hoặc ít hơn).
// Chọn đúng = 1 ngôi sao (pháo giấy + khen). Chọn sai = rung nhẹ, nghe lại, không trừ
// điểm. Đúng đủ ROUNDS câu → mở lượt mừng. Dùng chung khung .lt-* của trò "Nghe & chọn".

type SizeRound = {
  mode: "size";
  item: CompareItem;
  base: boolean; // canh đáy để so chiều cao/độ dài từ cùng một mặt phẳng
  adj: string; // tính từ trong câu lệnh (cao/thấp/dài/ngắn/to/nhỏ)
  more: string; // tính từ "lớn hơn" của nhóm (để mô tả ô)
  less: string; // tính từ "nhỏ hơn" của nhóm
  scales: [number, number]; // hệ số cỡ hai ô (trái, phải)
  target: 0 | 1;
  prompt: string;
};

type CountRound = {
  mode: "count";
  item: CompareItem;
  askMore: boolean; // hỏi "nhiều hơn" (true) hay "ít hơn" (false)
  counts: [number, number];
  target: 0 | 1;
  prompt: string;
};

type Round = SizeRound | CountRound;

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function buildRound(avoidEmoji?: string): Round {
  // ~55% câu so kích thước, còn lại so số lượng — xen kẽ cho đỡ nhàm.
  if (Math.random() < 0.55) {
    const group = pick(SIZE_GROUPS);
    let item = pick(group.items);
    let guard = 0;
    while (item.emoji === avoidEmoji && guard++ < 20) item = pick(group.items);

    const askMore = Math.random() < 0.5;
    const adj = askMore ? group.more : group.less;
    // Cỡ to rõ hơn cỡ nhỏ (tỉ lệ ~1.7–2.4×) để bé thấy khác biệt ngay.
    const bigK = rand(102, 122) / 100;
    const smallK = rand(48, 60) / 100;
    const bigSide: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
    const scales: [number, number] = bigSide === 0 ? [bigK, smallK] : [smallK, bigK];
    const target: 0 | 1 = askMore ? bigSide : ((1 - bigSide) as 0 | 1);
    return {
      mode: "size",
      item,
      base: group.base,
      adj,
      more: group.more,
      less: group.less,
      scales,
      target,
      prompt: `Chạm vào ${item.vi} ${adj} hơn`,
    };
  }

  let item = pick(COUNT_ITEMS);
  let guard = 0;
  while (item.emoji === avoidEmoji && guard++ < 20) item = pick(COUNT_ITEMS);
  const small = rand(1, 3);
  const big = rand(small + 2, 6); // chênh ít nhất 2 cho dễ nhận ra
  const askMore = Math.random() < 0.5;
  const bigSide: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
  const counts: [number, number] = bigSide === 0 ? [big, small] : [small, big];
  const target: 0 | 1 = askMore ? bigSide : ((1 - bigSide) as 0 | 1);
  return {
    mode: "count",
    item,
    askMore,
    counts,
    target,
    prompt: `Chạm vào bên có ${askMore ? "nhiều" : "ít"} ${item.vi} hơn`,
  };
}

export default function ComparePage() {
  const { addStars } = useChild();
  const record = useRecordActivity();
  const { showToast, toastEl } = useToast();

  // round = null ở render đầu (kể cả SSR) để tránh lệch hydration — buildRound()
  // dùng Math.random() nên chỉ chạy ở client (trong effect khởi tạo).
  const [round, setRound] = useState<Round | null>(null);
  const [step, setStep] = useState(0); // câu thứ mấy (0..ROUNDS)
  const [wrong, setWrong] = useState<number | null>(null); // ô vừa chọn sai (rung)
  const [lock, setLock] = useState(false); // khoá khi đang chuyển câu
  const [done, setDone] = useState(false);
  // Xong 1 lượt chơi (đủ số vòng) → ghi nhận nhiệm vụ Vườn Toán.
  useEffect(() => {
    if (done) record("math", "compare");
  }, [done, record]);
  const advancing = useRef(false);

  const say = useCallback((r: Round | null) => {
    if (r) void speak(r.prompt, "vi");
  }, []);

  const start = useCallback(() => {
    const first = buildRound();
    setDone(false);
    setStep(0);
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

  const next = useCallback(
    (afterCorrect: boolean) => {
      const nextStep = step + (afterCorrect ? 1 : 0);
      if (nextStep >= ROUNDS) {
        setStep(ROUNDS);
        setDone(true);
        setRound(null);
        confettiBurst();
        playSuccess();
        stopSpeaking();
        return;
      }
      const r = buildRound(round?.item.emoji);
      setStep(nextStep);
      setWrong(null);
      setLock(false);
      advancing.current = false;
      setRound(r);
      say(r);
    },
    [step, round, say],
  );

  function choose(i: 0 | 1, e: React.MouseEvent) {
    if (!round || lock || advancing.current) return;

    if (i === round.target) {
      advancing.current = true;
      setLock(true);
      setWrong(null);
      playSuccess();
      confettiBurst(e.clientX, e.clientY);
      addStars(1);
      const praise = pick(PRAISES);
      if (round.mode === "size") {
        showToast(`${praise} ${round.item.emoji} này ${round.adj} hơn nhé!`);
      } else {
        showToast(
          `${praise} Bên này ${round.askMore ? "nhiều" : "ít"} hơn ${round.item.emoji}`,
        );
      }
      setStep((s) => s + 1); // tô sáng ngôi sao ngay
      setTimeout(() => next(true), 1100);
    } else {
      // Sai: rung nhẹ, cho nghe lại, thử tiếp — không trừ điểm.
      setWrong(i);
      playWrong();
      say(round);
      setTimeout(() => setWrong((cur) => (cur === i ? null : cur)), 500);
    }
  }

  const filled = done ? ROUNDS : step;

  // Mô tả từng ô cho trình đọc màn hình.
  function cardLabel(r: Round, i: 0 | 1): string {
    if (r.mode === "count") return `${r.counts[i]} ${r.item.vi}`;
    const isBig = r.scales[i] === Math.max(r.scales[0], r.scales[1]);
    return `${r.item.vi} ${isBig ? r.more : r.less}`;
  }

  return (
    <main className="wrap lt-wrap">
      <div className="lt-top">
        <Link href="/math" className="pill">
          ← Trò chơi
        </Link>
        <h1 className="lt-title">
          <span aria-hidden>⚖️</span> Cái nào hơn?
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

          <div className="lt-grid n2 cmp-grid">
            {([0, 1] as const).map((i) => (
              <button
                key={i}
                type="button"
                className={`lt-card cmp-card ${wrong === i ? "wrong" : ""}`}
                onClick={(e) => choose(i, e)}
                disabled={lock}
                aria-label={cardLabel(round, i)}
              >
                {round.mode === "size" ? (
                  <span
                    className={`cmp-slot ${round.base ? "base" : ""}`}
                    style={{ ["--k" as string]: round.scales[i] } as CSSProperties}
                  >
                    <Emoji emoji={round.item.emoji} className="cmp-em" />
                  </span>
                ) : (
                  <span className="cmp-count">
                    {Array.from({ length: round.counts[i] }, (_, j) => (
                      <Emoji key={j} emoji={round.item.emoji} className="cmp-count-em" />
                    ))}
                  </span>
                )}
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
              Bé so sánh đúng cả {ROUNDS} câu rồi. Giỏi quá đi! Được {ROUNDS} ngôi sao ⭐
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
