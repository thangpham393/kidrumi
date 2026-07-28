"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { useRecordActivity } from "@/lib/missions";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { speak, stopSpeaking } from "@/components/speak";
import Emoji from "@/components/Emoji";
import {
  CATEGORIES,
  PER_CAT,
  PRAISES,
  ROUNDS,
  type SortCategory,
  type SortThing,
} from "./data";

// "Phân loại vào rổ" — mỗi lượt bốc 2 chủ đề (2 rổ) từ kho nhiều chủ đề; bé kéo
// (hoặc chạm chọn rồi chạm rổ) để bỏ mỗi vật vào ĐÚNG rổ. Bỏ đúng một vật → khen
// + pháo giấy nhỏ; bỏ sai → rung nhẹ, vật ở lại (không trừ điểm). Phân loại ĐÚNG
// HẾT một lượt = 1 ngôi sao rồi sang lượt mới. Đủ ROUNDS lượt → mở lượt mừng.

const DRAG_THRESHOLD = 8; // px: quá ngưỡng này mới coi là "kéo" (nhỏ hơn = "chạm")

type RoundThing = SortThing & { id: string; cat: string };
type Round = { cats: [SortCategory, SortCategory]; things: RoundThing[] };

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Dựng một lượt: bốc 2 chủ đề khác nhau (tránh trùng cặp lượt trước cho đỡ nhàm),
// mỗi chủ đề lấy PER_CAT vật khác nhau, rồi trộn chung vào khay.
function buildRound(avoid?: [string, string]): Round {
  let a = pick(CATEGORIES);
  let b = pick(CATEGORIES);
  const avoidSet = avoid ? new Set(avoid) : null;
  let guard = 0;
  while (
    (a.key === b.key || (avoidSet && avoidSet.has(a.key) && avoidSet.has(b.key))) &&
    guard++ < 40
  ) {
    a = pick(CATEGORIES);
    b = pick(CATEGORIES);
  }
  const things: RoundThing[] = [];
  for (const cat of [a, b]) {
    const seen = new Set<string>();
    while (seen.size < PER_CAT) {
      const t = pick(cat.things);
      if (seen.has(t.emoji)) continue;
      seen.add(t.emoji);
      things.push({ ...t, cat: cat.key, id: `${cat.key}-${t.emoji}` });
    }
  }
  return { cats: [a, b], things: shuffle(things) };
}

const instructionFor = (r: Round) =>
  `Bỏ ${r.cats[0].label.toLowerCase()} và ${r.cats[1].label.toLowerCase()} vào đúng rổ nhé!`;

type Drag = { x: number; y: number; emoji: string; id: string };

