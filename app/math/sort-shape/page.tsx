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
  COLORS,
  PER_CAT,
  PRAISES,
  ROUNDS,
  SHAPES,
  type Shape,
} from "./data";

// "Phân loại hình" — mỗi lượt bốc 2 LOẠI hình (2 rổ); khay có nhiều hình thuộc 2
// loại đó, mỗi hình tô một màu ngẫu nhiên. Bé kéo (hoặc chạm chọn rồi chạm rổ) để
// bỏ mỗi hình vào ĐÚNG rổ theo DẠNG hình (bỏ qua màu). Bỏ đúng → khen + pháo giấy;
// bỏ sai → rung nhẹ, hình ở lại (không trừ điểm). Đúng HẾT một lượt = 1 ngôi sao
// rồi sang lượt mới. Đủ ROUNDS lượt → mở lượt mừng. Dùng chung khung .sort-* của
// trò "Phân loại vào rổ".

const DRAG_THRESHOLD = 8; // px: quá ngưỡng này mới coi là "kéo" (nhỏ hơn = "chạm")

type Tile = { shape: Shape; color: string; id: string };
type Round = { shapes: [Shape, Shape]; tiles: Tile[] };

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const isNear = (a: Shape, b: Shape) => a.near === b.key || b.near === a.key;

// Dựng một lượt: bốc 2 loại hình khác nhau (không dễ nhầm, tránh trùng cặp lượt
// trước cho đỡ nhàm); mỗi loại lấy PER_CAT hình, mỗi hình một màu khác nhau; trộn
// chung vào khay.
function buildRound(avoid?: [string, string]): Round {
  const avoidSet = avoid ? new Set(avoid) : null;
  let a = pick(SHAPES);
  let b = pick(SHAPES);
  let guard = 0;
  while (
    (a.key === b.key ||
      isNear(a, b) ||
      (avoidSet && avoidSet.has(a.key) && avoidSet.has(b.key))) &&
    guard++ < 60
  ) {
    a = pick(SHAPES);
    b = pick(SHAPES);
  }
  const tiles: Tile[] = [];
  for (const shape of [a, b]) {
    const cols = shuffle(COLORS).slice(0, PER_CAT);
    for (let i = 0; i < PER_CAT; i++) {
      tiles.push({ shape, color: cols[i], id: `${shape.key}-${i}` });
    }
  }
  return { shapes: [a, b], tiles: shuffle(tiles) };
}

const instructionFor = (r: Round) =>
  `Bỏ ${r.shapes[0].phrase} và ${r.shapes[1].phrase} vào đúng rổ nhé!`;

// ---- Vẽ hình bằng SVG (viewBox 0 0 100 100, đủ lề để không chạm mép) ----
const STAR_PTS =
  "50,5 60.6,35.4 92.8,36.1 67.1,55.6 76.5,86.4 50,68 23.5,86.4 32.9,55.6 7.2,36.1 39.4,35.4";
const HEART_D =
  "M50 88 C 14 62, 8 34, 30 22 C 42 15, 50 24, 50 30 C 50 24, 58 15, 70 22 C 92 34, 86 62, 50 88 Z";
const HEX_PTS = "20,6 80,6 98,50 80,94 20,94 2,50";

function ShapeSvg({
  shape,
  color,
  className,
}: {
  shape: Shape;
  color: string;
  className?: string;
}) {
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
    <svg
      className={className}
      viewBox="0 0 100 100"
      role="img"
      aria-label={shape.phrase}
    >
      {el}
    </svg>
  );
}

type Drag = { x: number; y: number; tile: Tile };

