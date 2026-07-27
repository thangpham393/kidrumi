"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useChild } from "@/components/ChildContext";
import { useToast } from "@/components/useToast";
import { confettiBurst, playSuccess, playWrong } from "@/components/celebrate";
import { speak, stopSpeaking } from "@/components/speak";
import {
  INSTRUCTION,
  LISTEN_LABEL,
  PRAISES,
  ROUNDS,
  STORIES,
  type Story,
  type StoryFrame,
} from "./data";

// "Nghe hiểu câu chuyện" — mỗi câu, Google TTS đọc một truyện ngắn 3 câu rồi hiện 3 bức
// tranh (xáo trộn) ở khay dưới + 3 ô trống ở trên. Bé kéo (hoặc chạm chọn rồi chạm ô) để
// xếp tranh theo đúng thứ tự trước–sau. Đặt đúng một tranh → khen + pháo giấy + đọc lời
// khung ấy; đặt sai → rung nhẹ, tranh về khay (không trừ điểm). Xếp đúng HẾT một truyện =
// 1 ngôi sao. Đủ ROUNDS truyện → mở lượt mừng. Dùng chung khung .lt-* của các góc học.

const DRAG_THRESHOLD = 8; // px: quá ngưỡng này mới coi là "kéo" (nhỏ hơn = "chạm")

type Round = {
  story: Story;
  tray: StoryFrame[]; // các tranh đã xáo trộn để bé xếp
  order: string[]; // id tranh theo đúng thứ tự ô (0..2)
};

const idOf = (f: StoryFrame) => `${f.n}`; // mỗi truyện chỉ có n=1,2,3 → id gọn theo n

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function makeRound(story: Story): Round {
  // Xáo cho tới khi KHÔNG trùng đúng thứ tự gốc (để bé luôn phải nghĩ, không "ăn may").
  let tray = shuffle(story.frames);
  while (tray.every((f, i) => f.n === i + 1)) tray = shuffle(story.frames);
  return { story, tray, order: story.frames.map(idOf) };
}

type Drag = { x: number; y: number; frame: StoryFrame };

function Pic({ frame, className }: { frame: StoryFrame; className?: string }) {
  return (
    <span className={`story-pic ${className ?? ""}`}>
      <Image src={frame.img} alt={frame.alt} fill sizes="(max-width: 720px) 30vw, 300px" draggable={false} />
    </span>
  );
}