export default function SortBasketPage() {
  const { addStars } = useChild();
  const record = useRecordActivity();
  const { showToast, toastEl } = useToast();

  // round = null ở render đầu (kể cả SSR) để tránh lệch hydration — buildRound()
  // dùng Math.random() nên chỉ chạy ở client (trong effect khởi tạo).
  const [round, setRound] = useState<Round | null>(null);
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(0); // số lượt đã xong = số sao
  const [selected, setSelected] = useState<string | null>(null); // vật đang "nhấc" (chạm)
  const [overCat, setOverCat] = useState<string | null>(null); // rổ đang được rê tới
  const [wrongCat, setWrongCat] = useState<string | null>(null); // rổ vừa bỏ sai (rung đỏ)
  const [drag, setDrag] = useState<Drag | null>(null); // vật đang bay theo ngón tay
  const [done, setDone] = useState(false);
  // Xong 1 lượt chơi (đủ số vòng) → ghi nhận nhiệm vụ Vườn Toán.
  useEffect(() => {
    if (done) record("math", "sort");
  }, [done, record]);

  const colRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const press = useRef<{ item: RoundThing; x0: number; y0: number; moved: boolean } | null>(null);
  // Mirror state để logic đồng bộ (tránh closure cũ khi bé thao tác nhanh).
  const roundRef = useRef<Round | null>(null);
  const placedRef = useRef<Set<string>>(new Set());
  const completedRef = useRef(0);
  const transitioning = useRef(false); // đang chuyển lượt → khoá tính lượt lặp

  const start = useCallback(() => {
    const r = buildRound();
    roundRef.current = r;
    placedRef.current = new Set();
    completedRef.current = 0;
    transitioning.current = false;
    setRound(r);
    setPlaced(new Set());
    setCompleted(0);
    setSelected(null);
    setOverCat(null);
    setWrongCat(null);
    setDrag(null);
    setDone(false);
    void speak(instructionFor(r), "vi");
  }, []);

  // Khởi tạo ở client (tránh random khi SSR); dừng đọc khi rời trang.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    start();
    return () => stopSpeaking();
  }, [start]);

  // Rổ nào đang nằm dưới điểm (x, y)? — dùng để thả khi kéo.
  const catAtPoint = useCallback((x: number, y: number): string | null => {
    const r = roundRef.current;
    if (!r) return null;
    for (const cat of r.cats) {
      const box = colRefs.current[cat.key]?.getBoundingClientRect();
      if (box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
        return cat.key;
      }
    }
    return null;
  }, []);

  // Xong một lượt: thưởng 1 sao, mừng, rồi sang lượt mới (hoặc mở lượt mừng cuối).
  const finishRound = useCallback(() => {
    if (transitioning.current) return;
    transitioning.current = true;
    setTimeout(() => {
      addStars(1);
      confettiBurst();
      playSuccess();
      const nc = completedRef.current + 1;
      completedRef.current = nc;
      setCompleted(nc);
      if (nc >= ROUNDS) {
        setTimeout(() => {
          setDone(true);
          confettiBurst();
          playSuccess();
        }, 550);
        return;
      }
      showToast(`${pick(PRAISES)} Sang lượt mới nào 🎉`);
      setTimeout(() => {
        const next = buildRound(roundRef.current?.cats.map((c) => c.key) as [string, string]);
        roundRef.current = next;
        placedRef.current = new Set();
        setRound(next);
        setPlaced(new Set());
        setSelected(null);
        setOverCat(null);
        setWrongCat(null);
        setDrag(null);
        transitioning.current = false;
        void speak(instructionFor(next), "vi");
      }, 950);
    }, 450);
  }, [addStars, showToast]);

  // Bỏ một vật vào rổ `catKey`. (x, y) là điểm nổ pháo giấy.
  const drop = useCallback(
    (item: RoundThing, catKey: string, x: number, y: number) => {
      if (transitioning.current || placedRef.current.has(item.id)) return;
      if (item.cat === catKey) {
        playSuccess();
        confettiBurst(x, y);
        showToast(`${pick(PRAISES)} ${item.emoji} là ${item.vi}`);
        setSelected(null);
        const next = new Set(placedRef.current).add(item.id);
        placedRef.current = next;
        setPlaced(next);
        if (roundRef.current && next.size >= roundRef.current.things.length) {
          finishRound();
        }
      } else {
        playWrong();
        setWrongCat(catKey);
        setTimeout(() => setWrongCat((c) => (c === catKey ? null : c)), 500);
      }
    },
    [showToast, finishRound],
  );

  // ---- Kéo bằng con trỏ (chuột + cảm ứng) ----
  function onPointerDown(e: React.PointerEvent, item: RoundThing) {
    if (transitioning.current || placedRef.current.has(item.id) || done) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    press.current = { item, x0: e.clientX, y0: e.clientY, moved: false };
  }

  function onPointerMove(e: React.PointerEvent) {
    const p = press.current;
    if (!p) return;
    const dist = Math.hypot(e.clientX - p.x0, e.clientY - p.y0);
    if (!p.moved && dist > DRAG_THRESHOLD) {
      p.moved = true;
      setSelected(null); // bắt đầu kéo thì bỏ trạng thái "đang chọn"
    }
    if (p.moved) {
      setDrag({ x: e.clientX, y: e.clientY, emoji: p.item.emoji, id: p.item.id });
      setOverCat(catAtPoint(e.clientX, e.clientY));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    const p = press.current;
    press.current = null;
    if (!p) return;
    if (p.moved) {
      const cat = catAtPoint(e.clientX, e.clientY);
      setDrag(null);
      setOverCat(null);
      if (cat) drop(p.item, cat, e.clientX, e.clientY);
    } else {
      // Chạm (không kéo): nhấc/bỏ chọn vật để rồi chạm vào rổ.
      setSelected((cur) => (cur === p.item.id ? null : p.item.id));
    }
  }

  // Chạm/bấm vào rổ khi đã chọn sẵn một vật (chế độ chạm 2 bước / bàn phím).
  function tapBasket(catKey: string) {
    if (!selected || !round) return;
    const item = round.things.find((t) => t.id === selected);
    if (!item) return;
    const box = colRefs.current[catKey]?.getBoundingClientRect();
    const cx = box ? box.left + box.width / 2 : window.innerWidth / 2;
    const cy = box ? box.top + box.height / 2 : window.innerHeight / 2;
    drop(item, catKey, cx, cy);
  }

  const remaining = round?.things.filter((t) => !placed.has(t.id)) ?? [];
  const roundNo = Math.min(completed + 1, ROUNDS);
  const instruction = round ? instructionFor(round) : "";

  return (
    <main className="wrap sort-wrap">
      <div className="lt-top">
        <Link href="/math" className="pill">
          ← Trò chơi
        </Link>
        <h1 className="lt-title">
          <span aria-hidden>🧺</span> Phân loại vào rổ
        </h1>
        <button
          type="button"
          className="lt-replay"
          onClick={() => round && void speak(instruction, "vi")}
          disabled={!round}
          aria-label="Nghe lại lời nhắc"
          title="Nghe lại"
        >
          🔊
        </button>
      </div>

      <div className="lt-stars" aria-label={`Đã xong ${completed} trên ${ROUNDS} lượt`}>
        {Array.from({ length: ROUNDS }, (_, i) => (
          <span key={i} className={`lt-star ${i < completed ? "on" : ""}`} aria-hidden>
            {i < completed ? "⭐" : "☆"}
          </span>
        ))}
      </div>
      <p className="sort-round">Lượt {roundNo} / {ROUNDS}</p>

      {round && (
        <>
          <button
            type="button"
            className="lt-prompt sort-prompt"
            onClick={() => void speak(instruction, "vi")}
            aria-label={`Nghe lại: ${instruction}`}
          >
            <span className="lt-prompt-ic" aria-hidden>
              🔊
            </span>
            <span className="lt-prompt-body">
              <span className="lt-prompt-text">{instruction}</span>
            </span>
          </button>

          <div className="sort-cols">
            {round.cats.map((cat) => {
              const inBasket = round.things.filter(
                (t) => placed.has(t.id) && t.cat === cat.key,
              );
              const style = {
                ["--tone" as string]: cat.tone,
                ["--soft" as string]: cat.soft,
              } as CSSProperties;
              const cls =
                "sort-col" +
                (overCat === cat.key ? " over" : "") +
                (wrongCat === cat.key ? " wrong" : "") +
                (selected ? " armed" : "");
              return (
                <button
                  key={cat.key}
                  ref={(el) => {
                    colRefs.current[cat.key] = el;
                  }}
                  type="button"
                  className={cls}
                  style={style}
                  onClick={() => tapBasket(cat.key)}
                  aria-label={`Rổ ${cat.label}`}
                >
                  <span className="sort-cat">
                    <span className="sort-cat-emojis" aria-hidden>
                      <Emoji emoji={cat.hint[0]} className="sort-cat-em" />
                      <Emoji emoji={cat.hint[1]} className="sort-cat-em" />
                    </span>
                    <span className="sort-cat-label">{cat.label}</span>
                  </span>
                  <span className="sort-drop">
                    {inBasket.length > 0 && (
                      <span className="sort-placed" aria-hidden>
                        {inBasket.map((t) => (
                          <Emoji key={t.id} emoji={t.emoji} className="sort-placed-em" />
                        ))}
                      </span>
                    )}
                    <Emoji emoji="🧺" className="sort-basket" alt={`Rổ ${cat.label}`} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="sort-tray" aria-label="Khay đồ cần phân loại">
            {remaining.map((t) => (
              <button
                key={t.id}
                type="button"
                className={
                  "sort-chip" +
                  (selected === t.id ? " sel" : "") +
                  (drag?.id === t.id ? " dragging" : "")
                }
                style={{ touchAction: "none" }}
                onPointerDown={(e) => onPointerDown(e, t)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                aria-label={t.vi}
                aria-pressed={selected === t.id}
              >
                <Emoji emoji={t.emoji} className="sort-chip-em" />
              </button>
            ))}
            {remaining.length === 0 && !done && (
              <span className="sort-tray-empty">Xong lượt này! 🎉</span>
            )}
          </div>
        </>
      )}

      {drag && (
        <div className="sort-float" style={{ left: drag.x, top: drag.y }} aria-hidden>
          <Emoji emoji={drag.emoji} className="sort-chip-em" />
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
              Bé phân loại đúng cả {ROUNDS} lượt rồi. Giỏi quá đi! Được {ROUNDS} ngôi
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
