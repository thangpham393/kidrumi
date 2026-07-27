"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { speak, stopSpeaking } from "@/components/speak";
import Emoji from "@/components/Emoji";
import {
  MAX_COUNT,
  MIN_COUNT,
  PRAISES,
  ROUNDS,
  THINGS,
  type CountThing,
} from "./data";

// "Đếm cùng bé" — mỗi câu hiện một cụm vật cùng loại trong khay; bé đếm rồi chạm
// vào CHỮ SỐ đúng trong 4 lựa chọn. Chọn đúng = 1 ngôi sao (pháo giấy + khen). Chọn
// sai = rung nhẹ, nghe lại, không trừ điểm. Đúng đủ ROUNDS câu → mở lượt mừng.
// Dùng chung khung .lt-* của trò "Nghe & chọn".

type Round = {
  thing: CountThing;
  count: number; // đáp án đúng = số vật hiện ra
  options: number[]; // 4 chữ số để chọn (đã trộn), gồm count
  prompt: string;
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(avoidEmoji?: string): Round {
  let thing = pick(THINGS);
  let guard = 0;
  while (thing.emoji === avoidEmoji && guard++ < 20) thing = pick(THINGS);

  const count = rand(MIN_COUNT, MAX_COUNT);
  // 3 đáp án nhiễu gần đáp án đúng (lệch 1–3), khác nhau, nằm trong [MIN, MAX].
  const options = new Set<number>([count]);
  let g2 = 0;
  while (options.size < 4 && g2++ < 100) {
    const delta = rand(1, 3) * (Math.random() < 0.5 ? -1 : 1);
    let v = count + delta;
    if (v < MIN_COUNT) v = count + Math.abs(delta);
    if (v > MAX_COUNT) v = count - Math.abs(delta);
    if (v >= MIN_COUNT && v <= MAX_COUNT) options.add(v);
  }
  // Phòng khi kẹt (dải hẹp): điền thêm số bất kỳ trong [MIN, MAX] cho đủ 4.
  for (let v = MIN_COUNT; options.size < 4 && v <= MAX_COUNT; v++) options.add(v);

  return {
    thing,
    count,
    options: shuffle([...options]),
    prompt: `Có mấy ${thing.vi}?`,
  };
}

export default function CountPage() {
  const { addStars } = useChild();
  const { showToast, toastEl } = useToast();

  // round = null ở render đầu (kể cả SSR) để tránh lệch hydration — buildRound()
  // dùng Math.random() nên chỉ chạy ở client (trong effect khởi tạo).
  const [round, setRound] = useState<Round | null>(null);
  const [step, setStep] = useState(0); // câu thứ mấy (0..ROUNDS)
  const [wrong, setWrong] = useState<number | null>(null); // ô số vừa chọn sai (rung)
  const [picked, setPicked] = useState<number | null>(null); // ô số đúng vừa chọn (sáng xanh)
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
    setPicked(null);
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
      const r = buildRound(round?.thing.emoji);
      setStep(nextStep);
      setWrong(null);
      setPicked(null);
      setLock(false);
      advancing.current = false;
      setRound(r);
      say(r);
    },
    [step, round, say],
  );

  function choose(i: number, e: React.MouseEvent) {
    if (!round || lock || advancing.current) return;

    if (round.options[i] === round.count) {
      advancing.current = true;
      setLock(true);
      setWrong(null);
      setPicked(i);
      playSuccess();
      confettiBurst(e.clientX, e.clientY);
      addStars(1);
      showToast(`${pick(PRAISES)} Có ${round.count} ${round.thing.vi} 🎉`);
      setStep((s) => s + 1); // tô sáng ngôi sao ngay
      setTimeout(() => next(true), 1150);
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
          <span aria-hidden>🔢</span> Đếm cùng bé
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

          <div
            className="count-stage"
            aria-label={`${round.count} ${round.thing.vi}`}
          >
            {Array.from({ length: round.count }, (_, j) => (
              <Emoji key={j} emoji={round.thing.emoji} className="count-em" />
            ))}
          </div>

          <div className="count-pad" role="group" aria-label="Chọn số">
            {round.options.map((n, i) => (
              <button
                key={i}
                type="button"
                className={
                  "count-key" +
                  (wrong === i ? " wrong" : "") +
                  (picked === i ? " correct" : "")
                }
                onClick={(e) => choose(i, e)}
                disabled={lock}
                aria-label={`Số ${n}`}
              >
                {n}
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
              Bé đếm đúng cả {ROUNDS} câu rồi. Giỏi quá đi! Được {ROUNDS} ngôi sao ⭐
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