export default function StoryPage() {
  const { addStars } = useChild();
  const { showToast, toastEl } = useToast();

  // round = null ở render đầu (kể cả SSR) để tránh lệch hydration — makeRound() dùng
  // Math.random() nên chỉ chạy ở client (trong effect khởi tạo).
  const [round, setRound] = useState<Round | null>(null);
  const [placed, setPlaced] = useState<(string | null)[]>([null, null, null]); // id tranh theo ô
  const [step, setStep] = useState(0); // số truyện đã xong = số sao
  const [selected, setSelected] = useState<string | null>(null); // tranh đang "nhấc" (chạm)
  const [overSlot, setOverSlot] = useState<number | null>(null); // ô đang rê tới
  const [wrongSlot, setWrongSlot] = useState<number | null>(null); // ô vừa đặt sai (rung)
  const [drag, setDrag] = useState<Drag | null>(null); // tranh đang bay theo ngón tay
  const [done, setDone] = useState(false);

  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const press = useRef<{ frame: StoryFrame; x0: number; y0: number; moved: boolean } | null>(null);
  // Mirror state để logic đồng bộ (tránh closure cũ khi bé thao tác nhanh).
  const queueRef = useRef<Story[]>([]);
  const roundRef = useRef<Round | null>(null);
  const placedRef = useRef<(string | null)[]>([null, null, null]);
  const stepRef = useRef(0);
  const transitioning = useRef(false);

  const start = useCallback(() => {
    const queue = shuffle(STORIES);
    const r = makeRound(queue[0]);
    queueRef.current = queue;
    roundRef.current = r;
    placedRef.current = [null, null, null];
    stepRef.current = 0;
    transitioning.current = false;
    setRound(r);
    setPlaced([null, null, null]);
    setStep(0);
    setSelected(null);
    setOverSlot(null);
    setWrongSlot(null);
    setDrag(null);
    setDone(false);
    void speak(r.story.narration, "vi");
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

  // Xong một truyện: thưởng 1 sao, mừng, rồi sang truyện mới (hoặc mở lượt mừng cuối).
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
      showToast(`${pick(PRAISES)} Truyện mới nào 🎉`);
      setTimeout(() => {
        const next = makeRound(queueRef.current[ns]);
        roundRef.current = next;
        placedRef.current = [null, null, null];
        setRound(next);
        setPlaced([null, null, null]);
        setSelected(null);
        setOverSlot(null);
        setWrongSlot(null);
        setDrag(null);
        transitioning.current = false;
        void speak(next.story.narration, "vi");
      }, 1000);
    }, 450);
  }, [addStars, showToast]);

  // Đặt một tranh vào ô `slot`. (x, y) là điểm nổ pháo giấy.
  const drop = useCallback(
    (frame: StoryFrame, slot: number, x: number, y: number) => {
      const r = roundRef.current;
      if (!r || transitioning.current) return;
      const fid = idOf(frame);
      if (placedRef.current.includes(fid)) return; // đã đặt rồi
      if (placedRef.current[slot] != null) return; // ô đã có tranh
      if (r.order[slot] === fid) {
        playSuccess();
        confettiBurst(x, y);
        setSelected(null);
        const next = [...placedRef.current];
        next[slot] = fid;
        placedRef.current = next;
        setPlaced(next);
        if (next.every((v) => v != null)) {
          finishRound();
        } else {
          showToast(pick(PRAISES));
          void speak(frame.line, "vi"); // đọc lời khung vừa đặt đúng — củng cố "nghe hiểu"
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
  function onPointerDown(e: React.PointerEvent, frame: StoryFrame) {
    if (transitioning.current || done) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    press.current = { frame, x0: e.clientX, y0: e.clientY, moved: false };
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
      setDrag({ x: e.clientX, y: e.clientY, frame: p.frame });
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
      if (slot != null) drop(p.frame, slot, e.clientX, e.clientY);
    } else {
      // Chạm (không kéo): nhấc/bỏ chọn tranh để rồi chạm vào ô.
      const fid = idOf(p.frame);
      setSelected((cur) => (cur === fid ? null : fid));
    }
  }

  // Chạm/bấm vào ô khi đã chọn sẵn một tranh (chế độ chạm 2 bước / bàn phím).
  function tapSlot(slot: number) {
    if (selected == null || !round) return;
    const frame = round.tray.find((f) => idOf(f) === selected);
    if (!frame) return;
    const box = slotRefs.current[slot]?.getBoundingClientRect();
    const cx = box ? box.left + box.width / 2 : window.innerWidth / 2;
    const cy = box ? box.top + box.height / 2 : window.innerHeight / 2;
    drop(frame, slot, cx, cy);
  }

  const remaining = round?.tray.filter((f) => !placed.includes(idOf(f))) ?? [];
  const filled = done ? ROUNDS : step;
  const frameById = (id: string | null) =>
    id != null ? round?.tray.find((f) => idOf(f) === id) ?? null : null;

  const replay = () => round && void speak(round.story.narration, "vi");

  return (
    <main className="wrap lt-wrap story-wrap">
      <div className="lt-top">
        <Link href="/vietnamese" className="pill">
          ← Trò chơi
        </Link>
        <h1 className="lt-title">
          <span aria-hidden>🐰</span> Nghe hiểu câu chuyện
        </h1>
        <button
          type="button"
          className="lt-replay"
          onClick={replay}
          disabled={!round}
          aria-label="Nghe lại câu chuyện"
          title="Nghe lại"
        >
          🔊
        </button>
      </div>

      <div className="lt-stars" aria-label={`Đã xong ${filled} trên ${ROUNDS} truyện`}>
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
            className="lt-prompt story-prompt"
            onClick={replay}
            aria-label={`Nghe lại câu chuyện: ${round.story.narration}`}
          >
            <span className="lt-prompt-ic" aria-hidden>
              🔊
            </span>
            <span className="lt-prompt-body">
              <span className="lt-prompt-text">{LISTEN_LABEL}</span>
            </span>
          </button>
          <p className="story-instruction">{INSTRUCTION}</p>

          {/* Sân xếp: 3 ô trống bé thả tranh vào, đánh số 1·2·3 dẫn hướng trước–sau. */}
          <div className="story-slots" aria-label="Ba ô xếp tranh theo thứ tự">
            {round.order.map((_, slot) => {
              const inFrame = frameById(placed[slot]);
              const cls =
                "story-slot" +
                (overSlot === slot ? " over" : "") +
                (wrongSlot === slot ? " wrong" : "") +
                (inFrame ? " filled" : "") +
                (selected != null && !inFrame ? " armed" : "");
              return (
                <button
                  key={slot}
                  ref={(el) => {
                    slotRefs.current[slot] = el;
                  }}
                  type="button"
                  className={cls}
                  onClick={() => tapSlot(slot)}
                  aria-label={`Ô thứ ${slot + 1}`}
                  disabled={!!inFrame}
                >
                  <span className="story-slot-num" aria-hidden>
                    {slot + 1}
                  </span>
                  {inFrame && <Pic frame={inFrame} className="in-slot" />}
                </button>
              );
            })}
          </div>

          {/* Khay tranh cần xếp. */}
          <div className="story-tray" aria-label="Khay các tranh cần xếp">
            {remaining.map((f) => {
              const fid = idOf(f);
              return (
                <button
                  key={fid}
                  type="button"
                  className={
                    "story-card" +
                    (selected === fid ? " sel" : "") +
                    (drag && idOf(drag.frame) === fid ? " dragging" : "")
                  }
                  style={{ touchAction: "none" }}
                  onPointerDown={(e) => onPointerDown(e, f)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  aria-label={f.alt}
                  aria-pressed={selected === fid}
                >
                  <Pic frame={f} />
                </button>
              );
            })}
            {remaining.length === 0 && !done && (
              <span className="story-tray-empty">Xong truyện này! 🎉</span>
            )}
          </div>
        </>
      )}

      {drag && (
        <div className="story-float" style={{ left: drag.x, top: drag.y }} aria-hidden>
          <Pic frame={drag.frame} />
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
              Bé xếp đúng thứ tự cả {ROUNDS} câu chuyện rồi. Giỏi quá đi! Được {ROUNDS}{" "}
              ngôi sao ⭐
            </p>
            <div className="lt-result-actions">
              <button type="button" className="btn" onClick={start}>
                Chơi lại →
              </button>
              <Link href="/vietnamese" className="btn-ghost">
                Về góc Tiếng Việt
              </Link>
            </div>
          </div>
        </div>
      )}

      {toastEl}
    </main>
  );
}