export default function SortShapePage() {
  const { addStars } = useChild();
  const record = useRecordActivity();
  const { showToast, toastEl } = useToast();

  // round = null ở render đầu (kể cả SSR) để tránh lệch hydration — buildRound()
  // dùng Math.random() nên chỉ chạy ở client (trong effect khởi tạo).
  const [round, setRound] = useState<Round | null>(null);
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(0); // số lượt đã xong = số sao
  const [selected, setSelected] = useState<string | null>(null); // hình đang "nhấc"
  const [overKey, setOverKey] = useState<string | null>(null); // rổ đang được rê tới
  const [wrongKey, setWrongKey] = useState<string | null>(null); // rổ vừa bỏ sai (rung)
  const [drag, setDrag] = useState<Drag | null>(null); // hình đang bay theo ngón tay
  const [done, setDone] = useState(false);
  // Xong 1 lượt chơi (đủ số vòng) → ghi nhận nhiệm vụ Vườn Toán.
  useEffect(() => {
    if (done) record("math", "sort-shape");
  }, [done, record]);

  const colRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const press = useRef<{ tile: Tile; x0: number; y0: number; moved: boolean } | null>(null);
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
    setOverKey(null);
    setWrongKey(null);
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
  const keyAtPoint = useCallback((x: number, y: number): string | null => {
    const r = roundRef.current;
    if (!r) return null;
    for (const shape of r.shapes) {
      const box = colRefs.current[shape.key]?.getBoundingClientRect();
      if (box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
        return shape.key;
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
        const next = buildRound(
          roundRef.current?.shapes.map((s) => s.key) as [string, string],
        );
        roundRef.current = next;
        placedRef.current = new Set();
        setRound(next);
        setPlaced(new Set());
        setSelected(null);
        setOverKey(null);
        setWrongKey(null);
        setDrag(null);
        transitioning.current = false;
        void speak(instructionFor(next), "vi");
      }, 950);
    }, 450);
  }, [addStars, showToast]);

  // Bỏ một hình vào rổ `key`. (x, y) là điểm nổ pháo giấy.
  const drop = useCallback(
    (tile: Tile, key: string, x: number, y: number) => {
      if (transitioning.current || placedRef.current.has(tile.id)) return;
      if (tile.shape.key === key) {
        playSuccess();
        confettiBurst(x, y);
        showToast(`${pick(PRAISES)} Đây là ${tile.shape.phrase}`);
        setSelected(null);
        const next = new Set(placedRef.current).add(tile.id);
        placedRef.current = next;
        setPlaced(next);
        if (roundRef.current && next.size >= roundRef.current.tiles.length) {
          finishRound();
        }
      } else {
        playWrong();
        setWrongKey(key);
        setTimeout(() => setWrongKey((c) => (c === key ? null : c)), 500);
      }
    },
    [showToast, finishRound],
  );

  // ---- Kéo bằng con trỏ (chuột + cảm ứng) ----
  function onPointerDown(e: React.PointerEvent, tile: Tile) {
    if (transitioning.current || placedRef.current.has(tile.id) || done) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    press.current = { tile, x0: e.clientX, y0: e.clientY, moved: false };
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
      setDrag({ x: e.clientX, y: e.clientY, tile: p.tile });
      setOverKey(keyAtPoint(e.clientX, e.clientY));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    const p = press.current;
    press.current = null;
    if (!p) return;
    if (p.moved) {
      const key = keyAtPoint(e.clientX, e.clientY);
      setDrag(null);
      setOverKey(null);
      if (key) drop(p.tile, key, e.clientX, e.clientY);
    } else {
      // Chạm (không kéo): nhấc/bỏ chọn hình để rồi chạm vào rổ.
      setSelected((cur) => (cur === p.tile.id ? null : p.tile.id));
    }
  }

  // Chạm/bấm vào rổ khi đã chọn sẵn một hình (chế độ chạm 2 bước / bàn phím).
  function tapBasket(key: string) {
    if (!selected || !round) return;
    const tile = round.tiles.find((t) => t.id === selected);
    if (!tile) return;
    const box = colRefs.current[key]?.getBoundingClientRect();
    const cx = box ? box.left + box.width / 2 : window.innerWidth / 2;
    const cy = box ? box.top + box.height / 2 : window.innerHeight / 2;
    drop(tile, key, cx, cy);
  }

  const remaining = round?.tiles.filter((t) => !placed.has(t.id)) ?? [];
  const roundNo = Math.min(completed + 1, ROUNDS);
  const instruction = round ? instructionFor(round) : "";

  return (
    <main className="wrap sort-wrap">
      <div className="lt-top">
        <Link href="/math" className="pill">
          ← Trò chơi
        </Link>
        <h1 className="lt-title">
          <span aria-hidden>🔷</span> Phân loại hình
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
            {round.shapes.map((shape) => {
              const inBasket = round.tiles.filter(
                (t) => placed.has(t.id) && t.shape.key === shape.key,
              );
              const cls =
                "sort-col" +
                (overKey === shape.key ? " over" : "") +
                (wrongKey === shape.key ? " wrong" : "") +
                (selected ? " armed" : "");
              return (
                <button
                  key={shape.key}
                  ref={(el) => {
                    colRefs.current[shape.key] = el;
                  }}
                  type="button"
                  className={cls}
                  onClick={() => tapBasket(shape.key)}
                  aria-label={`Rổ ${shape.label}`}
                >
                  <span className="sort-cat">
                    <ShapeSvg
                      shape={shape}
                      color="var(--ink-soft)"
                      className="shsort-cat-svg"
                    />
                    <span className="sort-cat-label">{shape.label}</span>
                  </span>
                  <span className="sort-drop">
                    {inBasket.length > 0 && (
                      <span className="sort-placed" aria-hidden>
                        {inBasket.map((t) => (
                          <ShapeSvg
                            key={t.id}
                            shape={t.shape}
                            color={t.color}
                            className="shsort-placed-svg"
                          />
                        ))}
                      </span>
                    )}
                    <Emoji emoji="🧺" className="sort-basket" alt={`Rổ ${shape.label}`} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="sort-tray" aria-label="Khay hình cần phân loại">
            {remaining.map((t) => (
              <button
                key={t.id}
                type="button"
                className={
                  "sort-chip" +
                  (selected === t.id ? " sel" : "") +
                  (drag?.tile.id === t.id ? " dragging" : "")
                }
                style={{ touchAction: "none" }}
                onPointerDown={(e) => onPointerDown(e, t)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                aria-label={t.shape.phrase}
                aria-pressed={selected === t.id}
              >
                <ShapeSvg shape={t.shape} color={t.color} className="shsort-chip-svg" />
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
          <ShapeSvg shape={drag.tile.shape} color={drag.tile.color} className="shsort-chip-svg" />
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
