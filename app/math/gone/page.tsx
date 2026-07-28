"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { useRecordActivity } from "@/lib/missions";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { speak, stopSpeaking } from "@/components/speak";
import Emoji from "@/components/Emoji";
import {
  COVER_MS,
  ITEMS,
  MEMORIZE_MS,
  PRAISES,
  ROUNDS,
  levelFor,
  type GoneItem,
} from "./data";

// "Vật gì biến mất?" — bé ngắm một nhóm đồ vật trong khay để ghi nhớ; khay được
// che lại trong chốc lát rồi lộ ra khi đã thiếu MỘT món; bé tìm ra vật đã biến mất
// trong các lựa chọn bên dưới. Tìm đúng = 1 ngôi sao (pháo giấy + khen). Chọn sai =
// rung nhẹ, nghe lại, không trừ điểm. Đúng đủ ROUNDS câu → mở lượt mừng.
// Dùng chung khung .lt-* của trò "Nghe & chọn".

type Phase = "memorize" | "cover" | "ask";

type Round = {
  shown: GoneItem[]; // nhóm vật ở lượt ghi nhớ
  remaining: GoneItem[]; // nhóm còn lại (đã thiếu missing) — giữ thứ tự gốc
  missing: GoneItem; // vật đã biến mất (đáp án đúng)
  options: GoneItem[]; // các lựa chọn đã trộn, gồm missing
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

// Rút `n` phần tử khác nhau từ pool, có thể loại trừ một số emoji cho trước.
function sample(pool: GoneItem[], n: number, exclude: Set<string>): GoneItem[] {
  const avail = pool.filter((it) => !exclude.has(it.emoji));
  return shuffle(avail).slice(0, n);
}

function buildRound(step: number): Round {
  const { count, options } = levelFor(step);
  const shown = sample(ITEMS, count, new Set());
  const missing = pick(shown);
  const remaining = shown.filter((it) => it.emoji !== missing.emoji);

  // Lựa chọn nhiễu: các vật KHÔNG nằm trong nhóm đã hiện (để không gây rối trí nhớ).
  const usedInStage = new Set(shown.map((it) => it.emoji));
  const distractors = sample(ITEMS, options - 1, usedInStage);

  return {
    shown,
    remaining,
    missing,
    options: shuffle([missing, ...distractors]),
  };
}

const MEMORIZE_PROMPT = "Con nhớ các đồ vật nhé";
const ASK_PROMPT = "Vật gì biến mất?";

export default function GonePage() {
  const { addStars } = useChild();
  const record = useRecordActivity();
  const { showToast, toastEl } = useToast();

  // round = null ở render đầu (kể cả SSR) để tránh lệch hydration — buildRound()
  // dùng Math.random() nên chỉ chạy ở client (trong effect khởi tạo).
  const [round, setRound] = useState<Round | null>(null);
  const [phase, setPhase] = useState<Phase>("memorize");
  const [step, setStep] = useState(0); // câu thứ mấy (0..ROUNDS)
  const [wrong, setWrong] = useState<number | null>(null); // ô vừa chọn sai (rung)
  const [picked, setPicked] = useState<number | null>(null); // ô đúng vừa chọn (sáng xanh)
  const [lock, setLock] = useState(false); // khoá khi đang chuyển câu
  const [done, setDone] = useState(false);
  // Xong 1 lượt chơi (đủ số vòng) → ghi nhận nhiệm vụ Vườn Toán.
  useEffect(() => {
    if (done) record("math", "gone");
  }, [done, record]);
  const advancing = useRef(false);

  // Giữ các timer đang chờ để huỷ khi chơi lại / rời trang (tránh chồng lượt).
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  // Bắt đầu một câu ở lượt ghi nhớ: hiện đủ nhóm → che → lộ ra khi đã thiếu một món.
  const beginRound = useCallback(
    (r: Round) => {
      setRound(r);
      setPhase("memorize");
      setWrong(null);
      setPicked(null);
      setLock(false);
      advancing.current = false;
      void speak(MEMORIZE_PROMPT, "vi");
      later(() => {
        setPhase("cover");
        later(() => {
          setPhase("ask");
          void speak(ASK_PROMPT, "vi");
        }, COVER_MS);
      }, MEMORIZE_MS);
    },
    [later],
  );

  const start = useCallback(() => {
    clearTimers();
    setDone(false);
    setStep(0);
    beginRound(buildRound(0));
  }, [beginRound, clearTimers]);

  // Khởi tạo ở client (tránh random khi SSR); dừng đọc + huỷ timer khi rời trang.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    start();
    return () => {
      stopSpeaking();
      clearTimers();
    };
  }, [start, clearTimers]);

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
    setStep(nextStep);
    beginRound(buildRound(nextStep));
  }, [step, beginRound]);

  function choose(i: number, e: React.MouseEvent) {
    if (!round || phase !== "ask" || lock || advancing.current) return;

    if (round.options[i].emoji === round.missing.emoji) {
      advancing.current = true;
      setLock(true);
      setWrong(null);
      setPicked(i);
      playSuccess();
      confettiBurst(e.clientX, e.clientY);
      addStars(1);
      showToast(`${pick(PRAISES)} ${capitalize(round.missing.vi)} đã biến mất 🎉`);
      setStep((s) => s + 1); // tô sáng ngôi sao ngay
      later(() => next(), 1200);
    } else {
      // Sai: rung nhẹ, nhắc lại câu hỏi, thử tiếp — không trừ điểm.
      setWrong(i);
      playWrong();
      void speak(ASK_PROMPT, "vi");
      later(() => setWrong((cur) => (cur === i ? null : cur)), 500);
    }
  }

  const filled = done ? ROUNDS : step;
  const prompt = phase === "ask" ? ASK_PROMPT : MEMORIZE_PROMPT;
  // Vật hiện trên khay: đủ nhóm khi đang nhớ, còn lại khi hỏi (che thì ẩn hết).
  const stageItems =
    round && phase === "ask" ? round.remaining : round ? round.shown : [];

  return (
    <main className="wrap lt-wrap">
      <div className="lt-top">
        <Link href="/math" className="pill">
          ← Trò chơi
        </Link>
        <h1 className="lt-title">
          <span aria-hidden>🙈</span> Vật gì biến mất?
        </h1>
        <button
          type="button"
          className="lt-replay"
          onClick={() => void speak(prompt, "vi")}
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
            onClick={() => void speak(prompt, "vi")}
            aria-label={`Nghe lại: ${prompt}`}
          >
            <span className="lt-prompt-ic" aria-hidden>
              🔊
            </span>
            <span className="lt-prompt-body">
              <span className="lt-prompt-text">{prompt}</span>
            </span>
          </button>

          {phase === "memorize" && (
            <div className="gone-timer" role="status">
              <span className="gone-spin" aria-hidden />
              <span>Con nhớ nhé…</span>
            </div>
          )}

          <div
            className="gone-stage"
            aria-label={
              phase === "ask"
                ? "Nhóm đồ vật đã thiếu một món"
                : "Nhóm đồ vật cần ghi nhớ"
            }
          >
            {stageItems.map((it) => (
              <Emoji key={it.emoji} emoji={it.emoji} className="gone-em" alt={it.vi} />
            ))}
            {/* Màn che trượt ngang: trượt vào phủ kín khi che, trượt đi khi lộ ra */}
            <div
              className={
                "gone-curtain" +
                (phase === "cover"
                  ? " covering"
                  : phase === "ask"
                    ? " revealing"
                    : "")
              }
              aria-hidden
            >
              <span className="gone-curtain-face">🙈</span>
            </div>
          </div>

          {phase === "ask" && (
            <div className="gone-opts" role="group" aria-label="Chọn vật đã biến mất">
              {round.options.map((it, i) => (
                <button
                  key={it.emoji}
                  type="button"
                  className={
                    "gone-opt" +
                    (wrong === i ? " wrong" : "") +
                    (picked === i ? " correct" : "")
                  }
                  onClick={(e) => choose(i, e)}
                  disabled={lock}
                  aria-label={it.vi}
                >
                  <Emoji emoji={it.emoji} className="gone-opt-em" alt={it.vi} />
                </button>
              ))}
            </div>
          )}
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
              Bé nhớ giỏi tìm đúng cả {ROUNDS} câu rồi. Được {ROUNDS} ngôi sao ⭐
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

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
