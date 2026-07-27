"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { speak, stopSpeaking } from "@/components/speak";
import {
  BAR_COLORS,
  endsFor,
  KINDS,
  KIND_KEYS,
  PRAISES,
  promptFor,
  ROUNDS,
  SIZES,
  type BarColor,
  type Dir,
  type OrderKind,
} from "./data";

// "Xếp theo thứ tự" — mỗi câu bốc một KIỂU so sánh (cao–thấp / ngắn–dài / nhỏ–to) rồi
// hiện vài hình cỡ khác nhau ở khay dưới và các ô trống ở trên. Bé kéo (hoặc chạm chọn
// rồi chạm ô) để xếp hình theo đúng thứ tự (đề đọc to). Đặt đúng một hình → khen + pháo
// giấy nhỏ; đặt sai ô → rung nhẹ, hình về khay (không trừ điểm). Xếp đúng HẾT một câu =
// 1 ngôi sao. Đủ ROUNDS câu → mở lượt mừng. Dùng chung khung .lt-* của Vườn Toán.

const DRAG_THRESHOLD = 8; // px: quá ngưỡng này mới coi là "kéo" (nhỏ hơn = "chạm")

type Bar = { id: string; lv: number; color: BarColor };
type Round = {
  kind: OrderKind;
  bars: Bar[];
  dir: Dir;
  order: string[]; // id hình theo đúng thứ tự ô
  maxLv: number;
  prompt: string;
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

// Dựng một câu: bốc kiểu (tránh lặp kiểu câu trước), số hình theo tiến trình (chặn theo
// maxN của kiểu), N mức cỡ khác nhau + N màu khác nhau, và chiều xếp (tránh lặp chiều).
function buildRound(index: number, avoidKind?: OrderKind, avoidDir?: Dir): Round {
  let kind = pick(KIND_KEYS);
  if (avoidKind && kind === avoidKind) {
    const others = KIND_KEYS.filter((k) => k !== avoidKind);
    kind = pick(others);
  }
  const n = Math.min(SIZES[index] ?? 4, KINDS[kind].maxN);
  const maxLevel = n + 2; // bốc N mức khác nhau từ 1..(n+2) để chênh lệch rõ
  const levels = shuffle(Array.from({ length: maxLevel }, (_, i) => i + 1)).slice(0, n);
  const colors = shuffle(BAR_COLORS).slice(0, n);
  const bars: Bar[] = levels.map((lv, i) => ({ id: `b${i}`, lv, color: colors[i] }));

  let dir: Dir = Math.random() < 0.5 ? "asc" : "desc";
  if (avoidDir && dir === avoidDir && Math.random() < 0.6) {
    dir = dir === "asc" ? "desc" : "asc";
  }
  const sorted = [...bars].sort((a, b) => (dir === "asc" ? a.lv - b.lv : b.lv - a.lv));
  const order = sorted.map((b) => b.id);
  const maxLv = Math.max(...bars.map((b) => b.lv));

  return { kind, bars: shuffle(bars), dir, order, maxLv, prompt: promptFor(kind, dir) };
}

type Drag = { x: number; y: number; bar: Bar };

function BarShape({
  bar,
  kind,
  className,
}: {
  bar: Bar;
  kind: OrderKind;
  className?: string;
}) {
  const style = {
    ["--lv" as string]: bar.lv,
    ["--top" as string]: bar.color.top,
    ["--bottom" as string]: bar.color.bottom,
  } as CSSProperties;
  return (
    <span className={`ord-bar-shape k-${kind} ${className ?? ""}`} style={style} aria-hidden />
  );
}

export default function OrderPage() {
  const { addStars } = useChild();
  const { showToast, toastEl } = useToast();

  // round = null ở render đầu (kể cả SSR) để tránh lệch hydration — buildRound() dùng
  // Math.random() nên chỉ chạy ở client (trong effect khởi tạo).
  const [round, setRound] = useState<Round | null>(null);
  const [placed, setPlaced] = useState<(string | null)[]>([]); // barId theo từng ô
  const [step, setStep] = useState(0); // số câu đã xong = số sao
  const [selected, setSelected] = useState<string | null>(null); // thanh đang "nhấc" (chạm)
  const [overSlot, setOverSlot] = useState<number | null>(null); // ô đang rê tới
  const [wrongSlot, setWrongSlot] = useState<number | null>(null); // ô vừa đặt sai (rung)
  const [drag, setDrag] = useState<Drag | null>(null); // thanh đang bay theo ngón tay
  const [done, setDone] = useState(false);

  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const press = useRef<{ bar: Bar; x0: number; y0: number; moved: boolean } | null>(null);
  // Mirror state để logic đồng bộ (tránh closure cũ khi bé thao tác nhanh).
  const roundRef = useRef<Round | null>(null);
  const placedRef = useRef<(string | null)[]>([]);
  const stepRef = useRef(0);
  const transitioning = useRef(false);

  const start = useCallback(() => {
    const r = buildRound(0);
    roundRef.current = r;
    placedRef.current = Array(r.bars.length).fill(null);
    stepRef.current = 0;
    transitioning.current = false;
    setRound(r);
    setPlaced(placedRef.current);
    setStep(0);
    setSelected(null);
    setOverSlot(null);
    setWrongSlot(null);
    setDrag(null);
    setDone(false);
    void speak(r.prompt, "vi");
  }, []);

  // Khởi tạo ở client (tránh random khi SSR); dừng đọc khi rời trang.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    start();
    return () => stopSpeaking();
  }, [start]);

  // Ô nào đang nằm dưới điểm (x, y)? — dùng để thả khi kéo.
  const slotAtPoint = useCallback((x: number, y: number): number | null => {
    for (let i = 0; i < slotRefs.current.length; i++) {
      const box = slotRefs.current[i]?.getBoundingClientRect();
      if (box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
        return i;
      }
    }
    return null;
  }, []);

  // Xong một câu: thưởng 1 sao, mừng, rồi sang câu mới (hoặc mở lượt mừng cuối).
  const finishRound = useCallback(() => {
    if (transitioning.current) return;
    transitioning.current = true;
    setTimeout(() => {
      addStars(1);
      confettiBurst();
      playSuccess();
      const ns = stepRef.current + 1;
      stepRef.current = ns;
      setStep(ns);
      if (ns >= ROUNDS) {
        setTimeout(() => {
          setDone(true);
          confettiBurst();
          playSuccess();
        }, 550);
        return;
      }
      showToast(`${pick(PRAISES)} Sang câu mới nào 🎉`);
      setTimeout(() => {
        const next = buildRound(ns, roundRef.current?.kind, roundRef.current?.dir);
        roundRef.current = next;
        placedRef.current = Array(next.bars.length).fill(null);
        setRound(next);
        setPlaced(placedRef.current);
        setSelected(null);
        setOverSlot(null);
        setWrongSlot(null);
        setDrag(null);
        transitioning.current = false;
        void speak(next.prompt, "vi");
      }, 950);
    }, 450);
  }, [addStars, showToast]);

  // Đặt một thanh vào ô `slot`. (x, y) là điểm nổ pháo giấy.
  const drop = useCallback(
    (bar: Bar, slot: number, x: number, y: number) => {
      const r = roundRef.current;
      if (!r || transitioning.current) return;
      if (placedRef.current.includes(bar.id)) return; // đã đặt rồi
      if (placedRef.current[slot] != null) return; // ô đã có thanh
      if (r.order[slot] === bar.id) {
        playSuccess();
        confettiBurst(x, y);
        setSelected(null);
        const next = [...placedRef.current];
        next[slot] = bar.id;
        placedRef.current = next;
        setPlaced(next);
        if (next.every((v) => v != null)) {
          finishRound();
        } else {
          showToast(pick(PRAISES));
        }
      } else {
        playWrong();
        setWrongSlot(slot);
        setTimeout(() => setWrongSlot((c) => (c === slot ? null : c)), 500);
      }
    },
    [showToast, finishRound],
  );

  // ---- Kéo bằng con trỏ (chuột + cảm ứng) ----
  function onPointerDown(e: React.PointerEvent, bar: Bar) {
    if (transitioning.current || done) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    press.current = { bar, x0: e.clientX, y0: e.clientY, moved: false };
  }

  function onPointerMove(e: React.PointerEvent) {
    const p = press.current;
    if (!p) return;
    const dist = Math.hypot(e.clientX - p.x0, e.clientY - p.y0);
    if (!p.moved && dist > DRAG_THRESHOLD) {
      p.moved = true;
      setSelected(null);
    }
    if (p.moved) {
      setDrag({ x: e.clientX, y: e.clientY, bar: p.bar });
      setOverSlot(slotAtPoint(e.clientX, e.clientY));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    const p = press.current;
    press.current = null;
    if (!p) return;
    if (p.moved) {
      const slot = slotAtPoint(e.clientX, e.clientY);
      setDrag(null);
      setOverSlot(null);
      if (slot != null) drop(p.bar, slot, e.clientX, e.clientY);
    } else {
      // Chạm (không kéo): nhấc/bỏ chọn thanh để rồi chạm vào ô.
      setSelected((cur) => (cur === p.bar.id ? null : p.bar.id));
    }
  }

  // Chạm/bấm vào ô khi đã chọn sẵn một thanh (chế độ chạm 2 bước / bàn phím).
  function tapSlot(slot: number) {
    if (selected == null || !round) return;
    const bar = round.bars.find((b) => b.id === selected);
    if (!bar) return;
    const box = slotRefs.current[slot]?.getBoundingClientRect();
    const cx = box ? box.left + box.width / 2 : window.innerWidth / 2;
    const cy = box ? box.top + box.height / 2 : window.innerHeight / 2;
    drop(bar, slot, cx, cy);
  }

  const remaining = round?.bars.filter((b) => !placed.includes(b.id)) ?? [];
  const filled = done ? ROUNDS : step;
  const barById = (id: string | null) =>
    id != null ? round?.bars.find((b) => b.id === id) ?? null : null;

  return (
    <main className="wrap lt-wrap ord-wrap">
      <div className="lt-top">
        <Link href="/math" className="pill">
          ← Trò chơi
        </Link>
        <h1 className="lt-title">
          <span aria-hidden>📊</span> Xếp theo thứ tự
        </h1>
        <button
          type="button"
          className="lt-replay"
          onClick={() => round && void speak(round.prompt, "vi")}
          disabled={!round}
          aria-label="Nghe lại lời nhắc"
          title="Nghe lại"
        >
          🔊
        </button>
      </div>

      <div className="lt-stars" aria-label={`Đã đúng ${filled} trên ${ROUNDS} câu`}>
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
            className="lt-prompt ord-prompt"
            onClick={() => void speak(round.prompt, "vi")}
            aria-label={`Nghe lại: ${round.prompt}`}
          >
            <span className="lt-prompt-ic" aria-hidden>
              🔊
            </span>
            <span className="lt-prompt-body">
              <span className="lt-prompt-text">{round.prompt}</span>
            </span>
          </button>

          {/* Sân xếp: các ô trống bé thả hình vào (bám mép để so cỡ từ cùng mặt phẳng). */}
          <div className={`ord-stage kind-${round.kind}`}>
            <div className="ord-slots">
              {round.order.map((_, slot) => {
                const inBar = barById(placed[slot]);
                const cls =
                  "ord-slot" +
                  (overSlot === slot ? " over" : "") +
                  (wrongSlot === slot ? " wrong" : "") +
                  (inBar ? " filled" : "") +
                  (selected != null && !inBar ? " armed" : "");
                return (
                  <button
                    key={slot}
                    ref={(el) => {
                      slotRefs.current[slot] = el;
                    }}
                    type="button"
                    className={cls}
                    style={{ ["--slot-lv" as string]: round.maxLv } as CSSProperties}
                    onClick={() => tapSlot(slot)}
                    aria-label={`Ô thứ ${slot + 1}`}
                    disabled={!!inBar}
                  >
                    {inBar && <BarShape bar={inBar} kind={round.kind} className="in-slot" />}
                  </button>
                );
              })}
            </div>
            <div className={`ord-guide arrow-${KINDS[round.kind].arrow === "↓" ? "down" : "right"}`} aria-hidden>
              {(() => {
                const [a, b] = endsFor(round.kind, round.dir);
                return (
                  <>
                    <span className="ord-guide-end">{a}</span>
                    <span className="ord-guide-arrow">{KINDS[round.kind].arrow}</span>
                    <span className="ord-guide-end">{b}</span>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Khay hình cần xếp. */}
          <div className={`ord-tray kind-${round.kind}`} aria-label="Khay các hình cần xếp">
            {remaining.map((b) => (
              <button
                key={b.id}
                type="button"
                className={
                  "ord-bar" +
                  (selected === b.id ? " sel" : "") +
                  (drag?.bar.id === b.id ? " dragging" : "")
                }
                style={{ touchAction: "none" }}
                onPointerDown={(e) => onPointerDown(e, b)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                aria-label={`Hình cỡ ${b.lv}`}
                aria-pressed={selected === b.id}
              >
                <BarShape bar={b} kind={round.kind} />
              </button>
            ))}
            {remaining.length === 0 && !done && (
              <span className="ord-tray-empty">Xong câu này! 🎉</span>
            )}
          </div>
        </>
      )}

      {drag && round && (
        <div className="ord-float" style={{ left: drag.x, top: drag.y }} aria-hidden>
          <BarShape bar={drag.bar} kind={round.kind} />
        </div>
      )}

      {done && (
        <div className="modal-back" role="dialog" aria-modal="true">
          <div className="modal result-modal lt-result">
            <div className="lt-result-emoji" aria-hidden>
              🎉
            </div>
            <h2>Tuyệt vời!</h2>
            <p>
              Bé xếp đúng thứ tự cả {ROUNDS} câu rồi. Giỏi quá đi! Được {ROUNDS} ngôi
              sao ⭐
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
