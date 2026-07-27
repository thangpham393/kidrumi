"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { speak, stopSpeaking } from "@/components/speak";
import Emoji from "@/components/Emoji";
import type { LtWord } from "./types";

type Props = {
  words: LtWord[]; // kho từ đích
  distractors: LtWord[]; // kho hình gây nhiễu (⊇ words)
  prompts: ((term: string) => string)[]; // mẫu câu lệnh
  choices: number; // số hình để chọn (2..4)
  total: number; // số câu mỗi chặng
  showLabel: boolean; // hiện chữ dưới hình (Làm quen)
  lang: string; // mã đọc TTS: "en" | "zh"
  variant?: string; // "zh" → font chữ Hán
  topicLabel: string; // vd "Con vật"
  stage: string; // vd "Phân biệt"
  icon: string; // emoji chủ đề
  backHref: string; // về lộ trình
  nextHref?: string; // chặng kế tiếp (nếu có)
  onDone: () => void; // đánh dấu hoàn thành chặng
};

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

export default function ListenLesson({
  words,
  distractors,
  prompts,
  choices,
  total,
  showLabel,
  lang,
  variant,
  topicLabel,
  stage,
  icon,
  backHref,
  nextHref,
  onDone,
}: Props) {
  const { addStars } = useChild();
  const { showToast, toastEl } = useToast();

  // Dựng một câu: chọn từ đích + (choices-1) hình gây nhiễu khác hẳn nó.
  const buildRound = useCallback(
    (avoidKey?: string): Round => {
      let target = pick(words);
      if (words.length > 1) while (target.key === avoidKey) target = pick(words);

      const options: LtWord[] = [target];
      let guard = 0;
      while (options.length < choices && guard++ < 200) {
        const d = pick(distractors);
        if (options.some((o) => o.key === d.key || o.emoji === d.emoji)) continue;
        options.push(d);
      }
      const prompt = pick(prompts)(target.term);
      return { prompt, target, options: shuffle(options) };
    },
    [words, distractors, prompts, choices],
  );

  // round = null ở lần render đầu (kể cả SSR) để tránh lệch hydration —
  // buildRound() dùng Math.random() nên chỉ chạy ở client (trong effect).
  const [round, setRound] = useState<Round | null>(null);
  const [step, setStep] = useState(0); // câu thứ mấy (0..total)
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [lock, setLock] = useState(false);
  const [done, setDone] = useState(false);
  const advancing = useRef(false);

  const say = useCallback(
    (r: Round | null) => {
      if (r) void speak(r.prompt, lang);
    },
    [lang],
  );

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

  useEffect(() => {
    // Cố ý setState sau khi mount: câu đầu phải sinh ở client để khớp hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    start();
    return () => stopSpeaking();
  }, [start]);

  function next(afterCorrect: boolean) {
    const nextStep = step + (afterCorrect ? 1 : 0);
    if (nextStep >= total) {
      setStep(total);
      setDone(true);
      setRound(null);
      confettiBurst();
      playSuccess();
      stopSpeaking();
      onDone();
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
      setStep((s) => s + 1);
      setTimeout(() => next(true), 1100);
    } else {
      // Sai: rung nhẹ, cho nghe lại, thử tiếp — không trừ điểm.
      setWrongKey(w.key);
      playWrong();
      say(round);
      setTimeout(() => setWrongKey((cur) => (cur === w.key ? null : cur)), 500);
    }
  }

  const filled = done ? total : step;

  return (
    <main className={`wrap lt-wrap ll-lesson ${variant ? `lt-${variant}` : ""}`}>
      <div className="lt-top">
        <Link href={backHref} className="pill">
          ← Lộ trình
        </Link>
        <h1 className="lt-title">
          <span aria-hidden>{icon}</span> {topicLabel} · {stage}
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

      {/* Thanh tiến độ 10 câu (gọn hơn hàng 10 ngôi sao). */}
      <div className="ll-bar" aria-label={`Đã đúng ${filled} trên ${total} câu`}>
        <div className="ll-bar-track">
          <div className="ll-bar-fill" style={{ width: `${(filled / total) * 100}%` }} />
        </div>
        <div className="ll-bar-count">
          <span aria-hidden>⭐</span> {filled}/{total}
        </div>
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

          <div className={`lt-grid n${choices} ${showLabel ? "with-label" : ""}`}>
            {round.options.map((w) => (
              <button
                key={w.key}
                type="button"
                className={`lt-card ${wrongKey === w.key ? "wrong" : ""}`}
                onClick={(e) => choose(w, e)}
                disabled={lock}
                aria-label={w.vi}
              >
                <Emoji emoji={w.emoji} className="lt-emoji" />
                {showLabel && <span className="ll-card-label">{w.term}</span>}
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
              Bé hoàn thành chặng <b>{stage}</b> rồi. Giỏi quá đi! Được {total} ngôi
              sao ⭐
            </p>
            <div className="lt-result-actions">
              {nextHref ? (
                <Link href={nextHref} className="btn">
                  Chặng tiếp theo →
                </Link>
              ) : (
                <button type="button" className="btn" onClick={start}>
                  Chơi lại →
                </button>
              )}
              <Link href={backHref} className="btn-ghost">
                Về lộ trình
              </Link>
            </div>
          </div>
        </div>
      )}

      {toastEl}
    </main>
  );
}
