"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { speak, stopSpeaking } from "@/components/speak";
import Emoji from "@/components/Emoji";
import { PATTERNS, POOL, PRAISES, ROUNDS, type PatItem } from "./data";

// "Tiếp nối dãy" — mỗi câu hiện một dãy vật lặp theo quy luật (AB, ABC, AAB, ABB…)
// kết thúc bằng ô "?"; bé chạm vào một trong 3 vật để hoàn thành dãy.
//   Chọn đúng = 1 ngôi sao (pháo giấy + khen), ô "?" hiện đúng vật rồi qua câu mới.
//   Chọn sai = rung nhẹ, nghe lại câu lệnh, KHÔNG trừ điểm.
// Đúng đủ ROUNDS câu → mở lượt mừng. Dùng chung khung .lt-* của trò "Nghe & chọn".

type Round = {
  sequence: string[]; // các emoji hiện trước ô "?"
  answer: PatItem; // vật đúng cho ô "?"
  choices: PatItem[]; // 3 lựa chọn (đã trộn)
  target: number; // vị trí đáp án trong choices
  key: string; // loại quy luật (để mô tả cho trình đọc)
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

// Chọn `n` vật khác nhau từ POOL, tránh emoji trong `avoid`.
function pickItems(n: number, avoid: Set<string>): PatItem[] {
  const bag = shuffle(POOL.filter((it) => !avoid.has(it.emoji)));
  return bag.slice(0, n);
}

function buildRound(avoidEmoji?: string): Round {
  // Quy luật theo trọng số: câu dễ (AB) hay gặp hơn.
  const weighted = PATTERNS.flatMap((p) => Array<typeof p>(p.weight).fill(p));
  const pat = pick(weighted);
  const numSymbols = Math.max(...pat.unit) + 1;

  const avoid = new Set<string>();
  if (avoidEmoji) avoid.add(avoidEmoji);
  const symbols = pickItems(numSymbols, avoid);

  // Hiện đủ ≥2 đơn vị để quy luật rõ ràng; đơn vị 2 vật cho thêm/bớt 1 nhịp để đỡ nhàm.
  const unitLen = pat.unit.length;
  const visibleLen = unitLen === 2 ? pick([4, 5]) : 6;
  const sequence = Array.from(
    { length: visibleLen },
    (_, i) => symbols[pat.unit[i % unitLen]].emoji,
  );
  const answer = symbols[pat.unit[visibleLen % unitLen]];

  // Lựa chọn: đáp án + các vật khác trong quy luật; thiếu thì bù vật lạ từ POOL.
  const picked = new Set<string>([answer.emoji]);
  const choices: PatItem[] = [answer];
  for (const s of symbols) {
    if (choices.length >= 3) break;
    if (!picked.has(s.emoji)) {
      picked.add(s.emoji);
      choices.push(s);
    }
  }
  if (choices.length < 3) {
    for (const it of shuffle(POOL)) {
      if (choices.length >= 3) break;
      if (!picked.has(it.emoji)) {
        picked.add(it.emoji);
        choices.push(it);
      }
    }
  }

  const shuffled = shuffle(choices);
  return {
    sequence,
    answer,
    choices: shuffled,
    target: shuffled.findIndex((c) => c.emoji === answer.emoji),
    key: pat.key,
  };
}

const PROMPT = "Vật nào tiếp theo?";

export default function PatternPage() {
  const { addStars } = useChild();
  const { showToast, toastEl } = useToast();

  // round = null ở render đầu (kể cả SSR) để tránh lệch hydration — buildRound()
  // dùng Math.random() nên chỉ chạy ở client (trong effect khởi tạo).
  const [round, setRound] = useState<Round | null>(null);
  const [step, setStep] = useState(0); // câu thứ mấy (0..ROUNDS)
  const [wrong, setWrong] = useState<number | null>(null); // ô vừa chọn sai (rung)
  const [reveal, setReveal] = useState<string | null>(null); // emoji hiện trong ô "?" khi đúng
  const [lock, setLock] = useState(false); // khoá khi đang chuyển câu
  const [done, setDone] = useState(false);
  const advancing = useRef(false);

  const say = useCallback(() => void speak(PROMPT, "vi"), []);

  const start = useCallback(() => {
    const first = buildRound();
    setDone(false);
    setStep(0);
    setWrong(null);
    setReveal(null);
    setLock(false);
    advancing.current = false;
    setRound(first);
    say();
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
    const r = buildRound(round?.answer.emoji);
    setStep(nextStep);
    setWrong(null);
    setReveal(null);
    setLock(false);
    advancing.current = false;
    setRound(r);
    say();
  }, [step, round, say]);

  function choose(i: number, e: React.MouseEvent) {
    if (!round || lock || advancing.current) return;

    if (i === round.target) {
      advancing.current = true;
      setLock(true);
      setWrong(null);
      setReveal(round.answer.emoji); // lấp ô "?" bằng vật đúng
      playSuccess();
      confettiBurst(e.clientX, e.clientY);
      addStars(1);
      showToast(`${pick(PRAISES)} Tiếp theo là ${round.answer.vi} 🎉`);
      setStep((s) => s + 1); // tô sáng ngôi sao ngay
      setTimeout(next, 1100);
    } else {
      // Sai: rung nhẹ, cho nghe lại, thử tiếp — không trừ điểm.
      setWrong(i);
      playWrong();
      say();
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
          <span aria-hidden>🧩</span> Tiếp nối dãy
        </h1>
        <button
          type="button"
          className="lt-replay"
          onClick={say}
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
            onClick={say}
            aria-label={`Nghe lại: ${PROMPT}`}
          >
            <span className="lt-prompt-ic" aria-hidden>
              🔊
            </span>
            <span className="lt-prompt-body">
              <span className="lt-prompt-text">{PROMPT}</span>
            </span>
          </button>

          <div className="pat-strip" role="img" aria-label="Dãy vật lặp theo quy luật, còn thiếu vật cuối">
            <div className="pat-seq">
              {round.sequence.map((em, i) => (
                <span key={i} className="pat-cell">
                  <Emoji emoji={em} className="pat-em" />
                </span>
              ))}
              <span className={`pat-cell pat-q ${reveal ? "filled" : ""}`}>
                {reveal ? (
                  <Emoji emoji={reveal} className="pat-em" />
                ) : (
                  <span className="pat-qmark" aria-hidden>
                    ?
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="lt-grid n3 pat-choices">
            {round.choices.map((c, i) => (
              <button
                key={`${c.emoji}-${i}`}
                type="button"
                className={`lt-card ${wrong === i ? "wrong" : ""}`}
                onClick={(e) => choose(i, e)}
                disabled={lock}
                aria-label={c.vi}
              >
                <Emoji emoji={c.emoji} className="lt-emoji" />
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
              Bé nối đúng cả {ROUNDS} dãy rồi. Giỏi quá đi! Được {ROUNDS} ngôi sao ⭐
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
